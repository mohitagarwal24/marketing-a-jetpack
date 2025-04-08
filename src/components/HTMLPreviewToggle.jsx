import React, { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import "./HTMLPreviewToggle.css";

const HTMLPreviewToggle = ({ rawHTML }) => {
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef(null);

  const toggleView = () => {
    setShowPreview((prev) => !prev);
  };

  // Load sanitized HTML into iframe
  useEffect(() => {
    if (showPreview && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(DOMPurify.sanitize(rawHTML));
        doc.close();
      }
    }
  }, [showPreview, rawHTML]);

  return (
    <div className="preview-box">
      <div className="toggle-container">
        <button
          className={`toggle-button ${!showPreview ? "active" : ""}`}
          onClick={() => setShowPreview(false)}
        >
          Show Code
        </button>
        <button
          className={`toggle-button ${showPreview ? "active" : ""}`}
          onClick={() => setShowPreview(true)}
        >
          Show Preview
        </button>
      </div>

      {showPreview ? (
        <iframe
          title="HTML Preview"
          ref={iframeRef}
          className="html-preview-iframe"
        />
      ) : (
        <pre className="html-code">
          <code>{rawHTML}</code>
        </pre>
      )}
    </div>
  );
};

export default HTMLPreviewToggle;
