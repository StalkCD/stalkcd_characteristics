import * as fs from "fs";
import {Connection} from "../database/Connection";
import {MongoClient} from "mongodb";
import { ArrivalRate } from '../models/ArrivalRate';
import { BuildResult } from '../models/BuildResult';
import { Characteristics } from "../models/Characteristics";
import {JobsFailed} from "../models/JobsFailed";
import {StepsFailed} from "../models/StepsFailed";


export class GetKPIs {

    repoNameForKPIs: string;
    workflowNameForKPIs: string;
    repoOwnerForKPIs: string | undefined;
    token: string | undefined;

    constructor(repoNameForKPIs: string, workflowNameForKPIs: string, repoOwnerForKPIs?: string, token?: string) {

        this.repoNameForKPIs = repoNameForKPIs;
        this.workflowNameForKPIs = workflowNameForKPIs;
        if(repoOwnerForKPIs != undefined && repoOwnerForKPIs != "") {
            this.repoOwnerForKPIs = repoOwnerForKPIs;
        }
        if(token != undefined && token != "") {
            this.token = token;
        }
    }

    async getKPIs(loadFrom: string): Promise<Characteristics> {

        /*
        if (this.load != 'local' && this.load != 'download') {
            throw new Error('No valid load type.');
        }
        this.load = "";
        let history = new GHAHistoryBuilder();
        if(this.load == 'local') {
            let loader: GHAFileLoader = new GHAFileLoader(this.repoNameForKPIs, this.workflowNameForKPIs);
            history = loader.loadFiles();
        }
        if(this.load == 'download') {
            if(this.repoOwnerForKPIs == undefined || this.repoOwnerForKPIs == "") {
                throw new Error('No repo owner available for download.');
            }
            if(this.token == undefined || this.token == "") {
                throw new Error('No token available for download.');
            }
            let loader: DownloadGHAFilesAndLogs = new DownloadGHAFilesAndLogs(this.repoOwnerForKPIs, this.repoNameForKPIs, this.workflowNameForKPIs, this.token!);
            history = await loader.downloadFiles(save, saveType);
        }

         */
        let runsFile: any;
        let runsFileJson: any;
        let workflowJson: any;
        let jobFilesJson: any[] = [];

        if(loadFrom == 'local') {
            console.log("local");
            runsFile = await fs.readFileSync(`./GHAhistorydata/${this.repoNameForKPIs}/${this.workflowNameForKPIs}/${this.workflowNameForKPIs}_runs.json`, 'utf-8');
            runsFileJson = await JSON.parse(runsFile);
            const amountRunsOfWorkflow = Object.keys(runsFileJson.workflow_runs).length;
            for(let i = 0; i < amountRunsOfWorkflow; i++) {
                let jobFile = await fs.readFileSync(`./GHAhistorydata/${this.repoNameForKPIs}/${this.workflowNameForKPIs}/runid_${runsFileJson.workflow_runs[i].id}/${runsFileJson.workflow_runs[i].id}_jobs.json`, 'utf-8');
                jobFilesJson.push(await JSON.parse(jobFile));
            }

        } else if(loadFrom == 'db') {
            console.log("db");
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
            //console.log(jobFilesJson[0]);
            let jobsAndStepsFailed: any[] = this.jobsAndStepsFailed(jobFilesJson);
            kpis.jobsFailed = jobsAndStepsFailed[0];
            kpis.stepsFailed = jobsAndStepsFailed[1];

        } else {
            console.log("No Job Files!");
        }
        console.log(kpis);
        return kpis;
    }

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
        //console.log(map);
        let unique = listJobNames.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });
        //console.log(unique);
        let failedJobs: any[] = [];
        for(let i = 0; i < unique.length; i++) {
            let jobsFailed = new JobsFailed( unique[i], map[unique[i]]);
            failedJobs.push(jobsFailed);
        }
        //console.log(listJobsFailed);

        console.log(unique.length);
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
            console.log(stepsFailed);
            console.log(stepsFailed.length);
            let mapSteps  = stepsFailed.reduce(function (prev, cur) {
                prev[cur] = (prev[cur] || 0) + 1;
                return prev;
            }, {});
            console.log(mapSteps);
            //console.log(map);
            let uniqueSteps = stepsFailed.filter(function onlyUnique(value, index, array) {
                return array.indexOf(value) === index;
            });
            console.log(uniqueSteps);
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

    private avgStepDuration(jobFileJson: any) {

    }

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