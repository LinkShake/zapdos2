import { createYoga, useExtendContext } from "graphql-yoga";
import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { createSchema } from "graphql-yoga";
import { GraphQLContext } from "./context";
import { pubSub } from "./pubsub";
import { prisma } from "../utils/prisma";
import * as dotenv from "dotenv";
import { clerkClient, clerkPlugin } from "@clerk/fastify";
import { filterUserForClient } from "../helpers/filterUserForClient";

dotenv.config();

const app = fastify({ logger: true });
const msgsArr: Array<{ text: string }> = [];

const addUserDataToChats = async (chatsArr: any[], id: string) => {
  const chats: any[] = [...chatsArr];
  const currUser = await clerkClient.users.getUser(id);
  const userId = chats.map(({ user1, user2 }) => {
    if (id !== user1) {
      return user1;
    }
    return user2;
  });

  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
    })
  ).map(filterUserForClient);

  return chats.map((chat) => {
    const chatUser = users.find(
      (user) =>
        (user.id === chat.user1 || user.id === chat.user2) && user.id !== id
    );

    // console.log("chatUser: ", chatUser);

    if (id === chat.user1) {
      // console.log("u1: ", u1);
      // console.log("u2: ", u2);
      return {
        ...chat,
        user1: {
          id: currUser?.id,
          username: currUser?.username,
          image: currUser?.profileImageUrl,
        },
        user2: {
          id: chatUser?.id,
          username: chatUser?.username,
          image: chatUser?.profileImageUrl,
        },
        notifications: Array.isArray(chat.notifications)
          ? [...chat.notifications]
          : [],
      };
    } else {
      return {
        ...chat,
        user2: {
          id: currUser?.id,
          username: currUser?.username,
          image: currUser?.profileImageUrl,
        },
        user1: {
          id: chatUser?.id,
          username: chatUser?.username,
          image: chatUser?.profileImageUrl,
        },
        notifications: Array.isArray(chat.notifications)
          ? [...chat.notifications]
          : [],
      };
    }
  });
};

