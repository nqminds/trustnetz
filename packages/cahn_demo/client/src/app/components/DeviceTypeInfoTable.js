import {
  Typography,
  Paper,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Box,
  TableHead,
  TableRow,
  Chip,
  Button,
  Container,
  ButtonGroup,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

function unixInMillisecondsToDateString(unixInMilliseconds) {
  return new Date(unixInMilliseconds).toDateString();
}

export default function DeviceTypeInfoTable({ deviceTypeData }) {
  return (
    <Paper
      sx={{
        m: { xs: 1, sm: 3 },
        p: { xs: 1, sm: 2 },
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
        {deviceTypeData.DeviceType}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          margin: "auto",
          width: "60%",
        }}
      >
        <Stack divider={<Divider />} spacing={2}>
          <Box>
            <TableContainer
              sx={{
                margin: "auto",
              }}
            >
              <Table
                sx={{
                  [`& .${tableCellClasses.root}`]: {
                    borderBottom: "none",
                  },
                }}
              >
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>Field</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  {/* Device Type Fields */}
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Device Type</b> Created At
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        deviceTypeData.CreatedAtDeviceType
                      )}{" "}
                      ({deviceTypeData.CreatedAtDeviceType})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Device Type</b> ID
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceTypeData.DeviceTypeId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Device Type</b> Name
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceTypeData.DeviceType}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Devices of type {deviceTypeData.DeviceType}
            </Typography>

            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              sx={{ mt: 2 }}
            >
              {deviceTypeData.Devices.map((device, index) => (
                <TableContainer key={index}>
                  <Table
                    sx={{
                      [`& .${tableCellClasses.root}`]: {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <TableHead>
                      <StyledTableRow>
                        <StyledTableCell>{device.Name}</StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device</b> ID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.DeviceId}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device</b> IDevID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.Idevid}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device</b> Name
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.Name}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Manufacturer</b> ID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.ManufacturerId}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Manufacturer</b> Name
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.Manufacturer}
                          </StyledTableCell>
                        </StyledTableRow>
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              ))}
            </Stack>
          </>
        </Stack>
      </Paper>
    </Paper>
  );
}
