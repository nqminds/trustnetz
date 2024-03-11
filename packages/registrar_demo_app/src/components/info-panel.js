'use client';
import React, {useState, useEffect} from 'react';
import Table from '@/components/table';
import '@/app-css.css';
import fetchJson from '@/utilities/fetch-json';
import { RegistrarAPIAddress } from '@/config';

const InfoPanel = ({selectedDevice, selectedManufacturer, selectedDeviceType, selectedMud}) => {
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState({});
  const [selectedManufacturerInfo, setSelectedManufacturerInfo] = useState({});
  const [selectedDeviceTypeInfo, setSelectedDeviceTypeInfo] = useState({});
  const [selectedMudInfo, setSelectedMudInfo] = useState({});

  const fetchDeviceData = async (deviceToGetInfoFor) => {
    if (deviceToGetInfoFor) {
      const selectedDeviceUrlEncoded = encodeURIComponent(deviceToGetInfoFor);
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

  const fetchMudData = async (mudToGetInfoFor) => {
    if (mudToGetInfoFor) {
      const selectedMudUrlEncoded = encodeURIComponent(mudToGetInfoFor);
      const mudInfo = await fetchJson(`${RegistrarAPIAddress}/info/mud/${selectedMudUrlEncoded}`);
      mudInfo.mud = JSON.stringify(JSON.parse(mudInfo.mud), null, 2);
      setSelectedMudInfo(mudInfo);
    }
  }

  useEffect(() => {
    // Function to be executed
    const fetchData = async () => {
      // Use try-catch to handle errors in async functions
      try {
        await fetchDeviceData(selectedDevice);
        await fetchDeviceTypeData(selectedDeviceType);
        await fetchManufacturerData(selectedManufacturer);
        await fetchMudData(selectedMud);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Run the function initially
    fetchData();

    // Set up an interval to run the function every 2 seconds
    const intervalId = setInterval(fetchData, 2000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedDevice, selectedDeviceType, selectedManufacturer, selectedMud]); // Empty dependency array ensures the effect runs only once on mount

  console.log("INFO PANEL!!!!")

  return (
    <div className="info-container">
      {[
        {name: "Manufacturer", data: selectedManufacturerInfo},
        {name: "Device", data: selectedDeviceInfo},
        {name: "Device Type", data: selectedDeviceTypeInfo},
        {name: "Mud", data: selectedMudInfo}
      ].map(({name, data}) => 
        <div key={name} className="table-section">
          <h2>{name}</h2>
          <FieldRenderer name={name} data={data} />
        </div>
      )}
    </div>
  );
};

const FieldRenderer = ({name, data}) => {
  console.log(name, data)
  let tableData = {};
  switch (name)
  {
    case "Manufacturer":
      tableData = {name: data.name, trusted: <div className={data.trusted ? "green-text" : "red-text"}> {data.trusted ? "✔ true" : "X false"} </div>}
      return (
        <Table data={tableData} />
      )
    case "Device":
      tableData = {
        name: data.name,
        trusted: <div className={data.trusted ? "green-text" : "red-text"}> {data.trusted ? "✔ true" : "X false"} </div>,
        manufacturer: data.manufacturer,
        "manufacturer trusted": <div className={data.manufacturerTrusted ? "green-text" : "red-text"}> {data.manufacturerTrusted ? "✔ true" : "X false"} </div>,
        "device type": data.deviceType,
        "device type vulnerable": <div className={data.vulnerable ? "red-text" : "green-text"}> {data.vulnerable ? "✔ true" : "X false"} </div>,
      }
      return (
        <Table data={tableData} />
      )
    case "Device Type":
      tableData = {
        name: data.name,
        "SBOM ID": data.sbomId,
        vulnerable: <div className={data.vulnerable ? "red-text" : "green-text"}> {data.vulnerable ? "✔ true" : "X false"} </div>,
        "MUD Name": data.mudName,
      }
      return (
        <Table data={tableData} />
      )
    default:
      return <Table data={data} />
  }
}

export default InfoPanel;

