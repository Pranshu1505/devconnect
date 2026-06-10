import { useState } from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../../hooks";
import { useAuth } from "../../context/AuthContext";

export default function JobList() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    type: "",
    experience: "",
    remote: "",
    search: "",
  });

  const { jobs, loading, pagination } = useJobs({
    type: filters.type || undefined,
    experience: filters.experience || undefined,
    remote: filters.remote || undefined,
    search: filters.search || undefined,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Board</h1>
        {user?.role === "company" && (
          <Link to="/jobs/new" className="btn-primary text-sm">
            + Post a Job
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-56 space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Filters</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                <input
                  className="input text-sm"
                  placeholder="React, Node..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
                <select
                  className="input text-sm"
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Experience</label>
                <select
                  className="input text-sm"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                >
                  <option value="">Any Level</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-3 years">1–3 Years</option>
                  <option value="3-5 years">3–5 Years</option>
                  <option value="5+ years">5+ Years</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.remote === "true"}
                    onChange={(e) =>
                      handleFilterChange("remote", e.target.checked ? "true" : "")
                    }
                  />
                  Remote Only
                </label>
              </div>

              <button
                onClick={() => setFilters({ type: "", experience: "", remote: "", search: "" })}
                className="text-xs text-brand-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              No jobs found matching your filters
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="card block hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {job.isBoosted && (
                          <span className="tag bg-yellow-100 text-yellow-700 text-xs">⭐ Featured</span>
                        )}
                      </div>
                      <h2 className="font-semibold text-lg">{job.title}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.company?.companyName || job.company?.name} · {job.location}
                      </p>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {job.stack?.slice(0, 4).map((s) => (
                          <span key={s} className="tag">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right text-sm flex-shrink-0">
                      <span className="tag">{job.type}</span>
                      {job.isRemote && (
                        <div className="mt-1">
                          <span className="tag bg-green-50 text-green-700">Remote</span>
                        </div>
                      )}
                      {job.salaryMin && (
                        <p className="text-gray-500 mt-1 text-xs">
                          ₹{(job.salaryMin / 100000).toFixed(1)}L
                          {job.salaryMax ? ` – ₹${(job.salaryMax / 100000).toFixed(1)}L` : "+"}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4 text-right">
            {pagination.total || 0} jobs found
          </p>
        </div>
      </div>
    </div>
  );
}