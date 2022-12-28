import React from "react";
import "./spinner.css";

export default function LoadingSpinner({ children }) {
  return (
    <div>
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
      {children}
      {/* Loading Token Info.... */}
    </div>
  );
}
