import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { usePost } from "../../hooks";
import { postsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function EditPost() {
  const { id } = useParams();
  const { post, loading } = usePost(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", body: "", tags: "", series: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        body: post.body || "",
        tags: post.tags?.join(", ") || "",
        series: post.series || "",
      });
    }
  }, [post]);

  // Only author can edit
  useEffect(() => {
    if (post && user && post.author?._id !== user._id) {
      toast.error("Not authorized");
      navigate("/");
    }
  }, [post, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await postsAPI.update(id, { ...form, tags });
      toast.success("Post updated!");
      navigate(`/posts/${id}`);
    } catch (err) {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-12 bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            className="input text-xl font-semibold"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            className="input"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Series</label>
          <input
            className="input"
            value={form.series}
            onChange={(e) => setForm({ ...form, series: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <div data-color-mode="light">
            <MDEditor
              value={form.body}
              onChange={(val) => setForm({ ...form, body: val || "" })}
              height={450}
              preview="live"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}