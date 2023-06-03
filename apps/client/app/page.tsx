"use client";
import { App, NewChatModal } from "ui";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  gql,
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { link } from "../utils/SSELink";
import { useUser } from "@clerk/nextjs/app-beta/client";
import { NewChatModalContext } from "context";
import { Subscriptions } from "context/components/Subscriptions";
import { ChatsRefetchCxt } from "context";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { OnChatsDocument, useChatsQuery } from "hooks";

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

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

// const CHATS_QUERY = gql`
//   query Chats($id: String, $params: String) {
//     chats(id: $id, params: $params) {
//       id
//       user1 {
//         id
//         username
//         image
//       }
//       user2 {
//         id
//         username
//         image
//       }
//       notifications {
//         id
//         counter
//       }
//     }
//   }
// `;

// const CHATS_SUBSCRIPTION = gql`
//   subscription ChatSub($topic: String) {
//     chatsSub(topic: $topic) {
//       type
//       id
//       user1 {
//         id
//         username
//         image
//       }
//       user2 {
//         id
//         username
//         image
//       }
//       notifications {
//         id
//         counter
//       }
//     }
//   }
// `;

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
  } = useChatsQuery({
    variables: { id: userData?.id, params: chatsParams },
    onError(error) {
      console.log(error.message);
    },
  });

  useEffect(() => {
    subscribeToMore({
      document: OnChatsDocument,
      onError(error) {
        console.log(error.message);
      },
      variables: { topic: userData?.id },
      // @ts-ignore
      updateQuery: (prev, { subscriptionData }) => {
        console.log("something has changed!");
        if (!subscriptionData.data) return prev;

        const { data: dataObj } = subscriptionData;
        // @ts-ignore
        const data = dataObj.chatsSub;

        if (data.type === "newChat") {
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
                  chats={chat?.chats as Chat[]}
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
