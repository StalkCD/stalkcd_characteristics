import { ArrivalRate } from "./ArrivalRate";
import { BuildResult } from "./BuildResult";

export class Characteristics {

    avgBuildDuration?: number;
    arrivalRate?: ArrivalRate[];
    buildResults?: BuildResult[];


    constructor() {
    }
}