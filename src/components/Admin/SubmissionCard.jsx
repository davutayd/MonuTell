import React, { useState } from "react";
import styles from "./SubmissionCard.module.css";

const SubmissionCard = ({ submission, onApprove, onReject, showActions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    await onApprove(submission.id);
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    await onReject(submission.id);
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = () => {
    if (submission.type === "photo_upload") {
      return "📷 Photo Upload";
    }
    return "📍 New Place";
  };

  const getStatusBadge = () => {
    const statusClasses = {
      pending: styles.statusPending,
      approved: styles.statusApproved,
      rejected: styles.statusRejected,
    };
    return (
      <span className={`${styles.statusBadge} ${statusClasses[submission.status]}`}>
        {submission.status}
      </span>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.typeLabel}>{getTypeLabel()}</span>
        {getStatusBadge()}
      </div>

      {submission.image_url && (
        <div
          className={`${styles.imageContainer} ${imageExpanded ? styles.expanded : ""}`}
          onClick={() => setImageExpanded(!imageExpanded)}
        >
          <img
            src={submission.image_url}
            alt="Submission"
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.cardContent}>
        {submission.type === "photo_upload" && submission.monument_name && (
          <div className={styles.infoRow}>
            <span className={styles.label}>Target Monument:</span>
            <span className={styles.value}>{submission.monument_name}</span>
          </div>
        )}

        {submission.type === "new_place" && submission.payload && (
          <>
            {submission.payload.name_en && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{submission.payload.name_en}</span>
              </div>
            )}
            {submission.payload.category && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Category:</span>
                <span className={styles.value}>{submission.payload.category}</span>
              </div>
            )}
            {submission.payload.story_en && (
              <div className={styles.storyPreview}>
                <span className={styles.label}>Story:</span>
                <p className={styles.storyText}>
                  {submission.payload.story_en.length > 150
                    ? submission.payload.story_en.substring(0, 150) + "..."
                    : submission.payload.story_en}
                </p>
              </div>
            )}
            {submission.payload.latitude && submission.payload.longitude && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>
                  {submission.payload.latitude.toFixed(4)}, {submission.payload.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </>
        )}

        <div className={styles.infoRow}>
          <span className={styles.label}>Submitted:</span>
          <span className={styles.value}>{formatDate(submission.created_at)}</span>
        </div>
      </div>

      {showActions && (
        <div className={styles.cardActions}>
          <button
            className={styles.rejectButton}
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading ? "..." : "✕ Reject"}
          </button>
          <button
            className={styles.approveButton}
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? "..." : "✓ Approve"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionCard;
