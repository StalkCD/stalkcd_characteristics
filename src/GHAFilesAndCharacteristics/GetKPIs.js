"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKPIs = void 0;
const fs = __importStar(require("fs"));
const GHAHistoryBuilder_1 = require("./GHAHistoryBuilder");
const GHAFileLoader_1 = require("./GHAFileLoader");
const DownloadGHAFilesAndLogs_1 = require("./DownloadGHAFilesAndLogs");
class GetKPIs {
    constructor(repoNameForKPIs, workflowNameForKPIs, load, repoOwnerForKPIs, token) {
        this.repoNameForKPIs = repoNameForKPIs;
        this.workflowNameForKPIs = workflowNameForKPIs;
        this.load = load;
        if (repoOwnerForKPIs != undefined && repoOwnerForKPIs != "") {
            this.repoOwnerForKPIs = repoOwnerForKPIs;
        }
        if (token != undefined && token != "") {
            this.token = token;
        }
    }
    getKPIs(save) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync(`./res/GHAFilesandLogs/${this.repoNameForKPIs}`)) {
                throw new Error('The repo does not exist.');
            }
            if (!fs.existsSync(`./res/GHAFilesandLogs/${this.repoNameForKPIs}/${this.workflowNameForKPIs}`)) {
                throw new Error('The workflow does not exist.');
            }
            if (this.load != 'local' && this.load != 'download') {
                throw new Error('No valid load type.');
            }
            let history = new GHAHistoryBuilder_1.GHAHistoryBuilder();
            if (this.load == 'local') {
                let loader = new GHAFileLoader_1.GHAFileLoader(this.repoNameForKPIs, this.workflowNameForKPIs);
                history = loader.loadFiles();
            }
            if (this.load == 'download') {
                if (this.repoOwnerForKPIs == undefined || this.repoOwnerForKPIs == "") {
                    throw new Error('No repo owner available for download.');
                }
                if (this.token == undefined || this.token == "") {
                    throw new Error('No token available for download.');
                }
                let loader = new DownloadGHAFilesAndLogs_1.DownloadGHAFilesAndLogs(this.repoOwnerForKPIs, this.repoNameForKPIs, this.workflowNameForKPIs, this.token);
                history = yield loader.downloadFiles(save);
            }
            const runsFileJson = history.workflows[0].runsFile;
            let avgBuildDuration = this.getAvgBuildDuration(runsFileJson);
            let arrivalRate = yield this.getArrivalRate(runsFileJson);
            let buildResults = this.getBuildResults(runsFileJson);
            let kpis = { avgBuildDuration, arrivalRate, buildResults };
            console.log(kpis);
            return kpis;
        });
    }
    getBuildResults(runsFileJson) {
        let results = [];
        const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;
        for (let i = 0; i < amountWorkflowRuns; i++) {
            results.push(runsFileJson.workflow_runs[i].conclusion);
        }
        let map = results.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});
        let unique = results.filter(function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        });
        let resultsArray = [];
        for (let i = 0; i < unique.length; i++) {
            let arrival = [];
            arrival.push(unique[i]);
            arrival.push(map[unique[i]]);
            resultsArray.push(arrival);
        }
        return resultsArray;
    }
    getAvgBuildDuration(runsFileJson) {
        let totalDur = 0;
        const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;
        for (let i = 0; i < amountWorkflowRuns; i++) {
            let startTime = Date.parse(runsFileJson.workflow_runs[i].created_at);
            let endTime = Date.parse(runsFileJson.workflow_runs[i].updated_at);
            let runTime = endTime - startTime;
            totalDur += runTime;
        }
        let avgDur = totalDur / amountWorkflowRuns;
        return avgDur;
    }
    getArrivalRate(runsFileJson) {
        return __awaiter(this, void 0, void 0, function* () {
            let arrivalDates = []; //arrivalsPerDate
            const amountWorkflowRuns = Object.keys(runsFileJson.workflow_runs).length;
            for (let i = 0; i < amountWorkflowRuns && i < 200; i++) {
                let arrivalTime = Date.parse(runsFileJson.workflow_runs[i].created_at);
                let arrivalDate = new Date(arrivalTime);
                let month = arrivalDate.getUTCMonth() + 1; //months from 1-12
                let day = arrivalDate.getUTCDate();
                let year = arrivalDate.getUTCFullYear();
                let arrivalString = year + "/" + month + "/" + day;
                arrivalDates.push(arrivalString);
            }
            let map = arrivalDates.reduce(function (prev, cur) {
                prev[cur] = (prev[cur] || 0) + 1;
                return prev;
            }, {});
            let unique = arrivalDates.filter(function onlyUnique(value, index, array) {
                return array.indexOf(value) === index;
            });
            let arrivalsArray = [];
            for (let i = 0; i < unique.length; i++) {
                let arrival = [];
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
        });
    }
}
exports.GetKPIs = GetKPIs;
