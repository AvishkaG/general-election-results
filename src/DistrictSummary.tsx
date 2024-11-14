import Chart from "react-apexcharts";
import { District, Division } from "./types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Grid from "@mui/material/Grid2";

const COLORS = ["#c40a4b", "#b1b802", "#018241", "#484848"];

const DistrictSummary = ({ data }: { data: District }) => {
  const options = {
    chart: {
      id: data.name,
    },
    colors: COLORS,
    labels: data.parties.map((c) => c.name.toUpperCase()),
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

  const series = data.parties.map((c) => c.data.value ?? 0);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Chart
          options={options}
          series={series}
          type="pie"
          width={400}
          height={320}
        />
        <div className="divi-total">
          Total Votes: <span>{data.totalValidVotes.toLocaleString()}</span>
        </div>
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
            {data.divisions.map((division) => {
              if (division.totalValidVotes) {
                return (
                  <Grid
                    key={division.name}
                    size={{ lg: 4, md: 6, sm: 12, xs: 12 }}
                  >
                    <DivisionCard division={division} />
                  </Grid>
                );
              }
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
      <div
        style={{ paddingTop: "15px", fontWeight: 500 }}
      >{`Yet to come: ${data.divisions
        .filter((x) => !x.totalValidVotes)
        .map((y) => ` ${y.name}`)}`}</div>
    </>
  );
};

const DivisionCard = ({ division }: { division: Division }) => {
  const options = {
    chart: {
      id: division.name,
    },
    colors: COLORS,
    labels: division.parties.map((c) => c.name.toUpperCase()),
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

  const series = division.parties.map((c) => c.data.value ?? 0);

  return (
    <div className="divi-card">
      <div className="divi-name">{division.name}</div>
      <Chart
        options={options}
        series={series}
        type="pie"
        width={300}
        height={280}
      />
      <div className="divi-total">
        Total Votes: <span>{division.totalValidVotes.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default DistrictSummary;
