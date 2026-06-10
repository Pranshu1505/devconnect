import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    stack: "",
    location: "",
    type: "full-time",
    experience: "1-3 years",
    salaryMin: "",
    salaryMax: "",
    isRemote: false,
    deadline: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        stack: form.stack.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      const res = await jobsAPI.create(payload);
      toast.success("Job posted!");
      navigate(`/jobs/${res.data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-semibold">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input className="input" placeholder="e.g. Senior React Developer"
              value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Type</label>
              <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience Level</label>
              <select className="input" value={form.experience} onChange={(e) => set("experience", e.target.value)}>
                <option value="fresher">Fresher</option>
                <option value="1-3 years">1–3 Years</option>
                <option value="3-5 years">3–5 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input className="input" placeholder="e.g. Noida, UP"
                value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isRemote}
                  onChange={(e) => set("isRemote", e.target.checked)} />
                Remote position
              </label>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Compensation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Salary (₹/year)</label>
              <input type="number" className="input" placeholder="e.g. 800000"
                value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Salary (₹/year)</label>
              <input type="number" className="input" placeholder="e.g. 1500000"
                value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Job Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
            <input className="input" placeholder="react, nodejs, mongodb, typescript"
              value={form.stack} onChange={(e) => set("stack", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea className="input h-32" placeholder="Describe the role, responsibilities..."
              value={form.description} onChange={(e) => set("description", e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Requirements <span className="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea className="input h-28" placeholder={"3+ years React experience\nNode.js & Express\nMongoDB"}
              value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Application Deadline</label>
            <input type="date" className="input"
              value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Posting..." : "Post Job"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}