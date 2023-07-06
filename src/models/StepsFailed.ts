export class StepsFailed {
    name: string;
    count: number;
    belongsTo: string;

    constructor(name: string, count: number, belongsTo: string) {
        this.name = name;
        this.count = count;
        this.belongsTo = belongsTo;
    }
}