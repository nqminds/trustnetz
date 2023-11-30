document.getElementById('onboard').onclick = function() {
    var onboardLog = document.getElementById('onboardLog');
    var onboardStatus = document.getElementById('onboardStatus');
    var offboardStatus = document.getElementById('offboardStatus');

    onboardLog.style.display = onboardLog.style.display === 'none' ? 'block' : 'none';
    
    // Reset offboard status
    offboardStatus.textContent = '';

    // Send an AJAX POST request to onboard
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/onboard", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                onboardLog.textContent = xhr.responseText; // add logs here
                onboardStatus.textContent = 'Onboarded';
                onboardStatus.classList.add('status-green');
            } else {
                onboardStatus.textContent = 'Status: Error during onboard';
                offboardStatus.classList.remove('status-green');
            }
        }
    };
    xhr.send();
};

document.getElementById('offboard').onclick = function() {
    var offboardLog = document.getElementById('offboardLog');
    var offboardStatus = document.getElementById('offboardStatus');
    var onboardStatus = document.getElementById('onboardStatus');

    offboardLog.style.display = offboardLog.style.display === 'none' ? 'block' : 'none';
    
    // Reset onboard status
    onboardStatus.textContent = '';

    // Send an AJAX POST request to offboard
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/offboard", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                offboardLog.textContent = xhr.responseText; // add logs here
                offboardStatus.textContent = 'Offboarded';
                offboardStatus.classList.add('status-green');
            } else {
                offboardStatus.textContent = 'Status: Error during offboard'
                onboardStatus.classList.remove('status-green'); 

            }
        }
    };
    xhr.send();
};
