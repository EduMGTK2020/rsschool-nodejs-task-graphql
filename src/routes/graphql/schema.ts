import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { UserActions } from './entities/users.js';
import { PostActions } from './entities/posts.js';
import { MemberTypeActions } from './entities/member-types.js';
import { ProfileActions } from './entities/profiles.js';

export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...UserActions.queries,
      ...PostActions.queries,
      ...MemberTypeActions.queries,
      ...ProfileActions.queries,
    },
  }),
});
