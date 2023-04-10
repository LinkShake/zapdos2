import { PrismaClient } from "@prisma/client";
import { YogaInitialContext } from "graphql-yoga";
import { pubSub } from "./pubsub";

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  pubSub: typeof pubSub;
};

export async function createContext(
  initialContext: YogaInitialContext
): Promise<GraphQLContext> {
  return {
    prisma,
    pubSub,
  };
}
