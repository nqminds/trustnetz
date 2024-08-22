import { Box, Stack, Typography, Link } from "@mui/material";
const InfoSection = ({ title, icon: Icon, info, link }) => {
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
            fontSize: "35px",
            color: "primary.main",
            textAlign: "center",
            mr: 2,
          }}
        />
        <Link
          href={"/" + link + "/" + info.ID}
          variant="h4"
          textAlign={"center"}
          color="text.primary"
        >
          {title}
        </Link>
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
            <Typography variant="body1" sx={{ color: "primary.main" }}>
              <b>{key}: </b>
            </Typography>
            <Typography variant="body1">{value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default InfoSection;
