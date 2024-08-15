import { Typography, Box, Paper } from "@mui/material";

export default function Page({ params }) {
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
