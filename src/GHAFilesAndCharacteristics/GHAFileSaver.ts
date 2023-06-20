import {GHAHistoryBuilder} from "./GHAHistoryBuilder";
import * as fs from "fs";

export class GHAFileSaver {

    private baseDir =  "GHAhistorydata";
    private targetDir = this.baseDir + "/";

    saveFiles(history: GHAHistoryBuilder) {

        this.createBaseDir();

        this.targetDir = this.baseDir + "/" + history.repo?.name + "/";
        this.createTargetDir(this.targetDir);
        this.fileWriter(this.targetDir + history.repo?.name + "_workflows", history.repo!.workflowsFile, ".json");
        let amountWorkflowsOfRepo = Object.keys(history.repo?.workflowsFile.workflows).length;

        for(let i = 0; amountWorkflowsOfRepo > i; i++) {

            if (history.workflows != undefined) {
                this.createTargetDir(this.targetDir + history.repo?.workflowsFile.workflows![i].name);
                let path = history.repo?.workflowsFile.workflows![i].name + "/";
                this.fileWriter(this.targetDir + path + history.repo?.workflowsFile.workflows![i].name + "_runs", history.workflows![i].runsFile, ".json");
                this.fileWriter(this.targetDir + path + history.repo?.workflowsFile.workflows![i].name, history.repo?.workflowsFile.workflows![i], ".json");

                let amountRunsOfWorkflow = Object.keys(history.workflows![i].runsFile.workflow_runs).length;

                for (let j = 0; j < amountRunsOfWorkflow; j++) {
                    if(history.runs != undefined) {
                        path = history.repo?.workflowsFile.workflows![i].name + "/";
                        this.createTargetDir(this.targetDir + path + "runid_" + history.workflows![i].runsFile.workflow_runs[j].id);

                        let runId = history.workflows![i].runsFile.workflow_runs[j].id;

                        path = path + "runid_" + history.workflows![i].runsFile.workflow_runs[j].id + "/";
                        let run = history.runs?.find(({id}) => id === runId);
                        this.fileWriter(this.targetDir + path + "runid_" + runId + "_jobs", run!.jobsFile, ".json");
                        this.fileWriter(this.targetDir + path + "runid_" + runId, history.workflows![i].runsFile.workflow_runs[j], ".json")

                        let amountJobsOfRun = Object.keys(history.runs![j].jobsFile.jobs).length;

                        for (let l = 0; l < amountJobsOfRun; l++) {
                            if(history.jobs != undefined) {
                                path = history.repo?.workflowsFile.workflows![i].name + "/" + "runid_" + history.workflows![i].runsFile.workflow_runs[j].id + "/";
                                this.createTargetDir(this.targetDir + path + "jobid_" + history.runs![j].jobsFile.jobs![l].id);
                                let jobID = history.runs![j].jobsFile.jobs![l].id;

                                path = path + "jobid_" + history.runs![j].jobsFile.jobs![l].id + "/";

                                let job = history.jobs?.find(({id}) => id === jobID);
                                this.fileWriter(this.targetDir + path + "jobid_" + jobID + "_log", job!.logFile, ".json");
                                this.fileWriter(this.targetDir + path + "jobid_" + jobID, history.runs![j].jobsFile.jobs![l], ".json");
                            }
                        }

                    }
                }

            }
        }
    }

    fileWriter(path: string, content: string, ending: string) {

        let cont = JSON.stringify(content);
        fs.writeFile(path + ending,  cont, {encoding: 'utf8'}, err => {})
    }
    private createBaseDir() {
        if(!fs.existsSync(this.baseDir)) {
            fs.mkdir(this.baseDir, 0o777, (err: any) => {
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
    createTargetDir(folder: string) {

        if(!fs.existsSync(folder)) {
            fs.mkdir(folder, 0o777, (err: any) => {
                if (err) {
                    console.error(`Could not create directory '${folder}'`, err);
                }
            });
        }
    }

}