
export class AvgStepDurationPerStepPerJob {
    step: string;
    avgDur: number;
    belongsTo: string;

    constructor(step: string, avgDur: number, belongsTo: string) {
        this.step = step;
        this.avgDur = avgDur;
        this.belongsTo = belongsTo;
    }
}