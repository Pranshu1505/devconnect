import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePost } from "../../hooks";
import { useAuth } from "../../context/AuthContext";
import { postsAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";

export default function PostDetail() {
  const { id } = useParams();
  const { post, setPost, loading } = usePost(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-100 rounded" /><div className="h-64 bg-gray-100 rounded" /></div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">Post not found</div>;

  const isLiked = user && post.likes?.includes(user._id);
  const isBookmarked = user && post.bookmarks?.includes(user._id);
  const isAuthor = user && post.author?._id === user._id;

  const handleLike = async () => {
    if (!user) return toast.error("Login to like");
    const res = await postsAPI.like(post._id);
    setPost(p => ({ ...p, likes: res.data.liked ? [...(p.likes || []), user._id] : p.likes.filter(id => id !== user._id) }));
  };

  const handleBookmark = async () => {
    if (!user) return toast.error("Login to bookmark");
    await postsAPI.bookmark(post._id);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Bookmarked!");
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.addComment(post._id, comment);
      setPost(p => ({ ...p, comments: res.data.comments }));
      setComment("");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await postsAPI.delete(post._id);
    toast.success("Post deleted");
    navigate("/posts");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Cover */}
      {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-56 object-cover rounded-xl mb-6" />}

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-4">
        {post.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
      </div>

      {/* Author row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/users/${post.author?.username}`}>
            <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`} className="w-10 h-10 rounded-full" />
          </Link>
          <div>
            <Link to={`/users/${post.author?.username}`} className="font-medium hover:text-brand-600">{post.author?.name}</Link>
            <p className="text-sm text-gray-500">{post.readTime} min read · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAuthor && <>
            <Link to={`/posts/${post._id}/edit`} className="btn-secondary text-sm">Edit</Link>
            <button onClick={handleDelete} className="text-red-600 btn-secondary text-sm">Delete</button>
          </>}
        </div>
      </div>

      {/* Body */}
      <div data-color-mode="light" className="mb-8">
        <MDEditor.Markdown source={post.body} />
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <button onClick={handleLike} className={`flex items-center gap-1 text-sm font-medium ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}>
          ❤️ {post.likes?.length || 0} Likes
        </button>
        <button onClick={handleBookmark} className={`flex items-center gap-1 text-sm font-medium ${isBookmarked ? "text-brand-600" : "text-gray-500 hover:text-brand-600"}`}>
          🔖 {isBookmarked ? "Saved" : "Save"}
        </button>
        <span className="ml-auto text-sm text-gray-500">👁 {post.views} views</span>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-bold mb-4">Comments ({post.comments?.length || 0})</h2>

        {user && (
          <form onSubmit={handleComment} className="mb-6">
            <textarea className="input mb-2 h-20" placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} />
            <button type="submit" disabled={submitting} className="btn-primary text-sm">{submitting ? "Posting..." : "Post Comment"}</button>
          </form>
        )}

        <div className="space-y-4">
          {post.comments?.map(c => (
            <div key={c._id} className="flex gap-3">
              <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name}`} className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="card flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{c.user?.name}</span>
                  <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}