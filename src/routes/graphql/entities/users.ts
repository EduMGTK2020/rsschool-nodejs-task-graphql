import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';

import { UUIDType } from '../types/uuid.js';
import { Context } from '../interfaces.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

interface User {
  id?: string;
  name: string;
  balance: number;
}

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
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
        const id: string = parent['id'] as string;
        const posts = ctx.prisma.post.findMany({
          where: {
            authorId: id,
          },
        });
        return posts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['id'] as string;
        return ctx.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve(parent: object, _, ctx: Context) {
        const id: string = parent['id'] as string;
        return ctx.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: id,
              },
            },
          },
        });
      },
    },
  }),
});

export const UserActions = {
  queries: {
    users: {
      type: new GraphQLList(UserType),
      resolve(_, __, ctx: Context) {
        return ctx.prisma.user.findMany();
      },
    },

    user: {
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
    },
  },
  mutations: {
    createUser: {
      type: UserType,
      args: { dto: { type: CreateUserInputType } },
      resolve(_, args: object, ctx: Context) {
        const dto: User = args['dto'] as User;
        return ctx.prisma.user.create({ data: dto });
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_, args: object, ctx: Context) => {
        const id: string = args['id'] as string;
        try {
          await ctx.prisma.user.delete({ where: { id: id } });
        } catch (err) {
          return false;
        }
        return true;
      },
    },

    changeUser: {
      type: UserType,
      args: { id: { type: UUIDType }, dto: { type: ChangeUserInputType } },
      resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: User = args['dto'] as User;
        return ctx.prisma.user.update({ where: { id: id }, data: dto });
      },
    },
  },
};
