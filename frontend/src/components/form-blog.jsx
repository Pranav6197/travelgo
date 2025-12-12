import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import navigateBackBlackIcon from '@/assets/svg/navigate-back-black.svg';
import navigateBackWhiteIcon from '@/assets/svg/navigate-back-white.svg';
import ModalComponent from '@/components/modal';
import CategoryPill from '@/components/category-pill';
import { categories } from '@/utils/category-colors';
import userState from '@/utils/user-state';
import axiosInstance from '@/helpers/axios-instance';
import { AxiosError, isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { formBlogSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import Post from '@/types/post-type';
import useAuthData from '@/hooks/useAuthData';

function FormBlog({ type, postId, post }) {
  const [existingImages, setExistingImages] = useState(post?.images || (post?.imageLink ? [post.imageLink] : []));
  const [selectedFiles, setSelectedFiles] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formBlogSchema),
    defaultValues: {
      title: post?.title || '',
      authorName: post?.authorName || '',
      imageLink: post?.imageLink || '',
      categories: post?.categories || [],
      description: post?.description || '',
      isFeaturedPost: false,
    },
  });
  const formData = watch();

  // Removed handleImageSelect as we use file upload now
  const [modal, setmodal] = useState(false);
  const userData = useAuthData();

  //checks the length of the categories array and if the category is already selected
  const isValidCategory = (category) => {
    return formData.categories.length >= 3 && !formData.categories.includes(category);
  };

  const handleCategoryClick = (category) => {
    if (isValidCategory(category)) return;

    if (formData.categories.includes(category)) {
      setValue(
        'categories',
        formData.categories.filter((cat) => cat !== category)
      );
    } else {
      setValue('categories', [...formData.categories, category]);
    }
    trigger('categories');
  };

  const handleselector = () => {
    setValue('imageLink', selectedImage);
    setmodal(false);
  };
  const handleCheckboxChange = () => {
    setValue('isFeaturedPost', !formData.isFeaturedPost);
  };
  const onSumbit = async (data) => {
    try {
      const submitData = new FormData();
      submitData.append('title', data.title);
      submitData.append('authorName', data.authorName);
      submitData.append('description', data.description);
      submitData.append('isFeaturedPost', data.isFeaturedPost);

      // Append categories
      data.categories.forEach(cat => submitData.append('categories', cat));

      // Append existing images
      if (existingImages.length > 0) {
        // Send as JSON string to handle array correctly on backend
        submitData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append files
      if (selectedFiles) {
        Array.from(selectedFiles).forEach(file => {
          submitData.append('images', file);
        });
      } else if (data.imageLink && existingImages.length === 0) {
        submitData.append('imageLink', data.imageLink);
      }

      let postPromise;
      if (type === 'new') {
        postPromise = axiosInstance.post('/api/posts/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (type === 'edit' && postId) {
        if (userData?.role === 'ADMIN') {
          postPromise = axiosInstance.patch(`/api/posts/admin/${postId}`, submitData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          postPromise = axiosInstance.patch(`/api/posts/${postId}`, submitData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
      if (postPromise)
        toast.promise(postPromise, {
          pending: 'Creating blog post...',
          success: {
            render() {
              reset();
              navigate('/');
              return 'Blog created successfully';
            },
          },
          error: {
            render({ data }) {
              if (data instanceof AxiosError) {
                if (data?.response?.data?.message) {
                  return data?.response?.data?.message;
                }
              }
              return 'Blog creation failed';
            },
          },
        });
      if (postPromise) return (await postPromise).data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate('/');
          userState.removeUser();
        }
        console.error(error.response?.data?.message);
      } else {
        console.log(error);
      }
    }
  };
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(null);
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  function Asterisk() {
    return <span className="dark:text-dark-tertiary">*</span>;
  }

  return (
    <div className="flex-grow cursor-default bg-slate-50 px-6 py-8 dark:bg-dark-card">
      <div className="mb-4 flex justify-center">
        <div className="flex w-[32rem] items-center justify-start space-x-4 sm:w-5/6 lg:w-4/6 ">
          <div className="w-fit cursor-pointer">
            <img
              alt="theme"
              src={isDarkMode ? navigateBackWhiteIcon : navigateBackBlackIcon}
              onClick={() => navigate(-1)}
              className="active:scale-click h-5 w-10"
            />
          </div>
          <h2 className="cursor-text text-lg font-semibold text-light-primary dark:text-dark-primary sm:text-xl lg:text-2xl">
            Create Blog
          </h2>
        </div>
      </div>
      <div className="flex justify-center">
        <form onSubmit={handleSubmit(onSumbit)} className="sm:w-5/6 lg:w-2/3">
          <div className="mb-2 flex items-center">
            <label className="flex items-center">
              <span className="px-2 text-base font-medium text-light-secondary dark:text-dark-secondary">
                Is this a featured blog?
              </span>
              <input
                {...register('isFeaturedPost')}
                type="checkbox"
                className="ml-2 h-5 w-5 cursor-pointer rounded-full accent-purple-400"
                checked={formData.isFeaturedPost}
                onChange={handleCheckboxChange}
              />
            </label>
          </div>

          <div className="mb-2">
            <div className="px-2 py-1 font-medium text-light-secondary dark:text-dark-secondary">
              Blog title <Asterisk />
            </div>
            <input
              {...register('title')}
              type="text"
              placeholder="Travel Bucket List for this Year"
              autoComplete="off"
              className="dark:text-textInField mb-1 w-full rounded-lg bg-slate-200 p-3 placeholder:text-sm placeholder:text-light-tertiary dark:bg-dark-field dark:text-dark-textColor dark:placeholder:text-dark-tertiary"
              value={formData.title}
            />
            {errors.title && (
              <span className="p-2 text-sm text-red-500">{`${errors.title.message}`}</span>
            )}
          </div>

          <div className="mb-1">
            <div className="px-2 py-1 font-medium text-light-secondary dark:text-dark-secondary">
              Blog content <Asterisk />
            </div>
            <textarea
              {...register('description')}
              placeholder="Start writing here&hellip;"
              rows={5}
              className="dark:text-textInField w-full rounded-lg bg-slate-200 p-3 placeholder:text-sm placeholder:text-light-tertiary dark:bg-dark-field dark:text-dark-textColor dark:placeholder:text-dark-tertiary"
              value={formData.description}
            />
            {errors.description && (
              <span className="p-2 text-sm text-red-500">{`${errors.description.message}`}</span>
            )}
          </div>
          <div className="mb-2">
            <div className="px-2 py-1 font-medium text-light-secondary dark:text-dark-secondary">
              Author name <Asterisk />
            </div>
            <input
              {...register('authorName')}
              type="text"
              placeholder="Shree Sharma"
              className="dark:text-textInField mb-1 w-full rounded-lg bg-slate-200 p-3 placeholder:text-sm placeholder:text-light-tertiary dark:bg-dark-field dark:text-dark-textColor dark:placeholder:text-dark-tertiary"
              value={formData.authorName}
            />
            {errors.authorName && (
              <span className="p-2 text-sm text-red-500">{`${errors.authorName.message}`}</span>
            )}
          </div>

          <div className="px-2 py-1 font-medium text-light-secondary dark:text-dark-secondary">
            Blog Images
            <span className="text-xs tracking-wide text-dark-tertiary">
              &nbsp;(First image will be the cover/background)&nbsp;
            </span>
            <Asterisk />
          </div>

          {/* Existing Images Management */}
          {existingImages.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Image ${index + 1}`} className="h-24 w-full rounded object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...existingImages];
                        newImages.splice(index, 1);
                        setExistingImages(newImages);
                      }}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                    >
                      Delete
                    </button>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...existingImages];
                          const [movedImage] = newImages.splice(index, 1);
                          newImages.unshift(movedImage);
                          setExistingImages(newImages);
                        }}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                      >
                        Make Cover
                      </button>
                    )}
                  </div>
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-green-500 px-1 text-xs text-white">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="mb-1 flex justify-between gap-2 sm:gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="dark:text-textInField w-full rounded-lg bg-slate-200 p-3 placeholder:text-sm placeholder:text-light-tertiary dark:bg-dark-field dark:text-dark-textColor dark:placeholder:text-dark-tertiary"
              />
            </div>
            <div className="text-xs text-gray-500">
              Or provide a link (optional if files selected):
            </div>
            <input
              {...register('imageLink')}
              type="url"
              placeholder="https://&hellip;"
              className="dark:text-textInField mt-1 w-full rounded-lg bg-slate-200 p-3 placeholder:text-sm placeholder:text-light-tertiary dark:bg-dark-field dark:text-dark-textColor dark:placeholder:text-dark-tertiary"
            />
            {errors.imageLink && (
              <span className="p-2 text-sm text-red-500">{`${errors.imageLink.message}`}</span>
            )}
          </div>

          <div className="mb-4 flex flex-col">
            <label className="px-2 pb-1 font-medium text-light-secondary dark:text-dark-secondary sm:mr-4 sm:w-fit">
              Categories
              <span className="text-xs tracking-wide text-dark-tertiary">
                &nbsp;(max 3 categories)&nbsp;
              </span>
              <Asterisk />
            </label>
            <div>
              <div className="flex flex-wrap gap-3 rounded-lg p-2 dark:bg-dark-card dark:p-3">
                {categories.map((category, index) => (
                  <span key={`${category}-${index}`} onClick={() => handleCategoryClick(category)}>
                    <CategoryPill
                      category={category}
                      selected={formData.categories.includes(category)}
                      disabled={isValidCategory(category)}
                    />
                  </span>
                ))}
              </div>
              {errors.categories && (
                <span className="p-2 text-sm text-red-500">{`${errors.categories.message}`}</span>
              )}
            </div>
          </div>

          <button
            name="post-blog"
            type="submit"
            className="active:scale-click flex w-full items-center justify-center rounded-lg bg-light-primary px-12 py-3 text-base font-semibold text-light hover:bg-light-primary/80 dark:bg-dark-primary dark:text-dark-card dark:hover:bg-dark-secondary/80 sm:mx-1 sm:w-fit"
          >
            {type === 'new' ? 'Post Blog' : 'Update Blog'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default FormBlog;
