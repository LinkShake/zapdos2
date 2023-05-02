"use strict";
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
function appHandler() {
    const app = (0, fastify_1.default)({ logger: false });
    const msgsArr = [];
    const schema = (0, graphql_yoga_2.createSchema)({
        typeDefs: `
        type Query {
            hello: String,
            msgs(id: String): [Message],
            users: [User]
        }

        type Mutation {
            sendMsg(text: String!, from: String!, to: String!): Message!
            storeUser(id: String!, username: String!, image: String!): User!
        }

        type Subscription {
            newMsg(id: String!): Message!
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
                msgs: (id) => {
                    // console.log(id);
                    return prisma_1.prisma.message.findMany();
                },
                users: () => prisma_1.prisma.user.findMany(),
            },
            Subscription: {
                newMsg: {
                    subscribe: (_, args, ctx) => ctx.pubSub.subscribe(`newMsg_${args.id}`),
                },
            },
            Mutation: {
                sendMsg: (_, args, ctx) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma_1.prisma.message.create({
                        data: {
                            text: args.text,
                        },
                    });
                    [args.from, args.to].forEach((id) => {
                        ctx.pubSub.publish(`newMsg_${id}`, {
                            newMsg: { text: args.text },
                        });
                    });
                    // ctx.pubSub.publish(`newMsg_${args.from}`, {
                    //   newMsg: { text: args.text },
                    // });
                    // ctx.pubSub.publish(`newMsg_${args.to}`, {
                    //   newMsg: { text: args.text },
                    // });
                    return { text: args.text };
                }),
                storeUser: (_, args, ctx) => __awaiter(this, void 0, void 0, function* () {
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
        // logging: {
        //   debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
        //   info: (...args) => args.forEach((arg) => app.log.info(arg)),
        //   warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
        //   error: (...args) => args.forEach((arg) => app.log.error(arg)),
        // },
    });
    console.log("hello world!");
    app.route({
        url: "/graphql",
        method: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        handler: (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        console.log(req);
    });
    app.listen({ port: 4000 });
}
exports.default = appHandler;
