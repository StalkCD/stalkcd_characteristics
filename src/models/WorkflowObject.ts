export class WorkflowObject {
    repoName: string;
    workflowDescription: any;
    downloaded: boolean;
    downloadDate?: Date;

    constructor(repoName: string, workflowDescription: any, downloaded: boolean, downloadDate?: Date) {
        this.repoName = repoName;
        this.workflowDescription = workflowDescription;
        this.downloaded = downloaded;
        this.downloadDate = downloadDate;
    }
}