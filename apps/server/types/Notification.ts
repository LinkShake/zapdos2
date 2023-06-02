import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Notification {
  @Field((type) => ID)
  id: string;

  @Field()
  counter: number;
}
