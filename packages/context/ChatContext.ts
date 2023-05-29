import { Dispatch, SetStateAction, createContext } from "react";

interface IChatContext {
  setActiveChatId: Dispatch<SetStateAction<string>>;
  setOpenedChat: Dispatch<SetStateAction<boolean>>;
}

export const ChatContext = createContext<null | IChatContext>(null);
