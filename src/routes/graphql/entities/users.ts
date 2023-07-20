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
