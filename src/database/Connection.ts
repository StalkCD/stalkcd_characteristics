import {MongoClient, ServerApiVersion} from "mongodb";

// URI for local MongoDB
// let dbHost = process.env.DATABASE_HOST || 'localhost';
// let uri = "mongodb://user:pass@" + dbHost + ":27017/";

// URI for MongoDB Atlas
const DBKEY = process.env.DBKEY?.trim().replace(/^"(.*)"$/, '$1');
const uri = "..." + DBKEY + "..."

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

