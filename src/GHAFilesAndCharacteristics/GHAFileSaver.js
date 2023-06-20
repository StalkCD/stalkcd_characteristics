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
exports.GHAFileSaver = void 0;
const fs = __importStar(require("fs"));
class GHAFileSaver {
    constructor() {
        this.baseDir = "GHAhistorydata";
        this.targetDir = this.baseDir + "/";
    }
    saveFiles(history) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.createBaseDir();
        this.targetDir = this.baseDir + "/" + ((_a = history.repo) === null || _a === void 0 ? void 0 : _a.name) + "/";
        this.createTargetDir(this.targetDir);
        this.fileWriter(this.targetDir + ((_b = history.repo) === null || _b === void 0 ? void 0 : _b.name) + "_workflows", history.repo.workflowsFile, ".json");
        let amountWorkflowsOfRepo = Object.keys((_c = history.repo) === null || _c === void 0 ? void 0 : _c.workflowsFile.workflows).length;
        for (let i = 0; amountWorkflowsOfRepo > i; i++) {
            if (history.workflows != undefined) {
                this.createTargetDir(this.targetDir + ((_d = history.repo) === null || _d === void 0 ? void 0 : _d.workflowsFile.workflows[i].name));
                let path = ((_e = history.repo) === null || _e === void 0 ? void 0 : _e.workflowsFile.workflows[i].name) + "/";
                this.fileWriter(this.targetDir + path + ((_f = history.repo) === null || _f === void 0 ? void 0 : _f.workflowsFile.workflows[i].name) + "_runs", history.workflows[i].runsFile, ".json");
                this.fileWriter(this.targetDir + path + ((_g = history.repo) === null || _g === void 0 ? void 0 : _g.workflowsFile.workflows[i].name), (_h = history.repo) === null || _h === void 0 ? void 0 : _h.workflowsFile.workflows[i], ".json");
                let amountRunsOfWorkflow = Object.keys(history.workflows[i].runsFile.workflow_runs).length;
                for (let j = 0; j < amountRunsOfWorkflow; j++) {
                    if (history.runs != undefined) {
                        path = ((_j = history.repo) === null || _j === void 0 ? void 0 : _j.workflowsFile.workflows[i].name) + "/";
                        this.createTargetDir(this.targetDir + path + "runid_" + history.workflows[i].runsFile.workflow_runs[j].id);
                        let runId = history.workflows[i].runsFile.workflow_runs[j].id;
                        path = path + "runid_" + history.workflows[i].runsFile.workflow_runs[j].id + "/";
                        let run = (_k = history.runs) === null || _k === void 0 ? void 0 : _k.find(({ id }) => id === runId);
                        this.fileWriter(this.targetDir + path + "runid_" + runId + "_jobs", run.jobsFile, ".json");
                        this.fileWriter(this.targetDir + path + "runid_" + runId, history.workflows[i].runsFile.workflow_runs[j], ".json");
                        let amountJobsOfRun = Object.keys(history.runs[j].jobsFile.jobs).length;
                        for (let l = 0; l < amountJobsOfRun; l++) {
                            if (history.jobs != undefined) {
                                path = ((_l = history.repo) === null || _l === void 0 ? void 0 : _l.workflowsFile.workflows[i].name) + "/" + "runid_" + history.workflows[i].runsFile.workflow_runs[j].id + "/";
                                this.createTargetDir(this.targetDir + path + "jobid_" + history.runs[j].jobsFile.jobs[l].id);
                                let jobID = history.runs[j].jobsFile.jobs[l].id;
                                path = path + "jobid_" + history.runs[j].jobsFile.jobs[l].id + "/";
                                let job = (_m = history.jobs) === null || _m === void 0 ? void 0 : _m.find(({ id }) => id === jobID);
                                this.fileWriter(this.targetDir + path + "jobid_" + jobID + "_log", job.logFile, ".json");
                                this.fileWriter(this.targetDir + path + "jobid_" + jobID, history.runs[j].jobsFile.jobs[l], ".json");
                            }
                        }
                    }
                }
            }
        }
    }
    fileWriter(path, content, ending) {
        let cont = JSON.stringify(content);
        fs.writeFile(path + ending, cont, { encoding: 'utf8' }, err => { });
    }
    createBaseDir() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdir(this.baseDir, 0o777, (err) => {
                if (err) {
                    console.error(`Could not create directory '${this.baseDir}'`, err);
                }
            });
        }
    }
    /**
     * Method creates the target direction, and a subfolder that can get passed optionally.
     * @param folder
     * @private
     */
    createTargetDir(folder) {
        if (!fs.existsSync(folder)) {
            fs.mkdir(folder, 0o777, (err) => {
                if (err) {
                    console.error(`Could not create directory '${folder}'`, err);
                }
            });
        }
    }
}
exports.GHAFileSaver = GHAFileSaver;
