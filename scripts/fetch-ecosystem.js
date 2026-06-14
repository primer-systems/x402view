#!/usr/bin/env node
/**
 * Fetches ecosystem data from x402-foundation/x402 repo
 * Saves metadata.json files and logos to data/ecosystem/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'x402-foundation/x402';
const PARTNERS_PATH = 'typescript/site/app/ecosystem/partners-data';
const LOGOS_PATH = 'typescript/site/public/logos';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'ecosystem');
const LOGOS_OUTPUT_DIR = path.join(OUTPUT_DIR, 'logos');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'x402view-ecosystem-fetch' }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (res.status !== 200) throw new Error(`HTTP ${res.status} for ${url}`);
  return JSON.parse(res.data);
}

async function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'x402view-ecosystem-fetch' }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchBinary(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getDirectoryContents(repoPath) {
  const url = `https://api.github.com/repos/${REPO}/contents/${repoPath}`;
  const items = await fetchJSON(url);
  return items.filter(item => item.type === 'dir').map(item => item.name);
}

async function getFileList(repoPath) {
  const url = `https://api.github.com/repos/${REPO}/contents/${repoPath}`;
  try {
    const items = await fetchJSON(url);
    return items.filter(item => item.type === 'file').map(item => ({
      name: item.name,
      download_url: item.download_url
    }));
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('Fetching ecosystem data from x402-foundation/x402...\n');

  // Create output directories
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(LOGOS_OUTPUT_DIR, { recursive: true });

  // Get list of all partner projects
  console.log('Getting project list...');
  const projects = await getDirectoryContents(PARTNERS_PATH);
  console.log(`Found ${projects.length} projects\n`);

  // Fetch each project's metadata
  const allMetadata = [];
  let successCount = 0;
  let errorCount = 0;

  for (const project of projects) {
    process.stdout.write(`Fetching ${project}... `);
    try {
      const metadataUrl = `https://raw.githubusercontent.com/${REPO}/main/${PARTNERS_PATH}/${project}/metadata.json`;
      const res = await fetch(metadataUrl);
      if (res.status === 200) {
        const metadata = JSON.parse(res.data);
        metadata._id = project; // Add ID from folder name
        allMetadata.push(metadata);
        console.log('OK');
        successCount++;
      } else {
        console.log(`SKIP (${res.status})`);
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      errorCount++;
    }

    // Rate limiting - be nice to GitHub
    await new Promise(r => setTimeout(r, 100));
  }

  // Save combined metadata
  const outputFile = path.join(OUTPUT_DIR, 'projects.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    _meta: {
      source: 'https://github.com/x402-foundation/x402',
      fetchedAt: new Date().toISOString(),
      count: allMetadata.length
    },
    projects: allMetadata
  }, null, 2));

  console.log(`\nSaved ${successCount} projects to ${outputFile}`);
  if (errorCount > 0) console.log(`${errorCount} errors`);

  // Fetch logos
  console.log('\nFetching logos...');
  const logoFiles = await getFileList(LOGOS_PATH);
  console.log(`Found ${logoFiles.length} logo files`);

  let logoSuccess = 0;
  for (const logo of logoFiles) {
    process.stdout.write(`Fetching ${logo.name}... `);
    try {
      const data = await fetchBinary(logo.download_url);
      fs.writeFileSync(path.join(LOGOS_OUTPUT_DIR, logo.name), data);
      console.log('OK');
      logoSuccess++;
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\nSaved ${logoSuccess} logos to ${LOGOS_OUTPUT_DIR}`);
  console.log('\nDone!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
