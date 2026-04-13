#!/usr/bin/env node

/**
 * Simple save/load server for OpenSCAD playground
 *
 * This server persists and loads the compressed application state
 * (OpenSCAD source code, parameters, view settings, etc.)
 *
 * Usage:
 *   node server.mjs
 *
 * The server will listen on http://localhost:3000 by default.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8284;
const STATE_FILE = path.join(__dirname, 'playground-state.json');
const MODEL_FILE = path.join(__dirname, 'model.txt');

// Log a message with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Decompress base64-encoded gzipped data
function decompressData(compressedData) {
  const buffer = Buffer.from(compressedData, 'base64');
  const decompressed = gunzipSync(buffer);
  return decompressed.toString('utf-8');
}

// Create the server
const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Add CORS headers to all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST /save - Save state to file
  if (method === 'POST' && url === '/save') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { data } = JSON.parse(body);

        // Save the compressed state
        fs.writeFileSync(STATE_FILE, JSON.stringify({ data }, null, 2), 'utf8');
        log(`State saved to ${STATE_FILE}`);

        // Decompress and extract source code to save as plaintext
        try {
          const decompressed = decompressData(data);
          const state = JSON.parse(decompressed);

          // Extract the active source (first source or the one matching activePath)
          if (state.params && state.params.sources && state.params.sources.length > 0) {
            const activePath = state.params.activePath || '/playground.scad';
            const activeSource = state.params.sources.find(s => s.path === activePath) || state.params.sources[0];

            if (activeSource && activeSource.content) {
              fs.writeFileSync(MODEL_FILE, activeSource.content, 'utf8');
              log(`Source saved to ${MODEL_FILE}`);
            }
          }
        } catch (extractErr) {
          log(`Warning: Could not extract source to model.txt: ${extractErr.message}`);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved' }));
      } catch (err) {
        log(`Error saving state: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });

    return;
  }

  // Handle GET /load - Load state from file
  if (method === 'GET' && url === '/load') {
    try {
      if (!fs.existsSync(STATE_FILE)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'No saved state found' }));
        return;
      }

      const data = fs.readFileSync(STATE_FILE, 'utf8');
      log(`State loaded from ${STATE_FILE}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      log(`Error loading state: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }

    return;
  }

  // Handle GET /model - Load plaintext source from model.txt
  if (method === 'GET' && url === '/model') {
    try {
      if (!fs.existsSync(MODEL_FILE)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No model file found. Save some code first!');
        return;
      }

      const content = fs.readFileSync(MODEL_FILE, 'utf8');
      log(`Model loaded from ${MODEL_FILE}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(content);
    } catch (err) {
      log(`Error loading model: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error: ${err.message}`);
    }

    return;
  }

  // Handle POST /model - Save plaintext source to model.txt (for external tools)
  if (method === 'POST' && url === '/model') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        fs.writeFileSync(MODEL_FILE, body, 'utf8');
        log(`Model saved to ${MODEL_FILE}`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Model saved successfully');
      } catch (err) {
        log(`Error saving model: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error: ${err.message}`);
      }
    });

    return;
  }

  // Handle 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Not found' }));
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`Save/Load server running on http://0.0.0.0:${PORT}`);
  log(`Endpoints:`);
  log(`  POST http://0.0.0.0:${PORT}/save    - Save playground state (also creates model.txt)`);
  log(`  GET  http://0.0.0.0:${PORT}/load    - Load playground state`);
  log(`  GET  http://0.0.0.0:${PORT}/model   - Load plaintext model from model.txt`);
  log(`  POST http://0.0.0.0:${PORT}/model   - Save plaintext model to model.txt`);
  log(`Files:`);
  log(`  ${STATE_FILE}`);
  log(`  ${MODEL_FILE}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down server...');
  server.close(() => {
    log('Server closed.');
    process.exit(0);
  });
});
