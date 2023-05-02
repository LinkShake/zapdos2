"use strict";

// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// app.register(cors, {
//   origin: "http://localhost:3000",
// });

// Register your application as a normal plugin.
app.register(import("../src/app"), {
  prefix: "/",
});

const handler = async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  res.header("Access-Control-Allow-Origin", "*");
  app.server.emit("request", req, res);
};

export default handler;
