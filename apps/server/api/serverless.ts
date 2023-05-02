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

// @ts-ignore
const handler = async (req, res) => {
  await app.ready();
  res?.setHeader("Access-Control-Allow-Origin", "*");
  app.server.emit("request", req, res);
};

export default handler;
