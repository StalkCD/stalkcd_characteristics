"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHAHistoryBuilder = void 0;
class GHAHistoryBuilder {
    addRepo(repoName, fileData) {
        this.repo = { name: repoName, workflowsFile: fileData };
    }
    addWorkflow(id, runsFile) {
        if (this.workflows == undefined) {
            let workflow = { id: id, runsFile: runsFile };
            let workflowArray = [];
            workflowArray.push(workflow);
            this.workflows = workflowArray;
        }
        else {
            let workflow = { id: id, runsFile: runsFile };
            let workflowArray = this.workflows;
            workflowArray.push(workflow);
            this.workflows = workflowArray;
        }
    }
    addRun(id, jobsFile) {
        if (this.runs == undefined) {
            let run = { id: id, jobsFile: jobsFile };
            let runArray = [];
            runArray.push(run);
            this.runs = runArray;
        }
        else {
            let run = { id: id, jobsFile: jobsFile };
            let runArray = this.runs;
            runArray.push(run);
            this.runs = runArray;
        }
    }
    addJob(id, logFile) {
        if (this.jobs == undefined) {
            let job = { id: id, logFile: logFile };
            let jobArray = [];
            jobArray.push(job);
            this.jobs = jobArray;
        }
        else {
            let job = { id: id, logFile: logFile };
            let jobArray = this.jobs;
            jobArray.push(job);
            this.jobs = jobArray;
        }
    }
}
exports.GHAHistoryBuilder = GHAHistoryBuilder;
//# sourceMappingURL=GHAHistoryBuilder.js.map