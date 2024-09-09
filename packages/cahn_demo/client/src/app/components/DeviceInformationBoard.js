"use client";
import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown";
import BuildIcon from "@mui/icons-material/Build";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { Typography, Paper, Stack, Divider, Skeleton } from "@mui/material";
import DeviceInfoSection from "./DeviceInfoSection";

export default function DeviceInformationBoard({ selectedDevice, isLoading }) {
  return (
    <>
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
          {isLoading
            ? "Device Information"
            : `> ${selectedDevice.deviceInfo.Name} Information`}
        </Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height={118} />
        ) : (
          <>
            <Stack
              spacing={0}
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="space-evenly"
              sx={{ mt: 3 }}
              direction="row"
              useFlexGap
              flexWrap="wrap"
            >
              <DeviceInfoSection
                title="Device"
                icon={DeviceUnknownIcon}
                info={selectedDevice.deviceInfo}
                link="device"
              />
              <DeviceInfoSection
                title="Manufacturer"
                icon={BuildIcon}
                info={selectedDevice.manufacturerInfo}
                link="manufacturer"
              />
              <DeviceInfoSection
                title="Device Type"
                icon={DevicesOtherIcon}
                info={selectedDevice.deviceTypeInfo}
                link="device-type"
              />
            </Stack>
          </>
        )}
      </Paper>
    </>
  );
}
