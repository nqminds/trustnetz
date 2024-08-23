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
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";

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

export default function SpecificDeviceInformationBoard({ manufacturerData }) {
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
        {manufacturerData.Manufacturer}
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
                  {/* Manufacturer Fields */}
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Manufacturer</b> Created At
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        manufacturerData.CreatedAtManufacturer
                      )}{" "}
                      ({manufacturerData.CreatedAtManufacturer})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Manufacturer</b> ID
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {manufacturerData.ManufacturerId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>
                      <b>Manufacturer</b> Name
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {manufacturerData.Manufacturer}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <StyledTableCell>Manufacturer is Trusted</StyledTableCell>
                    <StyledTableCell align="right">
                      <Chip
                        icon={
                          manufacturerData.CanIssueManufacturerTrust ? (
                            <CheckIcon />
                          ) : (
                            <DoDisturbIcon />
                          )
                        }
                        label={manufacturerData.CanIssueManufacturerTrust.toString()}
                        color={
                          manufacturerData.CanIssueManufacturerTrust
                            ? "success"
                            : "error"
                        }
                      />
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
              Devices made by {manufacturerData.Manufacturer}
            </Typography>

            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              sx={{ mt: 2 }}
            >
              {manufacturerData.Devices.map((device, index) => (
                <TableContainer>
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
                            <b>Device {index + 1}</b> ID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.DeviceId}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device {index + 1}</b> IDevID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.Idevid}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device {index + 1}</b> Name
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.Name}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device {index + 1} Type</b> Created At
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {unixInMillisecondsToDateString(
                              device.CreatedAtDeviceType
                            )}{" "}
                            ({device.CreatedAtDeviceType})
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device {index + 1} Type</b> ID
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.DeviceTypeId}
                          </StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell>
                            <b>Device {index + 1} Type</b> Name
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {device.DeviceType}
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <ButtonGroup variant="contained" size="large">
          <Button>
            <Typography variant="button">Button 1</Typography>
          </Button>
          <Button>
            <Typography variant="button">Button 2</Typography>
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
}
