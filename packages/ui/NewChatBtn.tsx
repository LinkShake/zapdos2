"use client";
import { IconPlus } from "@tabler/icons-react";
import { NewChatModalContext } from "../../apps/client/context/NewChatModalContext";
import { useContext } from "react";
import { Button } from "@mantine/core";

export const NewChatBtn = () => {
  const ctx = useContext(NewChatModalContext);
  return (
    <Button onClick={() => ctx?.setState("opened")} className="new-chat-btn">
      <IconPlus size={25} />
    </Button>
  );
};
