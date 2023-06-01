"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { NewChatModalContext } from "context";
import { Flex, Input, TextInput, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery, gql } from "@apollo/client";
import { ChatPreview } from "./ChatPreview";
import { useUser } from "@clerk/clerk-react";

interface User {
  id: string;
  username: string;
  image: string;
  // profileImageUrl: string;
}

export const NewChatModal = () => {
  const match = useMediaQuery("(max-width: 1400px)");
  const { user } = useUser();
  const ctx = useContext(NewChatModalContext);
  const theme = useMantineTheme();
  const [searchedUser, setSearchedUser] = useState<string>("");
  const { data, error } = useQuery(
    gql`
      query {
        users {
          id
          username
          image
        }
      }
    `,
    {
      onError(error) {
        console.log(error.message);
      },
    }
  );
  const [usersArr, setUsersArr] = useState<User[]>(data?.users);
  const updatedUsersArr = useMemo(() => {
    console.log(searchedUser);
    return searchedUser
      ? usersArr?.filter(
          ({ username }) =>
            username?.toLowerCase().includes(searchedUser) ||
            username?.toUpperCase().includes(searchedUser)
        )
      : data?.users;
  }, [usersArr, searchedUser, data?.users]);

  useEffect(() => {
    const onEscapeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") ctx?.setState("closed");
    };

    // @ts-ignore
    window?.addEventListener("keydown", onEscapeKey);
    // @ts-ignore
    return () => window?.removeEventListener("keydown", onEscapeKey);
  });

  useEffect(() => {
    setUsersArr(data?.users);
  }, [data?.users]);

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
          width: "20rem",
          height: "40rem",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
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
              setSearchedUser(e.target?.value);
              setUsersArr(updatedUsersArr);
              // refetch({ searchParams: e.target?.value });
            }}
            style={{
              marginTop: "1rem",
            }}
          />
          <ul
            style={{
              maxHeight: "15rem",
              overflowY: "auto",
            }}
          >
            {usersArr?.map(
              (props: { id: string; username: string; image: string }) => {
                return (
                  <ChatPreview
                    key={props.id}
                    variant="userAvatar"
                    chatUser={props}
                    myId={user?.id}
                  />
                );
              }
            )}
          </ul>
        </Flex>
      </div>
    </>
  );
};
