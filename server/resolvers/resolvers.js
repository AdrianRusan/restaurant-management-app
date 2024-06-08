const { Restaurant, User } = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();


const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const resolvers = {
  Query: {
    restaurants: async(_, {page = 1, pageSize = 10}) => {
      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      return await Restaurant.findAll({offset, limit: parseInt(pageSize, 10)})
    },
    searchRestaurants: async(_, {searchTerm, page = 1, pageSize = 10}) => {
      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      return await Restaurant.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            // { address: { [Op.like]: `%${searchTerm}%` } },
            // { email: { [Op.like]: `%${searchTerm}%` } },
            // { phone: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        offset,
        limit: parseInt(pageSize, 10)
      });
    },
  },
  Mutation : {
    createRestaurant: async(_, {name, address, email, phone}) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email address');
      }

      return await Restaurant.create({name, address, email, phone})
    },
    updateRestaurant: async(_, {id, name, address, email, phone}) => {
      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) throw new Error('Restaurant not found');

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email address');
      }

      return await restaurant.update({name, address, email, phone});
    },
    deleteRestaurant: async(_, {id}) => {
      const result = await Restaurant.destroy({where: {id}});
      if (result === 0) {
        throw new Error('Restaurant not found');
      }

      return true;
    },
    register: async(_, {email, password}) => {
      try {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Invalid email address');
        }

        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const existingUser = await User.findOne({ where: { email: email.toLowerCase() }});
        if (existingUser) {
          throw new Error('User already exists');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({ email, password: hashedPassword });

        return generateToken(user);
      } catch (error) {
        throw new Error(`${error.message}`);
      }
    },
    login: async(_, {email, password}) => {
      try {
        const user = await User.findOne({ where: { email }});
        if (!user || !bcrypt.compareSync(password, user.password)) {
          throw new Error('Invalid email or password');
        }

        return generateToken(user);
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },
}

module.exports = resolvers;