import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
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

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
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
  },
};
