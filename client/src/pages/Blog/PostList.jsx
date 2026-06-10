import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePosts } from "../../hooks";
import PostCard from "../../components/blog/PostCard";

const POPULAR_TAGS = ["javascript", "react", "nodejs", "python", "webdev", "career", "mern"];

export default function PostList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const tag = searchParams.get("tag") || "";

  const { posts, loading, pagination } = usePosts({
    tag: tag || undefined,
    search: search || undefined,
    page: searchParams.get("page") || 1,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Main feed */}
        <div className="flex-1">
          <div className="mb-6 flex items-center gap-3">
            <input
              className="input"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No posts found</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setSearchParams({ page: i + 1 })}
                  className={`px-3 py-1 rounded ${Number(searchParams.get("page") || 1) === i + 1 ? "btn-primary" : "btn-secondary"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchParams(t === tag ? {} : { tag: t })}
                  className={`tag cursor-pointer ${t === tag ? "bg-brand-600 text-white" : ""}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}