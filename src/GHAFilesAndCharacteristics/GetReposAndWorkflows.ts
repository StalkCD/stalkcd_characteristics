import {Connection} from "../database/Connection";
import {MongoClient} from "mongodb";
import {WorkflowObject} from "../models/WorkflowObject";

export class GetReposAndWorkflows{

    constructor() {

    }

    async get() {
        let connection: Connection = new Connection();
        let dbs: MongoClient | undefined;
        dbs = await connection.getConnection();
        let db = await dbs.db("GHAhistorydata");
        let listRepos = await db.listCollections().toArray();

        let workflowArray: any[] = [];
        try {
            for (const coll of listRepos) {
                let workflowsFile: any = await db.collection(coll.name).findOne({"file": "workflows"});
                for (const workflow of workflowsFile.workflows) {

                    let runsFile: any = await db.collection(coll.name).findOne({
                        "file": "workflow_runs",
                        "workflowid": workflow.id
                    });
                    if (runsFile === null) {
                        let wfo: WorkflowObject = new WorkflowObject(coll.name, workflow, false);
                        workflowArray.push(wfo)
                    } else {
                        let wfo: WorkflowObject = new WorkflowObject(coll.name, workflow, true, runsFile.downloaddate);
                        workflowArray.push(wfo);
                    }
                }
            }
        } catch (err: any) {
            console.log("Problems with the data.");
            console.log(err.message);
        }
        await dbs.close();
        return workflowArray;

    }
}