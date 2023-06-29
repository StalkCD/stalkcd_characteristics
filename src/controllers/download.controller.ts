import { Body, Post, Route, Tags } from 'tsoa';
import { DownloadGHAFilesAndLogs } from '../GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs';
import { IApiResponse, IDownloadConfig } from '../interface';


@Route("download")
@Tags("Download")
export default class DownloadController {
  @Post("/")
  public async downloadGHAFilesAndLogs(@Body() body: IDownloadConfig): Promise<IApiResponse> {
    let repoName: string = body.repoName;
    let repoOwner: string = body.repoOwner;
    let workflowName: string = body.workflowName;
    let gitHubToken: string = body.gitHubToken;
    let saveTo: string = body.saveTo || "local";

    await new DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, gitHubToken).downloadFiles(saveTo);

    return {
        message: "The download was successful.",
    };
  }
}