import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/")
      .then(() => {
        // ✅ token is valid
        setLoading(false);
      })
      .catch(() => {
        // ❌ not authenticated
        setLoading(false);
        navigate("/");
      });
  }, [navigate]);

  return { loading };
};
