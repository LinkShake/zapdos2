import { MessageContext } from "@/context/MessagesContext";
import { DocumentNode, QueryResult } from "@apollo/client";
import { useContext } from "react";

export const useMessagesContext = (params: {
  id: string;
}):
  | (
      | DocumentNode
      | QueryResult<
          any,
          {
            id: string;
          }
        >
    )[]
  | undefined => {
  const ctx = useContext(MessageContext);

  if (ctx?.useMessages) return ctx.useMessages({ id: params.id });
};
