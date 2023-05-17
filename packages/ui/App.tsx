import "./styles.css";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  MediaQuery,
  Burger,
  ActionIcon,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { NewChatBtn } from "./NewChatBtn";
import { ChatAvatar } from "./ChatAvatar";
import { Chat } from "./Chat";
import { ClerkProvider } from "@clerk/clerk-react";

interface User {
  id: string;
  username: string;
  image: string;
}

type Chats = {
  id: string;
  user1: User;
  user2: User;
  messages: Array<{ id: string; text: string }>;
  notifications: {
    id: string;
    counter: number;
  };
};

interface AppShellProps {
  currUser: string;
  setTheme: Dispatch<SetStateAction<"dark" | "light">>;
  themeState: "dark" | "light";
  // msgsArr: Array<{ text: string; id: number; chatId: string }>;
  sendMsg: ({
    variables: { text, id },
  }: {
    variables: { text: string; id: string };
  }) => void;
  UserProfile: React.ReactNode;
  chats: Chats[];
  deleteMsg: ({
    variables: { id, chatId },
  }: {
    variables: { id: number; chatId: string };
  }) => void;
  updateMsg: ({
    variables: { id, chatId, text },
  }: {
    variables: { id: number; chatId: string; text: string };
  }) => void;
  // chatId: string;
  // setChatId: React.Dispatch<React.SetStateAction<string>>;
}

export const App: React.FC<AppShellProps> = ({
  currUser,
  setTheme,
  themeState,
  sendMsg,
  UserProfile,
  chats,
  deleteMsg,
  updateMsg,
}) => {
  const theme = useMantineTheme();
  const match = useMediaQuery("(max-width: 768px)");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [chatId, setChatId] = useState<string>("");
  const [chat, setChat] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(!chat);
  const [inputField, setInputField] = useState<string>("");

  return (
    <AppShell
      // className="app"
      styles={{
        main: {
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          margin: 0,
          padding: "auto",
          paddingLeft: match ? 0 : "auto",
          paddingRight: match ? 0 : "auto",
        },
      }}
      fixed
      navbarOffsetBreakpoint="md"
      asideOffsetBreakpoint="md"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          style={{
            padding: 0,
            margin: 0,
          }}
          width={{ sm: 200, lg: 300 }}
        >
          {chats?.map((chatMetaData) => {
            const chatUser =
              currUser === chatMetaData.user1.id
                ? chatMetaData.user2
                : chatMetaData.user1;
            return (
              <ChatAvatar
                key={chatMetaData.id}
                variant="chatAvatar"
                chatUser={chatUser}
                setChat={setChat}
                setOpened={setOpened}
                setChatId={setChatId}
                {...chatMetaData}
              />
            );
          })}
          <NewChatBtn />
        </Navbar>
      }
      // aside={
      //   <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      //     <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      //       <Text>Application sidebar</Text>
      //     </Aside>
      //   </MediaQuery>
      // }
      // footer={
      //   <Footer height={60} p="md">
      //     Application footer
      //   </Footer>
      // }
      header={
        <Header
          height={{ base: 50, md: 70 }}
          p="md"
          style={
            {
              // backgroundColor: theme.colors.dark[7],
              // borderColor: theme.colors.dark[8],
              // border: "none",
            }
          }
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end",
              maxWidth: "100vw",
            }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                // color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <ActionIcon
                variant="outline"
                color={colorScheme === "dark" ? "yellow" : "blue"}
                onClick={() => toggleColorScheme()}
                title="Toggle color scheme"
              >
                {colorScheme === "dark" ? (
                  <IconSun
                    size={20}
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <IconMoonStars
                    size={20}
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                )}
              </ActionIcon>
              {/* </Group> */}
              {UserProfile}
            </div>
          </div>
        </Header>
      }
    >
      {chatId && (
        <Chat
          id={chatId}
          sendMsg={sendMsg}
          setInputField={setInputField}
          inputField={inputField}
          deleteMsg={deleteMsg}
          updateMsg={updateMsg}
        />
      )}
    </AppShell>
  );
};
