import { Resolver, Mutation, Arg, PubSub, PubSubEngine } from "type-graphql";
import { prisma } from "../utils/prisma";
import { Notification } from "../types/Notification";

type NotificationReturnType = {
  counter: number;
};

@Resolver()
export class NotificationResolver {
  @Mutation((type) => Notification)
  async markAsRead(
    @Arg("id", { nullable: true }) id: string,
    @Arg("userId", { nullable: true }) userId: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Notification> {
    console.log("userId: ", userId);
    await prisma.notification.updateMany({
      where: {
        AND: [{ userId }, { chatId: id }],
      },
      data: {
        counter: 0,
      },
    });

    const updatedNotifications = await prisma.notification.findFirst({
      where: {
        AND: [{ userId }, { chatId: id }],
      },
    });

    console.log(updatedNotifications);

    await pubSub.publish(`chatsSub_${userId}`, {
      type: "newNotification",
      notifications: {
        id,
        counter: 0,
      },
    });

    return updatedNotifications as Notification;
  }
}
