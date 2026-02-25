const UPTIME_KUMA_URL = 'https://up.geoffery10.com';
const SLUG = 'website-status-api';

async function fetchUptimeStatus() {
    try {
        // 1. Fetch the monitor list to get the internal Monitor IDs
        const pageResponse = await fetch(`${UPTIME_KUMA_URL}/api/status-page/${SLUG}`);
        if (!pageResponse.ok) throw new Error('Failed to fetch status page data');
        const pageData = await pageResponse.json();

        // Create a dictionary mapping the Monitor Name to its internal ID
        const monitorMap = {};
        if (pageData.publicGroupList) {
            pageData.publicGroupList.forEach(group => {
                if (group.monitorList) {
                    group.monitorList.forEach(monitor => {
                        monitorMap[monitor.name] = monitor.id;
                    });
                }
            });
        }

        // 2. Fetch the latest heartbeats (which contain the up/down status)
        const hbResponse = await fetch(`${UPTIME_KUMA_URL}/api/status-page/heartbeat/${SLUG}`);
        if (!hbResponse.ok) throw new Error('Failed to fetch heartbeats');
        const hbData = await hbResponse.json();
        const heartbeatList = hbData.heartbeatList || {};

        // 3. Find our HTML elements and update them
        const statusElements = document.querySelectorAll('.uk-status');
        
        statusElements.forEach(el => {
            // Get the name exactly as it appears in Uptime Kuma
            const monitorName = el.getAttribute('data-monitor');
            const monitorId = monitorMap[monitorName];

            // If the monitor isn't found on the public page
            if (!monitorId || !heartbeatList[monitorId]) {
                el.textContent = '[ ??? ]';
                return;
            }

            // Get all recent heartbeats for this monitor and find the newest one
            const beats = heartbeatList[monitorId];
            if (beats.length === 0) {
                el.textContent = '[ ??? ]';
                return;
            }

            let latestBeat = beats[0];
            for (let i = 1; i < beats.length; i++) {
                if (new Date(beats[i].time) > new Date(latestBeat.time)) {
                    latestBeat = beats[i];
                }
            }

            // Uptime Kuma Status Codes: 0=DOWN, 1=UP, 2=PENDING, 3=MAINTENANCE
            switch (latestBeat.status) {
                case 1:
                    el.textContent = '[ OK ]';
                    break;
                case 0:
                    el.textContent = '[ DOWN ]';
                    break;
                case 2:
                    el.textContent = '[ WAIT ]';
                    break;
                case 3:
                    el.textContent = '[ MAINT ]';
                    break;
                default:
                    el.textContent = '[ ??? ]';
            }
        });

    } catch (error) {
        console.error('Error fetching uptime status:', error);
        document.querySelectorAll('.uk-status').forEach(el => {
            if (el.textContent === '[ ... ]') el.textContent = '[ ERR ]';
        });
    }
}

// Fetch immediately, then update every 60 seconds
fetchUptimeStatus();
setInterval(fetchUptimeStatus, 60000);