import { ArrivalRate } from "./ArrivalRate";
import { BuildResult } from "./BuildResult";
import {StepsFailed} from "./StepsFailed";
import {JobsFailed} from "./JobsFailed";
import {TotalAvgStepDurationPerStep} from "./TotalAvgStepDurationPerStep";
import {AvgStepDurationPerStepPerJob} from "./AvgStepDurationPerStepPerJob";

export class Characteristics {

    avgBuildDuration?: number;
    arrivalRate?: ArrivalRate[];
    buildResults?: BuildResult[];
    stepsFailed?: StepsFailed[];
    jobsFailed?: JobsFailed[];
    totalAvgStepDuration?: number;
    totalAvgSuccessfulStepDuration?: number;
    totalAvgStepDurationPerStep?: TotalAvgStepDurationPerStep[];
    avgStepDurationPerStepPerJob?: AvgStepDurationPerStepPerJob[];

    constructor() {
    }
}