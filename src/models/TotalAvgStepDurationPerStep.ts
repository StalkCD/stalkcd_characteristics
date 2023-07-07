export class TotalAvgStepDurationPerStep {
    step: string;
    avgDur: number;

    constructor(step: string, avgDur: number) {
        this.step = step;
        this.avgDur = avgDur;
    }
}