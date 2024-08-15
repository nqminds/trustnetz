"use client";
import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown";
import BuildIcon from "@mui/icons-material/Build";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { Typography, Paper, Stack, Divider, Container } from "@mui/material";
import InfoSection from "./InfoSection";

export default function DeviceInformationBoard({ selectedDevice }) {
  return (
    <Paper
      sx={{
        m: { xs: 1, sm: 3 },
        p: { xs: 2, sm: 3 },
        minWidth: 300,
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
        {selectedDevice.deviceInfo.Name} Information
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
          info={selectedDevice.deviceInfo}
        />
        <InfoSection
          title="Manufacturer"
          icon={BuildIcon}
          info={selectedDevice.manufacturerInfo}
        />
        <InfoSection
          title="Device Type"
          icon={DevicesOtherIcon}
          info={selectedDevice.deviceTypeInfo}
        />
      </Stack>
    </Paper>
  );
}
