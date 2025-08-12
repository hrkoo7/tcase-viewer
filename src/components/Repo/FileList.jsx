import React from "react";
import "../../App.css"; 

export default function FileList({ files = [], onSelect }) {
  return (
    <div className="file-list">
      <h2 className="component-heading"> Files</h2>
      {files.map((file) => (
        <button
          key={file.sha}
          onClick={() => onSelect(file)}
          className="file-list-item"
        >
          <span className="file-icon">📄</span>
          <span className="file-name">{file.path}</span>
        </button>
      ))}
    </div>
  );
}
