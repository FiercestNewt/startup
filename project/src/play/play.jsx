import React, { useEffect, useState } from "react";
import { Chart } from "./Chart";

const INITIAL_CASH = 1000;
const ROUND_SECONDS = 20;

const stocks = [
  { ticker: "CHEM", name: "CHEM STUFF", offset: 1 },
  { ticker: "DOT", name: "DOT COMMS", offset: 2 },
  { ticker: "PAN", name: "PAN INC.", offset: 3 },
  { ticker: "YUM", name: "YUMMY FOODS", offset: 4 },
];

function createInitialPortfolio() {
  return {
    cash: INITIAL_CASH,
    holdings: {},
  };
}

export function Play() {
  const [portfolio, setPortfolio] = useState(createInitialPortfolio);
  const [marketTick, setMarketTick] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(ROUND_SECONDS);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = window.setInterval(() => {
      setMarketTick((current) => current + 1);
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  function buyStock(ticker, quantity, price) {
    setPortfolio((current) => {
      const cost = quantity * price;

      // Validate the transaction.
      if (
        quantity <= 0 ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(price) ||
        price <= 0 ||
        cost > current.cash + 0.000001
      ) {
        return current;
      }

      const holding = current.holdings[ticker] ?? {
        shares: 0,
        averageCost: 0,
      };

      const newShares = holding.shares + quantity;
      const newAverageCost =
        (holding.shares * holding.averageCost + cost) / newShares;

      return {
        cash: current.cash - cost,
        holdings: {
          ...current.holdings,
          [ticker]: {
            shares: newShares,
            averageCost: newAverageCost,
          },
        },
      };
    });
  }

  function sellStock(ticker, quantity, price) {
    setPortfolio((current) => {
      const holding = current.holdings[ticker];

      // You cannot sell shares you do not own.
      if (
        !holding ||
        quantity <= 0 ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(price) ||
        price <= 0 ||
        quantity > holding.shares
      ) {
        return current;
      }

      const remainingShares = holding.shares - quantity;
      const newHoldings = { ...current.holdings };

      if (remainingShares === 0) {
        delete newHoldings[ticker];
      } else {
        newHoldings[ticker] = {
          ...holding,
          shares: remainingShares,
        };
      }

      return {
        cash: current.cash + quantity * price,
        holdings: newHoldings,
      };
    });
  }

  function resetPortfolio() {
    setPortfolio(createInitialPortfolio());
    setMarketTick(0);
    setSecondsRemaining(ROUND_SECONDS);
    setIsRunning(true);
  }

  return (
    <main className="play-main">
      <div className="play-layout">
        <aside className="leaderboard" aria-labelledby="leaderboard-title">
          <h2 id="leaderboard-title">Leaderboard</h2>
          <ol>
            <li><span>Tim</span><strong>$123.45</strong></li>
            <li><span>Ada</span><strong>$678.90</strong></li>
            <li className="current-player"><span>You</span><strong>${portfolio.cash.toFixed(2)}</strong></li>
          </ol>
        </aside>

        <section className="market-panel" aria-labelledby="portfolio-chart-title">
          <div className="market-header">
            <div>
              <h2 id="portfolio-chart-title">Individual Stocks</h2>
              <p>Prices update every second. Buy low and sell high.</p>
            </div>
            <div className="round-clock" aria-live="polite">
              <span>{isRunning ? "Time left" : "Round over"}</span>
              <strong>{secondsRemaining}s</strong>
            </div>
          </div>

          <section className="portfolio-summary">
            <h3>Your Portfolio</h3>
            <p>Cash: <strong>${portfolio.cash.toFixed(2)}</strong></p>
            <p>Total shares: <strong>{Object.values(portfolio.holdings).reduce((total, holding) => total + holding.shares, 0)}</strong></p>
            <button type="button" onClick={resetPortfolio}>
              {isRunning ? "Reset Round" : "Start New Round"}
            </button>
          </section>

          <div className="chart-container">
            {stocks.map((stock) => {
              const holding = portfolio.holdings[stock.ticker] ?? {
                shares: 0,
                averageCost: 0,
              };

              return (
                <Chart
                  key={stock.ticker}
                  {...stock}
                  offset={stock.offset + marketTick}
                  seed={12345}
                  cash={portfolio.cash}
                  isActive={isRunning}
                  shares={holding.shares}
                  averageCost={holding.averageCost}
                  onBuy={buyStock}
                  onSell={sellStock}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
