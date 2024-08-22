"use client";

import { Typography, Box } from "@mui/material";
import DeviceInformationBoard from "./components/DeviceInformationBoard";
import DeviceSelect from "./components/DeviceSelect";
import { useState, useEffect } from "react";
import defaultData from "./defaultData";
import axios from "axios";

export default function Home() {
  const [data, setData] = useState(defaultData);
  const [selectedDevice, setSelectedDevice] = useState(defaultData[0]);

  useEffect(() => {
    axios.get("http://localhost:3001/all_devices_data").then((res) => {
      console.log(res.data);
      setData(res.data);
      setSelectedDevice(res.data[0]);
    });
  }, []);

  return (
    <Box>
      <Typography
        variant="h1"
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
      />
      <DeviceInformationBoard selectedDevice={selectedDevice} />
    </Box>
  );
}
