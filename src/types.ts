export interface ElectionResults {
  totalValidVotes: number;
  parties: Party[];
  provinces: Province[];
}

export interface Province {
  name: string;
  totalValidVotes: number;
  parties: Party[];
  districts: District[];
}

export interface District {
  name: string;
  totalValidVotes: number;
  totalSeats: number;
  parties: Party[];
  divisions: Division[];
}

export interface Division {
  name: string;
  totalValidVotes: number;
  parties: Party[];
}

export interface Party {
  name: string;
  data: PartyVote;
}

export interface PartyVote {
  value: number | null;
  percentage: number | null;
  estimatedSeats?: number;
  seats?: number;
}

export interface VoteUpdatePayload {
  district: string;
  division: string;
  totalValidVotes: number;
  akdVotes: number;
  spVotes: number;
  rwVotes: number;
}

export interface IPartyConfig {
  id: string;
  icon: () => JSX.Element;
  name: string;
  color: string;
}

export const candidateEnum = new Map<string, string>([
  ["akd", "ANURA DISSANAYAKE"],
  ["sp", "SAJITH PREMADASA"],
  ["rw", "RANIL WICKRAMASINGHE"],
]);
