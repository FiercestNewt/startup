import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const portfolioHistory = [
  { day: 'Day 1', you: 500, tim: 500, ada: 500 },
  { day: 'Day 2', you: 540, tim: 525, ada: 580 },
  { day: 'Day 3', you: 610, tim: 590, ada: 620 },
  { day: 'Day 4', you: 575, tim: 640, ada: 680 },
  { day: 'Day 5', you: 690, tim: 700, ada: 735 },
  { day: 'Day 6', you: 760, tim: 745, ada: 810 },
];

export function Play() {
  return (
    <main className="play-main">
      <div className="players">Player: <span className="player-name">Its you</span></div>
      <section className="portfolio-chart" aria-labelledby="portfolio-chart-title">
        <h2 id="portfolio-chart-title">Portfolio value</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c3d9c8" />
              <XAxis dataKey="day" tick={{ fill: '#20312a' }} />
              <YAxis
                tick={{ fill: '#20312a' }}
                tickFormatter={(value) => `$${value}`}
                width={64}
              />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="you" name="You" stroke="#176b45" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="tim" name="Tim" stroke="#238b5a" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ada" name="Ada" stroke="#d28b29" strokeWidth={2} dot={{ r: 3 }} />
                  <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
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
