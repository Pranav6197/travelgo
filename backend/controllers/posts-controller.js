import Post from '../models/post.js';
import User from '../models/user.js';
import { deleteDataFromCache, storeDataInCache } from '../utils/cache-posts.js';
import { HTTP_STATUS, REDIS_KEYS, RESPONSE_MESSAGES, validCategories } from '../utils/constants.js';

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

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        } else if (imageLink) {
            images = [imageLink];
        }

        // Validation - check if all fields are filled
        if (!title || !authorName || (!imageLink && images.length === 0) || !description || !categories) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
        }

        // Validation - check if imageLink is a valid URL (only if provided manually and no files uploaded)
        if (imageLink && images.length === 0) {
            const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
            if (!imageLinkRegex.test(imageLink)) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL });
            }
        }

        // Handle categories from FormData (might be string or array)
        let parsedCategories = categories;
        if (typeof categories === 'string') {
            // Attempt to parse if it's a JSON string, otherwise wrap in array
            try {
                parsedCategories = JSON.parse(categories);
            } catch (e) {
                parsedCategories = [categories];
            }
        }
        if (!Array.isArray(parsedCategories)) {
            parsedCategories = [parsedCategories];
        }


        // Validation - check if categories array has more than 3 items
        if (parsedCategories.length > 3) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES });
        }

        const post = new Post({
            title,
            authorName,
            imageLink: images.length > 0 ? images[0] : imageLink,
            images,
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

        res.status(HTTP_STATUS.OK).json(savedPost);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const getAllPostsHandler = async (req, res) => {
    try {
        const posts = await Post.find();
        await storeDataInCache(REDIS_KEYS.ALL_POSTS, posts);
        return res.status(HTTP_STATUS.OK).json(posts);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const getFeaturedPostsHandler = async (req, res) => {
    try {
        const featuredPosts = await Post.find({ isFeaturedPost: true });
        await storeDataInCache(REDIS_KEYS.FEATURED_POSTS, featuredPosts);
        res.status(HTTP_STATUS.OK).json(featuredPosts);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
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
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const getLatestPostsHandler = async (req, res) => {
    try {
        const latestPosts = await Post.find().sort({ timeOfPost: -1 });
        await storeDataInCache(REDIS_KEYS.LATEST_POSTS, latestPosts);
        res.status(HTTP_STATUS.OK).json(latestPosts);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const getPostByIdHandler = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Validation - check if post exists
        if (!post) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }

        res.status(HTTP_STATUS.OK).json(post);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const updatePostHandler = async (req, res) => {
    try {
        let updateData = { ...req.body };

        let images = [];
        // Handle existing images (passed as JSON string or array)
        if (req.body.existingImages) {
            if (typeof req.body.existingImages === 'string') {
                try {
                    images = JSON.parse(req.body.existingImages);
                } catch (e) {
                    images = [req.body.existingImages];
                }
            } else if (Array.isArray(req.body.existingImages)) {
                images = req.body.existingImages;
            }
        }

        // Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            images = [...images, ...newImages];
        }

        // Only update images if there are changes (either new files or explicit existingImages list passed)
        // If existingImages is NOT passed, we assume no deletion happened, but if new files are passed we append.
        // However, to support deletion, frontend MUST pass existingImages.
        // If req.body.existingImages is undefined, it might mean "keep as is" OR "delete all".
        // Let's assume if it's present (even empty), we use it. If undefined, we keep existing?
        // Better logic: If we are in "edit" mode, frontend should send the current state of images.

        if (req.body.existingImages || (req.files && req.files.length > 0)) {
            updateData.images = images;
            updateData.imageLink = images.length > 0 ? images[0] : '';
        }

        // Handle categories if present
        if (updateData.categories) {
            if (typeof updateData.categories === 'string') {
                try {
                    updateData.categories = JSON.parse(updateData.categories);
                } catch (e) {
                    updateData.categories = [updateData.categories];
                }
            }
            if (!Array.isArray(updateData.categories)) {
                updateData.categories = [updateData.categories];
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        // Validation - check if post exists
        if (!updatedPost) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        // invalidate the redis cache
        await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
            await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
            await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
            await res.status(HTTP_STATUS.OK).json(updatedPost);
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

export const deletePostByIdHandler = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        // Validation - check if post exists
        if (!post) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
        }
        await User.findByIdAndUpdate(post.authorId, { $pull: { posts: req.params.id } });

        // invalidate the redis cache
        await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
            await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
            await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
            res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.POSTS.DELETED });
    } catch (err) {
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
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
        console.log('Error in handler:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};
