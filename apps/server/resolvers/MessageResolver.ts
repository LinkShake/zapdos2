import {
  Resolver,
  Query,
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
  Field,
  Args,
} from "type-graphql";
import { Message, MessageArgs } from "../types/Message";
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

  @Mutation((returns) => Message)
  async sendMsg(
    @Arg("id") id: string,
    @Arg("text") text: string,
    @Arg("to") to: string,
    @Arg("from") from: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Message> {
    console.log("id: ", id);
    console.log("text: ", text);
    console.log("from: ", from);
    console.log("to: ", to);
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

    // @ts-ignore
    if (!prevNotifications && !prevNotifications?.counter) {
      const newNotification = await prisma.notification.create({
        data: {
          id,
          chatId: id,
          userId: to,
          counter: 1,
        },
      });

      await pubSub.publish(`chatsSub_${to}`, {
        type: "newNotification",
        notifications: {
          id,
          counter: newNotification?.counter,
        },
      });
    }

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
            id,
          },
        ],
      },
    });

    console.log("updatedNotifications: ", updatedNotifications);

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
    @Args() { id, chatId }: MessageArgs,
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
      msgsArr: [...msgs],
      type: "deletedMsg",
    });

    return msgs;
  }

  @Mutation((returns) => Message)
  async updateMsg(@Args() { id, chatId, text }: MessageArgs): Promise<Message> {
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
