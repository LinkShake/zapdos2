import { ArgsType, Field, ID, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Message {
  @Field((type) => ID)
  id: number;

  @Field()
  text: string;

  @Field()
  from: string;

  @Field()
  to: string;
}

@ArgsType()
export class MessageArgs {
  @Field((type) => Int)
  id: number;

  @Field()
  chatId: string;

  @Field({ nullable: true })
  text: string;
}
