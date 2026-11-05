import React, { useEffect, useMemo, useState } from "react";
import { Chart } from "./Chart";

const stocks = [
  { ticker: "CHEM", name: "CHEM STUFF" },
  { ticker: "DOT", name: "DOT COMMS" },
  { ticker: "PAN", name: "PAN INC." },
  { ticker: "YUM", name: "YUMMY FOODS" },
];

async function requestGame(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.msg || "Game request failed");
  return data;
}

export function Play() {
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const code = window.localStorage.getItem("activeGroupCode");

  async function refresh() {
    if (!code) return;
    try {
      setGame(await requestGame(`/games/${code}`));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, 1000);
    return () => window.clearInterval(intervalId);
  }, [code]);

  async function trade(ticker, quantity, action) {
    try {
      const nextGame = await requestGame(`/games/${code}/trade`, {
        method: "POST",
        body: JSON.stringify({ ticker, quantity, action }),
      });
      setGame(nextGame);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const totalValue = useMemo(() => {
    if (!game) return 0;
    return Object.entries(game.portfolio.holdings).reduce(
      (total, [ticker, holding]) => total + holding.shares * game.prices[ticker].price,
      game.portfolio.cash,
    );
  }, [game]);

  if (!code) return <main><h2>Join a group before starting a game.</h2></main>;
  if (!game) return <main><p>Loading game...</p>{error && <p className="error-message">{error}</p>}</main>;

  return (
    <main className="play-main">
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="play-layout">
        <aside className="leaderboard" aria-labelledby="leaderboard-title">
          <h2 id="leaderboard-title">Leaderboard</h2>
          <ol>
            {game.leaderboard.map((player) => (
              <li className={player.email === game.playerEmail ? "current-player" : ""} key={player.email}>
                <span>{player.email}</span><strong>${player.score.toFixed(2)}</strong>
              </li>
            ))}
          </ol>
        </aside>
        <section className="market-panel" aria-labelledby="portfolio-chart-title">
          <div className="market-header">
            <div><h2 id="portfolio-chart-title">Group market</h2><p>Server prices and trades update for everyone.</p></div>
            <div className="round-clock" aria-live="polite">
              <span>{game.status === "started" ? "Time left" : "Round over"}</span>
              <strong>{game.remainingSeconds}s</strong>
            </div>
          </div>
          <section className="portfolio-summary">
            <h3>Your Portfolio</h3>
            <p>Cash: <strong>${game.portfolio.cash.toFixed(2)}</strong></p>
            <p>Total value: <strong>${totalValue.toFixed(2)}</strong></p>
          </section>
          <div className="chart-container">
            {stocks.map((stock) => {
              const holding = game.portfolio.holdings[stock.ticker] ?? { shares: 0, averageCost: 0 };
              return <Chart key={stock.ticker} {...stock} history={game.prices[stock.ticker].history}
                cash={game.portfolio.cash} isActive={game.status === "started"} shares={holding.shares}
                averageCost={holding.averageCost} onBuy={(ticker, quantity) => trade(ticker, quantity, "buy")}
                onSell={(ticker, quantity) => trade(ticker, quantity, "sell")} />;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
