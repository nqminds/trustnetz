import { Box, Stack, Typography } from "@mui/material";

const InfoSection = ({ title, icon: Icon, info }) => {
  return (
    <Box
      sx={{
        margin: "16px auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Icon
          sx={{
            fontSize: "50px",
            color: "primary.main",
            textAlign: "center",
            mr: 2,
          }}
        />
        <Typography variant="h3" textAlign={"center"}>
          {title}
        </Typography>
      </Box>
      <Stack direction="column">
        {Object.entries(info).map(([key, value]) => (
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
  );
};

export default InfoSection;
