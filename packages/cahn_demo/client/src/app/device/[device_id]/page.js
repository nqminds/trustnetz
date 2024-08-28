"use client";
import {
  Typography,
  Box,
  Button,
  ButtonGroup,
  Paper,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceInfoTable from "../../components/DeviceInfoTable";
import withAuth from "@/app/utils/withAuth";

const Page = ({ params }) => {
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

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          m: { xs: 1, sm: 3 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "primary.main",
          }}
          gutterBottom
        >
          {"> "}
          {deviceData.Name} Trust
        </Typography>
        <Box
          component="pre"
          sx={{
            padding: "16px",
            borderRadius: "4px",
            overflowX: "auto",
            fontFamily: "Monaco, monospace",
            fontSize: "14px",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography component="code">
            {`Some stuff here from the Prolog environment about who trusts this device.

assert(device_trust("Henry-id",1723716151033,"HenryTrustPhone-id")).
assert(device_trust("Henry-id",1723716151033,"HenryVulnerableCamera-id")).
assert(device_trust("Ash-id",1723716151033,"AshEvilPhone-id")).


`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <ButtonGroup variant="contained" size="large">
            <Button>
              <Typography variant="button">Add trust</Typography>
            </Button>
            <Button>
              <Typography variant="button">Remove Trust</Typography>
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>
    </Box>
  );
};

export default withAuth(Page);
