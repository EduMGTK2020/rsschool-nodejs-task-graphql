import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { user, users } from './entities/users.js';
import { post, posts } from './entities/posts.js';
import { memberType, memberTypes } from './entities/member-types.js';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user,
    users,
    post,
    posts,
    memberType,
    memberTypes,
  },
});

export const Schema = new GraphQLSchema({
  query: RootQuery,
});
