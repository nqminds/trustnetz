function getServerPort(callback) {
    fetch('server.conf')
        .then(response => response.text())
        .then(text => {
            const match = text.match(/port=(\d+)/);
            if (match && match[1]) {
                callback(match[1]);
            } else {
                throw new Error('Port not found in server configuration.');
            }
        })
        .catch(error => {
            console.error('Error fetching server config:', error);
        });
}

function getLogFile(logFile, logElementId) {
    fetch(logFile)
        .then(response => response.text())
        .then(text => {
            var logElement = document.getElementById(logElementId);
            logElement.textContent = text;
        })
        .catch(error => {
            console.error('Error fetching log file:', error);
        });
}

function sendRequest(endpoint, logElementId, statusElementId, statusText, clearLogElementId, clearStatusElementId, logFile) {
    getServerPort(function(port) {
        var xhr = new XMLHttpRequest();
        var url = window.location.origin + endpoint;
        xhr.open("POST", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var statusElement = document.getElementById(statusElementId);
                var clearLogElement = document.getElementById(clearLogElementId);
                var clearStatusElement = document.getElementById(clearStatusElementId);

                if (xhr.status === 200) {
                    statusElement.textContent = statusText;
                    statusElement.classList.add('status-green');
                    clearLogElement.textContent = '';
                    clearStatusElement.textContent = '';
                    clearStatusElement.classList.remove('status-green');
                    setInterval(() => getLogFile(logFile, logElementId), 1000); // Poll every 1 seconds
                } else {
                    statusElement.textContent = 'Status: Error - ' + xhr.responseText;
                    statusElement.classList.remove('status-green');
                }
            }
        };
        xhr.send();
    });
}

function updateWlanStatus() {
    fetch('/wlan0-status')
        .then(response => response.text())
        .then(text => {
            document.getElementById('wlanStatus').textContent = text;
        })
        .catch(error => {
            console.error('Error fetching wlan0 status:', error);
        });
}

function sendPingRequest() {
    const interface = "wlan0";
    const ip = document.getElementById('pingIP').value;
    if (!ip) {
        console.error('No IP address provided');
        document.getElementById('pingStatus').textContent = 'Ping Request Failed: No IP address provided';
        return;
    }

    fetch(`/ping?ip=${ip}&interface=${interface}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            document.getElementById('pingStatus').textContent = 'Ping Result: ';
            document.getElementById('pingLogDropdown').textContent = text;
        })
        .catch(error => {
            console.error('Ping request failed:', error);
            document.getElementById('pingStatus').textContent = 'Ping Request Failed';
            document.getElementById('pingLogDropdown').textContent = 'Error: ' + error.message;
        });
}

document.getElementById('onboard').onclick = function() {
    sendRequest('/onboard', 'onboardLog', 'onboardStatus', 'Onboarded', 'offboardLog', 'offboardStatus', '../onboarding_log_file.txt');
};

document.getElementById('offboard').onclick = function() {
    sendRequest('/offboard', 'offboardLog', 'offboardStatus', 'Offboarded', 'onboardLog', 'onboardStatus', '../offboarding_log_file.txt');
};

document.getElementById('ping').addEventListener('click', function() {
    sendPingRequest();
});

// Update every 10 seconds
setInterval(updateWlanStatus, 10000);