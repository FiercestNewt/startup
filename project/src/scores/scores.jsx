import React, { useEffect, useState } from 'react';

export function Scores() {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/scores', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Unable to load scores');
        setScores(data);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <main>
      {error && <p className="error-message">{error}</p>}
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Score</th><th>Date</th></tr></thead>
        <tbody>
          {scores.map((entry, index) => (
            <tr key={`${entry.groupId}-${entry.email}`}><td>{index + 1}</td><td>{entry.email}</td>
              <td>${entry.score.toFixed(2)}</td><td>{new Date(entry.date).toLocaleDateString()}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
