"use client";

import { Typography, Box } from "@mui/material";
import DeviceInformationBoard from "./components/DeviceInformationBoard";
import DeviceSelect from "./components/DeviceSelect";
import { useState, useEffect } from "react";
import defaultData from "./defaultData";
import axios from "axios";
import withAuth from "./utils/withAuth";
import AppBar from "./components/AppBar";

const Home = () => {
  const [data, setData] = useState(defaultData);
  const [selectedDevice, setSelectedDevice] = useState(defaultData[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/all_devices_data").then((res) => {
      setData(res.data);
      setSelectedDevice(res.data[0]);
      setIsLoading(false);
    });
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
      </Box>
    </>
  );
};

export default withAuth(Home);
