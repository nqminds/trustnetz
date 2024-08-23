"use client";
import { Typography, Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import SpecificManufacturerInformationBoard from "../../components/SpecificManufacturerInformationBoard";

export default function Page({ params }) {
  const [manufacturerData, setManufacturerData] = useState({
    CreatedAtManufacturer: null,
    ManufacturerId: null,
    Manufacturer: null,
    Devices: [
      {
        DeviceId: null,
        Idevid: null,
        Name: null,
        CreatedAtDeviceType: null,
        DeviceTypeId: null,
        DeviceType: null,
      },
    ],
    CanIssueManufacturerTrust: false,
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/manufacturer/" + params.manufacturer_id)
      .then((res) => {
        setManufacturerData(res.data);
        console.log("res.data", res.data);
      });
  }, []);

  return (
    <Box>
      <Typography
        variant="h2"
        sx={{
          textAlign: "center",
          color: "primary.main",
          m: { xs: 1, sm: 3 },
        }}
      >
        Manufacturer Information
      </Typography>
      <SpecificManufacturerInformationBoard
        manufacturerData={manufacturerData}
      />
    </Box>
  );
}
