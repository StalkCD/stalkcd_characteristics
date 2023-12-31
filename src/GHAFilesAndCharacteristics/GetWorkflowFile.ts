import fetch, {RequestInit, Response} from "node-fetch";
import * as fs from "fs";
import {GHAFileSaver} from "./GHAFileSaver";
import {Connection} from "../database/Connection";
import {MongoClient} from "mongodb";

const GITHUB_API_VERSION = 'application/vnd.github.v3+json';

export class GetWorkflowFile {

    repoName: string;
    repoOwner: string;
    workflowName: string;
    token: string;

    constructor(repoOwner: string, repoName: string, workflowName: string, token: string) {

        this.repoName = repoName;
        this.repoOwner = repoOwner;
        this.workflowName = workflowName;
        this.token = token;
    }


    async getWorkflowFile(save: boolean, saveType: string) {

        let workflowLC = this.workflowName.toLowerCase();
        const path = ".github/workflows/" + workflowLC + ".yml";
        const fileContentsResponse = await this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${path}`);
        const fileContentsJson: any = await fileContentsResponse.json();
        JSON.stringify(fileContentsJson);

        const url: string = fileContentsJson.download_url;
        const yamlContentsResponse = await this.tryFetch(url);
        const yamlContents = await yamlContentsResponse.text();
        console.log(yamlContents);

        if(save) {
            if(saveType == 'db') {

                let connection: Connection = new Connection();
                let dbs: MongoClient | undefined;
                dbs = await connection.getConnection();
                let db = await dbs.db("GHAworkflowfiles");
                let coll: any[] = await db.listCollections().toArray();
                let collExists: boolean = false;

                coll.forEach(coll => {
                    if(coll.name == this.repoName) {
                        collExists = true;
                        console.log("exists");
                        db.dropCollection(this.repoName);
                    }
                })
                if(!collExists) {
                    await db.createCollection(this.repoName);
                }

                db.collection(this.repoName).insertOne({"workflow" : this.workflowName,"content":yamlContents});

            } else {
                let saver: GHAFileSaver = new GHAFileSaver("GHAWorkflowFiles");
                saver.createTargetDir("GHAWorkflowFiles");
                await saver.createTargetDir("GHAWorkflowFiles/" + this.repoName);
                await saver.createTargetDir("GHAWorkflowFiles/" + this.repoName + "/" + this.workflowName);
                let path = "GHAWorkflowFiles/" + this.repoName + "/" + this.workflowName
                saver.fileWriter(path + "/" + this.workflowName, yamlContents, ".yml");
            }
        }



        return yamlContents;
    }

    /**
     * Downloads a file with a given url of a repository.
     * @param fetchUrl the url to be downloaded
     * @private
     */
    private async tryFetch(fetchUrl:string): Promise<Response> {
        let fetchParams: RequestInit = {
            headers: {
                'Accept': GITHUB_API_VERSION,
                'Authorization': 'token ' + this.token,
                'User-Agent': 'request',
                'charset': 'UTF-8'
            },
        };
        let url: string = fetchUrl;
        let res: Response = new Response();

        try {
            res = await fetch(url, fetchParams);
        } catch (err) {
            console.error(err);
        }

        console.log("request successful: " + url)
        return res;
    }
}