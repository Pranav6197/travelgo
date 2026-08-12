import Post from "../models/post.js";
import User from "../models/user.js";
import { deleteDataFromCache, storeDataInCache } from "../utils/cache-posts.js";
import {
  HTTP_STATUS,
  REDIS_KEYS,
  RESPONSE_MESSAGES,
  validCategories,
} from "../utils/constants.js";
import {
  createPostImageAssets,
  dispatchPostImageEnhancements,
  IMAGE_STATUS,
  renderImageUrls,
} from "../services/image.service.js";

const isEnhancementRequested = (value) => value === true || value === "true";

function parseStringArray(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return Array.isArray(value) ? value : value ? [value] : [];
}

function legacyImageAsset(url) {
  return {
    originalUrl: url,
    imageStatus: IMAGE_STATUS.READY,
    enhancementRequested: false,
  };
}

function orderedExistingImageAssets(post, existingImages) {
  const availableAssets = [...(post.imageAssets || [])];
  return existingImages.map((url) => {
    const assetIndex = availableAssets.findIndex(
      (asset) => asset.originalUrl === url || asset.processedUrl === url,
    );
    return assetIndex >= 0
      ? availableAssets.splice(assetIndex, 1)[0]
      : legacyImageAsset(url);
  });
}

async function markEnhancementDispatchFailed(post, assets, error) {
  const assetIds = new Set(
    (assets || []).map((asset) => asset?._id?.toString()).filter(Boolean),
  );
  (post.imageAssets || []).forEach((asset) => {
    if (asset?._id && assetIds.has(asset._id.toString())) {
      asset.imageStatus = IMAGE_STATUS.FAILED;
    }
  });
  await post.save();
  console.error("Image enhancement could not be queued:", error?.message || error);
}

