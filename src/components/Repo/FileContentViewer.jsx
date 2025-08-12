import React from 'react';
import '../../App.css';

export default function FileContentViewer({ content = '', loading }) {
  if (loading) {
    return <div className="file-content-loading">Loading file content…</div>;
  }

  return (
    <div className="file-content-container">
      <h2 className="component-heading">File Content</h2>
      <pre className="file-content-text">
        {content}
      </pre>
    </div>
  );
}
