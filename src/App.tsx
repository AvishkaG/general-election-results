import { useEffect, useState } from "react";
import flatMap from "lodash/flatMap";
import orderBy from "lodash/orderBy";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircleIcon from "@mui/icons-material/Circle";
import CheckIcon from "@mui/icons-material/Check";
import { ElectionResults } from "./types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Backdrop,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fetchElectionData } from "./apis";
import ResultTable from "./ResultTable";
import { calculateElectionResults, getBulletColor } from "./utils";
import "./App.css";

function App() {
  const appTheme = useTheme();
  const XS_MATCHES = useMediaQuery(appTheme.breakpoints.down("sm"));
  const [electionData, setElectionData] = useState<ElectionResults | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await fetchElectionData();
        const newData = calculateElectionResults(data);

        setElectionData(newData);
      } catch (error) {
        setError("Failed to fetch election data.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchDataWithoutLoading = async () => {
      try {
        const data = await fetchElectionData();
        const newData = calculateElectionResults(data);
        setElectionData(newData);
      } catch (error) {
        setError("Failed to fetch election data.");
      }
    };

    const intervalId = setInterval(() => {
      fetchDataWithoutLoading();
    }, 10000); // 10 seconds interval

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f5f7" }}>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid
        container
        marginBottom={4}
        padding={XS_MATCHES ? 2 : 8}
        overflow="auto"
      >
        <AppBar
          component="nav"
          style={{ textAlign: "center", backgroundColor: "#333" }}
          className="app-bar"
        >
          <div>
            <img
              src={require("./assets/Flag_of_Sri_Lanka.svg.png")}
              height={30}
              alt=""
            />
            <Typography
              paddingTop={1}
              style={{ textTransform: "uppercase", fontSize: "1.3rem" }}
            >
              general election - 2024
            </Typography>
          </div>
        </AppBar>
        {!loading && (
          <>
            <Grid
              container
              spacing={XS_MATCHES ? 2 : 5}
              size={12}
              marginTop={XS_MATCHES ? 12 : 9}
              marginBottom={4}
            >
              {electionData && <ResultTable data={electionData?.parties} />}
            </Grid>
            <div className="released">
              {`Released Division/Postal Results :-
          
           ${
             flatMap(electionData?.provinces, (province) =>
               flatMap(province.districts, (district) =>
                 district.divisions.filter(
                   (division) => division.totalValidVotes !== null
                 )
               )
             ).length
           }
          / 182`}
            </div>
            {electionData && (
              <div
                style={{
                  width: "100%",
                }}
              >
                {orderBy(
                  flatMap(
                    electionData.provinces,
                    (province) => province.districts
                  ),
                  ["name"],
                  ["asc"]
                ).map((district) => {
                  if (
                    !district.parties.every(
                      (x) => x.data.value === 0 || x.data.value === null
                    )
                  ) {
                    return (
                      <div key={district.name} className="discard">
                        <Accordion
                          style={{
                            backgroundColor: "#ffffff",
                            boxShadow: "none",
                            border: "none",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            sx={{
                              padding: 0,
                            }}
                          >
                            <div className="distitle">
                              <CircleIcon
                                fontSize="small"
                                htmlColor={getBulletColor(district)}
                              />
                              {`${district.name} (
                      ${
                        district.divisions.filter((x) => x.totalValidVotes)
                          .length
                      }/${district.divisions.length})`}
                              {district.divisions.every(
                                (x) => x.totalValidVotes
                              ) && <CheckIcon color="success" />}
                            </div>
                          </AccordionSummary>
                          <AccordionDetails style={{ padding: 0 }}>
                            <ResultTable data={district.parties} />
                            <div className="divi-total">
                              Total Votes:{" "}
                              <span>
                                {district.totalValidVotes.toLocaleString()}
                              </span>
                            </div>
                            <Accordion
                              style={{
                                backgroundColor: "#f5f5f5",
                                boxShadow: "none",
                                border: "none",
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                              >
                                <div className="diviTopic">Divisions</div>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Grid container spacing={3}>
                                  {district.divisions.map((division) => {
                                    if (division.totalValidVotes) {
                                      return (
                                        <Grid
                                          key={division.name}
                                          size={{
                                            lg: 6,
                                            md: 6,
                                            sm: 12,
                                            xs: 12,
                                          }}
                                        >
                                          <div className="divi-card">
                                            <div className="divi-name">
                                              {division.name}
                                            </div>
                                            <ResultTable
                                              isDivision
                                              data={division.parties}
                                            />
                                            <div className="divi-total">
                                              Total Votes:{" "}
                                              <span>
                                                {division.totalValidVotes.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </Grid>
                                      );
                                    }
                                  })}
                                </Grid>
                              </AccordionDetails>
                            </Accordion>
                          </AccordionDetails>
                        </Accordion>
                        {district.divisions.some((x) => !x.totalValidVotes) && (
                          <div style={{ paddingTop: "15px", fontWeight: 500 }}>
                            {`Yet to come: ${district.divisions
                              .filter((x) => !x.totalValidVotes)
                              .map((y) => ` ${y.name}`)
                              .join(",")}`}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </>
        )}
      </Grid>
      <footer className="footer">
        <p>&copy; 2024 Avishka. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