export const createPostHandler = async (req, res) => {
  try {
    const {
      title,
      authorName,
      imageLink,
      categories,
      description,
      isFeaturedPost = false,
    } = req.body;
    const userId = req.user._id;

    const enhancementRequested = isEnhancementRequested(
      req.body.enhancementRequested,
    );
    const hasUploadedImages = Boolean(req.files?.length);

    // Validation - check if all fields are filled
    if (
      !title ||
      !authorName ||
      (!imageLink && !hasUploadedImages) ||
      !description ||
      !categories
    ) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
    }

    // Validation - check if imageLink is a valid URL (only if provided manually and no files uploaded)
    if (imageLink && !hasUploadedImages) {
      const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
      if (!imageLinkRegex.test(imageLink)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL });
      }
    }

    // Handle categories from FormData (might be string or array)
    const parsedCategories = parseStringArray(categories);

    // Validation - check if categories array has more than 3 items
    if (parsedCategories.length > 3) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES });
    }

    // S3 uploads finish before the post is created; enhancement itself remains asynchronous.
    const imageAssets = hasUploadedImages
      ? await createPostImageAssets(req.files, enhancementRequested)
      : [];
    const images =
      imageAssets.length > 0
        ? renderImageUrls(imageAssets)
        : imageLink
          ? [imageLink]
          : [];
    const post = new Post({
      title,
      authorName,
      imageLink: images.length > 0 ? images[0] : imageLink,
      images,
      imageAssets,
      description,
      categories: parsedCategories,
      isFeaturedPost,
      authorId: req.user._id,
    });

    const [savedPost] = await Promise.all([
      post.save(), // Save the post
      deleteDataFromCache(REDIS_KEYS.ALL_POSTS), // Invalidate cache for all posts
      deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS), // Invalidate cache for featured posts
      deleteDataFromCache(REDIS_KEYS.LATEST_POSTS), // Invalidate cache for latest posts
    ]);

    // updating user doc to include the ObjectId of the created post
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    if (enhancementRequested && imageAssets.length > 0) {
      try {
        // This only publishes to SQS; it never waits for Lambda processing.
        // Use the saved subdocuments: MongoDB assigns each image asset its _id
        // during the save, and Lambda needs that id to update the right asset.
        await dispatchPostImageEnhancements(savedPost);
      } catch (queueError) {
        await markEnhancementDispatchFailed(
          savedPost,
          savedPost.imageAssets,
          queueError,
        );
      }
    }

    res.status(HTTP_STATUS.OK).json(savedPost);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getAllPostsHandler = async (req, res) => {
  try {
    const posts = await Post.find();
    await storeDataInCache(REDIS_KEYS.ALL_POSTS, posts);
    return res.status(HTTP_STATUS.OK).json(posts);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getFeaturedPostsHandler = async (req, res) => {
  try {
    const featuredPosts = await Post.find({ isFeaturedPost: true });
    await storeDataInCache(REDIS_KEYS.FEATURED_POSTS, featuredPosts);
    res.status(HTTP_STATUS.OK).json(featuredPosts);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getPostByCategoryHandler = async (req, res) => {
  const category = req.params.category;
  try {
    // Validation - check if category is valid
    if (!validCategories.includes(category)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
    }

    const categoryPosts = await Post.find({ categories: category });
    res.status(HTTP_STATUS.OK).json(categoryPosts);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getLatestPostsHandler = async (req, res) => {
  try {
    const latestPosts = await Post.find().sort({ timeOfPost: -1 });
    await storeDataInCache(REDIS_KEYS.LATEST_POSTS, latestPosts);
    res.status(HTTP_STATUS.OK).json(latestPosts);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getPostByIdHandler = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }

    res.status(HTTP_STATUS.OK).json(post);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const updatePostHandler = async (req, res) => {
  try {
    const updatedPost = await Post.findById(req.params.id);

    // Validation - check if post exists
    if (!updatedPost) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }
    const updateData = { ...req.body };
    delete updateData.existingImages;
    delete updateData.enhancementRequested;
    delete updateData.imageLink;

    if (updateData.categories)
      updateData.categories = parseStringArray(updateData.categories);
    updatedPost.set(updateData);

    const hasExistingImageList = Object.prototype.hasOwnProperty.call(
      req.body,
      "existingImages",
    );
    const hasUploadedImages = Boolean(req.files?.length);
    let newImageAssets = [];
    if (hasExistingImageList || hasUploadedImages) {
      const existingImages = hasExistingImageList
        ? parseStringArray(req.body.existingImages)
        : updatedPost.images;
      const retainedAssets = orderedExistingImageAssets(
        updatedPost,
        existingImages,
      );
      newImageAssets = hasUploadedImages
        ? await createPostImageAssets(
            req.files,
            isEnhancementRequested(req.body.enhancementRequested),
          )
        : [];
      updatedPost.imageAssets = [...retainedAssets, ...newImageAssets];
      updatedPost.images = renderImageUrls(updatedPost.imageAssets);
      updatedPost.imageLink = updatedPost.images[0] || "";
    }

    await updatedPost.save();
    if (newImageAssets.some((asset) => asset.enhancementRequested)) {
      try {
        await dispatchPostImageEnhancements(updatedPost, newImageAssets);
      } catch (queueError) {
        await markEnhancementDispatchFailed(
          updatedPost,
          newImageAssets,
          queueError,
        );
      }
    }
    // invalidate the redis cache
    (await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      await res.status(HTTP_STATUS.OK).json(updatedPost));
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const deletePostByIdHandler = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }
    await User.findByIdAndUpdate(post.authorId, {
      $pull: { posts: req.params.id },
    });

    // invalidate the redis cache
    (await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      res
        .status(HTTP_STATUS.OK)
        .json({ message: RESPONSE_MESSAGES.POSTS.DELETED }));
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

export const getRelatedPostsByCategories = async (req, res) => {
  const { categories } = req.query;
  if (!categories) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
  }
  try {
    const filteredCategoryPosts = await Post.find({
      categories: { $in: categories },
    });
    res.status(HTTP_STATUS.OK).json(filteredCategoryPosts);
  } catch (err) {
    console.log("Error in handler:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};
