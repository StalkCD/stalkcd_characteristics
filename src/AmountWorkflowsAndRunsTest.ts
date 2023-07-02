import * as fs from "fs";
import fetch, {RequestInit, Response} from "node-fetch";

const GITHUB_API_VERSION = 'application/vnd.github.v3+json'; // https://docs.github.com/en/rest/overview/resources-in-the-rest-api

export class AmountWorkflowsAndRunsTest {

    repoName: string = "";
    repoOwner: string = "";
    token: string = "";

    constructor() {
    }

    async calc(token: string) {
        this.token = token;
        try {
            let runners: any = await this.tryFetch("https://api.github.com/orgs/Test-organis/settings/billing/actions");
            let runnerC: any = await runners.text();
            console.log(runnerC);


            let searchurl: string = "https://api.github.com/search/repositories?q=stars%3A%3E10000&type=repositories&s=stars&o=desc&per_page=100";
            let searchRes: any = await this.tryFetch(searchurl);
            let fileContents = await searchRes.text();
            let searchResJson: any = JSON.parse(fileContents);

            let amountRepos = Object.keys(searchResJson.items).length;

            let numberWorkflows: number = 0;
            let numberJobs: number = 0;
            let numberNoActions: number = 0;
            let numberRuns: number = 0;

            for(let i = 0; i < amountRepos; i++) {

                this.repoOwner = searchResJson.items[i].owner.login;
                this.repoName = searchResJson.items[i].name;
                let fileContents = await this.getAllWorkflows();
                let workflowsJson: any = await JSON.parse(fileContents);
                let amountWorkflows = Object.keys(searchResJson.items).length;

                numberWorkflows = numberWorkflows + Object.keys(workflowsJson.workflows).length;

                for (let j = 0; j < amountWorkflows; j++) {
                    if (workflowsJson.total_count !== 0) {

                        if (workflowsJson.workflows !== undefined && workflowsJson.workflows[j] !== undefined) {

                            try {
                                const RunsOfWorkflow = await this.getRunsOfWorkflow(workflowsJson.workflows![j]);
                                const RunsOfWorkflowJson = await JSON.parse(RunsOfWorkflow);
                                numberRuns = numberRuns + RunsOfWorkflowJson.total_count;

                                if (RunsOfWorkflowJson.total_count !== 0 || RunsOfWorkflowJson.workflow_runs[0] !== undefined) {
                                    const jobsOfRun = await this.getJobsOfRun(RunsOfWorkflowJson.workflow_runs[0].id);
                                    const jobsOfRunJson = JSON.parse(jobsOfRun);
                                    numberJobs = numberJobs + Object.keys(jobsOfRunJson.jobs).length;
                                }
                            } catch (err) {
                                console.log("An Error occured at i= ; j= : " + err)
                                console.log("continuing")
                                continue
                            }


                        }
                        console.log(i + " wf " + numberWorkflows);
                        console.log(i + " job " + numberJobs);
                        console.log(i + " nna " + numberNoActions);
                        console.log(i + " runs " + numberRuns);
                    } else {
                        numberNoActions = numberNoActions + 1;
                    }
                }
            }
        } catch(err: any) {
            console.log(err.message);
        }

    }

    private async getJobsOfRun(runId: any): Promise<any> {
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/runs/${runId}/jobs`);
        let fileContents = await fileContentsResponse.text();
        return fileContents;
    }

    private async getRunsOfWorkflow(workflow: any): Promise<any> {
        let page: number = 1;
        let fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows/${workflow.id}/runs?per_page=10&page=${page}`);
        let fileContents = await fileContentsResponse.text();
        let totalContents: any = fileContents.slice(0, -2);
        let linkMatch = /<([^>]*?)>; rel="next"/.exec(<string>fileContentsResponse.headers.get('link'));
        while (page < 1 && fileContentsResponse.headers.get('link') !== null && linkMatch && linkMatch.length >= 2 ? linkMatch[1] : undefined) {
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
    private async getAllWorkflows(): Promise<any> {
        const fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`);
        let fileContentsJson: any = await fileContentsResponse.json();
        let fileContents = JSON.stringify(fileContentsJson);

        return fileContents;
    }

    async tryFetch(fetchUrl: string): Promise<Response> {
        let fetchParams: RequestInit = {
            headers: {
                'Accept': GITHUB_API_VERSION,
                'Authorization': 'token ' + this.token,
                'User-Agent': 'request',
                'charset': 'UTF-8',
            },
        };
        let url: string = fetchUrl;//`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/actions/workflows`;
        let res: Response = new Response();

        try {
            res = await fetch(url, fetchParams);
        } catch (err) {
            console.error(err);

        }
        return res;
    }
}