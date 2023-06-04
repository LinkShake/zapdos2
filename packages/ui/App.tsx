import "./styles.css";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  AppShell,
  Navbar,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
// import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { NewChatBtn } from "./NewChatBtn";
import { ChatPreview } from "./ChatPreview";
import { Chat } from "./Chat";
import { useMutation, gql } from "@apollo/client";
import { DashboardNavbar } from "./DashboardNavbar";
import { ChatsLoading } from "./loading/ChatsLoading";
import { useMarkAsReadMutation } from "hooks";
import { useUser } from "@clerk/clerk-react";

interface User {
  id: string;
  username: string;
  image: string;
}

type Chat = {
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
  chats: Chat[];
  isDataLoading: boolean;
}

export const App: React.FC<AppShellProps> = ({
  currUser,
  chats,
  isDataLoading,
}) => {
  const theme = useMantineTheme();
  const matchSm = useMediaQuery("(min-width: 48em)");
  const matchLg = useMediaQuery("(min-width: 75em)");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [chatId, setChatId] = useState<string>("");
  const [chatUserId, setChatUserId] = useState<string>("");
  const [chat, setChat] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(!chat);
  const [inputField, setInputField] = useState<string>("");
  const [markAsRead] = useMarkAsReadMutation({
    variables: { id: chatId, userId: currUser },
  });
  const { user: me } = useUser();

  return (
    <AppShell
      // className="app"
      styles={{
        main: {
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          margin: "0px !important",
          top: 0,
          right: 0,
          // padding: "auto",
          paddingLeft: matchSm ? (matchLg ? "300px" : "200px") : "0px",
          // paddingLeft: "300px",
          paddingTop: "0px !important",
          paddingBottom: "0px !important",
          paddingRight: "0px !important",
          // border: "2px solid yellow",
          // paddingLeft:
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
          <DashboardNavbar />
          {isDataLoading ? (
            <>
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
              <ChatsLoading />
            </>
          ) : chats?.length ? (
            chats?.map((chatMetaData) => {
              const chatUser =
                currUser === chatMetaData.user1.id
                  ? chatMetaData.user2
                  : chatMetaData.user1;
              return (
                <ChatPreview
                  onClick={markAsRead}
                  key={chatMetaData.id}
                  myId={me?.id}
                  variant="chatAvatar"
                  chatUser={chatUser}
                  setChat={setChat}
                  setOpened={setOpened}
                  setChatId={setChatId}
                  setChatUserId={setChatUserId}
                  {...chatMetaData}
                />
              );
            })
          ) : (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                paddingTop: "2rem",
              }}
            >
              <Text fw={700}>No such user or chat</Text>
            </div>
          )}
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
      // header={
      //   <Header
      //     height={{ base: 45, md: 70 }}
      //     p="md"
      //     style={
      //       {
      //         // backgroundColor: theme.colors.dark[7],
      //         // borderColor: theme.colors.dark[8],
      //         // border: "none",
      //       }
      //     }
      //   >
      //     <div
      //       style={{
      //         display: "flex",
      //         alignItems: "center",
      //         height: "100%",
      //         justifyContent: "flex-end",
      //         maxWidth: "100vw",
      //       }}
      //     >
      //       <MediaQuery largerThan="sm" styles={{ display: "none" }}>
      //         <Burger
      //           opened={opened}
      //           onClick={() => setOpened((o) => !o)}
      //           size="sm"
      //           // color={theme.colors.gray[6]}
      //           mr="xl"
      //         />
      //       </MediaQuery>

      //       <div
      //         style={{
      //           display: "flex",
      //           gap: "1rem",
      //           alignItems: "center",
      //         }}
      //       >
      //         <ActionIcon
      //           variant="outline"
      //           color={colorScheme === "dark" ? "yellow" : "blue"}
      //           onClick={() => toggleColorScheme()}
      //           title="Toggle color scheme"
      //         >
      //           {colorScheme === "dark" ? (
      //             <IconSun
      //               size={20}
      //               style={{
      //                 borderRadius: "45%",
      //               }}
      //             />
      //           ) : (
      //             <IconMoonStars
      //               size={20}
      //               style={{
      //                 borderRadius: "45%",
      //               }}
      //             />
      //           )}
      //         </ActionIcon>
      //         {/* </Group> */}
      //         {UserProfile}
      //       </div>
      //     </div>
      //   </Header>
      // }
    >
      {chatId && (
        <Chat
          id={chatId}
          chatUserId={chatUserId}
          setInputField={setInputField}
          inputField={inputField}
          setChatId={setChatId}
          setChat={setChat}
          setOpened={setOpened}
        />
      )}
    </AppShell>
  );
};
