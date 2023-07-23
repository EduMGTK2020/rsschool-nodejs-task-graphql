import { GraphQLObjectType, GraphQLFloat, GraphQLList, GraphQLInt } from 'graphql';

import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { LoaderType } from '../interfaces.js';

import { Context } from '../interfaces.js';
import { MemberTypeIdType } from '../types/member-type-id.js';

export type Member = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
};

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeIdType },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const MemberTypeActions = {
  queries: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      async resolve(_, __, ctx: Context) {
        return await ctx.prisma.memberType.findMany();
      },
    },

    memberType: {
      type: MemberType,
      args: { id: { type: MemberTypeIdType } },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        return await ctx.prisma.memberType.findUnique({
          where: {
            id: id,
          },
        });
      },
    },
  },
};

export const memberTypeLoader = (prisma: PrismaClient): LoaderType => {
  return new DataLoader<string, Member | undefined>(async (ids: readonly string[]) => {
    const result = await prisma.memberType.findMany({
      where: { id: { in: ids as string[] | undefined } },
    });
    return ids.map((id) => result.find((x) => x.id === id));
  });
};
