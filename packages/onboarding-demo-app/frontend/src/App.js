import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './nquiringminds.svg';

function App() {
  const [onboardStatus, setOnboardStatus] = useState("Status: Unknown");
  const [offboardStatus, setOffboardStatus] = useState("Status: Unknown");
  const [onboardLog, setOnboardLog] = useState("");
  const [offboardLog, setOffboardLog] = useState("");
  const [pingStatus, setPingStatus] = useState("");
  const [pingLog, setPingLog] = useState("");
  const [wlanStatus, setWlanStatus] = useState("Checking...");
  const [pingIP, setPingIP] = useState("");

  // Fetch WLAN status periodically
  const fetchWlanStatus = async () => {
    try {
      const res = await fetch('/api/wlan0-status');
      if (!res.ok) throw new Error('Network response was not ok');
      const text = await res.text();
      setWlanStatus(text);
    } catch (error) {
      console.error('Error fetching WLAN status:', error);
      setWlanStatus("Error fetching WLAN status");
    }
  };

  useEffect(() => {
    fetchWlanStatus();
    const interval = setInterval(fetchWlanStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOnboard = async () => {
    setOnboardStatus("Status: Onboarding...");
    setOnboardLog(""); // Clear previous log
    try {
      const res = await fetch('/api/onboard', { method: 'POST' });
      if (!res.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOnboardLog(prev => prev + chunk);
      }
      setOnboardStatus("Status: Onboarded");
      // Reset offboard status/log if needed
      setOffboardStatus("Status: Unknown");
      setOffboardLog("");
    } catch (error) {
      setOnboardStatus("Status: Error Onboarding");
      console.error(error);
    }
  };

  const handleOffboard = async () => {
    setOffboardStatus("Status: Offboarding...");
    setOffboardLog(""); // Clear previous log
    try {
      const res = await fetch('/api/offboard', { method: 'POST' });
      if (!res.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOffboardLog(prev => prev + chunk);
      }
      setOffboardStatus("Status: Offboarded");
      // Reset onboard status/log if needed
      setOnboardStatus("Status: Unknown");
      setOnboardLog("");
    } catch (error) {
      setOffboardStatus("Status: Error Offboarding");
      console.error(error);
    }
  };

  
  const handlePing = async () => {
    if (!pingIP) {
      setPingStatus("Ping Request Failed: No IP address provided");
      return;
    }
    try {
      const res = await fetch(`/api/ping?ip=${pingIP}&interface=wlp170s0`);
      if (!res.ok) throw new Error("Ping request failed");
      const text = await res.text();
      setPingStatus("Ping Result:");
      setPingLog(text);
    } catch (error) {
      setPingStatus("Ping Request Failed");
      console.error(error);
    }
  };

  return (
    <div className="container">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo} alt="App Logo" className="logo" />
      </div>

      <h1 className="cyber-title">NQM BRSKI DEMO SYSTEM</h1>
      
      <div className="action-grid">
        {/* Onboard Card */}
        <div className="cyber-card onboard-card">
          <div className="card-header">
            <div className="cyber-icon">
              {/* Onboard Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <h2>Device Onboarding</h2>
          </div>
          <div className={`status-indicator ${onboardStatus.includes('Onboarded') ? 'status-onboarded' : ''}`}>
            {onboardStatus}
          </div>
          <button onClick={handleOnboard} className="cyber-button onboard-btn">
            INITIATE ONBOARDING
            <span className="button-glow"></span>
          </button>
          {/* Onboard Logs */}
          {onboardLog && (
            <pre className="log-output">{onboardLog}</pre>
          )}
        </div>

        {/* Offboard Card */}
        <div className="cyber-card offboard-card">
          <div className="card-header">
            <div className="cyber-icon">
              {/* Offboard Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2>Device Offboarding</h2>
          </div>
          <div className={`status-indicator ${offboardStatus.includes('Offboarded') ? 'status-offboarded' : ''}`}>
            {offboardStatus}
          </div>
          <button onClick={handleOffboard} className="cyber-button offboard-btn">
            INITIATE OFFBOARDING
            <span className="button-glow"></span>
          </button>
          {/* Offboard Logs */}
          {offboardLog && (
            <pre className="log-output">{offboardLog}</pre>
          )}
        </div>
      </div>

      {/* WLAN Status Container */}
      <div className="wlan-status-container">
        <h2>WLAN Status</h2>
        <pre className="wlan-status">{wlanStatus}</pre>
      </div>

      {/* Ping Box placed under WLAN Status */}
      <div className="ping-box">
        <div className="cyber-card ping-card">
          <div className="card-header">
            <div className="cyber-icon">
              {/* Ping Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
              </svg>
            </div>
            <h2>Network Diagnostics</h2>
          </div>
          <div className="ping-interface">
            <input
              type="text"
              placeholder="Enter target IP"
              value={pingIP}
              onChange={e => setPingIP(e.target.value)}
              className="cyber-input"
            />
            <button onClick={handlePing} className="cyber-button ping-btn">
              EXECUTE PING
              <span className="button-glow"></span>
            </button>
          </div>
          <div className="ping-results">
            <div className="result-header">{pingStatus}</div>
            <pre className="ping-output">{pingLog}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
