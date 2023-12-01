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

function sendRequest(endpoint, logElementId, statusElementId, statusText, clearLogElementId, clearStatusElementId) {
    getServerPort(function(port) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:" + port + endpoint, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var logElement = document.getElementById(logElementId);
                var statusElement = document.getElementById(statusElementId);
                var clearLogElement = document.getElementById(clearLogElementId);
                var clearStatusElement = document.getElementById(clearStatusElementId);

                if (xhr.status === 200) {
                    logElement.textContent = xhr.responseText; // add logs here
                    statusElement.textContent = statusText;
                    statusElement.classList.add('status-green');

                    // clear the opposite status and log
                    clearLogElement.textContent = '';
                    clearStatusElement.textContent = '';
                    clearStatusElement.classList.remove('status-green');
                } else {
                    statusElement.textContent = 'Status: Error';
                    statusElement.classList.remove('status-green');
                }
            }
        };
        xhr.send();
    });
}

document.getElementById('onboard').onclick = function() {
    sendRequest('/onboard', 'onboardLog', 'onboardStatus', 'Onboarded', 'offboardLog', 'offboardStatus');
};

document.getElementById('offboard').onclick = function() {
    sendRequest('/offboard', 'offboardLog', 'offboardStatus', 'Offboarded', 'onboardLog', 'onboardStatus');
};
