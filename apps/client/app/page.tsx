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
} from "@apollo/client";
import { link } from "../utils/SSELink";
import { UserButton, useUser } from "@clerk/nextjs/app-beta/client";
import { NewChatModalContext } from "context";
import { Subscriptions } from "context/components/Subscriptions";
import { ChatsParams, ChatsRefetchCxt } from "context";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const CHATS_QUERY = gql`
  query Chats($id: String, $params: String) {
    chats(id: $id, params: $params) {
      id
      user1 {
        id
        username
        image
      }
      user2 {
        id
        username
        image
      }
      notifications {
        id
        counter
      }
    }
  }
`;

const SEND_MSG_MUTATION = gql`
  mutation sendMsg($text: String!, $id: String!, $to: String!, $from: String!) {
    sendMsg(text: $text, id: $id, to: $to, from: $from) {
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

const CHATS_SUBSCRIPTION = gql`
  subscription ChatSub($topic: String) {
    chatsSub(topic: $topic) {
      type
      id
      user1 {
        id
        username
        image
      }
      user2 {
        id
        username
        image
      }
      notifications {
        id
        counter
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
  const [chatsParams, setChatsParams] = useState<string>("");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  useHotkeys([["mod+J", () => toggleColorScheme()]]);
  const [newChatModalState, setNewChatModalState] = useState<
    "opened" | "closed"
  >("closed");
  const { user: userData } = useUser();
  const {
    data: chat,
    loading,
    subscribeToMore,
    refetch,
  } = useQuery(CHATS_QUERY, {
    variables: { id: userData?.id, params: chatsParams },
    onError(error) {
      console.log(error.message);
    },
  });
  const [sendMsg] = useMutation(SEND_MSG_MUTATION);
  const [deleteMsg] = useMutation(DELETE_MSG_MUTATION);
  const [updateMsg] = useMutation(UPDATE_MSG_MUTATION);

  useEffect(() => {
    subscribeToMore({
      document: CHATS_SUBSCRIPTION,
      onError(error) {
        console.log(error.message);
      },
      variables: { topic: userData?.id },
      updateQuery: (prev, { subscriptionData }) => {
        // console.log("subscription hit");
        if (!subscriptionData.data) return prev;

        const { data: dataObj } = subscriptionData;
        const data = dataObj.chatsSub;

        // console.log(data);

        if (data.type === "newChat") {
          // console.log("new chat created");
          const formattedData = {
            id: data?.id,
            user1: data?.user1,
            user2: data?.user2,
            messages: data?.messages,
            notifications: data?.notifications,
          };

          return Object.assign({}, prev, {
            chats: [formattedData, ...prev.chats],
          });
        } else if (data.type === "newNotification") {
          // console.log("new notifications 4 u");
          const newData = prev.chats
            .filter((_data: any) => _data.id === data.notifications.id)
            .map((_data: any) => {
              return {
                ..._data,
                notifications: data.notifications,
              };
            });

          return Object.assign({}, prev, {
            chats: [
              ...newData,
              ...prev.chats.filter(
                (_data: any) => _data.id !== data.notifications.id
              ),
            ],
          });
        }
      },
    });
    // eslint-disable-next-line
  }, [userData?.id]);

  return (
    <main>
      <Subscriptions>
        <ChatsRefetchCxt.Provider
          value={{
            refetch,
          }}
        >
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
                          borderRadius: "none",
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
                  chats={chat?.chats}
                  deleteMsg={deleteMsg}
                  updateMsg={updateMsg}
                  isDataLoading={loading}
                />
                {newChatModalState === "opened" && <NewChatModal />}
              </MantineProvider>
            </ColorSchemeProvider>
          </NewChatModalContext.Provider>
        </ChatsRefetchCxt.Provider>
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
