import { Dispatch, SetStateAction, createContext } from "react";

interface SubscriptionContextInterface {
  state: string;
  setState: Dispatch<SetStateAction<string>>;
}

export const SubscriptionContext =
  createContext<null | SubscriptionContextInterface>(null);
