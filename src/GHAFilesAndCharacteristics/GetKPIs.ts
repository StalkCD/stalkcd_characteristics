import * as fs from "fs";
import {Connection} from "../database/Connection";
import {MongoClient} from "mongodb";
import { ArrivalRate } from '../models/ArrivalRate';
import { BuildResult } from '../models/BuildResult';
import { Characteristics } from "../models/Characteristics";
import {JobsFailed} from "../models/JobsFailed";
import {StepsFailed} from "../models/StepsFailed";
import {TotalAvgStepDurationPerStep} from "../models/TotalAvgStepDurationPerStep";
import {AvgStepDurationPerStepPerJob} from "../models/AvgStepDurationPerStepPerJob";

/**
 * Class to aggregate kpis from historical pipeline execution data
 */
export class GetKPIs {

    repoNameForKPIs: string;
    workflowNameForKPIs: string;
    token: string | undefined;

    constructor(repoNameForKPIs: string, workflowNameForKPIs: string) {

        this.repoNameForKPIs = repoNameForKPIs;
        this.workflowNameForKPIs = workflowNameForKPIs;
    }

    /**
     * Method is responsible to call all sub-method for each kpi and return the results in an array in the end.
     * Variable loadFrom decides whether to load the data from MongoDB or from textfiles.
     * @param loadFrom
     */
    async getKPIs(loadFrom: string): Promise<Characteristics> {

        let runsFile: any;
        let runsFileJson: any;
        let jobFilesJson: any[] = [];

        if(loadFrom == 'local') {
            console.log("local");
            console.log(this.repoNameForKPIs);
            console.log(this.workflowNameForKPIs);
            runsFile = await fs.readFileSync(`./GHAhistorydata/${this.repoNameForKPIs}/${this.workflowNameForKPIs}/${this.workflowNameForKPIs}_runs.json`, 'utf-8');

            try {
                runsFileJson = await JSON.parse(runsFile);
                const amountRunsOfWorkflow = Object.keys(runsFileJson.workflow_runs).length;
                for (let i = 0; i < amountRunsOfWorkflow; i++) {
                    let jobFile = await fs.readFileSync(`./GHAhistorydata/${this.repoNameForKPIs}/${this.workflowNameForKPIs}/runid_${runsFileJson.workflow_runs[i].id}/${runsFileJson.workflow_runs[i].id}_jobs.json`, 'utf-8');
                    try {
                        jobFilesJson.push(await JSON.parse(jobFile));
                    } catch (e: any) {
                        console.log(e.message);
                    }
                }
            } catch (e: any) {
                console.log(e.message);
            }

        } else if(loadFrom == 'db') {
            console.log("db");
            this.repoNameForKPIs = this.repoNameForKPIs.toLowerCase();
            let connection: Connection = new Connection();
            let dbs: MongoClient | undefined;
            dbs = await connection.getConnection();
            let db = await dbs.db("GHAhistorydata");
            runsFileJson = await db.collection(this.repoNameForKPIs).findOne({"file" : "workflow_runs", "workflowname" : this.workflowNameForKPIs});
            let cursor = await db.collection(this.repoNameForKPIs).find({"file" : "jobs"});
            for await (const doc of cursor) {
                jobFilesJson.push(doc);
            }
            await dbs.close();
        } else {
            console.error("No valid load type.");
        }

        let kpis = new Characteristics();

        if(runsFileJson !== undefined) {
            let avgBuildDuration = this.getAvgBuildDuration(runsFileJson);
            kpis.avgBuildDuration = avgBuildDuration;
            let arrivalRate = await this.getArrivalRate(runsFileJson);
            kpis.arrivalRate = arrivalRate;
            let buildResults = this.getBuildResults(runsFileJson);
            kpis.buildResults = buildResults;
        } else {
            console.log("No Runs File!");
        }

        if(jobFilesJson.length !== 0) {
            let jobsAndStepsFailed: any[] = this.jobsAndStepsFailed(jobFilesJson);
            kpis.jobsFailed = jobsAndStepsFailed[0];
            kpis.stepsFailed = jobsAndStepsFailed[1];
            let stepDuration: any[] = this.stepDuration(jobFilesJson);
            kpis.totalAvgStepDuration = stepDuration[0];
            kpis.totalAvgSuccessfulStepDuration = stepDuration[1];
            kpis.totalAvgStepDurationPerStep = stepDuration[2];
            kpis.avgStepDurationPerStepPerJob = stepDuration[3];

        } else {
            console.log("No Job Files!");
        }
        console.log(kpis);
        return kpis;
    }

