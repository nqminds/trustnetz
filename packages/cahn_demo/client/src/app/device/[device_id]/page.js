"use client";
import { Typography, Box, Button, ButtonGroup } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceInfoTable from "../../components/DeviceInfoTable";

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
        variant="h2"
        sx={{
          textAlign: "center",
          color: "primary.main",
          m: { xs: 1, sm: 3 },
        }}
      >
        Device Information
      </Typography>
      <DeviceInfoTable deviceData={deviceData} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <ButtonGroup variant="contained" size="large">
          <Button>
            <Typography variant="button">Button 1</Typography>
          </Button>
          <Button>
            <Typography variant="button">Button 2</Typography>
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}
