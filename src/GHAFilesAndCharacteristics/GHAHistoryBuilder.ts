export interface log {

    log: any;
}
export interface job {
    id: number;
    logFile: any;
}
export interface run {
    id: number;
    jobsFile: any;
}
export interface workflow {
    id: number;
    runsFile: any;
}
export interface repo {
    name: string;
    workflowsFile : any;
}
export class GHAHistoryBuilder {

    repo: repo | undefined;
    workflows: workflow[] | undefined;
    runs: run[] | undefined;
    jobs: job[] | undefined;
    log: log | undefined;


    addRepo(repoName: string, fileData: any) {
        this.repo = {name: repoName, workflowsFile: fileData};
    }

    addWorkflow(id:number, runsFile: any) {
        if(this.workflows == undefined) {
            let workflow: workflow = {id: id, runsFile: runsFile};
            let workflowArray: workflow[] = [];
            workflowArray.push(workflow);
            this.workflows = workflowArray;

        } else {
            let workflow: workflow = {id: id, runsFile: runsFile};
            let workflowArray: workflow[] = this.workflows;
            workflowArray.push(workflow);
            this.workflows = workflowArray;
        }

    }

    addRun(id:number, jobsFile: any) {
        if(this.runs == undefined) {
            let run: run = {id: id, jobsFile: jobsFile};
            let runArray: run[] = [];
            runArray.push(run);
            this.runs = runArray;
        } else {
            let run: run = {id: id, jobsFile: jobsFile};
            let runArray: run[] = this.runs;
            runArray.push(run);
            this.runs = runArray;
        }
    }

    addJob(id: number, logFile: any) {
        if(this.jobs == undefined) {
            let job: job = {id: id, logFile: logFile};
            let jobArray: job[] = [];
            jobArray.push(job);
            this.jobs = jobArray;
        } else {
            let job: job = {id: id, logFile: logFile};
            let jobArray: job[] = this.jobs;
            jobArray.push(job);
            this.jobs = jobArray;
        }

    }

}