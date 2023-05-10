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
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { MsgMenu } from "./MsgMenu";
import { SubscriptionContext } from "../../apps/client/context/SubscriptionContext";
import { NewChatBtn } from "./NewChatBtn";

type Users = {
  id: string;
  username: string;
  image: string;
};

interface AppShellProps {
  setTheme: Dispatch<SetStateAction<string>>;
  msgsArr: Array<{ text: string; id: number }>;
  sendMsg: ({ variables: { text } }: { variables: { text: string } }) => void;
  UserProfile: React.ReactNode;
  users: Users[];
  deleteMsg: ({ variables: { id } }: { variables: { id: number } }) => void;
}

export const App: React.FC<AppShellProps> = ({
  setTheme,
  msgsArr,
  sendMsg,
  UserProfile,
  users,
  deleteMsg,
}) => {
  const theme = useMantineTheme();
  const subscriptionAction = useContext(SubscriptionContext);
  const arr = new Array(5).fill(0);
  const [chat, setChat] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(!chat);
  const [inputField, setInputField] = useState<string>("");

  return (
    <AppShell
      className="app"
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          {/* <Text>Application navbar</Text> */}
          {users?.map(({ id, username, image }) => (
            <div
              key={id}
              onClick={() => {
                setChat(() => {
                  setOpened(false);
                  return true;
                });
              }}
              style={{
                border: "2px solid red",
              }}
            >
              <Image src={image} alt="user_profile" width={40} height={40} />
              <h3>{username}</h3>
            </div>
          ))}
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
              justifyContent: "space-around",
              maxWidth: "100vw",
            }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
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
                color={theme.colorScheme === "dark" ? "gray" : "dark"}
                onLabel={
                  <IconSun
                    size="1rem"
                    stroke={2.5}
                    color={theme.colors.yellow[4]}
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
                    color={theme.colors.blue[6]}
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
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          width: "fit-content",
          gap: "10px",
        }}
      >
        {msgsArr?.map(({ text, id }) => (
          <MsgMenu key={id} text={text} id={id} deleteMsg={deleteMsg} />
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // subscriptionAction?.setState("newMsg");
          sendMsg({ variables: { text: inputField } });
          setInputField("");
        }}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        <input
          type="text"
          style={{
            width: "85%",
            marginLeft: 0,
            paddingLeft: 0,
          }}
          placeholder="Type something..."
          value={inputField}
          onChange={(e) => {
            const evt =
              e.target as unknown as React.ChangeEvent<HTMLInputElement>;
            // @ts-ignore
            setInputField(evt?.value);
          }}
        />
      </form>
    </AppShell>
  );
};
