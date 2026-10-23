
import React, { useState } from 'react';
import DotField from './DotField';
import { Link } from 'react-router-dom';

function generateRandomJoinCode() {
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += String.fromCharCode(
      Math.floor(Math.random() * 26) + 65
    );
  }

  return code;
}

function JoinCodeScreen({ onStartGame }) {
  // Generate the code once when this screen mounts.
  const [joinCode] = useState(generateRandomJoinCode);

  return (
    <div className="join-code-screen">
      <h2>Join Code</h2>
      <p>Share this code with your friends to join the game:</p>
      <div className="join-code">{joinCode}</div>

      <button className="button" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  );
}

export function Login() {
  const [showJoinCode, setShowJoinCode] = useState(false);

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
        {showJoinCode ? (
          <JoinCodeScreen
            onStartGame={() => {
              window.location.href = '/play';
            }}
          />
        ) : (
          <>
            <h1>Welcome to Grow ur Stonks</h1>

            <form onSubmit={(event) => event.preventDefault()}>
              <button
                type="button"
                className="button"
                onClick={() => setShowJoinCode(true)}
              >
                Play in Group
              </button>

              <Link className="button" to="/play">
                Play Alone
              </Link>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
