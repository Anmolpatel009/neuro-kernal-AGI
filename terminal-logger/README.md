# Neuro-Kernel Terminal Logger

A real-time terminal dashboard that streams logs and command output to your browser via Server-Sent Events (SSE).

## Features

✨ **Live Log Streaming** — See terminal output in real-time  
🎨 **Color-Coded Logs** — Different colors for info, success, error, warning  
⚡ **Zero Build Process** — Just Node.js + vanilla React via CDN  
🔄 **SSE-Based** — Efficient real-time updates  
📝 **Command Execution** — Run commands directly from the dashboard  
📊 **Log History** — Keeps up to 1000 logs in memory  

## Setup

### 1. Install Dependencies
```bash
cd /workspaces/neuro-kernal-AGI/terminal-logger
npm install
```

### 2. Start the Server
```bash
npm start
# or
node server.js
```

### 3. Open in Browser
Visit: **http://localhost:3000**

## Usage

### View Live Logs
- Logs appear automatically as they're generated
- Scrolls to the bottom automatically
- Shows timestamp for each entry

### Execute Commands
- Type a command in the input box
- Press **Enter** or click **▶ Run**
- See output in real-time

### Clear Logs
- Click **Clear** to reset the log view
- Logs are stored in memory (up to 1000 entries)

## API Endpoints

- **GET `/api/logs/stream`** — SSE endpoint for live log streaming
- **GET `/api/logs`** — Fetch all stored logs as JSON
- **POST `/api/logs`** — Manually add a log entry
- **POST `/api/execute`** — Execute a shell command

### Example: Manual Log Entry
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"message":"Custom log message","type":"info"}'
```

### Example: Execute Command
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"git status"}'
```

## Log Types

- **info** — General information (blue)
- **success** — Successful operations (green)
- **error** — Error messages (red)
- **warning** — Warning messages (yellow/orange)
- **command** — Command input (purple)

## Architecture

```
Browser → SSE Stream → Express Server → Shell/Process
           ↓
       Real-time Logs
```

## Integration with Neuro-Kernel

Wrap commands in the terminal logger when building/running processes:

```bash
node server.js &  # Start logger in background
# Then run your build commands
npm run build
git add .
git commit -m "Update"
git push
```

All output will be captured and displayed live!

## Future Enhancements

- [ ] Persist logs to database
- [ ] WebSocket support for bidirectional communication
- [ ] Log filtering and search
- [ ] Download logs as JSON/text
- [ ] Different sessions/workspaces
- [ ] Analytics dashboard
