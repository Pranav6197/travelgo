import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/helpers/axios-instance';
import userState from '@/utils/user-state';
import PostCard from '@/components/post-card';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import Header from '@/layouts/header-layout';

function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = userState.getUser();

    useEffect(() => {
        if (!currentUser?._id) {
            navigate('/signin');
            return;
        }

        const fetchProfile = async () => {
            try {
                // Fetch user details (assuming we have an endpoint or use local state)
                // For now, we use local state for basic info, but ideally we fetch full profile
                // Let's fetch the user's posts
                const postsRes = await axiosInstance.get(`/api/posts`);
                // Filter posts by authorId (since we don't have a specific /my-posts endpoint yet, or we can filter on client)
                // Better: Create a backend endpoint for /my-posts or filter here.
                // Let's filter client side for now as we have getAllPosts
                const userPosts = postsRes.data.filter(post => post.authorId === currentUser._id);

                setUser({
                    ...currentUser,
                    // Add more details if fetched from API
                });
                setPosts(userPosts);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-light dark:bg-dark">
                <Header />
                <div className="flex justify-center pt-20">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light dark:bg-dark">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-dark-card">
                    <div className="flex items-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-light-primary text-3xl font-bold text-white dark:bg-dark-primary">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-dark dark:text-light">
                                {user?.username || 'User'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                Role: {user?.role}
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="mb-6 text-xl font-semibold text-dark dark:text-light">My Posts</h2>

                <div className="flex flex-wrap gap-4">
                    {posts.length === 0 ? (
                        <p className="text-gray-500">You haven't created any posts yet.</p>
                    ) : (
                        posts.map((post) => <PostCard key={post._id} post={post} />)
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
