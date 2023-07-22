import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';

import { Context } from '../interfaces.js';
import { UUIDType } from '../types/uuid.js';
import { UserType } from './users.js';

interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
}

const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
});

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
});

export const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
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

export const PostActions = {
  queries: {

    posts: {
      type: new GraphQLList(PostType),
      resolve(_, __, ctx: Context) {
        return ctx.prisma.post.findMany();
      },
    },

    post: {
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
    },
  },
  mutations: {

    createPost: {
      type: PostType,
      args: { dto: { type: CreatePostInputType } },
      resolve(_, args: object, ctx: Context) {
        const dto: Post = args['dto'] as Post;
        return ctx.prisma.post.create({ data: dto });
      },
    },

    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_, args: object, ctx: Context) => {
        const id: string = args['id'] as string;
        try {
          await ctx.prisma.post.delete({ where: { id: id } });
        } catch (err) {
          return false;
        }
        return true;
      },
    },

    changePost: {
      type: PostType,
      args: { id: { type: UUIDType }, dto: { type: ChangePostInputType } },
      resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: Post = args['dto'] as Post;
        return ctx.prisma.post.update({ where: { id: id }, data: dto });
      },
    },
  },
};
