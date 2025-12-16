# Website Monitoring Tool

A real-time monitoring tool that checks website availability and tracks uptime metrics.

## Features

- **Continuous Monitoring** - Periodically checks a configured URL
- **Uptime Calculation** - Tracks availability percentage over time
- **Data Persistence** - Saves all check results to JSON file
- **REST API** - Query monitoring data via HTTP endpoints
- **Configurable** - URL and check interval via environment variables

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file or pass environment variables:

```
URL=https://example.com
CHECK_INTERVAL=10000
TIMEOUT_UPTIME=30000
PORT=3000
```

- `URL` - Website to monitor (default: https://www.google.com)
- `CHECK_INTERVAL` - Check frequency in milliseconds (default: 10000)
- `TIMEOUT_UPTIME` - Timeout uptime frequency in milliseconds (default: 30000)
- `PORT` - API port (default: 3000)

## Running

```bash
npm start
```

Or with custom configuration:

```bash
URL=https://example.com CHECK_INTERVAL=5000 npm start
```

## API Endpoints

### GET /health

Returns current uptime summary:

```json
{
  "status": "running",
  "monitoringUrl": "https://example.com",
  "uptime": "99.50",
  "totalChecks": 200,
  "successfulChecks": 199
}
```

### GET /data

Returns all check records:

```json
[
  {
    "timestamp": "2025-12-16T16:00:00.000Z",
    "status": 200,
    "duration": 245,
    "success": true
  }
]
```

## Data Storage

All monitoring data is persisted in `monitoring-data.json`. This file is created automatically on first run.

## Docker

Build and run with Docker:

```bash
docker build -t monitoring-tool .
docker run -e URL=https://example.com -p 3000:3000 monitoring-tool
```

## Development Process

Check commit history to see iterative development:

```bash
git log --oneline
```

## How It Works

1. **Health Check** - Makes HTTP requests to the configured URL
2. **Data Recording** - Stores results (status code, response time, timestamp)
3. **Uptime Calculation** - Percentage of successful checks
4. **API Access** - Query results via REST endpoints
5. **Persistence** - All data saved to JSON file for retrospective analysis

## Error Handling

- Network timeouts (5 second limit)
- HTTP error codes (4xx, 5xx)
- Connection failures

All are recorded as failed checks and contribute to uptime calculation.