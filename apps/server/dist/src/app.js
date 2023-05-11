"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const fastify_1 = __importDefault(require("fastify"));
const graphql_yoga_2 = require("graphql-yoga");
const pubsub_1 = require("./pubsub");
const prisma_1 = require("../utils/prisma");
const dotenv = __importStar(require("dotenv"));
const fastify_2 = require("@clerk/fastify");
const filterUserForClient_1 = require("../helpers/filterUserForClient");
dotenv.config();
const app = (0, fastify_1.default)({ logger: true });
const msgsArr = [];
const addUserDataToChats = (chatsArr, id) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = [...chatsArr];
    const currUser = yield fastify_2.clerkClient.users.getUser(id);
    const userId = chats.map(({ user1, user2 }) => {
        if (id !== user1) {
            return user1;
        }
        return user2;
    });
    const users = (yield fastify_2.clerkClient.users.getUserList({
        userId: userId,
    })).map(filterUserForClient_1.filterUserForClient);
    return chats.map((chat) => {
        const chatUser = users.find((user) => (user.id === chat.user1 || user.id === chat.user2) && user.id !== id);
        console.log("chatUser: ", chatUser);
        if (id === chat.user1) {
            const u1 = {
                id: currUser === null || currUser === void 0 ? void 0 : currUser.id,
                username: currUser === null || currUser === void 0 ? void 0 : currUser.username,
                image: currUser === null || currUser === void 0 ? void 0 : currUser.profileImageUrl,
            };
            const u2 = {
                id: chatUser === null || chatUser === void 0 ? void 0 : chatUser.id,
                username: chatUser === null || chatUser === void 0 ? void 0 : chatUser.username,
                image: chatUser === null || chatUser === void 0 ? void 0 : chatUser.profileImageUrl,
            };
            console.log("u1: ", u1);
            console.log("u2: ", u2);
            return Object.assign(Object.assign({}, chat), { user1: {
                    id: currUser === null || currUser === void 0 ? void 0 : currUser.id,
                    username: currUser === null || currUser === void 0 ? void 0 : currUser.username,
                    image: currUser === null || currUser === void 0 ? void 0 : currUser.profileImageUrl,
                }, user2: {
                    id: chatUser === null || chatUser === void 0 ? void 0 : chatUser.id,
                    username: chatUser === null || chatUser === void 0 ? void 0 : chatUser.username,
                    image: chatUser === null || chatUser === void 0 ? void 0 : chatUser.profileImageUrl,
                }, notifications: Array.isArray(chat.notifications)
                    ? [...chat.notifications]
                    : [] });
        }
        else {
            const u2 = {
                id: currUser === null || currUser === void 0 ? void 0 : currUser.id,
                username: currUser === null || currUser === void 0 ? void 0 : currUser.username,
                image: currUser === null || currUser === void 0 ? void 0 : currUser.profileImageUrl,
            };
            const u1 = {
                id: chatUser === null || chatUser === void 0 ? void 0 : chatUser.id,
                username: chatUser === null || chatUser === void 0 ? void 0 : chatUser.username,
                image: chatUser === null || chatUser === void 0 ? void 0 : chatUser.profileImageUrl,
            };
            console.log("u2: ", u2);
            console.log("u1: ", u1);
            return Object.assign(Object.assign({}, chat), { user2: {
                    id: currUser === null || currUser === void 0 ? void 0 : currUser.id,
                    username: currUser === null || currUser === void 0 ? void 0 : currUser.username,
                    image: currUser === null || currUser === void 0 ? void 0 : currUser.profileImageUrl,
                }, user1: {
                    id: chatUser === null || chatUser === void 0 ? void 0 : chatUser.id,
                    username: chatUser === null || chatUser === void 0 ? void 0 : chatUser.username,
                    image: chatUser === null || chatUser === void 0 ? void 0 : chatUser.profileImageUrl,
                }, notifications: Array.isArray(chat.notifications)
                    ? [...chat.notifications]
                    : [] });
        }
    });
});
const schema = (0, graphql_yoga_2.createSchema)({
    typeDefs: `
        type Query {
            hello: String,
            msgs(id: String): [Message],
            chats(id: String!): [Chat],
            users: [User]
        }

        type Mutation {
            sendMsg(text: String!, from: String, to: String): Message!
            deleteMsg(id: Int!): [Message]
            updateMsg(id: Int!, text: String!): Message!
            createChat(id: String!, id2: String!): Chat
            storeUser(id: String!, username: String!, image: String!): User!
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
            msgs: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
                const msgs = yield prisma_1.prisma.message.findUnique({
                    where: {
                        chatId: id,
                    },
                });
                return msgs;
            }),
            users: () => prisma_1.prisma.user.findMany(),
            chats: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(id);
                const chats = yield prisma_1.prisma.chat.findMany({
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
                const actualChats = yield addUserDataToChats(chats, id);
                console.log("actualsChats: ", actualChats);
                return [...actualChats];
            }),
        },
        Subscription: {
            msgsSub: {
                subscribe: (_, { id }, ctx) => ctx.pubSub.subscribe(`msgsSub_${id}`),
            },
            newMsg: {
                subscribe: (_, __, ctx) => ctx.pubSub.subscribe("newMsg"),
            },
            deletedMsg: {
                subscribe: (_, __, ctx) => ctx.pubSub.subscribe("deletedMsg"),
            },
            updatedMsg: {
                subscribe: (_, __, ctx) => ctx.pubSub.subscribe("updatedMsg"),
            },
        },
        Mutation: {
            sendMsg: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const chat = yield prisma_1.prisma.chat.findUnique({
                    where: {
                        id: args.id,
                    },
                    include: {
                        messages: true,
                    },
                });
                yield prisma_1.prisma.chat.update({
                    where: {
                        id: args.id,
                    },
                    data: {
                        // @ts-ignore
                        messages: [...chat === null || chat === void 0 ? void 0 : chat.messages, { text: args.text }],
                    },
                });
                const msgs = yield prisma_1.prisma.chat.findUnique({
                    where: {
                        id: args.id,
                    },
                    include: {
                        messages: true,
                    },
                });
                const msg = msgs === null || msgs === void 0 ? void 0 : msgs.messages[msgs.messages.length - 1];
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
            }),
            deleteMsg: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma_1.prisma.message.delete({
                    where: {
                        id: args.id,
                    },
                });
                const msgs = yield prisma_1.prisma.message.findMany();
                ctx.pubSub.publish("msgsSub", {
                    msgsSub: {
                        msgArr: [...msgs],
                        type: "deletedMsg",
                    },
                });
                return msgs;
            }),
            updateMsg: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const updatedMsg = yield prisma_1.prisma.message.update({
                    where: {
                        id: args.id,
                    },
                    data: {
                        text: args.text,
                    },
                });
                // const msg = await prisma.message.findUnique({ where: { id: args.id } });
                ctx.pubSub.publish("msgsSub", {
                    msgsSub: {
                        msg: updatedMsg,
                        type: "updatedMsg",
                    },
                });
                return { text: updatedMsg === null || updatedMsg === void 0 ? void 0 : updatedMsg.text };
            }),
            createChat: (_, args, __) => __awaiter(void 0, void 0, void 0, function* () {
                const newChat = yield prisma_1.prisma.chat.create({
                    data: {
                        user1: args.id,
                        user2: args.id2,
                        // messages: [] as any,
                        // notifications: [] as any,
                    },
                });
                return newChat;
            }),
            storeUser: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield prisma_1.prisma.user.findUnique({
                    where: {
                        id: args.id,
                    },
                });
                if (user)
                    return user;
                else {
                    const newUser = yield prisma_1.prisma.user.create({
                        data: {
                            id: args.id,
                            username: args.username,
                            image: args === null || args === void 0 ? void 0 : args.image,
                        },
                    });
                    return newUser;
                }
            }),
        },
    },
});
const yoga = (0, graphql_yoga_1.createYoga)({
    schema,
    graphiql: {
        defaultQuery: `
      query {
        hello
      }
        `,
    },
    // eslint-disable-next-line react-hooks/rules-of-hooks
    plugins: [(0, graphql_yoga_1.useExtendContext)(() => ({ pubSub: pubsub_1.pubSub }))],
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
    handler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
        const response = yield yoga.handleNodeRequest(req, {
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
    }),
});
app.post("/webhook", (req, res) => {
    console.log(req.body);
});
app.register(fastify_2.clerkPlugin);
app.listen({ port: 4000 });
