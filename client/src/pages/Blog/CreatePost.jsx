import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { postsAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", body: "", tags: "", series: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      return toast.error("Title and body are required");
    }
    setLoading(true);
    try {
      let coverImage = "";

      // Upload cover image first if selected
      if (coverFile) {
        const res = await postsAPI.uploadCover(coverFile);
        coverImage = res.data.url;
      }

      const tags = form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await postsAPI.create({
        title: form.title,
        body: form.body,
        tags,
        coverImage,
        series: form.series,
      });

      toast.success("Post published!");
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Write a New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover Image */}
        <div>
          {coverPreview && (
            <img
              src={coverPreview}
              alt="cover"
              className="w-full h-48 object-cover rounded-xl mb-2"
            />
          )}
          <label className="btn-secondary text-sm cursor-pointer inline-block">
            {coverPreview ? "Change Cover Image" : "Add Cover Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            className="input text-xl font-semibold"
            placeholder="Post title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input
            className="input"
            placeholder="react, nodejs, javascript"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        {/* Series */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Series <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className="input"
            placeholder="e.g. MERN Beginners Guide"
            value={form.series}
            onChange={(e) => setForm({ ...form, series: e.target.value })}
          />
        </div>

        {/* Markdown Editor */}
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

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Publishing..." : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}