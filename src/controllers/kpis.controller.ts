import { Body, Post, Route, Tags } from 'tsoa';
import { IKpisConfig } from '../interface';
import { Kpis } from '../models/Kpis';
import { GetKPIs } from '../GHAFilesAndCharacteristics/GetKPIs';

@Route("kpis")
@Tags("KPIs")
export default class KPIsController {

  @Post("/")
  public async getKPIs(@Body() body: IKpisConfig): Promise<Kpis> {
    let repoNameForKPIs: string = body.repoName;
    let workflowNameForKPIs: string = body.workflowName;

    let saveType: string = "db" //TODO über Schnittstelle abfragen
    
    return await new GetKPIs(repoNameForKPIs, workflowNameForKPIs).getKPIs(saveType);
  }
}