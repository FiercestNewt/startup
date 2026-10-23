
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Noise } from "noisejs";
import "./Chart.css";

function hashString(value = "") {
      return (
            [...String(value)].reduce(
                  (hash, char) =>
                        Math.imul(hash ^ char.charCodeAt(0), 16777619),
                  2166136261,
            ) >>> 0
      );
}

function getData(ticker, offset = 0, seed = 1, startPrice = 50) {
      const noise = new Noise(
            ((hashString(ticker) ^ seed) / 4294967295) * 1000,
      );
      const data = [];
      const firstTime = offset - 29;

      for (let i = 0; i < 30; i++) {
            const time = firstTime + i;
            const movement = noise.perlin2(time / 10, 0.25) * startPrice * 0.035;
            const trend = (time / 29 - 0.5) * startPrice * 0.12;
            const value = Math.max(0.01, startPrice + movement + trend);

            data.push({
                  index: i,
                  value: Number(value.toFixed(2)),
            });
      }

      return data;
}

const presets = [1, 10, 25];

export function Chart({
      ticker,
      name,
      offset = 0,
      seed = 1,
      shares = 0,
      averageCost = 0,
      cash = 0,
      isActive = true,
      maxBuy = Infinity,
      maxSell = shares,
      onBuy,
      onSell,
}) {
      const [quantity, setQuantity] = useState(1);

      const data = useMemo(
            () => getData(ticker, offset, seed),
            [ticker, offset, seed],
      );

      const price = data[data.length - 1].value;
      const previousPrice = data[data.length - 2].value;
      const firstPrice = data[0].value;

      // Compare the latest price against the start of the chart.
      const change = ((price - firstPrice) / firstPrice) * 100;
      const positive = price >= firstPrice;
      const color = positive ? "#9d9a35" : "#d34f45";

      const profit = shares * (price - averageCost);
      const affordableShares = Math.floor(cash / price);
      const canBuy = isActive ? Math.min(maxBuy, affordableShares) : 0;
      const canSell = isActive ? Math.min(maxSell, shares) : 0;

      function buy(amount) {
            const actualAmount = amount === "max" ? canBuy : Math.min(amount, canBuy);
            if (actualAmount > 0) onBuy?.(ticker, actualAmount, price);
      }

      function sell(amount) {
            const actualAmount = amount === "max" ? canSell : Math.min(amount, canSell);
            if (actualAmount > 0) onSell?.(ticker, actualAmount, price);
      }

      return (
            <article className="stock-card">
                  <h3 className="stock-name">{name ?? ticker}</h3>

                  <div className="stock-quote">
                        <span className={positive ? "positive" : "negative"}>
                              ${price.toFixed(2)}
                        </span>
                        <span className={positive ? "positive" : "negative"}>
                              {positive ? "▲" : "▼"}{" "}
                              {Math.abs(change).toFixed(2)}%
                        </span>
                  </div>

                  <div className="stock-profit">
                        <strong>◆ PROFIT</strong>
                        <span className={profit >= 0 ? "positive" : "negative"}>
                              {profit < 0 ? "-$" : "$"}
                              {Math.abs(profit).toFixed(2)}
                        </span>
                  </div>

                  <div className="stock-chart">
                        <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                    data={data}
                                    margin={{
                                          top: 3,
                                          right: 0,
                                          bottom: 0,
                                          left: 0,
                                    }}
                              >
                                    <XAxis dataKey="index" hide />
                                    <YAxis
                                          domain={["dataMin", "dataMax"]}
                                          hide
                                    />
                                    <Area
                                          type="monotone"
                                          dataKey="value"
                                          stroke={color}
                                          fill={color}
                                          fillOpacity={0.85}
                                          strokeWidth={1.5}
                                          isAnimationActive={false}
                                          dot={false}
                                    />
                              </AreaChart>
                        </ResponsiveContainer>
                  </div>

                  <div className="stock-holdings">
                        <span>shares:</span>
                        <strong>{shares}</strong>
                  </div>

                  <div className="stock-actions">
                        <button
                              className="stock-button"
                              disabled={canSell < 1}
                              onClick={() => sell(quantity)}
                        >
                              sell
                        </button>
                        <button
                              className="stock-button"
                              disabled={canBuy < 1}
                              onClick={() => buy(quantity)}
                        >
                              buy
                        </button>
                  </div>

                  <div className="stock-quantities">
                        {presets.map((amount) => (
                              <button
                                    key={amount}
                                    className={
                                          quantity === amount ? "selected" : ""
                                    }
                                    onClick={() => setQuantity(amount)}
                              >
                                    {amount}
                              </button>
                        ))}
                        <button
                              className={quantity === "max" ? "selected" : ""}
                              onClick={() => setQuantity("max")}
                        >
                              MAX
                        </button>
                  </div>
            </article>
      );
}
