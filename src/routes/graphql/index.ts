import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';

import { Context } from './interfaces.js';
import { Schema } from './schema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  const { prisma } = fastify;
  const ctx:Context = {
    prisma,
  };

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return await graphql({
        schema: Schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: ctx,
      });
    },
  });
};

export default plugin;
