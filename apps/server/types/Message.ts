import { Field, ID, ObjectType } from "type-graphql";

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
