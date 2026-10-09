import React from 'react';

export function Play() {
  return (
    <main>
      <div className="players">Player: <span className="player-name">Its you</span></div>
      <ul className="notification">
        <li>Tim: $123.45</li>
        <li>Ada: $678.90</li>
        <li>You: $123.45</li>
      </ul>
      <div><label htmlFor="count">Score</label><input type="text" id="count" value="--" readOnly /></div>
      <div><button type="button">Reset</button></div>
      <div><button type="button">Buy</button><button type="button">Sell</button></div>
    </main>
  );
}
