import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';

import { Context } from '../interfaces.js';
import { UUIDType } from '../types/uuid.js';
import { UserType } from './users.js';
import { MemberType } from './member-types.js';
import { MemberTypeIdType } from '../types/member-type-id.js';

interface Profile {
  id?: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
  },
});

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  },
});

export const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
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

export const ProfileActions = {
  queries: {

    profiles: {
      type: new GraphQLList(ProfileType),
      resolve(_, __, ctx: Context) {
        return ctx.prisma.profile.findMany();
      },
    },

    profile: {
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
    },
  },
  mutations: {

    createProfile: {
      type: ProfileType,
      args: { dto: { type: CreateProfileInputType } },
      resolve(_, args: object, ctx: Context) {
        const dto: Profile = args['dto'] as Profile;
        return ctx.prisma.profile.create({ data: dto });
      },
    },

    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_, args: object, ctx: Context) => {
        const id: string = args['id'] as string;
        try {
          await ctx.prisma.profile.delete({ where: { id: id } });
        } catch (err) {
          return false;
        }
        return true;
      },
    },

    changeProfile: {
      type: ProfileType,
      args: { id: { type: UUIDType }, dto: { type: ChangeProfileInputType } },
      resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: Profile = args['dto'] as Profile;
        return ctx.prisma.profile.update({ where: { id: id }, data: dto });
      },
    },
  },
};
