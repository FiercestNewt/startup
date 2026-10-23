import React, { useState } from "react";
import { Chart } from "./Chart";

const INITIAL_CASH = 1000;

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
  }

  return (
    <main className="play-main">
      <div className="players">
        Player: <span className="player-name">It's you</span>
      </div>

      <section
        className="portfolio-chart"
        aria-labelledby="portfolio-chart-title"
      >
        <h2 id="portfolio-chart-title">Individual Stocks</h2>

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
                seed={12345}
                cash={portfolio.cash}
                shares={holding.shares}
                averageCost={holding.averageCost}
                onBuy={buyStock}
                onSell={sellStock}
              />
            );
          })}
        </div>
      </section>

      <section className="portfolio-summary">
        <h3>Your Portfolio</h3>

        <p>
          Cash: <strong>${portfolio.cash.toFixed(2)}</strong>
        </p>

        <p>
          Total shares:{" "}
          <strong>
            {Object.values(portfolio.holdings).reduce(
              (total, holding) => total + holding.shares,
              0,
            )}
          </strong>
        </p>

        <button type="button" onClick={resetPortfolio}>
          Reset Portfolio
        </button>
      </section>

      <ul className="notification">
        <li>Tim: $123.45</li>
        <li>Ada: $678.90</li>
        <li>You: ${portfolio.cash.toFixed(2)}</li>
      </ul>
    </main>
  );
}
