"use client";
import { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Typography,
  FormHelperText,
} from "@mui/material";
const DeviceSelect = ({ devices, selectedDevice, setSelectedDevice }) => {
  const handleChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <Paper
      sx={{
        m: 3,
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
        {"> "}Device Select
      </Typography>
      <FormControl sx={{ m: 1, minWidth: 150 }}>
        {" "}
        <InputLabel id="demo-simple-select-label">Device</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedDevice}
          label="Device"
          onChange={handleChange}
          autoWidth
          variant="outlined"
        >
          {devices.map((device) => (
            <MenuItem key={device} value={device}>
              {device.deviceInfo.Name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select the device you wish to view</FormHelperText>
      </FormControl>
    </Paper>
  );
};

export default DeviceSelect;
