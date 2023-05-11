import { gql, useQuery } from "@apollo/client";

export const useMessages = (params: { id: string }) => {
  const query = gql`
    query msgs($id: String) {
      msgs(id: $id) {
        id
        text
      }
    }
  `;

  const subscription = gql`
    subscription OnMessage($id: String) {
      msgsSub(id: $id) {
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
  `;

  return [useQuery(query, { variables: { id: params.id } }), subscription];
};
