import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { user, users } from './entities/users.js';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user,
    users,
  },
});

export const Schema = new GraphQLSchema({
  query: RootQuery,
});