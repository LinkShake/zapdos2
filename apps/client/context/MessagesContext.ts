import { DocumentNode, QueryResult } from "@apollo/client";
import { createContext } from "react";

interface IMessageContext {
  useMessage: (params: { id: string }) => (
    | DocumentNode
    | QueryResult<
        any,
        {
          id: string;
        }
      >
  )[];
}

export const MessageContext = createContext<null | IMessageContext>(null);
