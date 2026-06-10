import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", bio: "", location: "", githubUrl: "",
    portfolioUrl: "", skills: "", openToWork: false,
    companyName: "", companyWebsite: "", companySize: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        githubUrl: user.githubUrl || "",
        portfolioUrl: user.portfolioUrl || "",
        skills: user.skills?.join(", ") || "",
        openToWork: user.openToWork || false,
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companySize: user.companySize || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload avatar if changed
      if (avatarFile) {
        const avatarRes = await usersAPI.uploadAvatar(avatarFile);
        setUser((u) => ({ ...u, avatar: avatarRes.data.avatar }));
      }

      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const updated = await usersAPI.updateProfile({ ...form, skills });
      setUser(updated.data.user);
      toast.success("Profile updated!");
      navigate(`/users/${updated.data.user.username}`);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="card flex items-center gap-5">
          <img
            src={avatarPreview || `https://ui-avatars.com/api/?name=${form.name}`}
            className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
          />
          <label className="btn-secondary text-sm cursor-pointer">
            Change Avatar
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>

        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea className="input h-20" maxLength={300} placeholder="Tell others about yourself..."
              value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="input" placeholder="e.g. Delhi, India"
              value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
        </div>

        {/* Developer Fields */}
        {user?.role === "developer" && (
          <div className="card space-y-4">
            <h2 className="font-semibold">Developer Info</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <input className="input" placeholder="React, Node.js, MongoDB"
                value={form.skills} onChange={(e) => set("skills", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input className="input" placeholder="https://github.com/username"
                value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Portfolio URL</label>
              <input className="input" placeholder="https://myportfolio.com"
                value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.openToWork}
                onChange={(e) => set("openToWork", e.target.checked)} />
              I'm open to work
            </label>
          </div>
        )}

        {/* Company Fields */}
        {user?.role === "company" && (
          <div className="card space-y-4">
            <h2 className="font-semibold">Company Info</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input className="input" value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Website</label>
              <input className="input" placeholder="https://company.com"
                value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Size</label>
              <select className="input" value={form.companySize}
                onChange={(e) => set("companySize", e.target.value)}>
                <option value="">Select size</option>
                <option value="1-10">1–10</option>
                <option value="11-50">11–50</option>
                <option value="51-200">51–200</option>
                <option value="201-1000">201–1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}