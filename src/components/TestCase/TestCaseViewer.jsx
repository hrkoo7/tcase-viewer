import React from 'react';
import '../../App.css';

export default function TestCaseViewer({ code = '', loading, onGenerate }) {
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test-cases.txt';
    link.click();
  };

  return (
    <div className="testcase-viewer">
      <h2 className="component-heading">🧪 Test Code</h2>
      <div className="testcase-buttons">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating tests…' : 'Generate Test Cases'}
        </button>

        {code && (
          <button
            onClick={handleDownload}
            className="download-btn"
          >
            Download
          </button>
        )}
      </div>

      {code && (
        <pre className="testcase-box">
          {code}
        </pre>
      )}
    </div>
  );
}
