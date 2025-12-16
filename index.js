const axios = require('axios');
const fs = require('fs');
const DATA_FILE = 'monitoring-data.json';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Reusable function
function getSuccessfulChecks() {
    return checks.filter(c => c.success).length;
}

// Environment variables of Node.js for modularity of monitoring-tool
const CONFIG = {
    url: process.env.URL || 'http://www.google.com/',
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 10000,
    timeoutUptime: parseInt(process.env.TIMEOUT_UPTIME) || 30000,
    port: parseInt(process.env.PORT || 3000)
};

let checks = loadData();

// Main function to check the website
async function checkWebsite() {
    const startTime = Date.now();

    try {
        const response = await axios.get(CONFIG.url, {timeout: 5000});
        const duration = Date.now() - startTime;
        checks.push({
            timestamp: new Date().toISOString(),
            status: response.status,
            duration,
            success: true
        });
        console.log(`\`✅ ${new Date().toLocaleTimeString()} - Status: ${response.status} ${response.statusText} - Duration: ${duration}ms`);
        saveData()
    } catch (error) {
        const duration = Date.now() - startTime;
        checks.push({
            timestamp: new Date().toISOString(),
            status: error.response?.status || 'TIMEOUT',
            duration,
            success: false,
            error: error.message
        });
        console.log(`❌ ${new Date().toLocaleTimeString()} - Error: ${error.message}`);
        saveData()
    }
}

// Get uptime of given website
function getUptime() {
    if (checks.length === 0) return 0;
    const successful = getSuccessfulChecks();
    return ((successful / checks.length) * 100).toFixed(2);
}

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(checks, null, 2));
}

function loadData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}


// Output for Console
console.log(`🚀 Starting monitoring for: ${CONFIG.url}`);
console.log(`📊 Check interval: ${CONFIG.checkInterval}ms`);
console.log(`📊 Timeout uptime: ${CONFIG.timeoutUptime}ms\n`);

checkWebsite();
setInterval(checkWebsite, CONFIG.checkInterval);

setInterval(() => {
    console.log(`\n📈 Current Uptime: ${getUptime()}% (${getSuccessfulChecks()}/${checks.length} 
    checks passed)\n`);
}, CONFIG.timeoutUptime);


//Express API
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        monitoringUrl: CONFIG.url,
        uptime: getUptime(),
        totalChecks: checks.length,
        successfulChecks: getSuccessfulChecks()
    });
});

app.get('/data', (req, res) => {
    res.json(checks)
});

app.listen(PORT, () => {
    console.log(`\n📡 API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Data: http://localhost:${PORT}/data\n`);
});