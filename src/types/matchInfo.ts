export interface MatchInfo {
    id: string | null;
    resistantAntibioticsHashValue: string;
    susceptibleAntibioticsHashValue: string;
    susceptibleAtHighDoseAntibioticsHashValue: string;
    matchRecords: Array<string>;
}

