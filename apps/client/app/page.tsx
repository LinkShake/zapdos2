"use client";
import { App } from "ui";
import { ColorScheme, MantineProvider } from "@mantine/core";
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
import { Loading } from "ui";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs/app-beta/client";

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const MSGS_SUBSCRIPTION = gql`
  subscription {
    newMsg {
      text
    }
  }
`;

const USER_MUTATION = gql`
  mutation storeUser($id: String!, $username: String!, $image: String!) {
    storeUser(id: $id, username: $username, image: $image) {
      id
      username
      image
    }
  }
`;

function Home() {
  const { user } = useUser();
  console.log(typeof user?.id);
  console.log(user?.username);
  console.log(user?.profileImageUrl);
  const [theme, setTheme] = useState<string>("dark");
  const {
    data: msgs,
    loading,
    error,
    subscribeToMore,
  } = useQuery(
    gql`
      query msgs($id: String) {
        msgs(id: $id) {
          text
        }
      }
    `,
    {
      variables: {
        id: user?.id,
      },
    }
  );
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
  const [sendMsg] = useMutation(gql`
    mutation sendMsg($text: String!) {
      sendMsg(text: $text) {
        text
      }
    }
  `);
  const [storeUser, { data: userData }] = useMutation(USER_MUTATION);
  console.log("userData: ", userData);
  console.log("users: ", users);

  useEffect(() => {
    subscribeToMore({
      document: MSGS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return Object.assign({}, prev, {
          msgs: [...prev.msgs, subscriptionData.data.newMsg],
        });
      },
    });
    if (user?.id && user?.username && user?.profileImageUrl) {
      storeUser({
        variables: {
          id: user?.id,
          username: user?.username,
          image: user?.profileImageUrl,
        },
      });
    }
  }, []);

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
        <App
          setTheme={setTheme}
          msgsArr={msgs?.msgs}
          sendMsg={sendMsg}
          UserProfile={<UserButton />}
          users={users?.users}
        />
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
