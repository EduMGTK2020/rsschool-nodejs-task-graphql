import { GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLInt } from 'graphql';

import { Context } from '../interfaces.js';
import { UUIDType } from '../types/uuid.js';
import { UserType } from './users.js';
import { MemberType } from './member-types.js';

export const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      type: UserType,
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['userId'] as string;
        const user = ctx.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        return user;
      },
    },
    memberType: {
      type: MemberType,
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['memberTypeId'] as string;
        const memberType = ctx.prisma.memberType.findUnique({
          where: {
            id: id,
          },
        });
        return memberType;
      },
    },
  }),
});

export const profiles = {
  type: new GraphQLList(ProfileType),
  resolve(_, __, ctx: Context) {
    return ctx.prisma.profile.findMany();
  },
};

export const profile = {
  type: ProfileType,
  args: { id: { type: UUIDType } },
  resolve(_, args: object, ctx: Context) {
    const id: string = args['id'] as string;
    return ctx.prisma.profile.findUnique({
      where: {
        id: id,
      },
    });
  },
};
