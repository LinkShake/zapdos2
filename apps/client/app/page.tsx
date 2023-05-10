"use client";
import { App, NewChatModal } from "ui";
import { ColorScheme, MantineProvider } from "@mantine/core";
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

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const MSGS_QUERY = gql`
  query msgs {
    msgs {
      id
      text
    }
  }
`;

const SEND_MSG_MUTATION = gql`
  mutation sendMsg($text: String!) {
    sendMsg(text: $text) {
      text
    }
  }
`;

const DELETE_MSG_MUTATION = gql`
  mutation deleteMsg($id: Int!) {
    deleteMsg(id: $id) {
      text
    }
  }
`;

const UPDATE_MSG_MUTATION = gql`
  mutation updateMsg($id: Int!, $text: String!) {
    deleteMsg(id: $id, text: $text) {
      id
      text
    }
  }
`;

const MSGS_SUBSCRIPTION = gql`
  subscription {
    msgsSub {
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
  const [theme, setTheme] = useState<string>("dark");
  const [newChatModalState, setNewChatModalState] = useState<
    "opened" | "closed"
  >("closed");
  const { data: msgs, loading, error, subscribeToMore } = useQuery(MSGS_QUERY);
  const { user: userData } = useUser();
  console.log("userId: ", userData?.id);
  const {
    data: users,
    loading: usersLoading,
    error: err,
    subscribeToMore: moreUsers,
  } = useQuery(gql`
    query {
      users {
        id
        username
        image
      }
    }
  `);
  const [sendMsg] = useMutation(SEND_MSG_MUTATION);
  const [deleteMsg] = useMutation(DELETE_MSG_MUTATION);

  useEffect(() => {
    subscribeToMore({
      document: gql`
        subscription {
          msgsSub {
            msg {
              id
              text
            }
            type
            msgArr {
              id
              text
            }
          }
        }
      `,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(subscriptionData.data);
        if (!subscriptionData.data) return prev;

        if (subscriptionData.data.msgsSub.type === "newMsg") {
          return Object.assign({}, prev, {
            msgs: [...prev.msgs, subscriptionData.data.msgsSub.msg],
          });
        } else if (subscriptionData.data.msgsSub.type === "deletedMsg") {
          return Object.assign({}, prev, {
            msgs: [...subscriptionData.data.msgsSub.msgArr],
          });
        }
      },
    });

    // if (user?.id && user?.username && user?.profileImageUrl) {
    //   storeUser({
    //     variables: {
    //       id: user?.id,
    //       username: user?.username,
    //       image: user?.profileImageUrl,
    //     },
    //   });
    // }
  }, [subscribeToMore]);

  if (loading) {
    return <Loading />;
  }

  return (
    <main>
      <MantineProvider
        theme={{ colorScheme: theme as ColorScheme | undefined }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NewChatModalContext.Provider
          value={{
            state: newChatModalState,
            setState: setNewChatModalState,
          }}
        >
          <App
            setTheme={setTheme}
            msgsArr={msgs?.msgs}
            sendMsg={sendMsg}
            UserProfile={<UserButton />}
            users={users?.users}
            deleteMsg={deleteMsg}
          />
          {newChatModalState === "opened" && <NewChatModal />}
        </NewChatModalContext.Provider>
      </MantineProvider>
    </main>
  );
}

const withApollo = () => (
  <ApolloProvider client={client}>
    <Home />
  </ApolloProvider>
);

export default withApollo;
