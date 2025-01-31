import { Collection, ObjectId } from "mongodb";
import { RestaurantModel } from "./types.ts";
import { GraphQLError } from "graphql";

export const resolvers = {
  Restaurant: {
    id: (parent: RestaurantModel) => parent._id!.toString(),
    location: (parent: RestaurantModel):string => parent.street+','+parent.city+','+parent.country,
    temperature: async (parent: RestaurantModel):Promise<number> => {
      const url_temperature = `https://api.api-ninjas.com/v1/weather?lat=${parent.lat}&lon=${parent.lng}`;
      const response_temperature = await fetch(url_temperature, {
        headers : {
          "X-Api-Key": Deno.env.get("API_KEY")
        }
      })
      if(response_temperature.status != 200){
        throw new GraphQLError("Problem with API NINJAs")
      }
      const data_temperature = await response_temperature.json();
      return data_temperature.temp;
    },
    localtime: async(parent:RestaurantModel):Promise<string> => {;
      const url = `https://api.api-ninjas.com/v1/worldtime?lat=${parent.lat}&lon=${parent.lng}`;
      const response = await fetch(url, {
        headers : {
          "X-Api-Key": Deno.env.get("API_KEY")
        }
      })
      if(response.status != 200){
        throw new GraphQLError("Problem with API NINJAs")
      }
      const data = await response.json();
      const hour = data.hour;
      const minute = data.minute;
      const localtime = hour + ':' +minute;
      return localtime;
    }
  },
  Query: {
    getRestaurants: async (_:unknown,__:unknown, context:{restaurantsCollection: Collection<RestaurantModel>} ):Promise<RestaurantModel[]> => {
      return await context.restaurantsCollection.find().toArray();
    },
    getRestaurant: async (_:unknown, {id}:{id:string}, context:{restaurantsCollection: Collection<RestaurantModel>}):Promise<RestaurantModel|null> => {
      return await context.restaurantsCollection.findOne({_id: new ObjectId(id)});
    }
  },
  Mutation: {
    addRestaurant: async(_:unknown,{name, street, city, number}: {name:string,street: string, city:string, number:string}, context:{restaurantsCollection: Collection<RestaurantModel>}):Promise<RestaurantModel> => {
      const url_lat_lng = `https://api.api-ninjas.com/v1/city?name=${city}`;
      const response_lat_lng = await fetch(url_lat_lng, {
        headers : {
          "X-Api-Key": Deno.env.get("API_KEY")
        }
      });
      if(response_lat_lng.status != 200){
        throw new GraphQLError("Problem with API NINJAs")
      }
      const data_lat_lng = await response_lat_lng.json();
      const lat = data_lat_lng.at(0).latitude;
      const lng = data_lat_lng.at(0).longitude;

      // Comprobar que telefono es valido
      const url_phone = `https://api.api-ninjas.com/v1/validatephone?number=${number}`;
      const response_phone = await fetch(url_phone, {
        headers: {
          "X-Api-Key": Deno.env.get("API_KEY")
        }
      });
      if(response_phone.status != 200){
        throw new GraphQLError("Problem with API NINJAs")
      }
      const data_phone = await response_phone.json();
      if(!data_phone.is_valid){
        throw new GraphQLError("El telefono no es correcto");
      }

      // Comprobar que no existe un restaurante con el mismo telefono
      const phoneExists = await context.restaurantsCollection.findOne({number});
      if(phoneExists){
        throw new GraphQLError("El telefono ya existe")
      };

      const {insertedId} = await context.restaurantsCollection.insertOne({
        name: name,
        city: city,
        country: data_phone.country,
        lat: lat,
        lng: lng,
        street: street,
        number: number
      })

      if(insertedId){
        const restaurant = await context.restaurantsCollection.findOne({_id: insertedId});
        if(restaurant){
          return restaurant
        }
        throw new GraphQLError("Couldnt find restaurant")
      }
      throw new GraphQLError("Couldnt insert restaurant")
    },
    deleteRestaurant: async (_:unknown, {id}: {id:string}, context:{restaurantsCollection: Collection<RestaurantModel>}):Promise<Boolean> =>{
      const {deletedCount} = await context.restaurantsCollection.deleteOne({_id: new ObjectId(id)});
      if(deletedCount) return true
      return false;
    }
  }
  
};