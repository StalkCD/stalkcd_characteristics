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
        console.log(depth);
        if (saveType === 'db') {
            await this.downloadToMongoDB(depth, pages);
        } else {
            if (depth >= 1) {
                const history: GHAHistoryBuilder = new GHAHistoryBuilder();
                const saver: GHAFileSaver = new GHAFileSaver("GHAhistorydata");
                await saver.createTargetDir("GHAhistorydata");
                await saver.createTargetDir(`GHAhistorydata/${this.repoName}`);

                try {
                    const fileContents = await this.getAllWorkflows();
                    let workflowsJson: any = JSON.parse(fileContents);
                    saver.fileWriter(`GHAhistorydata/${this.repoName}/${this.repoName}_workflows`, fileContents, ".json");

                    if (this.workflowName !== 'noValue' && this.workflowName !== "") {
                        const reducedFileContents = this.reduceWorkflows(fileContents);
                        workflowsJson = JSON.parse(reducedFileContents);
                    }

                    await Promise.all(workflowsJson.workflows.map(async (workflow: any) => {
                        if (!workflow) return;

                        const workflowName = workflow.name;
                        const workflowPath = `GHAhistorydata/${this.repoName}/${workflowName}`;
                        await saver.createTargetDir(workflowPath);
                        saver.fileWriter(`${workflowPath}/${workflowName}`, workflow, ".json");

                        if (depth >= 2) {
                            const runsOfWorkflow = await this.getRunsOfWorkflow(workflow, pages);
                            const runsOfWorkflowJson: any = JSON.parse(runsOfWorkflow);
                            saver.fileWriter(`${workflowPath}/${workflowName}_runs`, runsOfWorkflowJson, ".json");

                            if (depth >= 3) {
                                await Promise.all(runsOfWorkflowJson.workflow_runs.map(async (run: any) => {
                                    const runId = run.id;
                                    const runPath = `${workflowPath}/runid_${runId}`;
                                    await saver.createTargetDir(runPath);
                                    saver.fileWriter(`${runPath}/runid_${runId}`, run, ".json");

                                    const jobsOfRun = await this.getJobsOfRun(runId);
                                    const jobsOfRunJson: any = JSON.parse(jobsOfRun);
                                    saver.fileWriter(`${runPath}/${runId}_jobs`, jobsOfRunJson, ".json");

                                    if (depth >= 4) {
                                        await Promise.all(jobsOfRunJson.jobs.map(async (job: any) => {
                                            const jobId = job.id;
                                            const jobPath = `${runPath}/jobid_${jobId}`;
                                            await saver.createTargetDir(jobPath);
                                            saver.fileWriter(`${jobPath}/jobid_${jobId}`, job, ".json");

                                            const logOfJob = await this.getLogOfJob(jobId);
                                            saver.textFileWriter(`${jobPath}/jobid_${jobId}_log`, logOfJob, ".txt");
                                        }));
                                    }
                                }));
                            }
                        }
                    }));
                } catch (err: any) {
                    console.error(err.message);
                }
            } else {
                console.log("No valid depth");
            }
        }
    }

    private async downloadToMongoDB(depth: number, pages: number) {
        let dbs: MongoClient | undefined;
        try {
            if (depth >= 1) {
                const connection: Connection = new Connection();
                dbs = await connection.getConnection();
                const db = dbs.db("GHAhistorydata");

                const coll: any[] = await db.listCollections().toArray();
                let collExists: boolean = false;

                this.repoName = this.repoName.toLowerCase();
                for (const collection of coll) {
                    if (collection.name === this.repoName) {
                        collExists = true;
                        console.log("exists");
                        await db.dropCollection(this.repoName);
                        break;
                    }
                }

                if (!collExists) {
                    await db.createCollection(this.repoName);
                }

                let fileContents = await this.getAllWorkflows();
                let workflowsJson: any = JSON.parse(fileContents);
                workflowsJson.file = "workflows";
                workflowsJson.downloaddate = new Date(Date.now());
                await db.collection(this.repoName).insertOne(workflowsJson);

                if (depth >= 2) {
                    if (this.workflowName !== 'noValue') {
                        let reducedFileContents: any = this.reduceWorkflows(fileContents);
                        workflowsJson = JSON.parse(reducedFileContents);
                    }

                    const amountWorkflows = workflowsJson.workflows?.length || 0;

                    for (let i = 0; i < amountWorkflows; i++) {
                        const RunsOfWorkflow = await this.getRunsOfWorkflow(workflowsJson.workflows?.[i], pages);
                        const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                        RunsOfWorkflowJson.workflowid = workflowsJson.workflows?.[i]?.id;
                        RunsOfWorkflowJson.workflowname = workflowsJson.workflows?.[i]?.name;
                        RunsOfWorkflowJson.file = "workflow_runs";
                        RunsOfWorkflowJson.downloaddate = new Date(Date.now());
                        await db.collection(this.repoName).insertOne(RunsOfWorkflowJson);

                        if (depth >= 3) {
                            const amountRunsOfWorkflow = RunsOfWorkflowJson.workflow_runs?.length || 0;

                            for (let j = 0; j < amountRunsOfWorkflow; j++) {
                                const jobsOfRun = await this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs?.[j]?.id);
                                const jobsOfRunJson = JSON.parse(jobsOfRun);
                                jobsOfRunJson.runid = RunsOfWorkflowJson.workflow_runs?.[j]?.id;
                                jobsOfRunJson.file = "jobs";
                                jobsOfRunJson.downloaddate = new Date(Date.now());
                                await db.collection(this.repoName).insertOne(jobsOfRunJson);

                                if (depth >= 4) {
                                    const amountJobsOfRun = jobsOfRunJson.jobs?.length || 0;

                                    for (let k = 0; k < amountJobsOfRun; k++) {
                                        const logOfJob = await this.getLogOfJob(jobsOfRunJson.jobs?.[k]?.id);
                                        await db.collection(this.repoName).insertOne({
                                            file: "log",
                                            jobid: jobsOfRunJson.jobs?.[k]?.id,
                                            downloaddate: new Date(Date.now()),
                                            content: logOfJob
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error occurred during MongoDB operations:", error);
        } finally {
            if (dbs) {
                await dbs.close();
            }
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
        let linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        while (page < pages && fileContentsResponse.headers.get('link') !== null && linkMatch && linkMatch.length >= 2 ? linkMatch[1] : undefined) {
            page = page + 1;
            let nextFileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
            let nextFileContents = await nextFileContentsResponse.text();
            fileContents = this.mergeWorkflowRuns(fileContents, nextFileContents)
            linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        }
        return fileContents;
    }

    private mergeWorkflowRuns(existingJson: string, newResponseJson: string): string {
        try {
            const existingData = JSON.parse(existingJson);
            const newData = JSON.parse(newResponseJson);

            const newWorkflowRuns = newData.workflow_runs || [];

            existingData.workflow_runs = [...(existingData.workflow_runs || []), ...newWorkflowRuns];

            const mergedJson = JSON.stringify(existingData);

            return mergedJson;
        } catch (error) {
            console.error('Error merging workflow runs:', error);
            return existingJson;
        }
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