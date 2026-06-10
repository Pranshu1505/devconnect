// Home.jsx
import { Link } from "react-router-dom";
import { usePosts, useJobs } from "../hooks";
import PostCard from "../components/blog/PostCard";

export default function Home() {
  const { posts, loading: postsLoading } = usePosts({ limit: 6 });
  const { jobs, loading: jobsLoading } = useJobs({ limit: 4 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Where developers grow together</h1>
        <p className="text-gray-500 text-lg mb-6">Write, learn, and find your next opportunity</p>
        <div className="flex justify-center gap-3">
          <Link to="/posts" className="btn-primary">Browse Posts</Link>
          <Link to="/jobs" className="btn-secondary">Find Jobs</Link>
        </div>
      </div>

      {/* Latest Posts */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Latest Posts</h2>
          <Link to="/posts" className="text-brand-600 text-sm font-medium">View all →</Link>
        </div>
        {postsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </section>

      {/* Latest Jobs */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Latest Jobs</h2>
          <Link to="/jobs" className="text-brand-600 text-sm font-medium">View all →</Link>
        </div>
        {jobsLoading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <Link key={job._id} to={`/jobs/${job._id}`} className="card hover:shadow-md transition-shadow block">
                {job.isBoosted && <span className="tag bg-yellow-100 text-yellow-700 mb-2 inline-block">⭐ Featured</span>}
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.company?.companyName || job.company?.name} · {job.location}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {job.stack?.slice(0,3).map(s => <span key={s} className="tag">{s}</span>)}
                  <span className="tag">{job.type}</span>
                  {job.isRemote && <span className="tag bg-green-50 text-green-700">Remote</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}