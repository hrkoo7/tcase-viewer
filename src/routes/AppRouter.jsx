// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import TestCasePage from '../pages/TestCasePage';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected SPA route — backend redirects to this after OAuth */}
        <Route
          path="/testcase"
          element={
            <PrivateRoute>
              <TestCasePage />
            </PrivateRoute>
          }
        />

        {/* Root -> try testcase (PrivateRoute will send to /login if not authed) */}
        <Route path="/" element={<Navigate to="/testcase" replace />} />

        {/* Unknown -> go root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

