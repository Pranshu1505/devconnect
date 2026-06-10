import { useState, useEffect, useCallback } from "react";
import { postsAPI, jobsAPI, usersAPI } from "../services/api";
import toast from "react-hot-toast";

// ── Posts Hook ────────────────────────────────────
export const usePosts = (params = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postsAPI.getAll(params);
      setPosts(res.data.posts);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, setPosts, loading, pagination, refetch: fetchPosts };
};

// ── Single Post Hook ──────────────────────────────
export const usePost = (id) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    postsAPI.getOne(id)
      .then((res) => setPost(res.data.post))
      .catch(() => toast.error("Post not found"))
      .finally(() => setLoading(false));
  }, [id]);

  return { post, setPost, loading };
};

// ── Jobs Hook ─────────────────────────────────────
export const useJobs = (params = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getAll(params);
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, loading, pagination, refetch: fetchJobs };
};

// ── Notifications Hook ────────────────────────────
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await usersAPI.getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter((n) => !n.read).length);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async () => {
    await usersAPI.markNotificationsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, markRead, refetch: fetchNotifications };
};