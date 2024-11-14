import { maxBy } from "lodash";
import { CompassIcon } from "./assets/CompassIcon";
import { ElephantIcon } from "./assets/ElephantIcon";
import { GasIcon } from "./assets/GasIcon";
import { HouseIcon } from "./assets/HouseIcon";
import { LotusIcon } from "./assets/LotusIcon";
import { MicIcon } from "./assets/MicIcon";
import { TelephoneIcon } from "./assets/Telephone";
import { District, ElectionResults, IPartyConfig, Party } from "./types";

export function calculateElectionResults(
  electionResults: ElectionResults
): ElectionResults {
  // Helper function for district-level seat calculation
  const calculateDistrictSeats = (district: District): District => {
    const minimumPercentage = 5;
    const bonusSeat = 1;
    const proportionalSeats = district.totalSeats - bonusSeat;

    const eligibleParties = district.parties
      .map((party) => ({
        ...party,
        data: { ...party.data, estimatedSeats: 0, remainder: 0 },
      }))
      .filter((party) => (party.data.percentage ?? 0) >= minimumPercentage);

    const hareQuota = district.totalValidVotes / proportionalSeats;
    let remainingSeats = proportionalSeats;

    eligibleParties.forEach((party) => {
      const votes = party.data.value ?? 0;
      const initialSeats = Math.floor(votes / hareQuota);
      party.data.estimatedSeats = initialSeats;
      remainingSeats -= initialSeats;
      party.data.remainder = votes % hareQuota;
    });

    eligibleParties.sort(
      (a, b) => (b.data.remainder ?? 0) - (a.data.remainder ?? 0)
    );

    for (let i = 0; i < remainingSeats && i < eligibleParties.length; i++) {
      eligibleParties[i].data.estimatedSeats! += 1;
    }

    if (eligibleParties.length > 0) {
      const highestVoteParty = eligibleParties.reduce((max, party) =>
        (party.data.value ?? 0) > (max.data.value ?? 0) ? party : max
      );
      highestVoteParty.data.estimatedSeats! += bonusSeat;
    }

    const allDivisionsHaveVotes = district.divisions.every(
      (division) => division.totalValidVotes !== null
    );

    const updatedParties = district.parties.map((party) => {
      const eligibleParty = eligibleParties.find((p) => p.name === party.name);
      const seats = allDivisionsHaveVotes
        ? eligibleParty?.data.estimatedSeats
        : undefined;
      return {
        ...party,
        data: {
          ...party.data,
          estimatedSeats: eligibleParty?.data.estimatedSeats,
          seats,
        },
      };
    });

    return { ...district, parties: updatedParties };
  };

  // Update districts with seat calculation
  const updatedProvinces = electionResults.provinces.map((province) => {
    const updatedDistricts = province.districts.map(calculateDistrictSeats);

    // Aggregate seats for each party at the province level
    const provinceParties = province.parties.map((party) => {
      const totalEstimatedSeats = updatedDistricts.reduce(
        (acc, district) =>
          acc +
          (district.parties.find((p) => p.name === party.name)?.data
            .estimatedSeats ?? 0),
        0
      );
      const totalSeats = updatedDistricts.reduce(
        (acc, district) =>
          acc +
          (district.parties.find((p) => p.name === party.name)?.data.seats ??
            0),
        0
      );
      return {
        ...party,
        data: {
          ...party.data,
          estimatedSeats: totalEstimatedSeats,
          seats: totalSeats,
        },
      };
    });

    return {
      ...province,
      districts: updatedDistricts,
      parties: provinceParties,
    };
  });

  // Aggregate seats for each party at the national level
  const nationalParties = electionResults.parties.map((party) => {
    const totalEstimatedSeats = updatedProvinces.reduce(
      (acc, province) =>
        acc +
        (province.parties.find((p) => p.name === party.name)?.data
          .estimatedSeats ?? 0),
      0
    );
    const totalSeats = updatedProvinces.reduce(
      (acc, province) =>
        acc +
        (province.parties.find((p) => p.name === party.name)?.data.seats ?? 0),
      0
    );
    return {
      ...party,
      data: {
        ...party.data,
        estimatedSeats: totalEstimatedSeats,
        seats: totalSeats,
      },
    };
  });

  return {
    ...electionResults,
    provinces: updatedProvinces,
    parties: nationalParties,
  };
}

export const partiesConfigs: IPartyConfig[] = [
  {
    id: "NPP",
    icon: CompassIcon,
    name: "National People's Power",
    color: "#c40a4b",
  },
  {
    id: "SJB",
    icon: TelephoneIcon,
    name: "Samagi Jana Balawegaya",
    color: "#b1b802",
  },
  {
    id: "UNP",
    icon: ElephantIcon,
    name: "United National Party",
    color: "#018241",
  },
  {
    id: "NDF",
    icon: GasIcon,
    name: "New Democratic Front",
    color: "#33FF57",
  },
  {
    id: "SLPP",
    icon: LotusIcon,
    name: "Sri Lanka Podujana Peramuna",
    color: "#FF33A1 ",
  },
  {
    id: "ITAK",
    icon: HouseIcon,
    name: "Ilankai Tamil Arasu Kachchi",
    color: "#FF5733",
  },
  {
    id: "EPDP",
    icon: MicIcon,
    name: "Eelam People's Democratic Party",
    color: "#87CEEB",
  },
];

export const getPartyConfigById = (id: string | undefined): IPartyConfig => {
  if (!id) return partiesConfigs[0];
  return partiesConfigs.find((x) => x.id === id) ?? partiesConfigs[0];
};

export function formatPercentage(value: number | undefined | null): string {
  return value?.toFixed(2) ?? "0";
}

export function formatVoteCount(value: number | undefined | null): string {
  return value ? new Intl.NumberFormat("en-US").format(value) : "N/A";
}

export const getBulletColor = (dis: District) => {
  const highestPercentageParty = maxBy(
    dis.parties.map((party) => ({
      ...party,
      data: {
        ...party.data,
        percentage: party.data.percentage || 0, // Handle null percentages
      },
    })),
    (party: { data: { percentage: any } }) => party.data.percentage
  );

  return getPartyConfigById(highestPercentageParty?.name).color;
};

export function filterAndSortTopTableParties(parties: Party[]): Party[] {
  const filteredParties = parties.filter(
    (party) => party.data.value !== null && party.data.value !== 0
  );

  if (filteredParties.length < 4) {
    return parties.slice(0, 4);
  }

  return filteredParties.sort(
    (a, b) => (b.data.value || 0) - (a.data.value || 0)
  );
}
