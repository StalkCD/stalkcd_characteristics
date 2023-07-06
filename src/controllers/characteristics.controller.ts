import { Body, Post, Route, Tags } from 'tsoa';
import { ICharacteristicsConfig } from '../interface';
import { Characteristics } from '../models/Characteristics';
import { GetKPIs } from '../GHAFilesAndCharacteristics/GetKPIs';

@Route("characteristics")
@Tags("Characteristics")
export default class CharacteristicsController {

  @Post("/")
  public async getCharacteristics(@Body() body: ICharacteristicsConfig): Promise<Characteristics> {
    let repo: string = body.repoName;
    let workflow: string = body.workflowName;
    let loadFrom: string = body.loadFrom || "local";
    
    return await new GetKPIs(repo, workflow).getKPIs(loadFrom);
  }
}