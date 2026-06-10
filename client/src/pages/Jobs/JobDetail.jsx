import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { jobsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    jobsAPI.getOne(id)
      .then((res) => {
        setJob(res.data.job);
        if (user) {
          const applied = res.data.job.applications?.some(
            (a) => a.applicant === user._id || a.applicant?._id === user._id
          );
          setHasApplied(applied);
        }
      })
      .catch(() => toast.error("Job not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobsAPI.apply(id, coverLetter);
      toast.success("Application submitted!");
      setHasApplied(true);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  const isOwner = user && job.company?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="card mb-6">
            {job.isBoosted && (
              <span className="tag bg-yellow-100 text-yellow-700 mb-3 inline-block">⭐ Featured</span>
            )}
            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
            <p className="text-gray-500 mb-4">
              {job.company?.companyName || job.company?.name} · {job.location}
              {job.isRemote && " · Remote"}
            </p>

            <div className="flex gap-2 flex-wrap mb-4">
              <span className="tag">{job.type}</span>
              <span className="tag">{job.experience}</span>
              {job.isRemote && <span className="tag bg-green-50 text-green-700">Remote</span>}
              {job.salaryMin && (
                <span className="tag bg-purple-50 text-purple-700">
                  ₹{(job.salaryMin / 100000).toFixed(1)}L
                  {job.salaryMax ? ` – ₹${(job.salaryMax / 100000).toFixed(1)}L` : "+"}
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {job.stack?.map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card mb-6">
            <h2 className="font-semibold mb-3">Job Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-semibold mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-600 mt-0.5">✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          {/* Apply Button */}
          <div className="card">
            {user?.role === "developer" && (
              <>
                {hasApplied ? (
                  <div className="text-center text-green-600 font-medium py-2">
                    ✅ Application Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary w-full"
                  >
                    Apply Now
                  </button>
                )}
              </>
            )}
            {!user && (
              <Link to="/login" className="btn-primary w-full text-center block">
                Login to Apply
              </Link>
            )}
            {isOwner && (
              <Link to={`/jobs/${id}/applications`} className="btn-secondary w-full text-center block text-sm">
                View Applications ({job.applications?.length || 0})
              </Link>
            )}
          </div>

          {/* Company Info */}
          <div className="card">
            <h3 className="font-semibold mb-3">About Company</h3>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={job.company?.avatar || `https://ui-avatars.com/api/?name=${job.company?.name}`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-sm">{job.company?.companyName || job.company?.name}</p>
                {job.company?.companySize && (
                  <p className="text-xs text-gray-500">{job.company.companySize} employees</p>
                )}
              </div>
            </div>
            {job.company?.companyWebsite && (
              <a href={job.company.companyWebsite} target="_blank" rel="noreferrer"
                className="text-brand-600 text-sm hover:underline">
                Visit Website ↗
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="card text-sm text-gray-500 space-y-1">
            <p>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
            {job.deadline && (
              <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
            )}
            <p>{job.applications?.length || 0} applicants</p>
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Apply for {job.title}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="input h-32"
                placeholder="Tell the company why you're a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1">
                {applying ? "Submitting..." : "Submit Application"}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}