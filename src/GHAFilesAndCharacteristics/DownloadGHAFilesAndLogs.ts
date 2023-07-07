import fetch, {RequestInit, Response} from "node-fetch";
import {GHAFileSaver} from "./GHAFileSaver";
import {GHAHistoryBuilder} from "./GHAHistoryBuilder";
import {Connection} from "../database/Connection";
import {MongoClient} from "mongodb";
// import {saveAs} from 'file-saver';

const GITHUB_API_VERSION = 'application/vnd.github.v3+json'; // https://docs.github.com/en/rest/overview/resources-in-the-rest-api

export class DownloadGHAFilesAndLogs {

    repoName: string;
    repoOwner: string;
    workflowName: string;
    token: string;
    rerunLimit: number = 0;

    constructor(repoOwner: string, repoName: string, workflowName: string, token: string) {

        this.repoName = repoName;
        this.repoOwner = repoOwner;
        this.workflowName = workflowName;
        this.token = token;
    }

    /**
     *
     */
    async downloadFiles(saveType: string, depth: number, pages: number) {

        if(saveType == 'db') {
            await this.downloadToMongoDB(depth, pages);

        } else {

            if(depth >= 1) {
                let history: GHAHistoryBuilder = new GHAHistoryBuilder();
                let saver: GHAFileSaver = new GHAFileSaver("GHAhistorydata");
                let path: string = "";
                await saver.createTargetDir("GHAhistorydata");
                await saver.createTargetDir("GHAhistorydata/" + this.repoName);
                path = "GHAhistorydata/" + this.repoName + "/";

                try {

                    let fileContents = await this.getAllWorkflows();
                    let workflowsJson: any = JSON.parse(fileContents);

                    saver.fileWriter(path + this.repoName + "_workflows", fileContents, ".json");

                    let reducedfileContents: any = this.reduceWorkflows(fileContents);
                    let reducedWorkflowsJson: any = JSON.parse(reducedfileContents);
                    const amountWorkflows = Object.keys(reducedWorkflowsJson.workflows).length;
                    //history.addRepo(this.repoName, workflowsJson);

                    for (let i = 0; i < amountWorkflows; i++) {
                        if (!(reducedWorkflowsJson.workflows) || reducedWorkflowsJson.workflows[i] !== undefined) {

                            saver.createTargetDir(path + reducedWorkflowsJson.workflows![i].name);
                            path = "GHAhistorydata/" + this.repoName + "/" + reducedWorkflowsJson.workflows![i].name + "/";
                            saver.fileWriter(path + reducedWorkflowsJson.workflows![i].name, reducedWorkflowsJson, ".json");

                            if(depth >= 2) {
                                const RunsOfWorkflow = await this.getRunsOfWorkflow(reducedWorkflowsJson.workflows![i], pages);
                                const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                                //history.addWorkflow(workflowsJson.workflows![i].id, RunsOfWorkflowJson);

                                if (reducedWorkflowsJson.workflows) {
                                    saver.fileWriter(path + reducedWorkflowsJson.workflows[i].name + "_runs", RunsOfWorkflowJson, ".json");
                                }
                                if(depth >= 3) {
                                    const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;

                                    for (let j = 0; j < amountRunsOfWorkflow; j++) {

                                    path = "GHAhistorydata/" + this.repoName + "/" + reducedWorkflowsJson.workflows![i].name + "/";
                                    saver.createTargetDir(path + "runid_" + RunsOfWorkflowJson.workflow_runs![j].id);
                                    path = path + "runid_" + RunsOfWorkflowJson.workflow_runs![j].id + "/";

                                    saver.fileWriter(path + "runid_" + RunsOfWorkflowJson.workflow_runs![j].id, RunsOfWorkflowJson.workflow_runs![j], ".json");

                                        const jobsOfRun = await this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs[j].id);
                                        const jobsOfRunJson = JSON.parse(jobsOfRun);
                                        //history.addRun(RunsOfWorkflowJson.workflow_runs[j].id, jobsOfRunJson);

                                        saver.fileWriter(path + RunsOfWorkflowJson.workflow_runs![j].id + "_jobs", jobsOfRunJson, ".json")

                                        if(depth >= 4) {

                                        // Tried to download Logs of Run https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2022-11-28#download-workflow-run-logs
                                        //try {
                                        //    const logOfRun = await this.getLogOfRun(RunsOfWorkflowJson.workflow_runs[j].id);
                                        //} catch (err: any) {
                                        //    console.log(err.message);
                                        //}
                                        const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;

                                        for (let k = 0; k < amountJobsOfRun; k++) {
                                            path = "GHAhistorydata/" + this.repoName + "/" + reducedWorkflowsJson.workflows![i].name + "/" + "runid_" + RunsOfWorkflowJson.workflow_runs![j].id + "/";
                                            saver.createTargetDir(path + "jobid_" + jobsOfRunJson.jobs![k].id);
                                            path = path + "jobid_" + jobsOfRunJson.jobs![k].id + "/";
                                            saver.fileWriter(path + "jobid_" + jobsOfRunJson.jobs![k].id, jobsOfRunJson.jobs![k], ".json");


                                                const logOfJob = await this.getLogOfJob(jobsOfRunJson.jobs![k].id);
                                                saver.textFileWriter(path + "jobid_" + jobsOfRunJson.jobs![k].id + "_log", logOfJob, ".txt");
                                                //history.addJob(jobsOfRunJson.jobs![k].id, logOfJob)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                } catch (err: any) {
                    console.error();
                }
            } else {
                console.log("No valid depth");
            }
            //return history;
        }
        return null;
    }

     private async downloadToMongoDB(depth: number, pages: number) {

        if(depth >= 1) {
            let connection: Connection = new Connection();
            let dbs: MongoClient;
            dbs = await connection.getConnection();
            let db = await dbs.db("GHAhistorydata");
            let coll: any[] = await db.listCollections().toArray();
            let collExists: boolean = false;

            coll.forEach(coll => {
                if (coll.name == this.repoName) {
                    collExists = true;
                    console.log("exists");
                    db.dropCollection(this.repoName);
                }
            })
            if (!collExists) {
                await db.createCollection(this.repoName);
            }

            let fileContents = await this.getAllWorkflows();
            let workflowsJson: any = JSON.parse(fileContents);
            workflowsJson["file"] = "workflows";
            await db.collection(this.repoName).insertOne(workflowsJson);

            if(depth >= 2) {
                let reducedfileContents: any = this.reduceWorkflows(fileContents);
                let reducedWorkflowsJson: any = JSON.parse(reducedfileContents);
                const amountWorkflows = Object.keys(reducedWorkflowsJson.workflows).length;

                for (let i = 0; i < amountWorkflows; i++) {
                    const RunsOfWorkflow = await this.getRunsOfWorkflow(reducedWorkflowsJson.workflows![i], pages);
                    const RunsOfWorkflowJson = await JSON.parse(RunsOfWorkflow);
                    RunsOfWorkflowJson["workflowid"] = reducedWorkflowsJson.workflows![i].id;
                    RunsOfWorkflowJson["workflowname"] = reducedWorkflowsJson.workflows![i].name;
                    RunsOfWorkflowJson["file"] = "workflow_runs";
                    await db.collection(this.repoName).insertOne(RunsOfWorkflowJson);

                    if(depth >= 3) {
                        const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;

                        for (let j = 0; j < amountRunsOfWorkflow; j++) {

                            const jobsOfRun = await this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs[j].id);
                            const jobsOfRunJson = JSON.parse(jobsOfRun);
                            jobsOfRunJson["runid"] = RunsOfWorkflowJson.workflow_runs[j].id;
                            jobsOfRunJson["file"] = "jobs";

                            await db.collection(this.repoName).insertOne(jobsOfRunJson);

                            if(depth >= 4) {
                                const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;

                                for (let k = 0; k < amountJobsOfRun; k++) {

                                    const logOfJob = await this.getLogOfJob(jobsOfRunJson.jobs![k].id);

                                    await db.collection(this.repoName).insertOne({
                                        "file": "log",
                                        "jobid": jobsOfRunJson.jobs![k].id,
                                        content: logOfJob
                                    });
                                }
                            }
                        }
                    }
                }
            }
            await dbs.close(true);
        }
    }

    private reduceWorkflows(fileContents: any): any {

        let indexOfWorkflow = 0;
        let fileContentsJson = JSON.parse(fileContents);
        for (let i = 0; i < Object.keys(fileContentsJson.workflows).length; i++) {
            if (fileContentsJson.workflows![i].name == this.workflowName) {
                indexOfWorkflow = i;
            }
        }
        fileContents = "{\"workflows\":[" + JSON.stringify(fileContentsJson.workflows![indexOfWorkflow]) + "]}";
        return fileContents;
    }

    private async getLogOfJob(jobId: any): Promise<any> {
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/jobs/${jobId}/logs`);
        let fileContents = await fileContentsResponse.text();
        return fileContents;
    }

    private async getLogOfRun(runId: any): Promise<any> {
        let fetchUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/runs/${runId}/logs`;
        console.log("Debug fetchUrl: " + fetchUrl)
        let fileContentsResponse = await this.tryFetchZip(fetchUrl);
        let fileContents = await fileContentsResponse.blob();
        return fileContents;
    }

    private async getJobsOfRun(runId: any): Promise<any> {
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/runs/${runId}/jobs`);
        let fileContents = await fileContentsResponse.text();
        return fileContents;
    }

    /**
     *
     * @param workflow
     * @private
     */
    private async getRunsOfWorkflow(workflow: any, pages: number): Promise<any> {
        let page: number = 1;
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
        let fileContents = await fileContentsResponse.text();
        let totalContents: any = fileContents.slice(0, -2);
        let linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        while (page < pages && fileContentsResponse.headers.get('link') !== null && linkMatch && linkMatch.length >= 2 ? linkMatch[1] : undefined) {
            page = page + 1;
            fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
            fileContents = await fileContentsResponse.text();
            fileContents = fileContents.slice(fileContents.indexOf("[") + 1);
            fileContents = fileContents.slice(0, -2);
            totalContents = totalContents + ",";
            totalContents = totalContents + fileContents;
            linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        }
        totalContents = totalContents + "]}"
        return totalContents;
    }


    /**
     * This method uses the tryFetch method to get all workflows of a given repository via the github api.
     * Afterwards this method downloads creates a folder in GHAhistorydata with the name of the given repository, if it doesn't already exist.
     * The method returns the content of the downloaded file.
     * @private
     */
    private async getAllWorkflows(): Promise<any> {
        const fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`);
        let fileContentsJson: any = await fileContentsResponse.json();
        let fileContents = JSON.stringify(fileContentsJson);

        return fileContents;
    }

    /**
     * Downloads a file with a given url of a repository.
     * @param fetchUrl the url to be downloaded
     * @private
     */
    async tryFetch(fetchUrl: string): Promise<Response> {
        let fetchParams: RequestInit = {
            headers: {
                'Accept': GITHUB_API_VERSION,
                'Authorization': 'token ' + this.token,
                'User-Agent': 'request',
                'charset': 'UTF-8'
            },
        };
        let url: string = fetchUrl;//`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`;
        let res: Response = new Response();

        try {
            res = await fetch(url, fetchParams);
        } catch (err) {
            console.error(err);

        }
        if (res.url == null || res.url == "" && this.rerunLimit < 10) {
            console.log("rerun " + this.rerunLimit)
            this.rerunLimit = this.rerunLimit + 1;
            this.tryFetch(fetchUrl);
        }

        this.rerunLimit = 0;
        console.log("request successful: " + url)
        return res;
    }

    async tryFetchZip(fetchUrl: string): Promise<Response> {
        let fetchParams: RequestInit = {
            headers: {
                'Authorization': 'token ' + this.token,
                'Accept': GITHUB_API_VERSION,
            },
        };
        let url: string = fetchUrl;//`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`;
        let res: Response = new Response();

        try {
            res = await fetch(url, fetchParams);
        } catch (err) {
            console.error(err);

        }
        if (res.url == null || res.url == "" && this.rerunLimit < 10) {
            console.log("rerun " + this.rerunLimit)
            this.rerunLimit = this.rerunLimit + 1;
            this.tryFetch(fetchUrl);
        }

        this.rerunLimit = 0;
        console.log("request successful: " + url)
        return res;
    }
}