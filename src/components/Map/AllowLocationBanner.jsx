import React from "react";

const AllowLocationBanner = ({ onAllow }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        background: "#fff8e1",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 2000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <span>📍 Konum izni gerekiyor. Başlatmak için tıkla.</span>
      <button
        onClick={onAllow}
        style={{
          padding: "6px 12px",
          background: "#2a7",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Konumumu Göster
      </button>
    </div>
  );
};

export default AllowLocationBanner;
