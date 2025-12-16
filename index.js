const axios = require('axios');

// Environment variables of Node.js for modularity of monitoring-tool
const CONFIG = {
    url: process.env.URL || 'http://www.google.com/',
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 10000,
};

let checks = [];


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
    }
}

function getUptime() {
    if (checks.length === 0) return 0;
    const successful = checks.filter(statusReport => statusReport.success).length;
    return ((successful / checks.length) * 100).toFixed(2);
}


console.log(`🚀 Starting monitoring for: ${CONFIG.url}`);
console.log(`📊 Check interval: ${CONFIG.checkInterval}ms\n`);

checkWebsite();
setInterval(getUptime, CONFIG.checkInterval);

setInterval(() => {
    console.log(`\n📈 Current Uptime: ${getUptime()}% (${checks.filter(statusReport => statusReport.success).length}/${checks.length} 
    checks passed)\n`);
}, 30000);