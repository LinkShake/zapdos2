import React from "react";
import { useMessages } from "../../hooks/useMessages";
import { MessageContext } from "../MessagesContext";

export const Subscriptions = ({ children }: { children: React.ReactNode }) => {
  return (
    <MessageContext.Provider value={{ useMessages }}>
      {children}
    </MessageContext.Provider>
  );
};
