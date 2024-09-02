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
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect } from "react";

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
  return new Date(Number(unixInMilliseconds)).toDateString();
}

export default function ManufacturerInfoTable({ manufacturerData }) {
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
          <>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Manufacturer Information
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
                    <StyledTableCell>Manufacturer Attribute</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  {/* Manufacturer Fields */}
                  <StyledTableRow>
                    <StyledTableCell>Created At</StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        manufacturerData.CreatedAtManufacturer
                      )}{" "}
                      ({manufacturerData.CreatedAtManufacturer})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell align="right">
                      {manufacturerData.ManufacturerId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>Name</StyledTableCell>
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
          </>

          <>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Device Types Made by {manufacturerData.Manufacturer}
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
                    <StyledTableCell align="center">ID</StyledTableCell>
                    <StyledTableCell align="center">Name</StyledTableCell>
                    <StyledTableCell align="center">Created At</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {manufacturerData.DeviceTypes.length > 0 &&
                    manufacturerData.DeviceTypes.map((device) => (
                      <StyledTableRow key={device.DeviceTypeId}>
                        <StyledTableCell align="center">
                          {device.DeviceTypeId}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {device.DeviceType}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {unixInMillisecondsToDateString(
                            device.CreatedAtDeviceType
                          )}{" "}
                          ({device.CreatedAtDeviceType})
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        </Stack>
      </Paper>
    </Paper>
  );
}
