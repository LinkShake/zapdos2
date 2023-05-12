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
import { Loading } from "ui";
import { UserButton, useUser } from "@clerk/nextjs/app-beta/client";
import { SubscriptionContext } from "@/context/SubscriptionContext";
import { NewChatModalContext } from "@/context/NewChatModalContext";
import { Subscriptions } from "@/context/components/Subscriptions";

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

// const USER_MUTATION = gql`
//   mutation storeUser($id: String!, $username: String!, $image: String!) {
//     storeUser(id: $id, username: $username, image: $image) {
//       id
//       username
//       image
//     }
//   }
// `;

function Home() {
  const [colorScheme, setColorScheme] = useState<"dark" | "light">("dark");
  const [chatId, setChatId] = useState<string>("");
  const changeColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  const [newChatModalState, setNewChatModalState] = useState<
    "opened" | "closed"
  >("closed");
  // const {
  //   data: msgs,
  //   loading,
  //   error,
  //   subscribeToMore,
  // } = useQuery(MSGS_QUERY, { variables: { id: chatId } });
  const { user: userData } = useUser();
  console.log("userId: ", userData?.id);
  const {
    data: chats,
    error: chatsErr,
    loading: chatsLoading,
  } = useQuery(CHATS_QUERY, { variables: { id: userData?.id } });
  const [sendMsg] = useMutation(SEND_MSG_MUTATION);
  const [deleteMsg] = useMutation(DELETE_MSG_MUTATION);
  const [updateMsg] = useMutation(UPDATE_MSG_MUTATION);

  // if (error) {
  //   return (
  //     <>
  //       <div>{error.message}</div>;<div>{error?.cause}</div>
  //     </>
  //   );
  // }

  // useEffect(() => {
  //   console.log("hi");
  //   subscribeToMore({
  //     document: MSGS_SUBSCRIPTION,
  //     variables: { id: chatId },
  //     updateQuery: (prev, { subscriptionData }) => {
  //       console.log("we are sub");
  //       console.log(subscriptionData.data);
  //       if (!subscriptionData.data) return prev;

  //       if (subscriptionData.data.msgsSub.type === "newMsg") {
  //         return Object.assign({}, prev, {
  //           msgs: [...prev.msgs, subscriptionData.data.msgsSub.msg],
  //         });
  //       } else if (subscriptionData.data.msgsSub.type === "deletedMsg") {
  //         return Object.assign({}, prev, {
  //           msgs: [...subscriptionData.data.msgsSub.msgArr],
  //         });
  //       }
  //     },
  //   });
  // }, [subscribeToMore, userData?.id, chatId]);

  // if (error) {
  //   return <div>{error.message}</div>;
  // }

  return (
    <main>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={changeColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Subscriptions>
            <NewChatModalContext.Provider
              value={{
                state: newChatModalState,
                setState: setNewChatModalState,
              }}
            >
              <App
                // useQuery={useQuery}
                // MSGS_QUERY={MSGS_QUERY}
                // MSGS_SUBSCRIPTION={MSGS_SUBSCRIPTION}
                currUser={userData?.id || ""}
                setTheme={setColorScheme}
                themeState={colorScheme}
                // chatId={chatId}
                // setChatId={setChatId}
                sendMsg={sendMsg}
                UserProfile={<UserButton />}
                chats={chats?.chats}
                deleteMsg={deleteMsg}
                updateMsg={updateMsg}
              />
              {newChatModalState === "opened" && <NewChatModal />}
            </NewChatModalContext.Provider>
          </Subscriptions>
        </MantineProvider>
      </ColorSchemeProvider>
    </main>
  );
}

const withApollo = () => (
  <ApolloProvider client={client}>
    <Home />
  </ApolloProvider>
);

export default withApollo;
