import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';

import { UUIDType } from '../types/uuid.js';
import { Context } from '../interfaces.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const users = {
  type: new GraphQLList(UserType),
  async resolve(_, __, ctx: Context) {
    return await ctx.prisma.user.findMany();
  },
};

export const user = {
  type: UserType,
  args: { id: { type: UUIDType } },
  async resolve(_, args: object, ctx: Context) {
    const id: string = args['id'] as string;
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  },
};
