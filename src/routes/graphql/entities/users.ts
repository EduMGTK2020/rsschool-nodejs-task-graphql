import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLResolveInfo,
  GraphQLNonNull,
} from 'graphql';

import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { LoaderType } from '../interfaces.js';

import { UUIDType } from '../types/uuid.js';
import { Context } from '../interfaces.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

interface UserDto {
  id?: string;
  name: string;
  balance: number;
}

interface User {
  id?: string;
  name: string;
  balance: number;
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
}

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      async resolve(parent: object, _, ctx: Context) {
        const id: string = parent['id'] as string;
        return await ctx.loaders.profile.load(id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent: object, _, ctx: Context) {
        const id: string = parent['id'] as string;
        return await ctx.loaders.posts.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent: object, _, ctx: Context) {
        const { userSubscribedTo } = parent as User;
        if (Array.isArray(userSubscribedTo) && userSubscribedTo.length > 0) {
          return await ctx.loaders.user.loadMany(
            userSubscribedTo.map((user) => user.authorId),
          );
        }
        return [];
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent: object, _, ctx: Context) {
        const { subscribedToUser } = parent as User;
        if (Array.isArray(subscribedToUser) && subscribedToUser.length > 0) {
          return await ctx.loaders.user.loadMany(
            subscribedToUser.map((user) => user.subscriberId),
          );
        }
        return [];
      },
    },
  }),
});

export const UserActions = {
  queries: {
    users: {
      type: new GraphQLList(UserType),
      async resolve(_, __, ctx: Context, info: GraphQLResolveInfo) {
        const parsedInfoObject: ResolveTree = parseResolveInfo(info) as ResolveTree;
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          parsedInfoObject,
          info.returnType,
        );
        const userSubscribedTo = fields['userSubscribedTo'] != undefined;
        const subscribedToUser = fields['subscribedToUser'] != undefined;

        const users = await ctx.prisma.user.findMany({
          include: { userSubscribedTo, subscribedToUser },
        });

        users.forEach((user) => {
          ctx.loaders.user.prime(user.id, user);
        });

        return users;
      },
    },

    user: {
      type: UserType,
      args: { id: { type: UUIDType } },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        return await ctx.loaders.user.load(id);
      },
    },
  },
  mutations: {
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInputType) } },
      async resolve(_, args: object, ctx: Context) {
        const dto: UserDto = args['dto'] as UserDto;
        return await ctx.prisma.user.create({ data: dto });
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        try {
          await ctx.prisma.user.delete({ where: { id: id } });
        } catch {
          return false;
        }
        return true;
      },
    },

    changeUser: {
      type: UserType,
      args: {
        id: { type: UUIDType },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) },
      },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: UserDto = args['dto'] as UserDto;
        return await ctx.prisma.user.update({ where: { id: id }, data: dto });
      },
    },

    subscribeTo: {
      type: UserType,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      async resolve(_, args: object, ctx: Context) {
        const userId: string = args['userId'] as string;
        const authorId: string = args['authorId'] as string;
        return await ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId: authorId,
              },
            },
          },
        });
      },
    },

    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      async resolve(_, args: object, ctx: Context) {
        const userId: string = args['userId'] as string;
        const authorId: string = args['authorId'] as string;
        try {
          await ctx.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId: authorId,
              },
            },
          });
        } catch {
          return false;
        }
        return true;
      },
    },
  },
};

export const userLoader = (prisma: PrismaClient): LoaderType => {
  return new DataLoader<string, User | undefined>(async (ids: readonly string[]) => {
    const usersByIds = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: { userSubscribedTo: true, subscribedToUser: true },
    });

    const usersById = new Map<string, User>();
    const sortedByIds: Array<User | undefined> = [];

    usersByIds.forEach((user) => {
      usersById.set(user.id, user);
    });

    ids.forEach((id) => {
      sortedByIds.push(usersById.get(id));
    });

    return sortedByIds;
  });
};
