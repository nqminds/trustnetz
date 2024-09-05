import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import React from "react";

const TrustSubmissions = ({
  trustVCs,
  permissionedUsers,
  emailAddress,
  handleRemoveTrust,
  handleCreateTrust,
}) => (
  <Paper
    sx={{
      p: { xs: 2, sm: 3 },
      m: { xs: 1, sm: 3 },
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
      Trust Submissions
    </Typography>{" "}
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="row"
      useFlexGap
      sx={{ flexWrap: "wrap" }}
    >
      {trustVCs.map((vc, index) => (
        <Card raised key={index} sx={{ maxWidth: 345, marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {new Date(Number(vc.timestamp)).toLocaleString("en-GB")}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {vc.authoriserId}
            </Typography>
            <Chip
              icon={
                permissionedUsers.includes(vc.authoriserId) ? (
                  <CheckIcon />
                ) : (
                  <DoDisturbIcon />
                )
              }
              label={
                permissionedUsers.includes(vc.authoriserId)
                  ? "Can issue trust"
                  : "Cannot issue trust"
              }
              color={
                permissionedUsers.includes(vc.authoriserId)
                  ? "success"
                  : "error"
              }
            />
          </CardContent>
          {vc.authoriserId === emailAddress && (
            <CardActions>
              <Button variant="contained" onClick={() => handleRemoveTrust(vc)}>
                Submit retraction
              </Button>
            </CardActions>
          )}
        </Card>
      ))}
    </Stack>
    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
      <Button variant="contained" onClick={handleCreateTrust}>
        Add trust
      </Button>
    </Box>{" "}
  </Paper>
);

export default TrustSubmissions;
