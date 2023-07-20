import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { user, users } from './entities/users.js';
import { post, posts } from './entities/posts.js';
import { memberType, memberTypes } from './entities/member-types.js';
import { profile, profiles } from './entities/profiles.js';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user,
    users,
    post,
    posts,
    memberType,
    memberTypes,
    profile,
    profiles,
  },
});

export const Schema = new GraphQLSchema({
  query: RootQuery,
});
