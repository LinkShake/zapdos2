import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Message } from "./Message";
import { Notification } from "./Notification";

@ObjectType()
export class ChatSub {
  @Field((type) => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  user1: User;

  @Field({ nullable: true })
  user2: User;

  @Field((type) => [Message])
  messages: Message[];

  @Field()
  notifications: Notification;

  @Field()
  type: string;
}
