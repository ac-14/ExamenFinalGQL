import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { MongoClient } from 'mongodb'
import { RestaurantModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  throw new Error("Please provide a MONGO_URL")
}
const client = new MongoClient(MONGO_URL);

const dbName = 'ExFinal';
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const restaurantsCollection = db.collection<RestaurantModel>('restaurants');

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {context: async() => ({restaurantsCollection})});
console.log(`🚀 Server ready at ${url}`);