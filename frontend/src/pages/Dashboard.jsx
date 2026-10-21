
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!data) {
    return <p>No dashboard data available.</p>;
  }

  
return (
  <div className="dashboard">
    <h1>Dashboard</h1>
    <p className="dashboard-subtitle">
      Overview of your employees and tasks
    </p>

    <h2>Employees</h2>
    <div className="dashboard-grid">
      <div className="stat-card">
        <p>Total Employees</p>
        <h3>{data.employees.total}</h3>
      </div>

      <div className="stat-card">
        <p>Active</p>
        <h3>{data.employees.byStatus.Active}</h3>
      </div>

      <div className="stat-card">
        <p>Inactive</p>
        <h3>{data.employees.byStatus.Inactive}</h3>
      </div>

      <div className="stat-card">
        <p>On Leave</p>
        <h3>{data.employees.byStatus["On Leave"]}</h3>
      </div>
    </div>

    <h2>Tasks</h2>
    <div className="dashboard-grid">
      <div className="stat-card">
        <p>Total Tasks</p>
        <h3>{data.tasks.total}</h3>
      </div>

      <div className="stat-card">
        <p>Todo</p>
        <h3>{data.tasks.byStatus.Todo}</h3>
      </div>

      <div className="stat-card">
        <p>In Progress</p>
        <h3>{data.tasks.byStatus["In Progress"]}</h3>
      </div>

      <div className="stat-card">
        <p>Completed</p>
        <h3>{data.tasks.byStatus.Completed}</h3>
      </div>

      <div className="stat-card">
        <p>Cancelled</p>
        <h3>{data.tasks.byStatus.Cancelled}</h3>
      </div>

      <div className="stat-card overdue-card">
        <p>Overdue Tasks</p>
        <h3>{data.tasks.overdue}</h3>
      </div>
    </div>
  </div>
);

}
