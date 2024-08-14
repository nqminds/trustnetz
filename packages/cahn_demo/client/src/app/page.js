import { Typography, Box } from "@mui/material";
import DeviceInformationBoard from "./components/DeviceInformationBoard";
export default function Home() {
  return (
    <Box>
      <Typography
        variant="h1"
        sx={{
          textAlign: "center",
          color: "primary.main",
          m: 3,
        }}
      >
        CAHN Dashboard
      </Typography>
      <DeviceInformationBoard />
    </Box>
  );
}
