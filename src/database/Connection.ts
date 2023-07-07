import {MongoClient, ServerApiVersion} from "mongodb";


let uri = "mongodb://user:pass@stalkcd_cockpit-mongodb-1:27017/";
//uri = "mongodb://user:pass@localhost:8083/"

const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
export class Connection {

    async getConnection(): Promise<MongoClient> {


        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
            // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return client;

    }

}

