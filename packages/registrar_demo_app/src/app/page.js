'use client';
import React, {useState, useEffect} from 'react';
import Table from '@/components/table';
import './MyComponent.css';

const VCRestAPIAddress = "http://localhost:3000";
const RegistrarAPIAddress = "http://localhost:3001";
const user = "Nick";

const ListItem = ({ leftContent, rightContent }) => (
  <div className="list-item">
    <div className="left-content">{leftContent}</div>
    <div className="right-content">{rightContent}</div>
  </div>
);

const fetchJson = async (url) => {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(`Error fetching from url ${url}:`, error);
  }
}

const postJson = async (body, url) => {
  try {
    let options = {
      method: "POST",
      headers: {
          "Content-Type":"application/json",
      },
      body: JSON.stringify(body),
    }
    let res = await fetch(url, options);
    let response = null;
    try {
      response = await res.clone().json();
    }
    catch {
      response = await res.text();
    }
    return response;
  } catch (err) {
    console.error(err);
  }
}


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
    const vcLog = await fetchJson(`${RegistrarAPIAddress}/vc-logs`);
    setVcLog(vcLog.map(({log}) => log));
  };

  const fetchDeviceData = async (deviceToGetInfoFor) => {
    if (deviceToGetInfoFor) {
      const selectedDeviceUrlEncoded = encodeURIComponent(selectedDeviceUrlEncoded);
      const deviceInfo = await fetchJson(`${RegistrarAPIAddress}/info/device/${selectedDeviceUrlEncoded}`);
      setSelectedDeviceInfo(deviceInfo);
    }
  }

  const fetchDeviceTypeData = async (deviceTypeToGetInfoFor) => {
    if (deviceTypeToGetInfoFor) {
      const selecteddeviceTypeUrlEncoded = encodeURIComponent(deviceTypeToGetInfoFor);
      const deviceTypeInfo = await fetchJson(`${RegistrarAPIAddress}/info/device-type/${selecteddeviceTypeUrlEncoded}`);
      setSelectedDeviceTypeInfo(deviceTypeInfo);
    }
  }

  const fetchManufacturerData = async (manufacturerToGetInfoFor) => {
    if (manufacturerToGetInfoFor) {
      const selectedManufacturerUrlEncoded = encodeURIComponent(manufacturerToGetInfoFor);
      const manufacturerInfo = await fetchJson(`${RegistrarAPIAddress}/info/manufacturer/${selectedManufacturerUrlEncoded}`);
      setSelectedManufacturerInfo(manufacturerInfo);
    }
  }

  useEffect(() => {
    // Fetch initial inputValue from an API route when the component mounts
    const fetchData = async () => {
      const devices = await fetchJson(`${RegistrarAPIAddress}/devices`);
      setDeviceList(devices);
      if (devices.length > 0) {
        setSelectedDevice(devices[0].name)
      }
      const manufacturers = await fetchJson(`${RegistrarAPIAddress}/manufacturers`);
      setManufacturerList(manufacturers);
      if (manufacturers.length > 0) {
        setSelectedManufacturer(manufacturers[0].name);
      }
      const deviceTypes = await fetchJson(`${RegistrarAPIAddress}/device-types`);
      setDeviceTypeList(deviceTypes);
      if (deviceTypes.length > 0) {
        setSelectedDeviceType(deviceTypes[0].name);
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

  const signClaim = async (claim, schemaName) => {
    const response = await postJson(claim, `${VCRestAPIAddress}/sign/${schemaName}`);
    return response;
  }
  const submitVC = async (vc, schemaName) => {
    const response = await postJson(vc, `${RegistrarAPIAddress}/submit-vc/${schemaName}`);
    return response;
  }

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
			console.error(err);
		}
  }

  const changeManufacturerTrust = async (trust) => {
    const claim = {
      user,
      "manufacturer": selectedManufacturer,
      trust,
    };
    await signAndSubmitClaim(claim, "manufacturer_trust");
	};

  const trustManufacturer = async () => {
    await changeManufacturerTrust(true);
	};

  const distrustManufacturer = async () => {
    await changeManufacturerTrust(false);
  }

  const changeDeviceTrust = async (trust) => {
    const claim = {
      user,
      "device": selectedDevice,
      trust,
    };
    await signAndSubmitClaim(claim, "device_trust");
  }

  const trustDevice = async () => {
    await changeDeviceTrust(true);
	};

  const distrustDevice = async () => {
    await changeDeviceTrust(false);
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
			console.error(err);
		}
  }

  const changeDeviceTypeVulnerable = async (vulnerable) => {
    const claim = {
      "deviceType": selectedDeviceType,
      vulnerable,
    };
    await signAndSubmitClaim(claim, "device_type_vulnerable");
  }

  const setDeviceTypeVulnerable = async () => {
    await changeDeviceTypeVulnerable(true);
  }

  const setDeviceTypeNotVulnerable = async () => {
    await changeDeviceTypeVulnerable(false);
  }

  return (
    <div className="container">
      {/* Left side with buttons */}
      <div className="button-container">
        <label>
          Select Manufacturer:
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
          Select Device:
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
          Select Device Type:
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
      {[
        {name: "Manufacturer", data: selectedManufacturerInfo},
        {name: "Device", data: selectedDeviceInfo},
        {name: "Device Type", data: selectedDeviceTypeInfo},
      ].map(({name, data}) => 
        <div key={name} className="table-section">
          <h2>{name}</h2>
          <Table data={data} />
        </div>
      )}
      </div>
    </div>
  );
};

export default MyComponent;

