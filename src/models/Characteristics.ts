import { ArrivalRate } from "./ArrivalRate";
import { BuildResult } from "./BuildResult";

export class Characteristics {
    avgBuildDuration: number;
    arrivalRate: ArrivalRate[];
    buildResults: BuildResult[];
    
    constructor(avgBuildDuration: number, arrivalRate: ArrivalRate[], buildResults: BuildResult[]) {
        this.avgBuildDuration = avgBuildDuration;
        this.arrivalRate = arrivalRate;
        this.buildResults = buildResults;
    }
}