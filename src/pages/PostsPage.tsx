import { useState } from "react";
import { useGetPostsQuery, useAddPostMutation } from "../api/postsApi";

export default function PostsPage() {
  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useGetPostsQuery(undefined, {
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: 300,
  });

  const [addPost] = useAddPostMutation();
  const [title, setTitle] = useState("");

  const handleAddPost = async () => {
    if (!title) return;
    await addPost({ title, body: "Test Body", userId: 1 }).unwrap();
    setTitle("");
    refetch();
  };

  if (isLoading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error loading posts</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Posts</h1>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New post title"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={handleAddPost}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!title}
          >
            Add Post
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {posts?.slice(0, 10).map((post) => (
            <li key={post.id} className="py-3 px-2 hover:bg-gray-100 rounded transition">
              {post.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
