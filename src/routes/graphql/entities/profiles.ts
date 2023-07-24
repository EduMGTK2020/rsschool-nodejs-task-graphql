import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { LoaderType } from '../interfaces.js';

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
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
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
      async resolve(parent: object, _, ctx: Context) {
        const id: string = parent['userId'] as string;
        return await ctx.loaders.user.load(id);
      },
    },
    memberType: {
      type: MemberType,
      async resolve(parent: object, _, ctx: Context) {
        const id: string = parent['memberTypeId'] as string;
        return await ctx.loaders.memberType.load(id);
      },
    },
  }),
});

export const ProfileActions = {
  queries: {
    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(_, __, ctx: Context) {
        return await ctx.prisma.profile.findMany();
      },
    },

    profile: {
      type: ProfileType,
      args: { id: { type: UUIDType } },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        return await ctx.prisma.profile.findUnique({
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
      args: { dto: { type: new GraphQLNonNull(CreateProfileInputType) } },
      async resolve(_, args: object, ctx: Context) {
        const dto: Profile = args['dto'] as Profile;
        return await ctx.prisma.profile.create({ data: dto });
      },
    },

    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      async resolve(_, args: object, ctx: Context) {
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
      args: {
        id: { type: UUIDType },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
      },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: Profile = args['dto'] as Profile;
        return await ctx.prisma.profile.update({ where: { id: id }, data: dto });
      },
    },
  },
};

export const profileLoader = (prisma: PrismaClient): LoaderType => {
  return new DataLoader<string, Profile | undefined>(async (ids: readonly string[]) => {
    const result = await prisma.profile.findMany({
      where: { userId: { in: ids as string[] | undefined } },
    });
    return ids.map((id) => result.find((x) => x.userId === id));
  });
};
