import { FastifyRequest } from "fastify";
import { __production__ } from "../constants/constants";
import { getAuth } from "@clerk/fastify";

export const isAuth = async (req: FastifyRequest) => {
  const session = await getAuth(req);
  if (__production__ && !session) {
    throw new Error("Not authenticated user");
  }
};