    /**
     * Aggregates the kpis 'jobsFailed' and 'stepsFailed'
     * @param jobFileJson
     * @private
     */
    private jobsAndStepsFailed(jobFileJson: any[]) {
        let listJobsFailed: any[] = [];
        let listJobNames: any[] = [];

        jobFileJson.forEach(jobFile => {

            if(jobFile.jobs !== undefined && jobFile.jobs !== null) {
                const amountJobs = Object.keys(jobFile.jobs).length;
                for (let i = 0; i < amountJobs; i++) {
                    if (!(jobFile.jobs) || jobFile.jobs[i].conclusion == 'failure') {
                        if (jobFile.jobs) {
                            listJobsFailed.push(jobFile.jobs[i]);
                            listJobNames.push(jobFile.jobs[i].name);
                        }
                    }

                }
            }
        })
        let map  = listJobNames.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});
        let unique = listJobNames.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });
        let failedJobs: any[] = [];
        for(let i = 0; i < unique.length; i++) {
            let jobsFailed = new JobsFailed( unique[i], map[unique[i]]);
            failedJobs.push(jobsFailed);
        }

        let failedSteps: any[] = [];
        for(let i = 0; i < unique.length; i++) {
            let stepsFailed: any[] = [];
            let jobName = unique[i];
            listJobsFailed.forEach(job => {
                if(unique[i] == job.name) {
                    const amountSteps = Object.keys(job.steps).length;
                    for (let j = 0; j < amountSteps; j++) {
                        if (!(job.steps) || job.steps[j].conclusion == 'failure') {
                            if (job.steps) {
                                stepsFailed.push(job.steps[j].name);
                            }
                        }
                    }
                }
            })

            let mapSteps  = stepsFailed.reduce(function (prev, cur) {
                prev[cur] = (prev[cur] || 0) + 1;
                return prev;
            }, {});

            let uniqueSteps = stepsFailed.filter(function onlyUnique(value, index, array) {
                return array.indexOf(value) === index;
            });
            for(let k = 0; k < uniqueSteps.length; k++) {
                let stepFailed = new StepsFailed(uniqueSteps[k], mapSteps[uniqueSteps[k]], jobName);
                failedSteps.push(stepFailed);
            }
        }

        let ret: any[] = [];
        ret.push(failedJobs);
        ret.push(failedSteps);
        return ret;

    }

    /**
     * Aggregates the kpis 'totalAvgStepDuration', 'totalAvgSuccessfulStepDuration', 'totalAvgStepDurationPerStep'
     * and 'avgStepDurationPerStepPerJob'
     * @param jobFileJson
     * @private
     */
    private stepDuration(jobFileJson: any[]) {

        let ret: any[] = [];
        let totalAvgStepDuration = 0;
        let totalAvgSuccessfulStepDuration = 0;

        let listJobNames: any[] = [];
        let listJobs: any[] = [];
        let allSteps: any[] = [];
        let allStepsNames: any[] = [];
        let totalDur = 0;
        let totalSuccessfulDur = 0;
        let stepAmount = 0;
        let successfulStepAmount = 0;
        jobFileJson.forEach(jobFile => {

            if(jobFile.jobs !== undefined && jobFile.jobs !== null) {
                const amountJobs = Object.keys(jobFile.jobs).length;
                for (let i = 0; i < amountJobs; i++) {
                    if(jobFile.jobs[i].status == "completed") {
                        if (jobFile.jobs) {
                            listJobNames.push(jobFile.jobs[i].name);
                            listJobs.push(jobFile.jobs[i]);
                        }
                        const amountSteps = Object.keys(jobFile.jobs[i].steps).length;
                        stepAmount = stepAmount + amountSteps;
                        for (let j = 0; j < amountSteps; j++) {
                            allSteps.push(jobFile.jobs[i].steps[j]);
                            allStepsNames.push(jobFile.jobs[i].steps[j].name);
                            let startTime = Date.parse(jobFile.jobs[i].steps[j].started_at);
                            let endTime = Date.parse(jobFile.jobs[i].steps[j].completed_at);
                            let runTime = endTime - startTime;
                            totalDur += runTime;

                            if (jobFile.jobs[i].steps[j].conclusion == 'success') {
                                successfulStepAmount = successfulStepAmount + 1;
                                let successStartTime = Date.parse(jobFile.jobs[i].steps[j].started_at);
                                let successEndTime = Date.parse(jobFile.jobs[i].steps[j].completed_at);
                                let successRunTime = successEndTime - successStartTime;
                                totalSuccessfulDur += successRunTime;
                            }
                        }
                    }
                }
            }
        })
        if(stepAmount !== 0) {
            totalAvgStepDuration = totalDur/stepAmount;
        }
        if(successfulStepAmount !== 0) {
            totalAvgSuccessfulStepDuration = totalSuccessfulDur/successfulStepAmount;
        }
        ret.push(totalAvgStepDuration);
        ret.push(totalAvgSuccessfulStepDuration);

        let uniqueSteps = allStepsNames.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });

        let totalAvgStepDurationPerStep: any[] = [];

        uniqueSteps.forEach(uniqueStep => {
            let totalDurSteps = 0;
            let amountSteps = 0;
            allSteps.forEach(step => {
                if(uniqueStep == step.name && step.status == 'completed') {
                    amountSteps = amountSteps + 1;
                    let startTime = Date.parse(step.started_at);
                    let endTime = Date.parse(step.completed_at);
                    let runTime = endTime - startTime;
                    totalDurSteps += runTime;
                }
            })
            let avgDur = 0;
            if(amountSteps !== 0) {
                avgDur = totalDurSteps/amountSteps;
            }
            let entry = new TotalAvgStepDurationPerStep(uniqueStep, avgDur);
            totalAvgStepDurationPerStep.push(entry);
        })
        ret.push(totalAvgStepDurationPerStep);

        const avgStepDurationPerStepPerJob: AvgStepDurationPerStepPerJob[] = [];

        for (const uniqueJob of [...new Set(listJobNames)]) {
            const stepsOfJob: any[] = [];
            const stepNameMap: { [key: string]: number } = {};
            const stepDurationMap: { [key: string]: number } = {};

            for (const job of listJobs) {
                if (uniqueJob === job.name) {
                    stepsOfJob.push(...job.steps);

                    for (const step of job.steps) {
                        const stepName = step.name;
                        const startTime = Date.parse(step.started_at);
                        const endTime = Date.parse(step.completed_at);
                        const runTime = endTime - startTime;

                        stepNameMap[stepName] = (stepNameMap[stepName] || 0) + 1;
                        stepDurationMap[stepName] = (stepDurationMap[stepName] || 0) + runTime;
                    }
                }
            }

            for (const uniqueStep of Object.keys(stepNameMap)) {
                const amountSteps = stepNameMap[uniqueStep];
                const totalDurSteps = stepDurationMap[uniqueStep];
                const avgDur = amountSteps !== 0 ? totalDurSteps / amountSteps : 0;

                const entry = new AvgStepDurationPerStepPerJob(uniqueStep, avgDur, uniqueJob);
                avgStepDurationPerStepPerJob.push(entry);
            }
        }
        ret.push(avgStepDurationPerStepPerJob);

        return ret;

    }

    /**
     * Aggregates the kpi 'buildResults'
     * @param runsFileJson
     * @private
     */
    private getBuildResults(runsFileJson: any) {

        let results: any[] = [];

        const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;
        for (let i = 0; i < amountWorkflowRuns; i++) {
            results.push(runsFileJson.workflow_runs[i].conclusion);
        }

        let map  = results.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});

        let unique = results.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });

        let resultsArray: BuildResult[] = [];

        for(let i = 0; i < unique.length; i++) {
            let buildResult = new BuildResult( unique[i], map[unique[i]]);
            resultsArray.push(buildResult);
        }

        return resultsArray;
    }

    /**
     * Aggregates the kpi 'avgBuildDuration'
     * @param runsFileJson
     * @private
     */
    private getAvgBuildDuration(runsFileJson: any) {

        let totalDur = 0;
        const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;
        for (let i = 0; i < amountWorkflowRuns; i++) {
            let startTime = Date.parse(runsFileJson.workflow_runs[i].created_at);
            let endTime = Date.parse(runsFileJson.workflow_runs[i].updated_at);
            let runTime = endTime - startTime;

            totalDur += runTime;
        }
        let avgDur = totalDur/amountWorkflowRuns;

        return avgDur;
    }

    /**
     * Aggregates the kpi 'arrivalRate'
     * @param runsFileJson
     * @private
     */
    private async getArrivalRate(runsFileJson: any) {

        let arrivalDates: any[] = []; //arrivalsPerDate

        const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;


        for (let i = 0; i < amountWorkflowRuns &&  i < 200; i++) {
            let arrivalTime = Date.parse(runsFileJson.workflow_runs[i].created_at);
            let arrivalDate = new Date(arrivalTime);
            let month = arrivalDate.getUTCMonth() + 1; //months from 1-12
            let day = arrivalDate.getUTCDate();
            let year = arrivalDate.getUTCFullYear();
            let arrivalString = year + "/" + month + "/" + day

            arrivalDates.push(arrivalString);

        }

        let map  = arrivalDates.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});


        let unique = arrivalDates.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });

        let arrivalsArray: ArrivalRate[] = []

        for(let i = 0; i < unique.length; i++) {
            let arrival = new ArrivalRate( unique[i], map[unique[i]]);
            arrivalsArray.push(arrival);
        }

        return arrivalsArray;
    }
}