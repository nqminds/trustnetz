'use client';
import React, {useState, useEffect} from 'react';
import Table from '@/components/table';
import './MyComponent.css';

const VCRestAPIAddress = "http://localhost:3000";
const RegistrarAPIAddress = "http://localhost:3001";

const ListItem = ({ leftContent, rightContent }) => (
  <div className="list-item">
    <div className="left-content">{leftContent}</div>
    <div className="right-content">{rightContent}</div>
  </div>
);

const MyComponent = () => {
  const [vcLog, setVcLog] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState({});
  const [selectedManufacturerInfo, setSelectedManufacturerInfo] = useState({});
  const [selectedDeviceTypeInfo, setSelectedDeviceTypeInfo] = useState({});

  const fetchVcLog = async () => {
    try {
      const response = await fetch(`${RegistrarAPIAddress}/vc-logs`);
      const vcLog = await response.json();
      setVcLog(vcLog.map(({log}) => log));
    } catch (error) {
      console.error('Error fetching VC Log:', error);
    }
  };

  const fetchDeviceData = async (deviceToGetInfoFor) => {
    try {
      if (deviceToGetInfoFor) {
        const selectedDeviceUrlEncoded = encodeURIComponent(deviceToGetInfoFor);
        const response = await fetch(`${RegistrarAPIAddress}/info/device/${selectedDeviceUrlEncoded}`);
        const deviceInfo = await response.json();
        setSelectedDeviceInfo(deviceInfo);
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  }

  const fetchDeviceTypeData = async (deviceTypeToGetInfoFor) => {
    try {
      if (deviceTypeToGetInfoFor) {
        const selecteddeviceTypeUrlEncoded = encodeURIComponent(deviceTypeToGetInfoFor);
        const response = await fetch(`${RegistrarAPIAddress}/info/device-type/${selecteddeviceTypeUrlEncoded}`);
        const deviceTypeInfo = await response.json();
        setSelectedDeviceTypeInfo(deviceTypeInfo);
      }
    } catch (error) {
      console.error('Error fetching device type data:', error);
    }
  }

  const fetchManufacturerData = async (manufacturerToGetInfoFor) => {
    try {
      if (manufacturerToGetInfoFor) {
        const selectedManufacturerUrlEncoded = encodeURIComponent(manufacturerToGetInfoFor);
        const response = await fetch(`${RegistrarAPIAddress}/info/manufacturer/${selectedManufacturerUrlEncoded}`);
        const manufacturerInfo = await response.json();
        setSelectedManufacturerInfo(manufacturerInfo);
      }
    } catch (error) {
      console.error('Error fetching manufacturer data:', error);
    }
  }

  useEffect(() => {
    // Fetch initial inputValue from an API route when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch(`${RegistrarAPIAddress}/devices`);
        const devices = await response.json();
        setDeviceList(devices);
      } catch (error) {
        console.error('Error fetching device list:', error);
      }
      try {
        const response = await fetch(`${RegistrarAPIAddress}/manufacturers`);
        const manufacturers = await response.json();
        setManufacturerList(manufacturers);
      } catch (error) {
        console.error('Error fetching manufacturer list:', error);
      }
      try {
        const response = await fetch(`${RegistrarAPIAddress}/device-types`);
        const deviceTypes = await response.json();
        setDeviceTypeList(deviceTypes);
      } catch (error) {
        console.error('Error fetching deviceType list:', error);
      }
      await fetchVcLog();
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

  useEffect(() => {
    // Function to be executed
    const fetchData = async () => {
      // Use try-catch to handle errors in async functions
      try {
        await fetchDeviceData(selectedDevice);
        await fetchDeviceTypeData(selectedDeviceType);
        await fetchManufacturerData(selectedManufacturer);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Run the function initially
    fetchData();

    // Set up an interval to run the function every 5 seconds
    const intervalId = setInterval(fetchData, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedDevice, selectedDeviceType, selectedManufacturer]); // Empty dependency array ensures the effect runs only once on mount

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
      let res = await fetch(`${VCRestAPIAddress}/sign/${schemaName}`, options);
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
      let res = await fetch(`${RegistrarAPIAddress}/submit-vc/${schemaName}`, options);
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
            onChange={(e) => {
              setSelectedManufacturer(e.target.value);
              fetchManufacturerData(e.target.value);
            }}
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
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              fetchDeviceData(e.target.value);
            }}
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
            onChange={(e) => {
              setSelectedDeviceType(e.target.value);
              fetchDeviceTypeData(e.target.value);
            }}
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

      {/* Middle side with scrollable list */}
      <div className="list-container">
        <h3>List of submitted VC and Registrar&#39;s Responses:</h3>
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


      {/* Vertical line */}
      <div className="vertical-line"></div>

      {/* Right side with information */}
      <div className="info-container">
      <div className="table-section">
        <h2>Manufacturer</h2>
        <Table data={selectedManufacturerInfo} />
      </div>

      <div className="table-section">
        <h2>Device</h2>
        <Table data={selectedDeviceInfo} />
      </div>

      <div className="table-section">
        <h2>Device Type</h2>
        <Table data={selectedDeviceTypeInfo} />
      </div>
      </div>
    </div>
  );
};

export default MyComponent;

