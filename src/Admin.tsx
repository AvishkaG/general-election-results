import React, { useEffect, useState } from "react";
import isEmpty from "lodash/isEmpty";
import find from "lodash/find";
import flatMap from "lodash/flatMap";
import orderBy from "lodash/orderBy";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import {
  candidateEnum,
  District,
  Division,
  ElectionResults,
  Province,
  VoteUpdatePayload,
} from "./types";
import Grid from "@mui/material/Grid2";
import { fetchElectionData, updateVotes } from "./apis";

const Admin = () => {
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");

  const [districts, setDistricts] = useState<District[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [total, setTotal] = useState("");
  const [akd, setAkd] = useState("");
  const [sp, setSp] = useState("");
  const [rw, setRw] = useState("");

  const [electionData, setElectionData] = useState<ElectionResults | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchElectionData();
        setElectionData(data);
        buildDistrictList(data);
      } catch (error) {
        setError("Failed to fetch election data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const buildDistrictList = (data: ElectionResults) => {
    const districts = flatMap(data.provinces, (province) => province.districts);
    setDistricts(orderBy(districts, ["name"], ["asc"]));
  };

  const buildDivisionList = (districtName: string) => {
    const result = find(districts, { name: districtName });
    setDivisions(result ? result.divisions : []);
  };

  const handleChangeDistrict = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    setDistrict(value);
    buildDivisionList(value);
  };
  const handleChangeDivision = (event: SelectChangeEvent) => {
    setDivision(event.target.value as string);
  };

  let isButtonDisabled: boolean = false;

  const getNumber = (txt: string): number => {
    return Number(txt);
  };

  const handleSubmit = () => {
    setSending(true);
    const payload: VoteUpdatePayload = {
      district,
      division,
      totalValidVotes: getNumber(total) ?? 0,
      akdVotes: getNumber(akd) ?? 0,
      spVotes: getNumber(sp) ?? 0,
      rwVotes: getNumber(rw) ?? 0,
    };

    updateVotes(payload)
      .then((response) => {
        console.log("API response:", response.success);
        setDistrict("");
        setDivision("");
        setTotal("");
        setAkd("");
        setSp("");
        setRw("");
        setOpen(true);
      })
      .catch((error) => {
        console.error("API call failed:", error);
      })
      .finally(() => {
        setSending(false);
      });
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={sending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container width="100%" spacing={2} padding={4}>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity={error && error.length ? "error" : "success"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error && error.length
              ? "Submitting votes failed!"
              : "Submitting votes successful!"}
          </Alert>
        </Snackbar>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">DISTRICT</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={district}
              label="DISTRICT"
              onChange={handleChangeDistrict}
            >
              {districts.map((dis) => (
                <MenuItem key={dis.name} value={dis.name}>
                  {dis.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth disabled={isEmpty(district)}>
            <InputLabel id="demo-simple-select-label">DIVISION</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={division}
              label="DIVISION"
              onChange={handleChangeDivision}
            >
              {divisions.map((div) => (
                <MenuItem key={div.name} value={div.name}>
                  {div.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth disabled={isEmpty(district)}>
            <TextField
              id="outlined-basic"
              type="number"
              label="TOTAL"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth disabled={isEmpty(division)}>
            <TextField
              id="outlined-basic"
              type="number"
              label={candidateEnum.get("akd")}
              onChange={(e) => setAkd(e.target.value)}
              value={akd}
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth disabled={isEmpty(division)}>
            <TextField
              id="outlined-basic"
              type="number"
              label={candidateEnum.get("sp")}
              onChange={(e) => setSp(e.target.value)}
              value={sp}
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth disabled={isEmpty(division)}>
            <TextField
              id="outlined-basic"
              type="number"
              label={candidateEnum.get("rw")}
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid size={4} sx={{ margin: "30px auto" }}>
          <FormControl fullWidth>
            <Button
              variant="contained"
              size="large"
              disabled={isButtonDisabled}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

export default Admin;
