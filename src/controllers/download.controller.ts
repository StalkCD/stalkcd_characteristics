import { Body, Post, Route, Tags } from 'tsoa';
import { DownloadGHAFilesAndLogs } from '../GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs';
import { IApiResponse, IDownloadConfig } from '../interface';


@Route("download")
@Tags("Download")
export default class DownloadController {
  @Post("/")
  public async downloadGHAFilesAndLogs(@Body() body: IDownloadConfig): Promise<IApiResponse> {
    // let repoName: string = body.repoName;
    // let repoOwner: string = body.repoOwner;
    // let workflowName: string = body.workflowName;
    // let gitHubToken: string = body.gitHubToken;
    let repoName: string = 'hibernate-orm';
    let repoOwner: string = 'hibernate';
    let workflowName: string = 'CodeQL';
    let gitHubToken: string = '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';
  
    let saveType: string = "db" //TODO über Schnittstelle abfragen

    await new DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, gitHubToken).downloadFiles(saveType);

    return {
        message: "The download was successful.",
    };
  }
}