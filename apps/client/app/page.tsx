"use client";
import { App, NewChatModal } from "ui";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  useQuery,
  gql,
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  useMutation,
  DocumentNode,
} from "@apollo/client";
import { link } from "../utils/SSELink";
import { UserButton, useUser } from "@clerk/nextjs/app-beta/client";
import { NewChatModalContext } from "@/context/NewChatModalContext";
import { Subscriptions } from "@/context/components/Subscriptions";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const MSGS_QUERY = gql`
  query Msgs($id: String) {
    msgs(id: $id) {
      id
      text
    }
  }
`;

const CHATS_QUERY = gql`
  query Chats($id: String) {
    chats(id: $id) {
      id
      user1 {
        id
        image
        username
      }
      user2 {
        id
        image
        username
      }
      messages {
        id
        text
      }
      notifications {
        id
        counter
      }
    }
  }
`;

const SEND_MSG_MUTATION = gql`
  mutation sendMsg($text: String!, $id: String!) {
    sendMsg(text: $text, id: $id) {
      text
    }
  }
`;

const DELETE_MSG_MUTATION = gql`
  mutation deleteMsg($id: Int!, $chatId: String!) {
    deleteMsg(id: $id, chatId: $chatId) {
      text
    }
  }
`;

const UPDATE_MSG_MUTATION = gql`
  mutation updateMsg($id: Int!, $text: String!, $chatId: String!) {
    updateMsg(id: $id, text: $text, chatId: $chatId) {
      id
      text
    }
  }
`;

const MSGS_SUBSCRIPTION = gql`
  subscription msgsSub($id: String) {
    msgsSub(id: $id) {
      msg {
        id
        text
      }
      type
      msgsArr {
        id
        text
      }
    }
  }
`;

function Home() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  useHotkeys([["mod+J", () => toggleColorScheme()]]);
  const [newChatModalState, setNewChatModalState] = useState<
    "opened" | "closed"
  >("closed");
  const { user: userData } = useUser();
  const { data: chats } = useQuery(CHATS_QUERY, {
    variables: { id: userData?.id },
  });
  const [sendMsg] = useMutation(SEND_MSG_MUTATION);
  const [deleteMsg] = useMutation(DELETE_MSG_MUTATION);
  const [updateMsg] = useMutation(UPDATE_MSG_MUTATION);

  return (
    <main>
      <Subscriptions>
        <NewChatModalContext.Provider
          value={{
            state: newChatModalState,
            setState: setNewChatModalState,
          }}
        >
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <MantineProvider
              theme={{
                colorScheme,
                fontFamily: "Roboto, sans-serif",
                components: {
                  InputWrapper: {
                    styles: (theme) => ({
                      label: {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : "white",
                      },
                    }),
                  },
                  Input: {
                    styles: (theme) => ({
                      input: {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : "white",
                      },
                    }),
                  },
                },
              }}
              withGlobalStyles
              withNormalizeCSS
            >
              <App
                currUser={userData?.id || ""}
                setTheme={setColorScheme}
                themeState={colorScheme}
                sendMsg={sendMsg}
                UserProfile={<UserButton />}
                chats={chats?.chats}
                deleteMsg={deleteMsg}
                updateMsg={updateMsg}
              />
              {newChatModalState === "opened" && <NewChatModal />}
            </MantineProvider>
          </ColorSchemeProvider>
        </NewChatModalContext.Provider>
      </Subscriptions>
    </main>
  );
}

const withApollo = () => (
  <ApolloProvider client={client}>
    <Home />
  </ApolloProvider>
);

export default withApollo;
