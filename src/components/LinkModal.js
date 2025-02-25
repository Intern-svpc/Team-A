import React from "react";

function LinkModal({ link, expiry, onClose }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  return (
    <div className="link-modal-overlay">
      <div className="link-modal">
        <h2>Generated Link</h2>
        <p>{link}</p>
        <p>This link will expire on: {new Date(expiry).toLocaleString()}</p>
        <button onClick={handleCopyLink}>Copy Link</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default LinkModal;