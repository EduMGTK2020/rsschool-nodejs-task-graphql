import { GraphQLObjectType, GraphQLFloat, GraphQLList, GraphQLInt } from 'graphql';

import { Context } from '../interfaces.js';
import { MemberTypeIdType } from '../types/member-type-id.js';

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeIdType },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const memberTypes = {
  type: new GraphQLList(MemberType),
  resolve(_, __, ctx: Context) {
    return ctx.prisma.memberType.findMany();
  },
};

export const memberType = {
  type: MemberType,
  args: { id: { type: MemberTypeIdType } },
  resolve(_, args: object, ctx: Context) {
    const id: string = args['id'] as string;
    const mType = ctx.prisma.memberType.findUnique({
      where: {
        id: id,
      },
    });
    return mType;
  },
};
