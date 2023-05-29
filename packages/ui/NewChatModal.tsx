"use client";
import { useContext, useEffect, useState } from "react";
import { NewChatModalContext } from "context";
import { Flex, Input, TextInput, useMantineTheme } from "@mantine/core";
import { useQuery, gql } from "@apollo/client";
import { ChatAvatar } from "./ChatAvatar";
import { useUser } from "@clerk/clerk-react";

export const NewChatModal = () => {
  const { user } = useUser();
  const ctx = useContext(NewChatModalContext);
  const theme = useMantineTheme();
  const [searchedUser, setSearchedUser] = useState<string>("");
  const { data, error, refetch } = useQuery(
    gql`
      query Users($searchParams: String) {
        users(searchParams: $searchParams) {
          id
          username
          image
        }
      }
    `,
    {
      variables: { searchParams: searchedUser },
      onError(error) {
        console.log(error.message);
      },
    }
  );

  useEffect(() => {
    const onEscapeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") ctx?.setState("closed");
    };

    // @ts-ignore
    window?.addEventListener("keydown", onEscapeKey);
    // @ts-ignore
    return () => window?.removeEventListener("keydown", onEscapeKey);
  });

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <div
        className="new-chat-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: " blur(4px)",
          zIndex: 100,
          transition: "all 0.5s",
        }}
        onClick={() => ctx?.setState("closed")}
      ></div>
      <div
        className="new-chat-component"
        style={{
          width: "50vw",
          height: "50vh",
          position: "absolute",
          left: "30%",
          top: "15%",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : "white",
          borderRadius: ".75rem",
          zIndex: 100,
        }}
      >
        <Flex justify="center" align="center" direction="column" wrap="wrap">
          <TextInput
            placeholder="Search for a user..."
            value={searchedUser}
            onChange={(e) => {
              // @ts-ignore
              setSearchedUser(e.target?.value);
              // @ts-ignore
              refetch({ searchParams: e.target?.value });
            }}
          />
          <div>
            {data?.users?.map(
              (props: { id: string; username: string; image: string }) => {
                return (
                  <ChatAvatar
                    key={props.id}
                    variant="userAvatar"
                    chatUser={props}
                    myId={user?.id}
                  />
                );
              }
            )}
          </div>
        </Flex>
      </div>
    </>
  );
};
