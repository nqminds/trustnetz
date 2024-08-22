"use client";
import { Typography, Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import SpecificDeviceInformationBoard from "../../components/SpecificDeviceInformationBoard";

export default function Page({ params }) {
  const [deviceData, setDeviceData] = useState({
    CreatedAtDevice: 0,
    DeviceId: "",
    Idevid: "",
    Name: "",
    CreatedAtDeviceType: 0,
    DeviceTypeId: "",
    DeviceType: "",
    CreatedAtManufactured: 0,
    ManufacturerId: "",
    CreatedAtManufacturer: 0,
    Manufacturer: "",
    CanConnect: false,
    CreatedAtUser: 0,
    UserId: "",
    Username: "",
    CanIssueDeviceTrust: false,
    CanIssueManufacturerTrust: false,
  });

  const thisiswhatdevicedatalookslike = {
    CreatedAtDevice: 1723716151033,
    DeviceId: "HenryTrustPhone-id",
    Idevid: "HenryTrustPhone-idevid",
    Name: "HenryTrustPhone",
    CreatedAtDeviceType: 1723716151033,
    DeviceTypeId: "TrustPhone-id",
    DeviceType: "TrustPhone",
    CreatedAtManufactured: 1723716151033,
    ManufacturerId: "TrustCorp-id",
    CreatedAtManufacturer: 1723716151033,
    Manufacturer: "TrustCorp",
    CanConnect: true,
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/device/" + params.device_id)
      .then((res) => {
        setDeviceData(res.data);
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
        Device Information
      </Typography>
      <SpecificDeviceInformationBoard deviceData={deviceData} />
    </Box>
  );
}
