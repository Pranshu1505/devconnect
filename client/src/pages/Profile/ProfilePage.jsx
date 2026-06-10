import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PostCard from "../../components/blog/PostCard";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    usersAPI.getProfile(username)
      .then((res) => {
        setProfile(res.data.user);
        setPosts(res.data.posts);
        if (currentUser) {
          setFollowing(res.data.user.followers?.some((f) => f._id === currentUser._id));
        }
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [username, currentUser]);

  const handleFollow = async () => {
    try {
      await usersAPI.follow(profile._id);
      setFollowing((prev) => !prev);
      setProfile((p) => ({
        ...p,
        followers: following
          ? p.followers.filter((f) => f._id !== currentUser._id)
          : [...p.followers, { _id: currentUser._id }],
      }));
    } catch (err) {
      toast.error("Failed to follow");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="flex gap-4"><div className="w-20 h-20 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div></div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-12 text-gray-500">User not found</div>;

  const isOwnProfile = currentUser && currentUser._id === profile._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=100`}
            alt={profile.name}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link to="/profile/edit" className="btn-secondary text-sm">Edit Profile</Link>
                ) : currentUser ? (
                  <button onClick={handleFollow} className={following ? "btn-secondary text-sm" : "btn-primary text-sm"}>
                    {following ? "Unfollow" : "Follow"}
                  </button>
                ) : null}
              </div>
            </div>

            {profile.bio && <p className="text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  🐙 GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  🌐 Portfolio
                </a>
              )}
              {profile.openToWork && (
                <span className="text-green-600 font-medium">✅ Open to Work</span>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-3 text-sm">
              <span><strong>{profile.postCount || 0}</strong> posts</span>
              <span><strong>{profile.followers?.length || 0}</strong> followers</span>
              <span><strong>{profile.following?.length || 0}</strong> following</span>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-lg font-bold mb-4">Posts by {profile.name}</h2>
        {posts.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">No posts yet</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={{ ...post, author: profile }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}