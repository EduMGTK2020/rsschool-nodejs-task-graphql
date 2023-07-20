import { GraphQLObjectType, GraphQLSchema } from 'graphql';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
  },
});

export const Schema = new GraphQLSchema({
  query: RootQuery,
});