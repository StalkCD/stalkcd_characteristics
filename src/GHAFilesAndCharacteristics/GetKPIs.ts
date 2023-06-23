import * as fs from 'fs';
import { Kpis } from '../DTOs/kpis';
import {GHAHistoryBuilder} from "./GHAHistoryBuilder";
import {GHAFileLoader} from "./GHAFileLoader";
import {DownloadGHAFilesAndLogs} from "./DownloadGHAFilesAndLogs";

export class GetKPIs {

    repoNameForKPIs: string;
    workflowNameForKPIs: string;
    load: string;
    repoOwnerForKPIs: string | undefined;
    token: string | undefined;

    constructor(repoNameForKPIs: string, workflowNameForKPIs: string, load: string, repoOwnerForKPIs?: string, token?: string) {

        this.repoNameForKPIs = repoNameForKPIs;
        this.workflowNameForKPIs = workflowNameForKPIs;
        this.load = load;
        if(repoOwnerForKPIs != undefined && repoOwnerForKPIs != "") {
            this.repoOwnerForKPIs = repoOwnerForKPIs;
        }
        if(token != undefined && token != "") {
            this.token = token;
        }
    }

    async getKPIs(save: boolean): Promise<Kpis> {

        if (this.load != 'local' && this.load != 'download') {
            throw new Error('No valid load type.');
        }
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
            let loader: DownloadGHAFilesAndLogs = new DownloadGHAFilesAndLogs(this.repoOwnerForKPIs!, this.repoNameForKPIs, this.workflowNameForKPIs, this.token!);
            history = await loader.downloadFiles(save);
        }
        const runsFileJson = history.workflows![0].runsFile;

        let avgBuildDuration = this.getAvgBuildDuration(runsFileJson);
        let arrivalRate = await this.getArrivalRate(runsFileJson);
        let buildResults = this.getBuildResults(runsFileJson);

        let kpis: Kpis = {avgBuildDuration, arrivalRate, buildResults};

        console.log(kpis);
        return kpis;
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

        let resultsArray: any[][] = [];

        for(let i = 0; i < unique.length; i++) {
            let arrival: any[] = [];
            arrival.push(unique[i]);
            arrival.push(map[unique[i]]);
            resultsArray.push(arrival);
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

        let arrivalsArray: any[][] = []

        for(let i = 0; i < unique.length; i++) {
            let arrival: any[] = [];
            arrival.push(unique[i]);
            arrival.push(map[unique[i]]);
            arrivalsArray.push(arrival);
        }

        /*
        for(let j = 0; j < arrivalsArray.length; j++) {
            console.log(arrivalsArray[j][0]);
            console.log(arrivalsArray[j][1]);
        }
        */
        return arrivalsArray;

    }

}