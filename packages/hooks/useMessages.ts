import { gql, useQuery } from "@apollo/client";

export const useMessages = (params: { id: string }) => {
  const query = gql`
    query msgs($id: String) {
      msgs(id: $id) {
        id
        text
        from
        to
      }
    }
  `;

  const subscription = gql`
    subscription OnMessage($topic: String) {
      msgsSub(topic: $topic) {
        msg {
          id
          text
          from
          to
        }
        msgsArr {
          id
          text
          from
          to
        }
        type
      }
    }
  `;

  return [useQuery(query, { variables: { id: params.id } }), subscription];
};
