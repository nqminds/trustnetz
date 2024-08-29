"use client";
import { Typography, Box, Button, ButtonGroup } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceTypeInfoTable from "../../components/DeviceTypeInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
const Page = ({ params }) => {
  const [deviceTypeData, setDeviceTypeData] = useState({
    CreatedAtDeviceType: "",
    DeviceTypeId: "",
    DeviceType: "",
    SBOM: {
      SbomId: "",
    },
    Devices: [
      [
        {
          DeviceId: "",
          Idevid: "",
          Name: "",
          ManufacturerId: "",
          Manufacturer: "",
        },
      ],
    ],
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/deviceType/" + params.device_type_id)
      .then((res) => {
        setDeviceTypeData(res.data);
        console.log("res.data :>> ", res.data);
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
          Device Type Information
        </Typography>
        <DeviceTypeInfoTable deviceTypeData={deviceTypeData} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <ButtonGroup variant="contained" size="large">
            <Button>Button 1</Button>
            <Button>Button 2</Button>
          </ButtonGroup>
        </Box>
      </Box>
    </>
  );
};

export default withAuth(Page);
