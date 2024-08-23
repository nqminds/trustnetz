"use client";
import { Typography, Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import SpecificDeviceTypeInformationBoard from "../../components/SpecificDeviceTypeInformationBoard";

export default function Page({ params }) {
  const [deviceTypeData, setDeviceTypeData] = useState({
    CreatedAtDeviceType: 0,
    DeviceTypeId: "",
    DeviceType: "",
    Devices: [
      {
        DeviceId: "",
        Idevid: "",
        Name: "",
        ManufacturerId: "",
        Manufacturer: "",
      },
    ],
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/deviceType/" + params.device_type_id)
      .then((res) => {
        setDeviceTypeData(res.data);
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
        Device Information
      </Typography>
      <SpecificDeviceTypeInformationBoard deviceTypeData={deviceTypeData} />
    </Box>
  );
}
