const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Store logs in memory
const logs = [];
const MAX_LOGS = 1000;
let clientId = 0;
const clients = new Map();

// Serve static files (React app will be built here)
app.use(express.static(path.join(__dirname, 'public')));

// Add log entry
function addLog(message, type = 'info', timestamp = new Date()) {
  const logEntry = {
    id: logs.length,
    message,
    type, // 'info', 'error', 'warning', 'success', 'command'
    timestamp: timestamp.toISOString()
  };

  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Broadcast to all connected clients
  broadcastLog(logEntry);
}

// Broadcast log to all SSE clients
function broadcastLog(logEntry) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  });
}

// SSE endpoint for streaming logs
app.get('/api/logs/stream', (req, res) => {
  const id = clientId++;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send existing logs first
  logs.forEach((log) => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  clients.set(id, res);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    clients.delete(id);
  });
});

// Endpoint to add logs manually
app.post('/api/logs', (req, res) => {
  const { message, type = 'info' } = req.body;
  addLog(message, type);
  res.json({ success: true });
});

// Endpoint to get all logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Execute shell commands and stream output
app.post('/api/execute', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command required' });
  }

  addLog(`$ ${command}`, 'command');

  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
  const args = process.platform === 'win32' ? ['/c', command] : ['-c', command];

  const child = spawn(shell, args, {
    cwd: '/workspaces/neuro-kernal-AGI'
  });

  let output = '';

  child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    addLog(text, 'info');
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    output += text;
    addLog(text, 'error');
  });

  child.on('close', (code) => {
    const exitMsg = `Process exited with code ${code}`;
    addLog(exitMsg, code === 0 ? 'success' : 'error');
    res.json({ success: true, output, exitCode: code });
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  addLog(`🚀 Terminal Logger Server started on http://localhost:${PORT}`, 'success');
  addLog('Ready to capture terminal logs...', 'info');
});
