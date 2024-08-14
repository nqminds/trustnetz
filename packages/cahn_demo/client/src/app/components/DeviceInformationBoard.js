"use client";

import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown";
import BuildIcon from "@mui/icons-material/Build";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { useMediaQuery } from "@mui/material";
import { Typography, Box, Paper, Stack, Divider } from "@mui/material";
import theme from "../theme";
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

  const matches = useMediaQuery(theme.breakpoints.up("lg"));

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
          textAlign: "center",
          color: "primary.main",
        }}
      >
        Device Information
      </Typography>
      <Divider orientation="horizontal" sx={{ mt: 2 }} />
      <Stack
        // direction="row"
        spacing={0}
        divider={
          <Divider orientation={matches ? "vertical" : "horizontal"} flexItem />
        }
        justifyContent="space-evenly"
        sx={{ mt: 3 }}
        direction={{ lg: "column", xl: "row" }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <DeviceUnknownIcon
              sx={{
                fontSize: "50px",
                color: "primary.main",
                textAlign: "center",
                mr: 2,
              }}
            />
            <Typography variant="h3" textAlign={"center"}>
              Device
            </Typography>
          </Box>
          <Stack direction="column">
            {Object.entries(deviceInfo).map(([key, value]) => (
              <Stack
                direction="row"
                key={key}
                spacing={5}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Typography variant="h5" sx={{ color: "primary.main" }}>
                  <b>{key}: </b>
                </Typography>
                <Typography variant="h6">{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <BuildIcon
              sx={{
                fontSize: "50px",
                color: "primary.main",
                textAlign: "center",
                mr: 2,
              }}
            />
            <Typography variant="h3" textAlign={"center"}>
              Manufacturer
            </Typography>
          </Box>
          <Stack direction="column">
            {Object.entries(manufacturerInfo).map(([key, value]) => (
              <Stack
                direction="row"
                key={key}
                spacing={5}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Typography variant="h5" sx={{ color: "primary.main" }}>
                  <b>{key}: </b>
                </Typography>
                <Typography variant="h6">{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <DevicesOtherIcon
              sx={{
                fontSize: "50px",
                color: "primary.main",
                textAlign: "center",
                mr: 2,
              }}
            />
            <Typography variant="h3" textAlign={"center"}>
              Device Type
            </Typography>
          </Box>
          <Stack direction="column">
            {Object.entries(deviceTypeInfo).map(([key, value]) => (
              <Stack
                direction="row"
                key={key}
                spacing={5}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Typography variant="h5" sx={{ color: "primary.main" }}>
                  <b>{key}: </b>
                </Typography>
                <Typography variant="h6">{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
