import { GraphQLScalarType, Kind } from 'graphql';

const isMemberTypeId = (value: unknown): value is string =>
  typeof value === 'string' && (value == 'basic' || value == 'business');

export const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  serialize(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(`Invalid MemberTypeId.`);
    }
    return value;
  },
  parseValue(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(`Invalid MemberTypeId.`);
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (isMemberTypeId(ast.value)) {
        return ast.value;
      }
    }
    return undefined;
  },
});
