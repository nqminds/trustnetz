import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Stack,
  Button,
} from "@mui/material";
import axios from "axios";

const UserSettings = () => {
  const emailAddress = localStorage.getItem("emailAddress");

  const [formData, setFormData] = useState({
    canIssueDeviceTrust: false,
    canIssueManufacturerTrust: false,
    canIssueDeviceTypeTrust: false,
  });

  const handleFormChange = (event) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleSubmit = () => {
    axios
      .post(`http://localhost:3001/user_settings`, {
        ...formData,
        emailAddress,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user_settings/${emailAddress}`)
      .then((res) => {
        setFormData(res.data);
      });
  }, []);

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
            control={
              <Switch
                checked={formData.canIssueDeviceTrust}
                onChange={handleFormChange}
                name="canIssueDeviceTrust"
              />
            }
            label="Can issue device trust?"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.canIssueManufacturerTrust}
                onChange={handleFormChange}
                name="canIssueManufacturerTrust"
              />
            }
            label="Can issue manufacturer trust"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.canIssueDeviceTypeTrust}
                onChange={handleFormChange}
                name="canIssueDeviceTypeTrust"
              />
            }
            label="Can issue device type trust"
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default UserSettings;
