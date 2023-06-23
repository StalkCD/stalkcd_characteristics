import {GHAHistoryBuilder} from "./GHAHistoryBuilder";
import * as fs from 'fs';

export class GHAFileLoader {

    repoName: string;
    workflowName: string | undefined;

    constructor(repoName: string, workflowName?: string) {

        this.repoName = repoName;
        if(workflowName != undefined && workflowName != "") {
            this.workflowName = workflowName;
        }

    }

    loadFiles(): GHAHistoryBuilder {
        let history = new GHAHistoryBuilder();

        if (!fs.existsSync(`GHAhistorydata/${this.repoName}`)) {
            console.log(__dirname)
            throw new Error('The repo does not exist.');
        }
        if (this.workflowName!= undefined && this.workflowName != "" && !fs.existsSync(`GHAhistorydata/${this.repoName}/${this.workflowName}`)) {
            throw new Error('The workflow does not exist.');
        }

        const workflowFile = fs.readFileSync(`GHAhistorydata/${this.repoName}/${this.repoName}_workflows.json`, 'utf-8');
        let workflowsJson = JSON.parse(workflowFile);

        if(this.workflowName != undefined && this.workflowName != "") {

            workflowsJson = workflowsJson.workflows.find((name: string) => this.workflowName!);
            let workflowTxt: string = "{\"workflows\": [" + JSON.stringify(workflowsJson) + "]}";
            workflowsJson = JSON.parse(workflowTxt);

        }
        history.addRepo(this.repoName, workflowsJson);
        const amountWorkflows = Object.keys(workflowsJson.workflows).length;
        for (let i = 0; i < amountWorkflows; i++) {
            if(workflowsJson.workflows![i] !== undefined) {

                const RunsOfWorkflow = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows![i].name}/${workflowsJson.workflows![i].name}_runs.json`, 'utf-8');
                const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                history.addWorkflow(workflowsJson.workflows![i].id, RunsOfWorkflowJson);
                const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;

                for (let j = 0; j < amountRunsOfWorkflow; j++) {

                    const jobsOfRun = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows![i].name}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}_jobs.json`, 'utf-8');
                    const jobsOfRunJson = JSON.parse(jobsOfRun);
                    history.addRun(RunsOfWorkflowJson.workflow_runs[j].id, jobsOfRunJson);

                    const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;

                    for (let k = 0; k < amountJobsOfRun; k++) {

                        const logOfJob = fs.readFileSync(`./GHAhistorydata/${this.repoName}/${workflowsJson.workflows![i].name}/runid_${RunsOfWorkflowJson.workflow_runs[j].id}/jobid_${jobsOfRunJson.jobs![k].id}/jobid_${jobsOfRunJson.jobs![k].id}_log.json`, 'utf-8');
                        history.addJob(jobsOfRunJson.jobs![k].id, logOfJob);
                    }

                }
            }
        }
        return history;
    }


}