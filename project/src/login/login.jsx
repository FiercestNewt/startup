
import React, { useEffect, useState } from 'react';
import DotField from './DotField';
import { Link } from 'react-router-dom';

async function requestApi(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.msg || 'The request could not be completed');
  }
  return data;
}

function GroupLobby({ user, onStartGame }) {
  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function runGroupAction(action) {
    setError('');
    setLoading(true);
    try {
      const newGroup = await action();
      setGroup(newGroup);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!group || group.status !== 'lobby') return undefined;

    const refreshGroup = async () => {
      try {
        const currentGroup = await requestApi(`/groups/${group.code}`);
        setGroup(currentGroup);
        if (currentGroup.status === 'started') {
          window.localStorage.setItem('activeGroupCode', currentGroup.code);
          onStartGame(currentGroup);
        }
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    const intervalId = window.setInterval(refreshGroup, 2000);
    return () => window.clearInterval(intervalId);
  }, [group, onStartGame]);

  function createGroup(event) {
    event.preventDefault();
    return runGroupAction(() =>
      requestApi('/groups', {
        method: 'POST',
        body: JSON.stringify({ name: groupName }),
      })
    );
  }

  function joinGroup(event) {
    event.preventDefault();
    return runGroupAction(() =>
      requestApi(`/groups/${joinCode.trim().toUpperCase()}/join`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
    );
  }

  function startGame() {
    return runGroupAction(async () => {
      const startedGroup = await requestApi(`/groups/${group.code}/start`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      window.localStorage.setItem('activeGroupCode', startedGroup.code);
      onStartGame(startedGroup);
      return startedGroup;
    });
  }

  return (
    <div className="group-lobby">
      <h2>Play in a group</h2>
      <p>Signed in as {user.email}</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      {!group ? (
        <div className="group-options">
          <form onSubmit={createGroup}>
            <h3>Create a group</h3>
            <label htmlFor="group-name">Group name</label>
            <div><input id="group-name" value={groupName} onChange={(event) => setGroupName(event.target.value)} required maxLength={50} /></div>
            <button type="submit" disabled={loading}>Create group</button>
          </form>
          <form onSubmit={joinGroup}>
            <h3>Join a group</h3>
            <label htmlFor="join-code">Group code</label>
            <div><input id="join-code" value={joinCode} onChange={(event) => setJoinCode(event.target.value)} required maxLength={6} /></div>
            <button type="submit" disabled={loading}>Join group</button>
          </form>
        </div>
      ) : (
        <section className="group-card">
          <h3>{group.name}</h3>
          <p>Share this code with your friends:</p>
          <strong className="join-code">{group.code}</strong>
          <h4>Players ({group.players.length})</h4>
          <ul>{group.players.map((player) => <li key={player}>{player}</li>)}</ul>
          {group.host === user.email ? (
            <button className="button" onClick={startGame} disabled={loading || group.status !== 'lobby'}>
              {group.status === 'started' ? 'Game started' : 'Start game'}
            </button>
          ) : (
            <p>Waiting for the host to start the game.</p>
          )}
        </section>
      )}
    </div>
  );
}

export function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestApi('/auth/me')
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/create';
      setUser(await requestApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="home-main">
      <div className="dot-field-background">
        <DotField
          gradientFrom="#5227FF"
          gradientTo="#FF9FFC"
          dotRadius={1.5}
          dotSpacing={14}
          cursorRadius={240}
          bulgeStrength={0.6}
          glowRadius={160}
          glowColor="#ffffff"
          gradientAngle={135}
          glowIntensity={0.8}
          baseOpacity={0.55}
          speed={1}
          interactive
          intro
          lightMode={false}
        />
      </div>

      <div className="login-content">
        {loading ? <p className="loading-message">Loading...</p> : user ? (
          <GroupLobby user={user} onStartGame={() => { window.location.href = '/play'; }} />
        ) : (
          <>
            <h1>Welcome to Grow ur Stonks</h1>
            <form onSubmit={authenticate}>
              <h2>{authMode === 'login' ? 'Log in' : 'Create account'}</h2>
              {error && <p className="error-message" role="alert">{error}</p>}
              <label htmlFor="email">Email</label>
              <div><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
              <label htmlFor="password">Password</label>
              <div><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
              <button type="submit">{authMode === 'login' ? 'Log in' : 'Create account'}</button>
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'create' : 'login')}>
                {authMode === 'login' ? 'Create an account' : 'I already have an account'}
              </button>
            </form>
            <Link className="button" to="/play">Play Alone</Link>
          </>
        )}
      </div>
    </main>
  );
}
