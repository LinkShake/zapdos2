"use client";
import { AppShellComponent } from "ui/AppShell";
import { ColorScheme, MantineProvider } from "@mantine/core";
import { useState } from "react";
import {
  useQuery,
  gql,
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { link } from "../utils/SSELink";

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

function Home() {
  const [theme, setTheme] = useState<string>("dark");
  const {
    data: msgs,
    loading,
    error,
  } = useQuery(gql`
    query {
      msgs {
        text
      }
    }
  `);
  return (
    <MantineProvider
      theme={{ colorScheme: theme as ColorScheme | undefined }}
      withGlobalStyles
      withNormalizeCSS
    >
      <AppShellComponent setTheme={setTheme} msgsArr={[]} />;
    </MantineProvider>
  );
}

const withApollo = () => (
  <ApolloProvider client={client}>
    <Home />
  </ApolloProvider>
);

export default Home;
