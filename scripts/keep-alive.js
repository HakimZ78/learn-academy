#!/usr/bin/env node

/**
 * Standalone script to keep Supabase project active
 * Can be run from anywhere (local machine, GitHub Actions, cron job, etc.)
 */

const SITE_URL = 'https://learn-academy.co.uk';
const KEEP_ALIVE_ENDPOINT = `${SITE_URL}/api/keep-alive`;

async function keepAlive() {
  try {
    console.log(`[${new Date().toISOString()}] Sending keep-alive request...`);

    const response = await fetch(KEEP_ALIVE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] Keep-alive successful:`, data);

    return data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Keep-alive failed:`, error.message);
    throw error;
  }
}

// Run immediately
keepAlive()
  .then(() => {
    console.log('Keep-alive completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Keep-alive failed:', error);
    process.exit(1);
  });