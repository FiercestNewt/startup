import React from 'react';
import { Link } from 'react-router-dom';

export function Login() {
  return (
    <main className="home-main">
      <h1>Welcome to Grow ur Stonks</h1>
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="email">Email address</label>
        <div><span>@</span><input id="email" type="email" placeholder="your@email.com" /></div>
        <div><span aria-hidden="true">🔒</span><input id="password" type="password" placeholder="password" /></div>
        <Link className="button" to="/play">Play in Group</Link>
        <Link className="button" to="/play">Play Alone</Link>
      </form>
    </main>
  );
}
