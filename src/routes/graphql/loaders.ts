import { PrismaClient } from '@prisma/client';
import { Loaders } from './interfaces.js';

import { profileLoader } from './entities/profiles.js';
import { postsLoader } from './entities/posts.js';
import { memberTypeLoader } from './entities/member-types.js';
import { userLoader } from './entities/users.js';

export const dataLoaders = (prisma: PrismaClient): Loaders => {
  return {
    profile: profileLoader(prisma),
    posts: postsLoader(prisma),
    memberType: memberTypeLoader(prisma),
    user: userLoader(prisma),
  };
};
