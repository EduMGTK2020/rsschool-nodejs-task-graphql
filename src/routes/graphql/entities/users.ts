import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';

import { UUIDType } from '../types/uuid.js';
import { Context } from '../interfaces.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['id'] as string;
        const profile = ctx.prisma.profile.findUnique({
          where: {
            userId: id,
          },
        });
        return profile;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parent: object, _, ctx: Context) {
        console.log(parent);
        const id: string = parent['id'] as string;
        const posts = ctx.prisma.post.findMany({
            where: {
              authorId: id,
            },
        });
        return posts;
      },
    },
  }),
});

export const users = {
  type: new GraphQLList(UserType),
  resolve(_, __, ctx: Context) {
    return ctx.prisma.user.findMany();
  },
};

export const user = {
  type: UserType,
  args: { id: { type: UUIDType } },
  resolve(_, args: object, ctx: Context) {
    const id: string = args['id'] as string;
    const user = ctx.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  },
};
