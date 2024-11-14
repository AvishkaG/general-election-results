import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chart from "react-apexcharts";
import { Box, Grid2, Tooltip, Typography } from "@mui/material";
import _ from "lodash";
import { Party } from "./types";
import {
  filterAndSortTopTableParties,
  formatPercentage,
  formatVoteCount,
  getPartyConfigById,
} from "./utils";
import CountUp from "react-countup";

interface ResultTableProps {
  data: Party[];
  isDivision?: boolean;
}

export default function ResultTable(props: ResultTableProps) {
  const { data: partyData, isDivision = false } = props;
  const options = {
    chart: {
      id: "data.name",
    },
    // colors: COLORS,
    labels: [],
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: function (val: any) {
          return val.toLocaleString();
        },
      },
    },
  };

  const series: number[] = [];

  return (
    <Grid2 container size={12}>
      <Grid2 size={12}>
        <TableContainer sx={{ border: "0.5px solid #00000087" }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Party</StyledTableCell>
                <StyledTableCell align="right">Total Votes</StyledTableCell>
                <StyledTableCell align="right">Percentage</StyledTableCell>
                {!isDivision && (
                  <StyledTableCell align="right">Seats</StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filterAndSortTopTableParties(partyData).map((party) => {
                const { name, icon: PIcon } = getPartyConfigById(party.name);
                return (
                  <StyledTableRow key={party.name}>
                    <StyledTableCell style={{ fontWeight: 400 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PIcon />
                        {name}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <CountUp preserveValue end={party.data.value ?? 0} />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <CountUp
                        preserveValue
                        decimals={2}
                        suffix="%"
                        end={party.data.percentage ?? 0}
                      />
                    </StyledTableCell>
                    {!isDivision && (
                      <StyledTableCell align="right">
                        <Tooltip
                          title={`Estimated Seats: ${
                            party.data?.estimatedSeats ?? 0
                          }`}
                        >
                          <span style={{ cursor: "pointer" }}>
                            <CountUp
                              preserveValue
                              end={party.data?.seats ?? 0}
                            />
                          </span>
                        </Tooltip>
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid2>
    </Grid2>
  );
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgb(51, 51, 51)",
    color: theme.palette.common.white,
    fontSize: 16,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 16,
    fontWeight: 500,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
