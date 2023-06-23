import fetch, {RequestInit, Response} from "node-fetch";
import {GHAFileSaver} from "./GHAFileSaver";
import {GHAHistoryBuilder} from "./GHAHistoryBuilder";

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
    async downloadFiles(save: boolean): Promise<GHAHistoryBuilder> {

        let history: GHAHistoryBuilder = new GHAHistoryBuilder();

        try {

            let fileContents = await this.getAllWorkflows();

            const workflowsJson: any = JSON.parse(fileContents);
            const amountWorkflows = Object.keys(workflowsJson.workflows).length;
            history.addRepo(this.repoName, workflowsJson);
            /*
            for (let i = 0; i < amountWorkflows; i++) {
                if(workflowsJson.workflows![i] !== undefined) {

                    const RunsOfWorkflow = await this.getRunsOfWorkflow(workflowsJson.workflows![i]);
                    const RunsOfWorkflowJson = JSON.parse(RunsOfWorkflow);
                    history.addWorkflow(workflowsJson.workflows![i].id, RunsOfWorkflowJson);

                    const amountRunsOfWorkflow = Object.keys(RunsOfWorkflowJson.workflow_runs).length;

                    for (let j = 0; j < amountRunsOfWorkflow; j++) {

                        const jobsOfRun = await this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs[j].id);
                        const jobsOfRunJson = JSON.parse(jobsOfRun);
                        history.addRun(RunsOfWorkflowJson.workflow_runs[j].id, jobsOfRunJson);

                        const amountJobsOfRun = Object.keys(jobsOfRunJson.jobs).length;

                        for (let k = 0; k < amountJobsOfRun; k++) {

                            const logOfJob = await this.getLogOfJob(jobsOfRunJson.jobs![k].id);
                            history.addJob(jobsOfRunJson.jobs![k].id, logOfJob)
                        }
                    }
                }
            }

             */
            if(save) {
                let saver: GHAFileSaver = new GHAFileSaver();
                saver.saveFiles(history);
            }

        } catch (err: any) {
        console.error();
        }

        return history;
    }


    private async getLogOfJob(jobId: any): Promise<any> {
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/jobs/${jobId}/logs`);
        let fileContents = await fileContentsResponse.text();
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
    private async getRunsOfWorkflow(workflow: any): Promise<any> {
        let page: number = 1;
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=100&page=${page}`);
        let fileContents = await fileContentsResponse.text();
        let totalContents: any = fileContents.slice(0, -2);
        let linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        while(page < 2 && fileContentsResponse.headers.get('link') !== null && linkMatch && linkMatch.length >= 2 ? linkMatch[1] : undefined) {
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

        if(this.workflowName != null && this.workflowName != "") {
            let indexOfWorkflow = 0;
            for(let i = 0; i < Object.keys(fileContentsJson.workflows!).length; i++) {
                if(fileContentsJson.workflows![i].name == this.workflowName) {
                    indexOfWorkflow = i;
                }
            }
            fileContents = "{\"workflows\":[" + JSON.stringify(fileContentsJson.workflows![indexOfWorkflow]) + "]}";
        }

        return fileContents;
    }
    /**
     * Downloads a file with a given url of a repository.
     * @param fetchUrl the url to be downloaded
     * @private
     */
    async tryFetch(fetchUrl:string): Promise<Response> {
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
        if(res.url == null || res.url == "" && this.rerunLimit < 10) {
            console.log("rerun " + this.rerunLimit)
            this.rerunLimit = this.rerunLimit + 1;
            this.tryFetch(fetchUrl);
        }

        this.rerunLimit = 0;
        console.log("request successful: " + url)
        return res;
    }
}