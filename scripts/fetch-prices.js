#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const PROJECTS_PATH = path.join(__dirname, '..', 'data', 'projects.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'prices.json');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        const wait = Math.pow(2, i + 1) * 1000;
        console.log(`Rate limited, waiting ${wait}ms...`);
        await delay(wait);
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.status?.error_code === 429) {
        const wait = Math.pow(2, i + 1) * 1000;
        console.log(`Rate limited (in body), waiting ${wait}ms...`);
        await delay(wait);
        continue;
      }
      return data;
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(1000);
    }
  }
  return null;
}

async function main() {
  console.log('Fetching price data from CoinGecko...');

  // Load projects
  const projectsData = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
  const projects = projectsData.projects;

  // Get all coingecko IDs
  const tokenIds = projects
    .filter(p => p.token?.coingecko_id)
    .map(p => p.token.coingecko_id);

  // Add bitcoin for comparison
  if (!tokenIds.includes('bitcoin')) {
    tokenIds.push('bitcoin');
  }

  console.log(`Fetching data for ${tokenIds.length} tokens...`);

  // Use /coins/markets endpoint - gets prices AND sparklines in ONE call
  const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}&sparkline=true&price_change_percentage=24h,7d`;
  const data = await fetchWithRetry(url);

  if (!data || data.length === 0) {
    console.error('Failed to fetch data - rate limited or error');
    process.exit(1);
  }

  console.log(`Data fetched for ${data.length} tokens`);

  // Transform to our format
  const prices = {};
  const sparklines = {};

  for (const coin of data) {
    prices[coin.id] = {
      usd: coin.current_price,
      usd_24h_change: coin.price_change_percentage_24h,
      usd_market_cap: coin.market_cap,
      usd_24h_vol: coin.total_volume
    };

    // Sparkline data (7 days of hourly prices)
    if (coin.sparkline_in_7d?.price) {
      // Sample down to ~20 points
      const allPrices = coin.sparkline_in_7d.price;
      const step = Math.max(1, Math.floor(allPrices.length / 20));
      const now = Date.now();
      const hourMs = 60 * 60 * 1000;

      // Convert to [timestamp, price] format
      sparklines[coin.id] = allPrices
        .filter((_, i) => i % step === 0)
        .map((price, i) => {
          // Approximate timestamps (CG gives 168 hours of data)
          const hoursAgo = (allPrices.length - (i * step)) * (168 / allPrices.length);
          return [now - (hoursAgo * hourMs), price];
        });

      console.log(`  ${coin.id}: $${coin.current_price}, sparkline: ${sparklines[coin.id].length} points`);
    } else {
      sparklines[coin.id] = [];
      console.log(`  ${coin.id}: $${coin.current_price}, no sparkline`);
    }
  }

  // Build output
  const output = {
    prices,
    sparklines,
    updated: new Date().toISOString()
  };

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nDone! Saved to ${OUTPUT_PATH}`);
  console.log(`Updated: ${output.updated}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
