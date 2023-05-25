import { FastifyReply, FastifyRequest } from "fastify";
import { __production__ } from "../constants/constants";
import { getAuth } from "@clerk/fastify";

export const isAuth = async (req: FastifyRequest, res: FastifyReply) => {
  const { sessionId } = await getAuth(req);
  if (__production__ && !sessionId) {
    res.status(401);
    res.send({ err: "User could not be verified" });
  }
};
