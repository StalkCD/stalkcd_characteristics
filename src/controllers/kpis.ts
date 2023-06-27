import { Request, Response } from "express";
import { GetKPIs } from "../GHAFilesAndCharacteristics/GetKPIs";
import { Kpis } from "../DTOs/kpis";

const getKPIs = async (req: Request, res: Response) => {
    let repoNameForKPIs: string = req.params.repoName;
    let workflowNameForKPIs: string = req.params.workflowName;
    let load: string = 'local'; //TODO Anpassen
    let save: boolean = false; //TODO Anpassen
    let saveType: string = "db" //TODO über Schnittstelle abfragen

    let kpis: Kpis = await new GetKPIs(repoNameForKPIs, workflowNameForKPIs, load).getKPIs(saveType);
  
    return res.status(200).json({kpis});
  };
  
  export default { getKPIs };