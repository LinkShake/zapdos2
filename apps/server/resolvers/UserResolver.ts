import { Query, Resolver, Arg } from "type-graphql";
import { User } from "../types/User";
import { clerkClient } from "@clerk/fastify";

@Resolver()
export class UserResolver {
  @Query((returns) => User)
  async getUser(@Arg("id") id: string): Promise<User> {
    const user = await clerkClient.users.getUser(id);
    return {
      id: user.id,
      username: user.username as string,
      image: user.profileImageUrl,
    };
  }

  @Query((returns) => [User])
  async users(): Promise<Array<User>> {
    const matchUsers = await clerkClient.users.getUserList();

    return matchUsers.map((user) => {
      return {
        id: user.id,
        username: user.username as string,
        image: user.profileImageUrl,
      };
    });
  }
}
