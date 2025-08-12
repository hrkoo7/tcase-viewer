// src/routes/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const VERIFY_URL = '${process.env.REACT_APP_API_BASE}/github/repos';

export default function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(VERIFY_URL, {
          method: 'GET',
          credentials: 'include', // important for cookies
        });
        if (!mounted) return;
        setAuthed(res.ok);
      } catch (err) {
        console.error('verify failed', err);
        if (mounted) setAuthed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (checking) return <div>Checking auth…</div>;
  return authed ? children : <Navigate to="/login" replace />;
}
