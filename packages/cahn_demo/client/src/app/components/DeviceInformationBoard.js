"use client";

import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown";
import BuildIcon from "@mui/icons-material/Build";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { useMediaQuery } from "@mui/material";
import { Typography, Paper, Stack, Divider } from "@mui/material";
import theme from "../theme";
import InfoSection from "./InfoSection";
export default function DeviceInformationBoard() {
  const deviceInfo = {
    ID: "device id",
    Name: "device name",
    IDevID: "device IDevID",
    "Created At": "created at timestamp",
  };

  const manufacturerInfo = {
    ID: "manufacturer id",
    Name: "manufacturer name",
    "Created At": "created at timestamp",
  };

  const deviceTypeInfo = {
    ID: "device type id",
    Name: "device type name",
    "Created At": "created at timestamp",
  };

  const matches = useMediaQuery(theme.breakpoints.up("xl"));

  return (
    <Paper
      sx={{
        m: 3,
        borderRadius: 5,
        p: 2,
      }}
      elevation={24}
    >
      <Typography
        variant="h2"
        sx={{
          color: "primary.main",
          mb: 5,
        }}
      >
        {"> "}Device Information
      </Typography>
      <Stack
        spacing={0}
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="space-evenly"
        sx={{ mt: 3 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
      >
        <InfoSection
          title="Device"
          icon={DeviceUnknownIcon}
          info={deviceInfo}
        />
        <InfoSection
          title="Manufacturer"
          icon={BuildIcon}
          info={manufacturerInfo}
        />
        <InfoSection
          title="Device Type"
          icon={DevicesOtherIcon}
          info={deviceTypeInfo}
        />
      </Stack>
    </Paper>
  );
}
