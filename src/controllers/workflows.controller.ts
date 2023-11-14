import { Get, Route, Tags } from 'tsoa';
import {GetReposAndWorkflows} from "../GHAFilesAndCharacteristics/GetReposAndWorkflows";

@Route("workflows")
@Tags("Workflows")
export default class WorkflowsController {

    @Get("/")
    public async getWorkflows(): Promise<any> {
        let res: any = await new GetReposAndWorkflows().get();
        return res;
    }
}