const axios = require('axios');
const fs = require('fs');
const DATA_FILE = 'monitoring-data.json';

// Environment variables of Node.js for modularity of monitoring-tool
const CONFIG = {
    url: process.env.URL || 'http://www.google.com/',
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 10000,
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
        console.log(`\`✅ ${new Date().toLocaleTimeString()} - Status: ${response.status} ${response.statusText} - Dutration: ${duration}ms`);
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
    const successful = checks.filter(statusReport => statusReport.success).length;
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
console.log(`📊 Check interval: ${CONFIG.checkInterval}ms\n`);

checkWebsite();
setInterval(getUptime, CONFIG.checkInterval);

setInterval(() => {
    console.log(`\n📈 Current Uptime: ${getUptime()}% (${checks.filter(statusReport => statusReport.success).length}/${checks.length} 
    checks passed)\n`);
}, 30000);