export const schema = `#graphql
  type Restaurant {
    id:ID!
    name: String!
    location: String!
    number: String!
    temperature: Int!
    localtime: String!
  }
  type Query {
    getRestaurants: [Restaurant!]!
    getRestaurant(id:ID!):Restaurant
  }
  type Mutation {
    addRestaurant(name:String!, street: String!, city: String!, number: String!):Restaurant!
    deleteRestaurant(id:ID!):Boolean!
  }
`;