const schema: any = createSchema({
  typeDefs: `
        type Query {
            hello: String,
            msgs(id: String): [Message],
            chats(id: String): [Chat],
            users(searchParams: String): [User]
        }

        type Mutation {
            sendMsg(text: String!, id: String): Message!
            deleteMsg(id: Int!, chatId: String!): [Message]
            updateMsg(id: Int!, text: String!, chatId: String!): Message!
            createChat(id: String!, id2: String!): Chat
        }

        type Subscription {
            msgsSub(id: String): PubSubType!
            newMsg: Message! 
            deletedMsg: [Message]
            updatedMsg: Message!
        }

        type Message {
            id: Int!
            text: String!
        }

        type PubSubType {
            msg: Message
            msgArr: [Message]
            type: String!
        }

        type User {
            id: String
            username: String
            image: String
        }

        type Notification {
          id: String
          counter: Int
        }

        type Id {
          id: String!
        }

        union UserData = Id | User 

        type Chat {
          id: String!
          user1: User
          user2: User
          messages: [Message]
          notifications: Notification
        }
    `,
  resolvers: {
    Query: {
      hello: () => "hello from graphql-yoga",
      msgs: async (_, { id }) => {
        const msgs = await prisma.message.findMany({
          where: {
            chatId: id,
          },
        });

        return msgs;
      },
      users: async (_, { searchParams }) => {
        const matchUsers = await clerkClient.users.getUserList();

        if (!searchParams) {
          return matchUsers;
        }

        const returnUsers = matchUsers
          .filter(
            ({ username }) =>
              username?.toLowerCase().slice(0, 4).includes(searchParams) ||
              username?.toUpperCase().slice(0, 4).includes(searchParams)
          )
          .map(({ id, username, profileImageUrl }) => {
            return {
              id,
              username,
              image: profileImageUrl,
            };
          });

        return returnUsers;
      },
      chats: async (_, { id }: { id: string }) => {
        console.log(id);
        const chats = await prisma.chat.findMany({
          where: {
            OR: [
              {
                user1: id,
              },
              {
                user2: id,
              },
            ],
          },
          include: {
            messages: true,
            notifications: true,
          },
        });

        console.log(chats[0].notifications);

        // const chatsWithUserData = chats.map(
        //   async ({ user1, user2, id, messages, notifications }) => {
        //     if (id !== user1) {
        //       const userOne = await clerkClient.users.getUser({});

        //       return {
        //         id,
        //         user1: userOne,
        //         user2,
        //         messages,
        //         notifications,
        //       };
        //     } else {
        //       const userTwo = await clerkClient.users.getUser(user2);

        //       return {
        //         id,
        //         user1,
        //         user2: userTwo,
        //         messages,
        //         notifications,
        //       };
        //     }
        //   }
        // );

        const actualChats = await addUserDataToChats(chats, id);

        return [...actualChats];
      },
    },
    Subscription: {
      msgsSub: {
        subscribe: (_, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe(`msgsSub_${id}`),
      },
      newMsg: {
        subscribe: (_, __, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe("newMsg"),
      },
      deletedMsg: {
        subscribe: (_, __, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe("deletedMsg"),
      },
      updatedMsg: {
        subscribe: (_, __, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe("updatedMsg"),
      },
    },
    Mutation: {
      sendMsg: async (
        _,
        args: { id: string; text: string },
        ctx: GraphQLContext
      ) => {
        // const chat = await prisma.chat.findUnique({
        //   where: {
        //     id: args.id,
        //   },
        //   include: {
        //     messages: true,
        //   },
        // });

        // await prisma.chat.update({
        //   where: {
        //     id: args.id,
        //   },
        //   data: {
        //     // @ts-ignore
        //     messages: [...chat?.messages, { text: args.text }],
        //   },
        // });

        // const msgs = await prisma.chat.findUnique({
        //   where: {
        //     id: args.id,
        //   },
        //   include: {
        //     messages: true,
        //   },
        // });

        // const msg = msgs?.messages[msgs.messages.length - 1];

        // const msg = msgs?.messages[msgs.messages.length - 1];
        try {
          // await prisma.chat.update({
          //   where: {
          //     id: args.id,
          //   },
          //   data: {
          //     messages: {
          //       create: { text: args.text },
          //     },
          //   },
          // });

          const msg = await prisma.message.create({
            data: {
              chatId: args.id,
              text: args.text,
            },
          });

          // const msgArr = await prisma.message.findMany({
          //   where: {
          //     chatId: args.id,
          //   },
          // });

          // const msg = msgArr[msgArr.length - 1];

          // [args.from, args.to].forEach((id) => {
          //   ctx.pubSub.publish(`newMsg_${id}`, {
          //     newMsg: { text: args.text },
          //   });
          // });
          // ctx.pubSub.publish(`newMsg_${args.from}`, {
          //   newMsg: { text: args.text },
          // });
          // ctx.pubSub.publish(`newMsg_${args.to}`, {
          //   newMsg: { text: args.text },
          // });
          ctx.pubSub.publish(`msgsSub_${args.id}`, {
            msgsSub: {
              msg,
              type: "newMsg",
            },
          });
          return { text: args.text };
        } catch (err) {
          // @ts-ignore
          console.log("error: ", err.message);
          return { text: "error" };
        }
      },
      deleteMsg: async (
        _,
        args: { id: number; chatId: string },
        ctx: GraphQLContext
      ) => {
        await prisma.chat.update({
          where: {
            id: args.chatId,
          },
          data: {
            messages: {
              delete: {
                id: args.id,
              },
            },
          },
        });

        const msgs = await prisma.message.findMany({
          where: {
            chatId: args.chatId,
          },
        });

        ctx.pubSub.publish(`msgsSub_${args.chatId}`, {
          msgsSub: {
            msgArr: [...msgs],
            type: "deletedMsg",
          },
        });

        return msgs;
      },
      updateMsg: async (
        _,
        args: { id: number; text: string; chatId: string },
        ctx: GraphQLContext
      ) => {
        await prisma.chat.update({
          where: {
            id: args.chatId,
          },
          data: {
            messages: {
              update: {
                where: { id: args.id },
                data: {
                  text: args.text,
                },
              },
            },
          },
        });
        const updatedMsg = await prisma.message.findFirst({
          where: {
            id: args.id,
            chatId: args.chatId,
          },
        });
        // const msg = await prisma.message.findUnique({ where: { id: args.id } });
        console.log(updatedMsg?.id);
        ctx.pubSub.publish(`msgsSub_${args.chatId}`, {
          msgsSub: {
            msg: {
              id: updatedMsg?.id,
              text: updatedMsg?.text,
            },
            type: "updatedMsg",
          },
        });

        return { text: updatedMsg?.text };
      },
      createChat: async (_, args: { id: string; id2: string }, __) => {
        const newChat = await prisma.chat.create({
          data: {
            user1: args.id,
            user2: args.id2,
            // messages: [] as any,
            // notifications: [] as any,
          },
        });

        return newChat;
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

app.post("/webhook", (req, res) => {
  console.log(req.body);
});

app.register(clerkPlugin);

app.listen({ port: 4000 });
