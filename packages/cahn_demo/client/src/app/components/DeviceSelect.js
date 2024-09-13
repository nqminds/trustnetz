"use client";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Typography,
  FormHelperText,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useCallback } from "react";

const DeviceSelect = ({
  devices,
  selectedDevice,
  setSelectedDevice,
  isLoading,
}) => {
  const handleChange = useCallback(
    (event) => {
      const selectedDevice = event.target.value;
      setSelectedDevice(selectedDevice);
      localStorage.setItem("selectedDevice", selectedDevice.deviceInfo.Name);
    },
    [setSelectedDevice]
  );

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
        {"> "}Device Select
      </Typography>
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={118} />
      ) : (
        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="device-select-label">Device</InputLabel>
          <Select
            labelId="device-select-label"
            id="device-select"
            value={selectedDevice}
            label="Device"
            onChange={handleChange}
            autoWidth
            variant="outlined"
          >
            {devices.map((device, index) => (
              <MenuItem key={index} value={device}>
                {device.deviceInfo.Name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the device you wish to view</FormHelperText>
        </FormControl>
      )}
    </Paper>
  );
};

export default DeviceSelect;
