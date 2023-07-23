import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export interface Context {
  prisma: PrismaClient;
  loaders: Loaders;
}

export type LoaderType = DataLoader<string, unknown | undefined>;

export interface Loaders {
  profile: LoaderType;
  posts: LoaderType;
  memberType: LoaderType;
  user: LoaderType;
}
