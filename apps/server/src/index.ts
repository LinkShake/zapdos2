import { createYoga, useExtendContext } from "graphql-yoga";
import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { createSchema } from "graphql-yoga";
import { GraphQLContext } from "./context";
import { pubSub } from "./pubsub";
import { prisma } from "../utils/prisma";

const app = fastify({ logger: true });
const msgsArr: Array<{ text: string }> = [];

const schema: any = createSchema({
  typeDefs: `
        type Query {
            hello: String,
            msgs: [Message]
        }

        type Mutation {
            sendMsg(text: String!): Message!
            storeUser(id: String!, username: String!, image: String!): User!
        }

        type Subscription {
            newMsg: Message!
        }

        type Message {
            text: String!
        }

        type User {
            id: String!  
            username: String!
            image: String
        }
    `,
  resolvers: {
    Query: {
      hello: () => "hello from graphql-yoga",
      msgs: () => prisma.message.findMany(),
    },
    Subscription: {
      newMsg: {
        subscribe: (_, __, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe("newMsg"),
      },
    },
    Mutation: {
      sendMsg: async (_, args: { text: string }, ctx: GraphQLContext) => {
        await prisma.message.create({
          data: {
            text: args.text,
          },
        });
        ctx.pubSub.publish("newMsg", { newMsg: { text: args.text } });
        return { text: args.text };
      },
      storeUser: async (_, args, ctx: GraphQLContext) => {
        const user = await prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
        if (user) return user;
        else {
          const newUser = await prisma.user.create({
            data: {
              id: args.id,
              username: args.username,
              image: args?.image,
            },
          });
          return newUser;
        }
      },
    },
  },
});

const yoga = createYoga<{
  req: FastifyRequest;
  res: FastifyReply;
}>({
  schema,
  graphiql: {
    defaultQuery: `
      query {
        hello
      }
        `,
  },
  // eslint-disable-next-line react-hooks/rules-of-hooks
  plugins: [useExtendContext(() => ({ pubSub }))],
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
});

console.log("hello world!");

app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  handler: async (req, res) => {
    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await yoga.handleNodeRequest(req, {
      req,
      //@ts-ignore
      res,
    });
    response.headers.forEach((value, key) => {
      res.header(key, value);
    });

    res.status(response.status);

    res.send(response.body);

    return res;
  },
});

app.listen({ port: 4000 });
