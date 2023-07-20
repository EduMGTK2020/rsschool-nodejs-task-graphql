import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';

import { Context } from '../interfaces.js';
import { UUIDType } from '../types/uuid.js';
import { UserType } from './users.js';

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: {
      type: UserType,
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['authorId'] as string;
        const user = ctx.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        return user;
      },
    },
  }),
});

export const posts = {
  type: new GraphQLList(PostType),
  resolve(_, __, ctx: Context) {
    return ctx.prisma.post.findMany();
  },
};

export const post = {
  type: PostType,
  args: { id: { type: UUIDType } },
  resolve(_, args: object, ctx: Context) {
    const id: string = args['id'] as string;
    const post = ctx.prisma.post.findUnique({
      where: {
        id: id,
      },
    });
    return post;
  },
};
