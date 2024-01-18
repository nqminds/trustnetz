'use client';
import React, {useState, useEffect} from 'react';
import './MyComponent.css';

const ListItem = ({ leftContent, rightContent }) => (
  <div className="list-item">
    <div className="left-content">{leftContent}</div>
    <div className="right-content">{rightContent}</div>
  </div>
);

const MyComponent = () => {
  const [vcLog, setVcLog] = useState([]);
  const [deviceType, setDeviceTypeState] = useState('Raspberry Pi');
  const [deviceList, setDeviceList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  console.log(deviceList, deviceTypeList, manufacturerList);

  const fetchVcLog = async () => {
    try {
      const response = await fetch('http://localhost:3001/vc-logs');
      const vcLog = await response.json();
      console.log(vcLog);
      setVcLog(vcLog.map(({log}) => log));
    } catch (error) {
      console.error('Error fetching VC Log:', error);
    }
  };

  useEffect(() => {
    // Fetch initial inputValue from an API route when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/devices');
        const devices = await response.json();
        setDeviceList(devices);
      } catch (error) {
        console.error('Error fetching device list:', error);
      }
      try {
        const response = await fetch('http://localhost:3001/manufacturers');
        const manufacturers = await response.json();
        setManufacturerList(manufacturers);
      } catch (error) {
        console.error('Error fetching manufacturer list:', error);
      }
      try {
        const response = await fetch('http://localhost:3001/device-types');
        const deviceTypes = await response.json();
        setDeviceTypeList(deviceTypes);
      } catch (error) {
        console.error('Error fetching deviceType list:', error);
      }
      await fetchVcLog();
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

  const handleButtonClick = (value) => {
    setVcLog([...vcLog, value]);
  };

  const signClaim = async (body, schemaName) => {
		try {
      let options = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(body),
      }
      let res = await fetch(`http://localhost:3000/sign/${schemaName}`, options);
      let response = null;
      try {
        response = await res.clone().json();
      }
      catch {
        response = await res.text();
      }
      return response;
		} catch (err) {
			console.log(err);
		}
	};

  const submitVC = async (vc, schemaName) => {
		try {
      let options = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(vc),
      }
      let res = await fetch(`http://localhost:3001/submit-vc/${schemaName}`, options);
      let response = null;
      try {
        response = await res.clone().json();
      }
      catch {
        response = await res.text();
      }
      return response;
		} catch (err) {
			console.log(err);
		}
	};

  const signAndSubmitClaim = async (claim, schemaName) => {
    try {
      // Create a new Date object
      const now = new Date();
      // Format the current time in ISO 8601 format
      const iso8601TimeString = now.toISOString();
      claim.issuanceDate = iso8601TimeString;
      const vc = await signClaim(claim, schemaName);
      const response = await submitVC(vc, schemaName);
      handleButtonClick(`VC Claim: ${JSON.stringify(claim)}, Response: ${response}`);
		} catch (err) {
			console.log(err);
		}
  }

  const trustManufacturer = async () => {
		try {
      const claim = {
        "user": "Nick",
        "manufacturer": selectedManufacturer,
        "trust": true,
      };
      await signAndSubmitClaim(claim, "manufacturer_trust");
		} catch (err) {
			console.log(err);
		}
	};

  const distrustManufacturer = async () => {
    try {
      const claim = {
        "user": "Nick",
        "manufacturer": selectedManufacturer,
        "trust": false,
      };
      await signAndSubmitClaim(claim, "manufacturer_trust");
		} catch (err) {
			console.log(err);
		}
  }

  const trustDevice = async () => {
		try {
      const claim = {
        "user": "Nick",
        "device": selectedDevice,
        "trust": true,
      };
      await signAndSubmitClaim(claim, "device_trust");
		} catch (err) {
			console.log(err);
		}
	};

  const distrustDevice = async () => {
    try {
      const claim = {
        "user": "Nick",
        "device": selectedDevice,
        "trust": false,
      };
      await signAndSubmitClaim(claim, "device_trust");
		} catch (err) {
			console.log(err);
		}
  }

  const setDeviceType = async () => {
    try {
      const claim = {
        "device": selectedDevice,
        "deviceType": selectedDeviceType,
        "trust": false,
      };
      await signAndSubmitClaim(claim, "device_type_binding");
		} catch (err) {
			console.log(err);
		}
  }

  const setDeviceTypeVulnerable = async () => {
    try {
      const claim = {
        "deviceType": selectedDeviceType,
        "vulnerable": true,
      };
      await signAndSubmitClaim(claim, "device_type_vulnerable");
		} catch (err) {
			console.log(err);
		}
  }

  const setDeviceTypeNotVulnerable = async () => {
    try {
      const claim = {
        "deviceType": selectedDeviceType,
        "vulnerable": false,
      };
      await signAndSubmitClaim(claim, "device_type_vulnerable");
		} catch (err) {
			console.log(err);
		}
  }

  return (
    <div className="container">
      {/* Left side with buttons */}
      <div className="button-container">
        <label>
          Manufacturer Select:
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
          >
            <option value="">Select a manufacturer</option>
            {manufacturerList.map((option, index) => (
              <option key={index} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={trustManufacturer}>Trust Manufacturer</button>
        <button onClick={distrustManufacturer}>Distrust Manufacturer</button>
        <label>
          Device Select:
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="">Select a device</option>
            {deviceList.map((option, index) => (
              <option key={index} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={trustDevice}>Trust Device</button>
        <button onClick={distrustDevice}>Distrust Device</button>
        <label>
          Device Type Select:
          <select
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
          >
            <option value="">Select a device type</option>
            {deviceTypeList.map((option, index) => (
              <option key={index} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={setDeviceType}>Set Device Type</button>
        <button onClick={setDeviceTypeVulnerable}>Set Device Type Vulnerable</button>
        <button onClick={setDeviceTypeNotVulnerable}>Set Device Type Not Vulnerable</button>
      </div>

      {/* Vertical line */}
      <div className="vertical-line"></div>

      {/* Right side with scrollable list */}
      <div className="list-container">
        <h3>List of submitted VC and Responses:</h3>
        <ul className="scrollable-list">
          {vcLog.slice().reverse().map((item, index) => (
            <li key={index}>
              {/* {item} */}
              <ListItem
                leftContent={item.split(", ")[0]}  // Left-aligned content
                rightContent={item.split(", ")[1]}  // Right-aligned content
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyComponent;

