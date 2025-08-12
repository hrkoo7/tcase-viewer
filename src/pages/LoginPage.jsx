// src/pages/LoginPage.jsx
import React from 'react';
import GitHubLoginButton from '../components/Auth/GitHubLoginButton';

const LoginPage = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1>Login to Test Case Generator</h1>
      <GitHubLoginButton />
    </div>
  );
};

export default LoginPage;
