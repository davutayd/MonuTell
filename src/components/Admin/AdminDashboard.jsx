import React, { useState, useEffect } from "react";
import SubmissionCard from "./SubmissionCard";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchSubmissions = async () => {
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/submissions?status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        }
      );

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Invalid password");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      setSubmissions(data.submissions);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [statusFilter, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/admin/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve");
      }
    } catch {
      alert("Failed to approve submission");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`/api/admin/reject/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject");
      }
    } catch {
      alert("Failed to reject submission");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={styles.passwordInput}
              autoFocus
            />
            {authError && <p className={styles.errorText}>{authError}</p>}
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
          <a href="/" className={styles.backLink}>
            ← Back to Map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <a href="/" className={styles.backButton}>
          ← Back to Map
        </a>
      </header>

      <div className={styles.filterBar}>
        <button
          className={`${styles.filterButton} ${statusFilter === "pending" ? styles.active : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "approved" ? styles.active : ""}`}
          onClick={() => setStatusFilter("approved")}
        >
          Approved
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "rejected" ? styles.active : ""}`}
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "all" ? styles.active : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading submissions...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={fetchSubmissions} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p>No {statusFilter} submissions found</p>
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className={styles.submissionsList}>
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={statusFilter === "pending"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
