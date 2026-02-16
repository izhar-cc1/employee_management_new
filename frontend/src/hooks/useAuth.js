import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/", { withCredentials: true })
      .then(() => {
        // ✅ token is valid
        setLoading(false);
      })
      .catch(() => {
        // ❌ not authenticated
        navigate("/");
      });
  }, [navigate]);

  return { loading };
};
