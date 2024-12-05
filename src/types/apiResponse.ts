import type { LabRecord } from './labRecords'; // Adjust the path as necessary
import type { MatchInfo } from './matchInfo';   // Adjust the path as necessary

// Define your API response types here
// Define a type for the pair
export type LabRecordMatchInfoPair = {
    record: LabRecord;
    matchInfo: MatchInfo | null;
};

// Define the API response type
export type ApiResponse = LabRecordMatchInfoPair[];