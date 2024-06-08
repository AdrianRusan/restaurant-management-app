const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Restaurant {
    id: ID!
    name: String!
    address: String!
    email: String!
    phone: String!
  }

  type User {
    id: ID!
    email: String!
    password: String!
  }

  type Query {
    restaurants(page: Int, pageSize: Int): [Restaurant]
    searchRestaurants(searchTerm: String, page: Int, pageSize: Int): [Restaurant]
  }

  type Mutation {
    createRestaurant(name: String!, address: String!, email: String!, phone: String!): Restaurant
    updateRestaurant(id: ID!, name: String, address: String, email: String, phone: String): Restaurant
    deleteRestaurant(id: ID!): Boolean
    register(email: String!, password: String!): String
    login(email: String!, password: String!): String
  }
`;

module.exports = typeDefs;