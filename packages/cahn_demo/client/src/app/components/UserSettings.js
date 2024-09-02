import {
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Stack,
  Button,
} from "@mui/material";

const UserSettings = () => {
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
        {"> "}User Settings
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack>
          <FormControlLabel
            control={<Switch />}
            label="Can issue device trust?"
          />{" "}
          <FormControlLabel
            control={<Switch />}
            label="Can issue manufacturer trust"
          />{" "}
          <FormControlLabel
            control={<Switch />}
            label="Can issue device type trust"
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default UserSettings;
