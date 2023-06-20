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
exports.DownloadGHAFilesAndLogs = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const GHAFileSaver_1 = require("./GHAFileSaver");
const GHAHistoryBuilder_1 = require("./GHAHistoryBuilder");
const GITHUB_API_VERSION = 'application/vnd.github.v3+json'; // https://docs.github.com/en/rest/overview/resources-in-the-rest-api
class DownloadGHAFilesAndLogs {
    constructor(repoOwner, repoName, workflowName, token) {
        this.repoName = repoName;
        this.repoOwner = repoOwner;
        this.workflowName = workflowName;
        this.token = token;
    }
    /**
     *
     */
    downloadFiles(save) {
        return __awaiter(this, void 0, void 0, function* () {
            let history = new GHAHistoryBuilder_1.GHAHistoryBuilder();
            try {
                let fileContents = yield this.getAllWorkflows();
                const workflowsJson = JSON.parse(fileContents);
                const amountWorkflows = Object.keys(workflowsJson.workflows).length;
                history.addRepo(this.repoName, workflowsJson);
                for (let i = 0; i < amountWorkflows; i++) {
                    if (workflowsJson.workflows[i] !== undefined) {
                        const RunsOfWorkflow = yield this.getRunsOfWorkflow(workflowsJson.workflows[i]);
                        const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                        history.addWorkflow(workflowsJson.workflows[i].id, RunsOfWorkflowJson);
                        const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;
                        for (let j = 0; j < amountRunsOfWorkflow; j++) {
                            const jobsOfRun = yield this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs[j].id);
                            const jobsOfRunJson = JSON.parse(jobsOfRun);
                            history.addRun(RunsOfWorkflowJson.workflow_runs[j].id, jobsOfRunJson);
                            const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;
                            for (let k = 0; k < amountJobsOfRun; k++) {
                                const logOfJob = yield this.getLogOfJob(jobsOfRunJson.jobs[k].id);
                                history.addJob(jobsOfRunJson.jobs[k].id, logOfJob);
                            }
                        }
                    }
                }
                if (save) {
                    let saver = new GHAFileSaver_1.GHAFileSaver();
                    saver.saveFiles(history);
                }
            }
            catch (err) {
                console.error();
            }
            return history;
        });
    }
    getLogOfJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/jobs/${jobId}/logs`);
            let fileContents = yield fileContentsResponse.text();
            return fileContents;
        });
    }
    getJobsOfRun(runId) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/runs/${runId}/jobs`);
            let fileContents = yield fileContentsResponse.text();
            return fileContents;
        });
    }
    /**
     *
     * @param workflow
     * @private
     */
    getRunsOfWorkflow(workflow) {
        return __awaiter(this, void 0, void 0, function* () {
            let page = 1;
            let fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
            let fileContents = yield fileContentsResponse.text();
            let totalContents = fileContents.slice(0, -2);
            let linkMatch = /<([^>]*?)>; rel="next"/.exec(fileContentsResponse.headers.get('link'));
            while (page < 2 && fileContentsResponse.headers.get('link') !== null && linkMatch && linkMatch.length >= 2 ? linkMatch[1] : undefined) {
                page = page + 1;
                fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
                fileContents = yield fileContentsResponse.text();
                fileContents = fileContents.slice(fileContents.indexOf("[") + 1);
                fileContents = fileContents.slice(0, -2);
                totalContents = totalContents + ",";
                totalContents = totalContents + fileContents;
                linkMatch = /<([^>]*?)>; rel="next"/.exec(fileContentsResponse.headers.get('link'));
            }
            totalContents = totalContents + "]}";
            return totalContents;
        });
    }
    /**
     * This method uses the tryFetch method to get all workflows of a given repository via the github api.
     * Afterwards this method downloads creates a folder in ./res/GHAFilesandLogs with the name of the given repository, if it doesn't already exist.
     * The method returns the content of the downloaded file.
     * @private
     */
    getAllWorkflows() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`);
            let fileContentsJson = yield fileContentsResponse.json();
            let fileContents = JSON.stringify(fileContentsJson);
            if (this.workflowName != null && this.workflowName != "") {
                let indexOfWorkflow = 0;
                for (let i = 0; i < Object.keys(fileContentsJson.workflows).length; i++) {
                    if (fileContentsJson.workflows[i].name == this.workflowName) {
                        indexOfWorkflow = i;
                    }
                }
                fileContents = "{\"workflows\":[" + JSON.stringify(fileContentsJson.workflows[indexOfWorkflow]) + "]}";
            }
            return fileContents;
        });
    }
    /**
     * Downloads a file with a given url of a repository.
     * @param fetchUrl the url to be downloaded
     * @private
     */
    tryFetch(fetchUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchParams = {
                headers: {
                    'Accept': GITHUB_API_VERSION,
                    'Authorization': 'token ' + this.token,
                    'User-Agent': 'request',
                    'charset': 'UTF-8'
                },
            };
            let url = fetchUrl; //`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`;
            let res = new node_fetch_1.Response();
            try {
                res = yield (0, node_fetch_1.default)(url, fetchParams);
            }
            catch (err) {
                console.error(err);
            }
            console.log("request successful: " + url);
            return res;
        });
    }
}
exports.DownloadGHAFilesAndLogs = DownloadGHAFilesAndLogs;
//# sourceMappingURL=DownloadGHAFilesAndLogs.js.map