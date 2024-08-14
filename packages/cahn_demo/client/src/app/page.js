"use client";
import { Typography, Box } from "@mui/material";
import DeviceInformationBoard from "./components/DeviceInformationBoard";
import DeviceSelect from "./components/DeviceSelect";
import { useState } from "react";
import combinedInfoArray from "./exampleData";
import exampleData from "./exampleData";
export default function Home() {
  const [selectedDevice, setSelectedDevice] = useState(exampleData[0]);

  return (
    <Box>
      <Typography
        variant="h1"
        sx={{
          textAlign: "center",
          color: "primary.main",
          m: 3,
        }}
      >
        CAHN Dashboard
      </Typography>
      <DeviceSelect
        devices={exampleData}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
      />
      <DeviceInformationBoard selectedDevice={selectedDevice} />
    </Box>
  );
}
