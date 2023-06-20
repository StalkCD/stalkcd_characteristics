import { Request, Response } from "express";
import { DownloadGHAFilesAndLogs } from "../GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs";

const downloadGHAFilesAndLogs = async (req: Request, res: Response) => {
  let repoName: string = req.params.repoName;
  let repoOwner: string = req.params.repoOwner;
  let workflowName: string = req.params.workflowName;
  let gitHubToken: string = req.params.gitHubToken;

  await new DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, gitHubToken).downloadFiles(false);

  return res.status(200).json({
      message: 'Download complete.'
  });
};

export default { downloadGHAFilesAndLogs };
