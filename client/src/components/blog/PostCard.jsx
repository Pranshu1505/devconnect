import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post }) {
  return (
    <article className="card hover:shadow-md transition-shadow">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-40 object-cover rounded-lg mb-3" />
      )}

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <Link to={`/users/${post.author?.username}`}>
          <img
            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
            alt={post.author?.name}
            className="w-7 h-7 rounded-full"
          />
        </Link>
        <div>
          <Link to={`/users/${post.author?.username}`} className="text-sm font-medium hover:text-brand-600">
            {post.author?.name}
          </Link>
          <p className="text-xs text-gray-500">
            {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Title */}
      <Link to={`/posts/${post._id}`}>
        <h2 className="text-lg font-semibold hover:text-brand-600 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h2>
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <Link key={tag} to={`/posts?tag=${tag}`} className="tag">#{tag}</Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
        <span>❤️ {post.likes?.length || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
        <span>⏱ {post.readTime || 1} min read</span>
        <span className="ml-auto">👁 {post.views || 0}</span>
      </div>
    </article>
  );
}