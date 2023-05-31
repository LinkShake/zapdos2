import { Dispatch, SetStateAction, createContext } from "react";

interface IChatsParams {
  params: string;
  setParams: Dispatch<SetStateAction<string>>;
}

export const ChatsParams = createContext<null | IChatsParams>(null);
