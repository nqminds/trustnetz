'use client';
import React, {useState, useEffect} from 'react';
import fetchJson from '@/utilities/fetch-json';
import postJson from '@/utilities/post-json';
import '@/app-css.css';
import { VCRestAPIAddress, RegistrarAPIAddress, user } from '@/config';

const ControlPanel = ({selectedDevice, selectedManufacturer, selectedDeviceType,
  setSelectedDevice, setSelectedManufacturer, setSelectedDeviceType,
}) => {
  const [vcLog, setVcLog] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);

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
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

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
    <div className="button-container">
      <label style={{ fontSize: '20px', padding: '20px' }}>
        Select Manufacturer:
        <select
          style={{ fontSize: '20px', padding: '2px' }}
          value={selectedManufacturer}
          onChange={(e) => {
            setSelectedManufacturer(e.target.value);
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
      <label style={{ fontSize: '20px', padding: '20px' }}>
        Select Device:
        <select
          style={{ fontSize: '20px', padding: '2px' }}
          value={selectedDevice}
          onChange={(e) => {
            setSelectedDevice(e.target.value);
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
      <label style={{ fontSize: '20px', padding: '20px' }}>
        Select Device Type:
        <select
          style={{ fontSize: '20px', padding: '2px' }}
          value={selectedDeviceType}
          onChange={(e) => {
            setSelectedDeviceType(e.target.value);
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
  );
};

export default ControlPanel;

