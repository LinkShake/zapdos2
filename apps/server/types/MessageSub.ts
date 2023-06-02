import { Field, ObjectType } from "type-graphql";
import { Message } from "./Message";

@ObjectType()
export class MessageSub {
  @Field({ nullable: true })
  msg?: Message;

  @Field((type) => [Message], { nullable: true })
  msgsArr?: Message[];

  @Field()
  type: string;
}
