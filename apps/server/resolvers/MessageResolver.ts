import {
  Resolver,
  Query,
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
} from "type-graphql";
import { Message } from "../types/Message";
import { prisma } from "../utils/prisma";
import { pubSub } from "../src/pubsub";

@Resolver()
export class MessageResolver {
  @Query(() => [Message])
  async msgs(
    @Arg("chatId", { nullable: true }) chatId: string
  ): Promise<Array<Message>> {
    const msgs = await prisma.message.findMany({
      where: {
        chatId,
      },
    });

    return msgs;
  }

  //   @Subscription(() => ChatSub, {
  //     topics: ({ args }) => args.topic,
  //   })
  //   chatsSub(@Root() chatsPayload: ChatSub): ChatSub {
  //     return {
  //       ...chatsPayload,
  //     };
  //   }

  @Mutation((returns) => Message)
  async sendMsg(
    @Arg("id") id: string,
    @Arg("text") text: string,
    @Arg("to") to: string,
    @Arg("from") from: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Message> {
    const msg = await prisma.message.create({
      data: {
        chatId: id,
        text,
        from,
        to,
      },
    });

    await prisma.chat.update({
      where: {
        id,
      },
      data: {
        lastUpdate: new Date(),
      },
    });

    const prevNotifications = await prisma.notification.findFirst({
      where: {
        AND: [
          {
            userId: to,
          },
          {
            id,
          },
        ],
      },
    });

    await prisma.notification.updateMany({
      where: {
        AND: [
          {
            userId: to,
          },
          {
            id,
          },
        ],
      },
      data: {
        id,
        counter: prevNotifications?.counter ? prevNotifications.counter + 1 : 1,
      },
    });

    const updatedNotifications = await prisma.notification.findFirst({
      where: {
        AND: [
          {
            userId: to,
          },
          {
            chatId: id,
          },
        ],
      },
    });

    await pubSub.publish(`chatsSub_${to}`, {
      type: "newNotification",
      notifications: {
        id,
        counter: updatedNotifications?.counter,
      },
    });

    await pubSub.publish(`msgsSub_${id}`, {
      msg,
      type: "newMsg",
    });

    return msg;
  }

  @Mutation((returns) => [Message])
  async deleteMsg(
    @Arg("id") id: number,
    @Arg("chatId") chatId: string,

    @PubSub() pubSub: PubSubEngine
  ): Promise<Array<Message>> {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        messages: {
          delete: {
            id,
          },
        },
      },
    });

    const msgs = await prisma.message.findMany({
      where: {
        chatId,
      },
    });

    await pubSub.publish(`msgsSub_${chatId}`, {
      msgArr: [...msgs],
      type: "deletedMsg",
    });

    return msgs;
  }

  @Mutation((returns) => Message)
  async updateMsg(
    @Arg("id") id: number,
    @Arg("text") text: string,
    @Arg("chatId") chatId: string
  ): Promise<Message> {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        messages: {
          update: {
            where: { id },
            data: {
              text,
            },
          },
        },
      },
    });

    const updatedMsg = await prisma.message.findFirst({
      where: {
        id,
        chatId,
      },
    });

    await pubSub.publish(`msgsSub_${chatId}`, {
      msg: {
        id: updatedMsg?.id,
        text: updatedMsg?.text,
      },
      type: "updatedMsg",
    });

    return updatedMsg as Message;
  }
}
