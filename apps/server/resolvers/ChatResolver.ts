import {
  Query,
  Resolver,
  Arg,
  PubSub,
  PubSubEngine,
  Mutation,
} from "type-graphql";
import { Chat } from "../types/Chat";
import { prisma } from "../utils/prisma";
import { clerkClient } from "@clerk/fastify";
import { filterUserForClient } from "../helpers/filterUserForClient";

const addUserDataToChats = async (chatsArr: any[], id: string) => {
  const chats: any[] = [...chatsArr];
  const currUser = await clerkClient.users.getUser(id);
  const userId = chats.map(({ user1, user2 }) => {
    if (id !== user1) {
      return user1;
    }
    return user2;
  });

  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
    })
  ).map(filterUserForClient);

  return chats.map((chat) => {
    const chatUser = users.find(
      (user) =>
        (user.id === chat.user1 || user.id === chat.user2) && user.id !== id
    );

    // console.log("chatUser: ", chatUser);

    if (id === chat.user1) {
      // console.log("u1: ", u1);
      // console.log("u2: ", u2);
      return {
        ...chat,
        user1: {
          id: currUser?.id,
          username: currUser?.username,
          image: currUser?.profileImageUrl,
        },
        user2: {
          id: chatUser?.id,
          username: chatUser?.username,
          image: chatUser?.profileImageUrl,
        },
        notifications: chat.notifications,
      };
    } else {
      return {
        ...chat,
        user2: {
          id: currUser?.id,
          username: currUser?.username,
          image: currUser?.profileImageUrl,
        },
        user1: {
          id: chatUser?.id,
          username: chatUser?.username,
          image: chatUser?.profileImageUrl,
        },
        notifications: chat.notifications,
      };
    }
  }) as Chat[];
};

@Resolver()
export class ChatResolver {
  @Query((returns) => [Chat])
  async chats(
    @Arg("id") id: string,
    @Arg("params") params: string
  ): Promise<Array<Chat>> {
    const chats = await prisma.chat.findMany({
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
        notifications: {
          where: {
            userId: id,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
    });

    const actualChats = await addUserDataToChats(chats, id);

    if (!params) return [...actualChats];
    else
      return actualChats.filter(({ user1, user2 }) =>
        id === user1.id
          ? user2.username.includes(params)
          : user1.username.includes(params)
      );
  }

  @Mutation((returns) => Chat)
  async createChat(
    @Arg("id") id: string,
    @Arg("id2") id2: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<any> {
    const chat = await prisma.chat.findMany({
      where: {
        OR: [
          {
            user1: id,
            user2: id2,
          },
          {
            user1: id2,
            user2: id,
          },
        ],
      },
    });

    if (chat.length) throw new Error("Chat already existing!");

    const newChat = await prisma.chat.create({
      data: {
        user1: id,
        user2: id2,
      },
      include: {
        messages: true,
        notifications: {
          where: {
            userId: id,
          },
        },
      },
    });

    const [chatWithUserData] = await addUserDataToChats([newChat], id);

    [id, id2].forEach(
      async (id) =>
        await pubSub.publish(`chatsSub_${id}`, {
          type: "newChat",
          ...chatWithUserData,
        })
    );

    return newChat;
  }
}
