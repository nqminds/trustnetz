"use client";
import { Typography, Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Page({ params }) {
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/device/" + params.device_id)
      .then((res) => {
        console.log(res.data);
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
      <Paper
        sx={{
          m: { xs: 1, sm: 3 },
          p: { xs: 2, sm: 3 },
          minWidth: 300,
        }}
      >
        <Typography>Device id: {params.device_id}</Typography>
      </Paper>
    </Box>
  );
}
