import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { MongoClient } from 'mongodb'

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  throw new Error("Please provide a MONGO_URL")
}
const client = new MongoClient(MONGO_URL);

const dbName = 'myProject';
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const collection = db.collection('documents');

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {context: async() => ({collection})});
console.log(`🚀 Server ready at ${url}`);