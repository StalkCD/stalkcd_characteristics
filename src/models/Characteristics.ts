import { ArrivalRate } from "./ArrivalRate";
import { BuildResult } from "./BuildResult";

export class Characteristics {

    avgBuildDuration?: number;
    arrivalRate?: ArrivalRate[];
    buildResults?: BuildResult[];
    stepsFailed?: any;
    jobsFailed?: any;
    totalAvgStepDuration?: any;
    totalAvgSuccessfulStepDuration?: any;
    totalAvgStepDurationPerStep?: any;
    avgStepDurationPerStepPerJob?: any;

    constructor() {
    }
}