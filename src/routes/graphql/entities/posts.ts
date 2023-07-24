import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';

import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { LoaderType } from '../interfaces.js';

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
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
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
      async resolve(parent: object, _, ctx: Context) {
        const id: string = parent['authorId'] as string;
        return await ctx.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
      },
    },
  }),
});

export const PostActions = {
  queries: {
    posts: {
      type: new GraphQLList(PostType),
      async resolve(_, __, ctx: Context) {
        return await ctx.prisma.post.findMany();
      },
    },

    post: {
      type: PostType,
      args: { id: { type: UUIDType } },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        return await ctx.prisma.post.findUnique({
          where: {
            id: id,
          },
        });
      },
    },
  },
  mutations: {
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInputType) } },
      async resolve(_, args: object, ctx: Context) {
        const dto: Post = args['dto'] as Post;
        return await ctx.prisma.post.create({ data: dto });
      },
    },

    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      async resolve(_, args: object, ctx: Context) {
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
      args: {
        id: { type: UUIDType },
        dto: { type: new GraphQLNonNull(ChangePostInputType) },
      },
      async resolve(_, args: object, ctx: Context) {
        const id: string = args['id'] as string;
        const dto: Post = args['dto'] as Post;
        return await ctx.prisma.post.update({ where: { id: id }, data: dto });
      },
    },
  },
};

export const postsLoader = (prisma: PrismaClient): LoaderType => {
  return new DataLoader<string, Post[] | undefined>(async (ids: readonly string[]) => {
    const postsByIds = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] | undefined } },
    });

    const postsByAuthorId = new Map<string, Post[]>();
    const sortedByIds: Array<Post[] | undefined> = [];

    postsByIds.forEach((post) => {
      const authorPosts = postsByAuthorId.get(post.authorId) || [];
      authorPosts.push(post);
      postsByAuthorId.set(post.authorId, authorPosts);
    });

    ids.forEach((id) => {
      sortedByIds.push(postsByAuthorId.get(id));
    });

    return sortedByIds;
  });
};
