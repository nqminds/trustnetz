'use client';
import React, {useState, useEffect} from 'react';
import Table from '@/components/table';
import '@/app-css.css';
import fetchJson from '@/utilities/fetch-json';
import { RegistrarAPIAddress } from '@/config';

const InfoPanel = ({selectedDevice, selectedManufacturer, selectedDeviceType}) => {
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState({});
  const [selectedManufacturerInfo, setSelectedManufacturerInfo] = useState({});
  const [selectedDeviceTypeInfo, setSelectedDeviceTypeInfo] = useState({});

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

    // Set up an interval to run the function every 2 seconds
    const intervalId = setInterval(fetchData, 2000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedDevice, selectedDeviceType, selectedManufacturer]); // Empty dependency array ensures the effect runs only once on mount

  return (
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
  );
};

export default InfoPanel;

