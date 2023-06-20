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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAFileLoader = void 0;
const GHAHistoryBuilder_1 = require("./GHAHistoryBuilder");
const fs = __importStar(require("fs"));
class GHAFileLoader {
    constructor(repoName, workflowName) {
        this.repoName = repoName;
        if (workflowName != undefined && workflowName != "") {
            this.workflowName = workflowName;
        }
    }
    loadFiles() {
        let history = new GHAHistoryBuilder_1.GHAHistoryBuilder();
        if (!fs.existsSync(`./res/GHAFilesandLogs/${this.repoName}`)) {
            throw new Error('The repo does not exist.');
        }
        if (this.workflowName != undefined && this.workflowName != "" && !fs.existsSync(`./GHAhistorydata/${this.repoName}/${this.workflowName}`)) {
            throw new Error('The workflow does not exist.');
        }
        const workflowFile = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${this.repoName}_workflows.json`, 'utf-8');
        let workflowsJson = JSON.parse(workflowFile);
        if (this.workflowName != undefined && this.workflowName != "") {
            workflowsJson = workflowsJson.workflows.find((name) => this.workflowName);
            let workflowTxt = "{\"workflows\": [" + JSON.stringify(workflowsJson) + "]}";
            workflowsJson = JSON.parse(workflowTxt);
        }
        history.addRepo(this.repoName, workflowsJson);
        const amountWorkflows = Object.keys(workflowsJson.workflows).length;
        for (let i = 0; i < amountWorkflows; i++) {
            if (workflowsJson.workflows[i] !== undefined) {
                const RunsOfWorkflow = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows[i].name}/${workflowsJson.workflows[i].name}_runs.json`, 'utf-8');
                const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                history.addWorkflow(workflowsJson.workflows[i].id, RunsOfWorkflowJson);
                const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;
                for (let j = 0; j < amountRunsOfWorkflow; j++) {
                    const jobsOfRun = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows[i].name}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}_jobs.json`, 'utf-8');
                    const jobsOfRunJson = JSON.parse(jobsOfRun);
                    history.addRun(RunsOfWorkflowJson.workflow_runs[j].id, jobsOfRunJson);
                    const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;
                    for (let k = 0; k < amountJobsOfRun; k++) {
                        const logOfJob = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows[i].name}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}/jobid_${jobsOfRunJson.jobs[k].id}/jobid_${jobsOfRunJson.jobs[k].id}_log.json`, 'utf-8');
                        history.addJob(jobsOfRunJson.jobs[k].id, logOfJob);
                    }
                }
            }
        }
        return history;
    }
}
exports.GHAFileLoader = GHAFileLoader;
//# sourceMappingURL=GHAFileLoader.js.map