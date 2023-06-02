import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Chat = {
  __typename?: "Chat";
  id: Scalars["String"]["output"];
  messages?: Maybe<Array<Maybe<Message>>>;
  notifications?: Maybe<Notification>;
  user1?: Maybe<User>;
  user2?: Maybe<User>;
};

export type ChatSub = {
  __typename?: "ChatSub";
  id?: Maybe<Scalars["String"]["output"]>;
  messages?: Maybe<Array<Maybe<Message>>>;
  notifications?: Maybe<Notification>;
  type?: Maybe<Scalars["String"]["output"]>;
  user1?: Maybe<User>;
  user2?: Maybe<User>;
};

export type Id = {
  __typename?: "Id";
  id: Scalars["String"]["output"];
};

export type Message = {
  __typename?: "Message";
  from?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["Int"]["output"];
  text: Scalars["String"]["output"];
  to?: Maybe<Scalars["String"]["output"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createChat?: Maybe<Chat>;
  deleteMsg?: Maybe<Array<Maybe<Message>>>;
  markAsRead?: Maybe<Notification>;
  sendMsg: Message;
  updateMsg: Message;
};

export type MutationCreateChatArgs = {
  id: Scalars["String"]["input"];
  id2: Scalars["String"]["input"];
};

export type MutationDeleteMsgArgs = {
  chatId: Scalars["String"]["input"];
  id: Scalars["Int"]["input"];
};

export type MutationMarkAsReadArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationSendMsgArgs = {
  from?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["String"]["input"]>;
  text: Scalars["String"]["input"];
  to?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateMsgArgs = {
  chatId: Scalars["String"]["input"];
  id: Scalars["Int"]["input"];
  text: Scalars["String"]["input"];
};

export type Notification = {
  __typename?: "Notification";
  counter?: Maybe<Scalars["Int"]["output"]>;
  id?: Maybe<Scalars["String"]["output"]>;
};

export type PubSubType = {
  __typename?: "PubSubType";
  msg?: Maybe<Message>;
  msgArr?: Maybe<Array<Maybe<Message>>>;
  type: Scalars["String"]["output"];
};

export type Query = {
  __typename?: "Query";
  chats?: Maybe<Array<Maybe<Chat>>>;
  getUser?: Maybe<User>;
  hello?: Maybe<Scalars["String"]["output"]>;
  msgs?: Maybe<Array<Maybe<Message>>>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type QueryChatsArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
  params?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetUserArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryMsgsArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
};

export type Subscription = {
  __typename?: "Subscription";
  chatsSub: ChatSub;
  deletedMsg?: Maybe<Array<Maybe<Message>>>;
  msgsSub: PubSubType;
  newMsg: Message;
  updatedMsg: Message;
};

export type SubscriptionChatsSubArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
};

export type SubscriptionMsgsSubArgs = {
  id?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  id?: Maybe<Scalars["String"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  username?: Maybe<Scalars["String"]["output"]>;
};

export type UserData = Id | User;

export type CreateChatMutationVariables = Exact<{
  id: Scalars["String"]["input"];
  id2: Scalars["String"]["input"];
}>;

export type CreateChatMutation = {
  __typename?: "Mutation";
  createChat?: { __typename?: "Chat"; id: string } | null;
};

export type DeleteMsgMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  chatId: Scalars["String"]["input"];
}>;

export type DeleteMsgMutation = {
  __typename?: "Mutation";
  deleteMsg?: Array<{ __typename?: "Message"; text: string } | null> | null;
};

export type SendMsgMutationVariables = Exact<{
  text: Scalars["String"]["input"];
  id: Scalars["String"]["input"];
  to?: InputMaybe<Scalars["String"]["input"]>;
  from?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SendMsgMutation = {
  __typename?: "Mutation";
  sendMsg: { __typename?: "Message"; text: string };
};

export type UpdateMsgMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  text: Scalars["String"]["input"];
  chatId: Scalars["String"]["input"];
}>;

export type UpdateMsgMutation = {
  __typename?: "Mutation";
  updateMsg: { __typename?: "Message"; id: number; text: string };
};

export type ChatsQueryVariables = Exact<{
  id?: InputMaybe<Scalars["String"]["input"]>;
  params?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ChatsQuery = {
  __typename?: "Query";
  chats?: Array<{
    __typename?: "Chat";
    id: string;
    user1?: {
      __typename?: "User";
      id?: string | null;
      image?: string | null;
      username?: string | null;
    } | null;
    user2?: {
      __typename?: "User";
      id?: string | null;
      image?: string | null;
      username?: string | null;
    } | null;
    messages?: Array<{
      __typename?: "Message";
      id: number;
      text: string;
    } | null> | null;
    notifications?: {
      __typename?: "Notification";
      id?: string | null;
      counter?: number | null;
    } | null;
  } | null> | null;
};

export type MsgsQueryVariables = Exact<{
  id?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type MsgsQuery = {
  __typename?: "Query";
  msgs?: Array<{
    __typename?: "Message";
    id: number;
    text: string;
    from?: string | null;
    to?: string | null;
  } | null> | null;
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = {
  __typename?: "Query";
  users?: Array<{
    __typename?: "User";
    id?: string | null;
    username?: string | null;
    image?: string | null;
  } | null> | null;
};

export type OnChatsSubscriptionVariables = Exact<{
  id?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type OnChatsSubscription = {
  __typename?: "Subscription";
  chatsSub: {
    __typename?: "ChatSub";
    type?: string | null;
    id?: string | null;
    user1?: {
      __typename?: "User";
      id?: string | null;
      username?: string | null;
    } | null;
    user2?: {
      __typename?: "User";
      id?: string | null;
      username?: string | null;
    } | null;
    messages?: Array<{
      __typename?: "Message";
      id: number;
      text: string;
    } | null> | null;
    notifications?: {
      __typename?: "Notification";
      id?: string | null;
      counter?: number | null;
    } | null;
  };
};

export type OnMessageSubscriptionVariables = Exact<{
  id?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type OnMessageSubscription = {
  __typename?: "Subscription";
  msgsSub: {
    __typename?: "PubSubType";
    type: string;
    msg?: {
      __typename?: "Message";
      id: number;
      text: string;
      from?: string | null;
      to?: string | null;
    } | null;
    msgArr?: Array<{
      __typename?: "Message";
      id: number;
      text: string;
    } | null> | null;
  };
};

export const CreateChatDocument = gql`
  mutation CreateChat($id: String!, $id2: String!) {
    createChat(id: $id, id2: $id2) {
      id
    }
  }
`;
export type CreateChatMutationFn = Apollo.MutationFunction<
  CreateChatMutation,
  CreateChatMutationVariables
>;

/**
 * __useCreateChatMutation__
 *
 * To run a mutation, you first call `useCreateChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatMutation, { data, loading, error }] = useCreateChatMutation({
 *   variables: {
 *      id: // value for 'id'
 *      id2: // value for 'id2'
 *   },
 * });
 */
export function useCreateChatMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateChatMutation,
    CreateChatMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateChatMutation, CreateChatMutationVariables>(
    CreateChatDocument,
    options
  );
}
export type CreateChatMutationHookResult = ReturnType<
  typeof useCreateChatMutation
>;
export type CreateChatMutationResult =
  Apollo.MutationResult<CreateChatMutation>;
export type CreateChatMutationOptions = Apollo.BaseMutationOptions<
  CreateChatMutation,
  CreateChatMutationVariables
>;
export const DeleteMsgDocument = gql`
  mutation DeleteMsg($id: Int!, $chatId: String!) {
    deleteMsg(id: $id, chatId: $chatId) {
      text
    }
  }
`;
export type DeleteMsgMutationFn = Apollo.MutationFunction<
  DeleteMsgMutation,
  DeleteMsgMutationVariables
>;

/**
 * __useDeleteMsgMutation__
 *
 * To run a mutation, you first call `useDeleteMsgMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMsgMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMsgMutation, { data, loading, error }] = useDeleteMsgMutation({
 *   variables: {
 *      id: // value for 'id'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useDeleteMsgMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteMsgMutation,
    DeleteMsgMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteMsgMutation, DeleteMsgMutationVariables>(
    DeleteMsgDocument,
    options
  );
}
export type DeleteMsgMutationHookResult = ReturnType<
  typeof useDeleteMsgMutation
>;
export type DeleteMsgMutationResult = Apollo.MutationResult<DeleteMsgMutation>;
export type DeleteMsgMutationOptions = Apollo.BaseMutationOptions<
  DeleteMsgMutation,
  DeleteMsgMutationVariables
>;
export const SendMsgDocument = gql`
  mutation SendMsg($text: String!, $id: String!, $to: String, $from: String) {
    sendMsg(text: $text, id: $id, to: $to, from: $from) {
      text
    }
  }
`;
export type SendMsgMutationFn = Apollo.MutationFunction<
  SendMsgMutation,
  SendMsgMutationVariables
>;

/**
 * __useSendMsgMutation__
 *
 * To run a mutation, you first call `useSendMsgMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMsgMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMsgMutation, { data, loading, error }] = useSendMsgMutation({
 *   variables: {
 *      text: // value for 'text'
 *      id: // value for 'id'
 *      to: // value for 'to'
 *      from: // value for 'from'
 *   },
 * });
 */
export function useSendMsgMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SendMsgMutation,
    SendMsgMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SendMsgMutation, SendMsgMutationVariables>(
    SendMsgDocument,
    options
  );
}
export type SendMsgMutationHookResult = ReturnType<typeof useSendMsgMutation>;
export type SendMsgMutationResult = Apollo.MutationResult<SendMsgMutation>;
export type SendMsgMutationOptions = Apollo.BaseMutationOptions<
  SendMsgMutation,
  SendMsgMutationVariables
>;
export const UpdateMsgDocument = gql`
  mutation UpdateMsg($id: Int!, $text: String!, $chatId: String!) {
    updateMsg(id: $id, text: $text, chatId: $chatId) {
      id
      text
    }
  }
`;
export type UpdateMsgMutationFn = Apollo.MutationFunction<
  UpdateMsgMutation,
  UpdateMsgMutationVariables
>;

/**
 * __useUpdateMsgMutation__
 *
 * To run a mutation, you first call `useUpdateMsgMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMsgMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMsgMutation, { data, loading, error }] = useUpdateMsgMutation({
 *   variables: {
 *      id: // value for 'id'
 *      text: // value for 'text'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useUpdateMsgMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateMsgMutation,
    UpdateMsgMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateMsgMutation, UpdateMsgMutationVariables>(
    UpdateMsgDocument,
    options
  );
}
export type UpdateMsgMutationHookResult = ReturnType<
  typeof useUpdateMsgMutation
>;
export type UpdateMsgMutationResult = Apollo.MutationResult<UpdateMsgMutation>;
export type UpdateMsgMutationOptions = Apollo.BaseMutationOptions<
  UpdateMsgMutation,
  UpdateMsgMutationVariables
>;
export const ChatsDocument = gql`
  query Chats($id: String, $params: String) {
    chats(id: $id, params: $params) {
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

/**
 * __useChatsQuery__
 *
 * To run a query within a React component, call `useChatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useChatsQuery(
  baseOptions?: Apollo.QueryHookOptions<ChatsQuery, ChatsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChatsQuery, ChatsQueryVariables>(
    ChatsDocument,
    options
  );
}
export function useChatsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChatsQuery, ChatsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChatsQuery, ChatsQueryVariables>(
    ChatsDocument,
    options
  );
}
export type ChatsQueryHookResult = ReturnType<typeof useChatsQuery>;
export type ChatsLazyQueryHookResult = ReturnType<typeof useChatsLazyQuery>;
export type ChatsQueryResult = Apollo.QueryResult<
  ChatsQuery,
  ChatsQueryVariables
>;
export const MsgsDocument = gql`
  query Msgs($id: String) {
    msgs(id: $id) {
      id
      text
      from
      to
    }
  }
`;

/**
 * __useMsgsQuery__
 *
 * To run a query within a React component, call `useMsgsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMsgsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMsgsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMsgsQuery(
  baseOptions?: Apollo.QueryHookOptions<MsgsQuery, MsgsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MsgsQuery, MsgsQueryVariables>(MsgsDocument, options);
}
export function useMsgsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MsgsQuery, MsgsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MsgsQuery, MsgsQueryVariables>(
    MsgsDocument,
    options
  );
}
export type MsgsQueryHookResult = ReturnType<typeof useMsgsQuery>;
export type MsgsLazyQueryHookResult = ReturnType<typeof useMsgsLazyQuery>;
export type MsgsQueryResult = Apollo.QueryResult<MsgsQuery, MsgsQueryVariables>;
export const UsersDocument = gql`
  query Users {
    users {
      id
      username
      image
    }
  }
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options
  );
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options
  );
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<
  UsersQuery,
  UsersQueryVariables
>;
export const OnChatsDocument = gql`
  subscription OnChats($id: String) {
    chatsSub(id: $id) {
      type
      id
      user1 {
        id
        username
      }
      user2 {
        id
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

/**
 * __useOnChatsSubscription__
 *
 * To run a query within a React component, call `useOnChatsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnChatsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnChatsSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOnChatsSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    OnChatsSubscription,
    OnChatsSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    OnChatsSubscription,
    OnChatsSubscriptionVariables
  >(OnChatsDocument, options);
}
export type OnChatsSubscriptionHookResult = ReturnType<
  typeof useOnChatsSubscription
>;
export type OnChatsSubscriptionResult =
  Apollo.SubscriptionResult<OnChatsSubscription>;
export const OnMessageDocument = gql`
  subscription OnMessage($id: String) {
    msgsSub(id: $id) {
      msg {
        id
        text
        from
        to
      }
      type
      msgArr {
        id
        text
      }
    }
  }
`;

/**
 * __useOnMessageSubscription__
 *
 * To run a query within a React component, call `useOnMessageSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnMessageSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnMessageSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOnMessageSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    OnMessageSubscription,
    OnMessageSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    OnMessageSubscription,
    OnMessageSubscriptionVariables
  >(OnMessageDocument, options);
}
export type OnMessageSubscriptionHookResult = ReturnType<
  typeof useOnMessageSubscription
>;
export type OnMessageSubscriptionResult =
  Apollo.SubscriptionResult<OnMessageSubscription>;
