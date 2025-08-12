import React from 'react';
import '../../App.css';

export default function RepoList({ repos = [], onSelect }) {
  return (
    <div className="repo-list">
      <h2 className="component-heading"> Repositories</h2>
      {repos.map((repo) => (
        <button
          key={repo.id}
          onClick={() => onSelect(repo)}
        >
          {repo.full_name}
        </button>
      ))}
    </div>
  );
}
