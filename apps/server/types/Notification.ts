import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Notification {
  @Field((type) => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  counter: number;

  @Field({ nullable: true })
  userId: string;
}
