import { createPubSub } from "graphql-yoga";

type Message = {
  text: string;
};

export type PubSubChannel = {
  newMsg: [{ newMsg: Message }];
};

export const pubSub = createPubSub<PubSubChannel>();
