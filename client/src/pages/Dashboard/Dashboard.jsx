import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications, usePosts, useJobs } from "../../hooks";
import { usersAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import PostCard from "../../components/blog/PostCard";

const TABS_DEVELOPER = ["Notifications", "My Posts", "Bookmarks"];
const TABS_COMPANY   = ["Notifications", "My Jobs"];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Notifications");
  const { notifications, unreadCount, markRead } = useNotifications();
  const { posts: myPosts } = usePosts({ author: user?._id });
  const { jobs: myJobs } = useJobs({ company: user?._id });

  const TABS = user?.role === "company" ? TABS_COMPANY : TABS_DEVELOPER;

  const notifIcon = {
    like: "❤️", comment: "💬", follow: "👤",
    job_application: "📩", job_status: "📋", mention: "📣",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {user?.role !== "company" && (
            <Link to="/write" className="btn-primary text-sm">+ Write Post</Link>
          )}
          {user?.role === "company" && (
            <Link to="/jobs/new" className="btn-primary text-sm">+ Post Job</Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "Notifications") markRead();
            }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {tab === "Notifications" && unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications Tab */}
      {activeTab === "Notifications" && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`card flex items-start gap-3 ${!n.read ? "border-l-4 border-brand-500" : ""}`}
              >
                <img
                  src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender?.name}`}
                  className="w-9 h-9 rounded-full flex-shrink-0"
                  alt={n.sender?.name}
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="mr-1">{notifIcon[n.type]}</span>
                    <strong>{n.sender?.name}</strong>
                    {n.type === "like" && " liked your post"}
                    {n.type === "comment" && " commented on your post"}
                    {n.type === "follow" && " started following you"}
                    {n.type === "job_application" && " applied to your job"}
                    {n.type === "job_status" && ` — ${n.message}`}
                    {n.post && (
                      <Link to={`/posts/${n.post._id}`} className="text-brand-600 ml-1 hover:underline">
                        {n.post.title}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Posts Tab */}
      {activeTab === "My Posts" && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">
              No posts yet.{" "}
              <Link to="/write" className="text-brand-600 hover:underline">
                Write your first post
              </Link>
            </div>
          ) : (
            myPosts.map((post) => (
              <PostCard key={post._id} post={{ ...post, author: user }} />
            ))
          )}
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === "Bookmarks" && <BookmarksTab />}

      {/* My Jobs Tab */}
      {activeTab === "My Jobs" && (
        <div className="space-y-3">
          {myJobs.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">
              No jobs posted yet.{" "}
              <Link to="/jobs/new" className="text-brand-600 hover:underline">
                Post your first job
              </Link>
            </div>
          ) : (
            myJobs.map((job) => (
              <div key={job._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/jobs/${job._id}`} className="font-semibold hover:text-brand-600">
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.applications?.length || 0} applicants · {job.type}
                    </p>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="btn-secondary text-xs">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Bookmarks sub-component
function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getBookmarks()
      .then((res) => setBookmarks(res.data.posts))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />;

  return bookmarks.length === 0 ? (
    <div className="card text-center py-10 text-gray-500">No bookmarks yet</div>
  ) : (
    <div className="space-y-4">
      {bookmarks.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  );
}