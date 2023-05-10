import { Dispatch, SetStateAction, createContext } from "react";

interface NewChatModalContextInterface {
  state: "opened" | "closed";
  setState: Dispatch<SetStateAction<"opened" | "closed">>;
}

export const NewChatModalContext =
  createContext<null | NewChatModalContextInterface>(null);
