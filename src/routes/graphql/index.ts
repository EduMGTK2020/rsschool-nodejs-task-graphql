import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

import { Context } from './interfaces.js';
import { Schema } from './schema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  const ctx: Context = {
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
      const validationRules = [depthLimit(5)];
      const errors = validate(Schema, parse(req.body.query), validationRules);

      if (errors.length !== 0) {
        return {
          data: '',
          errors: errors,
        };
      } else {
        return await graphql({
          schema: Schema,
          source: req.body.query,
          variableValues: req.body.variables,
          contextValue: ctx,
        });
      }
    },
  });
};

export default plugin;
