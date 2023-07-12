import { Body, Post, Route, Tags } from 'tsoa';
import {GetReposAndWorkflows} from "../GHAFilesAndCharacteristics/GetReposAndWorkflows";

@Route("workflows")
@Tags("Workflows")
export default class WorkflowsController {

    @Post("/")
    public async getWorkflows(): Promise<any> {
        console.log("ja");
        let res: any = await new GetReposAndWorkflows().get();
        console.log(res);
        return res;
    }
}