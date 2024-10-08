import {
  Typography,
  Paper,
  Stack,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Chip,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";
import { StyledTableRow, StyledTableCell } from "./StyledTable";
import unixInMillisecondsToDateString from "@/utils/unixMillisecondsToDateString";

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
      <Stack direction="row" spacing={2}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            margin: "auto",
            width: "60%",
          }}
        >
          <Stack divider={<Divider />} spacing={2}>
            <>
              <Typography
                variant="h4"
                sx={{
                  color: "primary.main",
                }}
              >
                Device Type Information
              </Typography>

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
                      <StyledTableCell>Device Type Attribute</StyledTableCell>
                      <StyledTableCell align="right">Value</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>

                  <TableBody>
                    {/* Device Type Fields */}
                    <StyledTableRow>
                      <StyledTableCell>Created At</StyledTableCell>
                      <StyledTableCell align="right">
                        {unixInMillisecondsToDateString(
                          deviceTypeData.CreatedAtDeviceType
                        )}{" "}
                        ({deviceTypeData.CreatedAtDeviceType})
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>ID</StyledTableCell>
                      <StyledTableCell align="right">
                        {deviceTypeData.DeviceTypeId}
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>Name</StyledTableCell>
                      <StyledTableCell align="right">
                        {deviceTypeData.DeviceType}
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <StyledTableCell>Has Trust From Users</StyledTableCell>
                      <StyledTableCell align="right">
                        <Chip
                          icon={
                            deviceTypeData.HasTrust ? (
                              <CheckIcon />
                            ) : (
                              <DoDisturbIcon />
                            )
                          }
                          label={deviceTypeData.HasTrust.toString()}
                          color={deviceTypeData.HasTrust ? "success" : "error"}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
            <>
              <Typography
                variant="h4"
                sx={{
                  color: "primary.main",
                }}
              >
                Devices of Type {deviceTypeData.DeviceType}
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
                          <StyledTableCell>
                            {device.Name} attribute
                          </StyledTableCell>
                          <StyledTableCell align="right"></StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        <>
                          <StyledTableRow>
                            <StyledTableCell>ID</StyledTableCell>
                            <StyledTableCell align="right">
                              {device.DeviceId}
                            </StyledTableCell>
                          </StyledTableRow>
                          <StyledTableRow>
                            <StyledTableCell>IDevID</StyledTableCell>
                            <StyledTableCell align="right">
                              {device.Idevid}
                            </StyledTableCell>
                          </StyledTableRow>
                          <StyledTableRow>
                            <StyledTableCell>Name</StyledTableCell>
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
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            margin: "auto",
            width: "60%",
          }}
        >
          <Stack divider={<Divider />} spacing={2}>
            {Object.keys(deviceTypeData.SBOM).length > 0 ? (
              <>
                <Typography
                  variant="h4"
                  sx={{
                    color: "primary.main",
                  }}
                >
                  SBOM Information
                </Typography>

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
                        <StyledTableCell>Field</StyledTableCell>
                        <StyledTableCell align="right">Value</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      <StyledTableRow>
                        <StyledTableCell>
                          <b>SBOM</b> ID
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {deviceTypeData.SBOM.SbomId}
                        </StyledTableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <StyledTableCell>
                          <b>SBOM</b> Details
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {deviceTypeData.SBOM.Details}
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                }}
              >
                No SBOM information available.
              </Typography>
            )}
            {/* Vulnerabilities */}
            {deviceTypeData.SBOM.Vulnerabilities &&
            deviceTypeData.SBOM.Vulnerabilities.length > 0 ? (
              <>
                <Typography
                  variant="h4"
                  sx={{
                    color: "primary.main",
                  }}
                >
                  Vulnerabilities
                </Typography>

                {deviceTypeData.SBOM.Vulnerabilities.map(
                  (vulnList, listIndex) => (
                    <TableContainer key={listIndex}>
                      <Table
                        sx={{
                          [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCell>Vulnerability ID</StyledTableCell>
                            <StyledTableCell align="right">
                              Severity
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {vulnList.map((vulnerability, vulnIndex) => (
                            <StyledTableRow key={vulnIndex}>
                              <StyledTableCell>
                                {vulnerability.VulnerabilityId}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {vulnerability.Severity}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                )}
              </>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                }}
              >
                No vulnerability information available.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
