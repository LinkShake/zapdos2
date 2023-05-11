import "./styles.css";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  Switch,
  Avatar,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { MsgMenu } from "./MsgMenu";
import { SubscriptionContext } from "../../apps/client/context/SubscriptionContext";
import { NewChatBtn } from "./NewChatBtn";
import { ChatAvatar } from "./ChatAvatar";
import { Chat } from "./Chat";

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
  deleteMsg: ({ variables: { id } }: { variables: { id: number } }) => void;
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
}) => {
  // const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [chatId, setChatId] = useState<string>("");
  const [chat, setChat] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(!chat);
  const [inputField, setInputField] = useState<string>("");

  return (
    <AppShell
      className="app"
      styles={{
        main: {
          background: themeState === "dark" ? "dark" : "gray",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          // color={
          //   themeState === "dark" ? theme.colors.gray[0] : theme.colors.dark[8]
          // }
          // style={{
          //   backgroundColor:
          //     themeState === "dark"
          //       ? theme.colors.gray[0]
          //       : theme.colors.dark[8],
          // }}
          width={{ sm: 200, lg: 300 }}
        >
          {/* <Text>Application navbar</Text> */}
          {chats?.map((chatMetaData) => {
            const chatUser =
              currUser === chatMetaData.user1.id
                ? chatMetaData.user2
                : chatMetaData.user1;
            return (
              <ChatAvatar
                key={chatMetaData.id}
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
        <Header height={{ base: 50, md: 70 }} p="md">
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

            {/* <Text>Application header</Text> */}
            {/* <Group position="center"> */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <Switch
                size="md"
                color={themeState === "dark" ? "gray" : "dark"}
                onLabel={
                  <IconSun
                    size="1rem"
                    stroke={2.5}
                    // color={theme.colors.yellow[4]}
                    style={{
                      cursor: "pointer",
                    }}
                    className="theme-switch"
                  />
                }
                offLabel={
                  <IconMoonStars
                    size="1rem"
                    stroke={2.5}
                    // color={theme.colors.blue[6]}
                    style={{
                      cursor: "pointer",
                    }}
                    className="theme-switch"
                  />
                }
                //   @ts-ignore
                onChange={(e) => setTheme(e.target?.checked ? "light" : "dark")}
              />
              {/* </Group> */}
              {UserProfile}
            </div>
          </div>
        </Header>
      }
    >
      {/* <Text>Resize app to see responsive navbar in action</Text> */}

      {chatId && (
        <Chat
          id={chatId}
          // msgsArr={msgsArr.length ? msgsArr : []}
          // useQuery={useQuery}
          // MSGS_QUERY={MSGS_QUERY}
          // MSGS_SUBSCRIPTION={MSGS_SUBSCRIPTION}
          sendMsg={sendMsg}
          setInputField={setInputField}
          inputField={inputField}
          deleteMsg={deleteMsg}
        />
      )}
    </AppShell>
  );
};
