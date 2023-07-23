import { Type } from '@fastify/type-provider-typebox';

import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { UserActions } from './entities/users.js';
import { PostActions } from './entities/posts.js';
import { MemberTypeActions } from './entities/member-types.js';
import { ProfileActions } from './entities/profiles.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};


export const gqlSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...UserActions.queries,
      ...PostActions.queries,
      ...MemberTypeActions.queries,
      ...ProfileActions.queries,
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      ...UserActions.mutations,
      ...PostActions.mutations,
      ...ProfileActions.mutations,
    },
  }),
});