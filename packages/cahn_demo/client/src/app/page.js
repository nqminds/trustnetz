"use client";

import { Typography, Box } from "@mui/material";
import DeviceInformationBoard from "./components/DeviceInformationBoard";
import DeviceSelect from "./components/DeviceSelect";
import { useState, useEffect } from "react";
import defaultData from "./defaultData";
import axios from "axios";
import withAuth from "./utils/withAuth";
import AppBar from "./components/AppBar";
import UserSettings from "./components/UserSettings";

const Home = () => {
  const [data, setData] = useState(defaultData);
  const [selectedDevice, setSelectedDevice] = useState(defaultData[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/all_devices_data"
        );
        if (response.data.length === 0) {
          console.log("No data found");
          return;
        }

        const fetchedData = response.data;
        setData(fetchedData);

        const storedDeviceName = localStorage.getItem("selectedDevice");
        const foundDevice = storedDeviceName
          ? fetchedData.find(
              (device) => device.deviceInfo.Name === storedDeviceName
            )
          : fetchedData[0];

        setSelectedDevice(foundDevice || fetchedData[0]);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <AppBar />
      <Box>
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            color: "primary.main",
            m: { xs: 1, sm: 3 },
          }}
        >
          CAHN Dashboard
        </Typography>
        <DeviceSelect
          devices={data}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          isLoading={isLoading}
        />
        <DeviceInformationBoard
          selectedDevice={selectedDevice}
          isLoading={isLoading}
        />
        <UserSettings />
      </Box>
    </>
  );
};

export default withAuth(Home);
