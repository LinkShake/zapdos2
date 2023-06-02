import { Arg, Resolver, Root, Subscription } from "type-graphql";
import { MessageSub } from "../types/MessageSub";
import { ChatSub } from "../types/ChatSub";

@Resolver()
export class SubscriptionResolver {
  @Subscription(() => MessageSub, {
    topics: ({ args }) => `msgsSub_${args.topic}`,
  })
  msgsSub(
    @Root() messagePayload: MessageSub,
    @Arg("topic") topic: string
  ): MessageSub {
    return {
      ...messagePayload,
    };
  }

  @Subscription(() => ChatSub, {
    topics: ({ args }) => `chatsSub_${args.topic}`,
  })
  chatsSub(@Root() chatPayload: ChatSub, @Arg("topic") topic: string): ChatSub {
    return {
      ...chatPayload,
    };
  }
}
