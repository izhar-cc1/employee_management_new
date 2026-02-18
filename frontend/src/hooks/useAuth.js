import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/me")
      .then((response) => {
        const role = response.data?.role;
        const employeeId = response.data?.employeeId;
        if (role) {
          localStorage.setItem("role", role);
        }
        if (employeeId) {
          localStorage.setItem("employeeId", employeeId);
        }
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
