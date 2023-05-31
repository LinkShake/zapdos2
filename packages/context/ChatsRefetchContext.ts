import { Dispatch, SetStateAction, createContext } from "react";

interface IChatsRefetchCxt {
  refetch: ({ id, params }: { id: string; params: string }) => any;
}

export const ChatsRefetchCxt = createContext<null | IChatsRefetchCxt>(null);
