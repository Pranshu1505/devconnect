import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { initSocket } from "../../utils/socket";

export default function GitHubCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      authAPI.getMe().then((res) => {
        setUser(res.data.user);
        initSocket(res.data.user._id);
        navigate("/");
      });
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Signing you in with GitHub...</p>
    </div>
  );
}