// src/pages/TestCasePage.jsx
import React, { useState, useEffect } from 'react';
import RepoList from '../components/Repo/RepoList';
import FileList from '../components/Repo/FileList';
import FileContentViewer from '../components/Repo/FileContentViewer';
import SummaryViewer from '../components/TestCase/SummaryViewer';
import TestCaseViewer from '../components/TestCase/TestCaseViewer';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const TestCasePage = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [summary, setSummary] = useState('');
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch repos on mount
  useEffect(() => {
    setError(null);
    fetch(`${API_BASE}/github/repos`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setRepos(data);
      })
      .catch(err => {
        console.error('fetch repos error', err);
        setError('Failed to load repositories');
      });
  }, []);

  // NOTE: RepoList must call onSelect(repo) — check component if not, adapt accordingly.
  const handleRepoSelect = (repo) => {
    console.log('handleRepoSelect', repo);
    setError(null);
    setSelectedRepo(repo);
    setFiles([]);
    setSelectedFile(null);
    setFileContent('');
    setSummary('');
    setTestCode('');

    // Use the query-style API you provided earlier:
    // GET /github/files?owner=hrkoo7&repo=artistly-mock
    const owner = repo.owner_login || (repo.owner && repo.owner.login) || repo.owner_login;
    const repoName = repo.name || repo.repo;
    if (!owner || !repoName) {
      console.error('Missing owner or repo name on selected repo', repo);
      setError('Invalid repository data');
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/github/files?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`, { credentials: 'include' })
      .then(res => {
        setLoading(false);
        if (!res.ok) throw new Error(`Files fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('files response', data);
        setFiles(data || []);
      })
      .catch(err => {
        console.error('File fetch error:', err);
        setError('Failed to load files for this repository');
      });
  };

  const handleFileSelect = (file) => {
    console.log('handleFileSelect', file);
    setError(null);
    setSelectedFile(file);
    setFileContent('');
    setSummary('');
    setTestCode('');

    // Use the file-content API shape you mentioned earlier:
    // GET /github/file-content?owner=hrkoo7&repo=artistly-mock&sha=1329...
    const owner = selectedRepo?.owner_login || (selectedRepo?.owner && selectedRepo.owner.login);
    const repoName = selectedRepo?.name;
    const sha = file?.sha;

    if (!owner || !repoName || !sha) {
      console.error('Missing owner/repo/sha', { owner, repoName, sha, file, selectedRepo });
      setError('Invalid file or repository data');
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/github/file-content?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}&sha=${encodeURIComponent(sha)}`, { credentials: 'include' })
      .then(res => {
        setLoading(false);
        if (!res.ok) throw new Error(`File content fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('file-content response', data);
        // Some backends return base64, some return plain text. handle both:
        if (data.content == null) {
          setFileContent('');
          setError('No content returned for file');
          return;
        }

        // Detect base64-ish: if string looks like base64 (contains only base64 chars and no newlines), decode.
        const isBase64 = typeof data.content === 'string' && /^[A-Za-z0-9+/=\n\r]+$/.test(data.content) && data.content.length % 4 === 0;
        try {
          const content = isBase64 ? atob(data.content) : data.content;
          setFileContent(content);
        } catch (err) {
          // fallback: try using the raw content
          console.warn('could not decode base64, using raw content', err);
          setFileContent(data.content);
        }
      })
      .catch(err => {
        console.error('Content fetch error:', err);
        setError('Failed to load file content');
      });
  };

  const handleGenerateSummary = async () => {
  setError(null);

  if (!selectedRepo || !selectedFile) {
    setError('Please select a repository and a file first.');
    return;
  }

  const owner = selectedRepo.owner_login || (selectedRepo.owner && selectedRepo.owner.login);
  const repoName = selectedRepo.name;
  const filesPayload = [
    { path: selectedFile.path, sha: selectedFile.sha }
  ];

  setLoading(true);
  try {
    // Adjust endpoint if your server uses a different path
    const res = await fetch(`${API_BASE}/ai/summaries`, {
      method: 'POST',
      credentials: 'include',           // send HttpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner,
        repo: repoName,
        files: filesPayload
      })
    });

    setLoading(false);

    // helpful debugging on 500
    if (!res.ok) {
      const text = await res.text();
      console.error('Summaries API error:', res.status, text);
      throw new Error(`Summaries API failed: ${res.status} — ${text}`);
    }

    const data = await res.json();
    // backend returns "summaries"
    setSummary(data.summaries ?? data.summary ?? '');
  } catch (err) {
    console.error('handleGenerateSummary error:', err);
    setError('Failed to generate summary: ' + err.message);
  }
};


  const handleGenerateTestCode = async () => {
  setError(null);
  if (!selectedRepo || !selectedFile || !summary) {
    setError('Select repo, file and generate summary first.');
    return;
  }

  const owner = selectedRepo.owner_login || (selectedRepo.owner && selectedRepo.owner.login);
  const repoName = selectedRepo.name;
  const payload = {
    owner,
    repo: repoName,
    file: { path: selectedFile.path, sha: selectedFile.sha },
    summaries: summary, // your backend expects this key name
  };

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/ai/test-code`, {
      method: 'POST',
      credentials: 'include',            // if backend requires cookie auth
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text(); // read raw for better debug on non-json or 500
    setLoading(false);

    if (!res.ok) {
      console.error('Test-code API error status:', res.status, 'body:', text);
      setError(`Test generation failed: ${res.status} — ${text}`);
      return;
    }

    // try parse JSON (server may return JSON)
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn('Response not JSON, using raw text');
      data = { code: text };
    }

    // normalize returned code (field might be code, testcase, or wrapped in markdown)
    let code = data.code ?? data.testcase ?? data.test_code ?? data.testcase_code ?? '';
    if (!code && typeof text === 'string') code = text;

    // strip leading/trailing triple-backticks if present
    code = code.replace(/^```[\w-]*\n?/, '').replace(/\n?```$/, '');

    setTestCode(code);
  } catch (err) {
    console.error('handleGenerateTestCode error', err);
    setLoading(false);
    setError('Failed to generate test code: ' + (err.message || err));
  }
};


  return (
    <div style={{ padding: '20px' }}>
      <h2><a href='/testcase' className='heading-link'>Test Case Generator</a></h2>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading…</div>}

      {!selectedRepo && <RepoList repos={repos} onSelect={handleRepoSelect} />}

      {selectedRepo && !selectedFile && (
        <>
          <button onClick={() => setSelectedRepo(null)}>← Back to repos</button>
          <h3>{selectedRepo.full_name || selectedRepo.name}</h3>
          <FileList files={files} onSelect={handleFileSelect} />
        </>
      )}

      {selectedFile && !summary && (
        <>
          <button onClick={() => setSelectedFile(null)}>← Back to files</button>
          <FileContentViewer content={fileContent} />
          <div style={{ marginTop: 12 }}>
            <button onClick={handleGenerateSummary}>Generate Summary</button>
          </div>
        </>
      )}

      {summary && !testCode && (
        <>
          <SummaryViewer summary={summary} />
          <div style={{ marginTop: 12 }}>
            <button onClick={handleGenerateTestCode}>Generate Test Code</button>
          </div>
        </>
      )}

      {testCode && <TestCaseViewer code={testCode} />}
    </div>
  );
};

export default TestCasePage;
