// src/components/auth/GitHubLoginButton.jsx
import React from 'react';

export default function GitHubLoginButton() {
  const handleLogin = () => {
    // Full navigation — NOT fetch/axios.
    // This lets the browser follow the redirect chain and GitHub auth page.
    window.location.href = 'http://localhost:5000/auth/github';
    // alternative: window.location.assign('http://localhost:5000/auth/github');
  };

  return (
    <button
      onClick={handleLogin}
      style={{ padding: '8px 14px', background: '#24292e', color: '#fff', borderRadius: 6, border: 'none' }}
    >
      Continue with GitHub
    </button>
  );
}

