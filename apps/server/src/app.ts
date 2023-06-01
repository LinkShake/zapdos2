import * as dotenv from "dotenv";
dotenv.config();

import { isAuth } from "../helpers/checkAuth";
import { createYoga, useExtendContext } from "graphql-yoga";
import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { createSchema } from "graphql-yoga";
import { GraphQLContext } from "./context";
import { pubSub } from "./pubsub";
import { prisma } from "../utils/prisma";
import { clerkClient, clerkPlugin } from "@clerk/fastify";
import { filterUserForClient } from "../helpers/filterUserForClient";
import cors from "@fastify/cors";

interface IUser {
  id: string;
  username: string;
  image: string;
}

interface ChatWithData {
  id: string;
  user1: IUser;
  user2: IUser;
  notifications: {
    id: string;
    counter: number;
  };
}

const app = fastify({ logger: true });

app.register(cors, {
  origin: "http://localhost:3000",
  allowedHeaders: ["Authorization", "Content-Type"],
});

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
        notifications: chat.notifications,
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
        notifications: chat.notifications,
      };
    }
  }) as ChatWithData[];
};

const schema: any = createSchema({
  typeDefs: `
        type Query {
            hello: String,
            msgs(id: String): [Message],
            chats(id: String, params: String): [Chat],
            users: [User]
            getUser(id: String): User
        }

        type Mutation {
            sendMsg(text: String!, id: String, to: String, from: String): Message!
            deleteMsg(id: Int!, chatId: String!): [Message]
            updateMsg(id: Int!, text: String!, chatId: String!): Message!
            createChat(id: String!, id2: String!): Chat
            markAsRead(id: String, userId: String): Notification
        }

        type Subscription {
            msgsSub(id: String): PubSubType!
            chatsSub(id: String): ChatSub!
            newMsg: Message! 
            deletedMsg: [Message]
            updatedMsg: Message!
        }

        type Message {
            id: Int!
            text: String!
            from: String
            to: String
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

        type ChatSub {
          type: String
          id: String
          user1: User
          user2: User
          messages: [Message]
          notifications: Notification
        }

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
      getUser: async (_, { id }: { id: string }) => {
        const user = await clerkClient.users.getUser(id);
        return {
          ...user,
          image: user.profileImageUrl,
        };
      },
      msgs: async (_, { id }) => {
        const msgs = await prisma.message.findMany({
          where: {
            chatId: id,
          },
        });

        return msgs;
      },
      users: async () => {
        const matchUsers = await clerkClient.users.getUserList();

        return matchUsers.map((user) => {
          return {
            ...user,
            image: user.profileImageUrl,
          };
        });
      },
      chats: async (_, { id, params }: { id: string; params: string }) => {
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
          orderBy: {
            lastUpdate: "asc",
          },
        });

        const actualChats = await addUserDataToChats(chats, id);

        if (!params) return [...actualChats];
        else
          return actualChats.filter(({ user1, user2 }) =>
            id === user1.id
              ? user2.username.includes(params)
              : user1.username.includes(params)
          );
      },
    },
    Subscription: {
      msgsSub: {
        subscribe: (_, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe(`msgsSub_${id}`),
      },
      chatsSub: {
        subscribe: (_, { id }: { id: string }, ctx: GraphQLContext) =>
          ctx.pubSub.subscribe(`chatsSub_${id}`),
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
        args: { id: string; text: string; to: string; from: string },
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
              from: args.from,
              to: args.to,
            },
          });

          const chat = await prisma.chat.findUnique({
            where: {
              id: args.id,
            },
            include: {
              notifications: true,
            },
          });

          const updatedChat = await prisma.chat.update({
            where: {
              id: args.id,
            },
            data: {
              notifications: {
                create: {
                  counter: 1,
                },
                update: {
                  counter:
                    chat?.notifications?.counter &&
                    chat.notifications.counter + 1,
                },
              },
              lastUpdate: new Date(),
            },
            include: {
              notifications: true,
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
          ctx.pubSub.publish(`chatsSub_${args.to}`, {
            chatsSub: {
              type: "newNotification",
              notifications: {
                id: args.id,
                counter: updatedChat.notifications?.counter,
              },
            },
          });
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
      createChat: async (
        _,
        args: { id: string; id2: string },
        ctx: GraphQLContext
      ) => {
        const chat = await prisma.chat.findMany({
          where: {
            OR: [
              {
                user1: args.id,
                user2: args.id2,
              },
              {
                user1: args.id2,
                user2: args.id,
              },
            ],
          },
        });

        if (chat.length) throw new Error("Chat already existing!");

        const newChat = await prisma.chat.create({
          data: {
            user1: args.id,
            user2: args.id2,
            // messages: [] as any,
            // notifications: [] as any,
          },
        });

        const [chatWithUserData] = await addUserDataToChats([newChat], args.id);

        [args.id, args.id2].forEach((id) =>
          ctx.pubSub.publish(`chatsSub_${id}`, {
            chatsSub: {
              type: "newChat",
              ...chatWithUserData,
            },
          })
        );

        return newChat;
      },
      markAsRead: async (
        _,
        { id, userId }: { id: string; userId: string },
        ctx: GraphQLContext
      ) => {
        const updatedChat = await prisma.chat.update({
          where: {
            id,
          },
          data: {
            notifications: {
              update: {
                counter: 0,
              },
            },
          },
          include: { notifications: true },
        });

        // ctx.pubSub.publish(`chatsSub_${userId}`, {
        //   chatsSub: {
        //     type: "newNotification",
        //     notifications: {
        //       id,
        //       counter: updatedChat.notifications?.counter,
        //     },
        //   },
        // });

        return { counter: 0 };
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

app.register(clerkPlugin);

app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  handler: async (req, res) => {
    isAuth(req, res);
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

app.listen({ port: 4000 });
