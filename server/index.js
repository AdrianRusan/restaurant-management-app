require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const Sequlize = require('sequelize');
const cors = require('cors');
const typeDefs = require('./schemas/schema');
const resolvers = require('./resolvers/resolvers');

async function startServer() {
  const app = express();

  app.use(cors({ 
    origin: '*',
    credentials: true 
  }));

  const sequelize = new Sequlize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const server = new ApolloServer({ typeDefs, resolvers });


  await server.start();

  server.applyMiddleware({ app });

  app.get('/', async (req, res) => {
    try {
      await sequelize.authenticate();
      console.log('Database connection successful');
      res.send('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      res.status(500).send('Database connection failed');
    }
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL Playground available at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
});