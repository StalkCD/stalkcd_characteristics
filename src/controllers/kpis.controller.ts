import { Body, Post, Route, Tags } from 'tsoa';
import { IKpisConfig } from '../interface';
import { Kpis } from '../models/Kpis';
import { GetKPIs } from '../GHAFilesAndCharacteristics/GetKPIs';

@Route("kpis")
@Tags("KPIs")
export default class KPIsController {

  @Post("/")
  public async getKPIs(@Body() body: IKpisConfig): Promise<Kpis> {
    let repo: string = body.repoName;
    let workflow: string = body.workflowName;
    let loadFrom: string = body.loadFrom || "local";

    // let repo: string = 'hibernate-orm';
    // let workflow: string = 'CodeQL';
    // let saveType: string = "db" 
    
    return await new GetKPIs(repo, workflow).getKPIs(loadFrom);
  }
}