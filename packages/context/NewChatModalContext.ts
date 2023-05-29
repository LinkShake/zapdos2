import { Dispatch, SetStateAction, createContext } from "react";

interface INewChatModalContext {
  state: "opened" | "closed";
  setState: Dispatch<SetStateAction<"opened" | "closed">>;
}

export const NewChatModalContext = createContext<null | INewChatModalContext>(
  null
);
