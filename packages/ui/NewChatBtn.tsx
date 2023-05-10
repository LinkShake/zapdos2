"use client";
import { IconPlus } from "@tabler/icons-react";
import { NewChatModalContext } from "../../apps/client/context/NewChatModalContext";
import { useContext } from "react";
import { Button } from "@mantine/core";

export const NewChatBtn = () => {
  const ctx = useContext(NewChatModalContext);
  return (
    <Button onClick={() => ctx?.setState("opened")}>
      <IconPlus size={20} />
    </Button>
  );
};
