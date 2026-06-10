import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import GitHubCallback from "./pages/Auth/GitHubCallback";
import PostList from "./pages/Blog/PostList";
import PostDetail from "./pages/Blog/PostDetail";
import CreatePost from "./pages/Blog/CreatePost";
import EditPost from "./pages/Blog/EditPost";
import JobList from "./pages/Jobs/JobList";
import JobDetail from "./pages/Jobs/JobDetail";
import CreateJob from "./pages/Jobs/CreateJob";
import ProfilePage from "./pages/Profile/ProfilePage";
import EditProfile from "./pages/Profile/EditProfile";
import Dashboard from "./pages/Dashboard/Dashboard";

// Layout
import Navbar from "./components/layout/Navbar";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicOnly = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/users/:username" element={<ProfilePage />} />

            {/* Auth */}
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/auth/github" element={<GitHubCallback />} />

            {/* Private */}
            <Route path="/write" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
            <Route path="/posts/:id/edit" element={<PrivateRoute><EditPost /></PrivateRoute>} />
            <Route path="/jobs/new" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
            <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}