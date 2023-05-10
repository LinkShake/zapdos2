"use client";
import { Menu, Button, Text, NavLink } from "@mantine/core";
import {
  IconSettings,
  IconSearch,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
  IconArrowsLeftRight,
  IconEdit,
  IconCopy,
} from "@tabler/icons-react";
import { useContext } from "react";
import { SubscriptionContext } from "../../apps/client/context/SubscriptionContext";

interface MsgMenuProps {
  text: string;
  id: number;
  deleteMsg: ({ variables: { id } }: { variables: { id: number } }) => void;
}

export const MsgMenu: React.FC<MsgMenuProps> = ({ text, id, deleteMsg }) => {
  const subscriptionAction = useContext(SubscriptionContext);

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Text
          style={{
            backgroundColor: "#1A1B1E",
            padding: ".5rem",
            paddingRight: "1rem",
            paddingLeft: "1rem",
          }}
        >
          {text}
        </Text>
      </Menu.Target>

      <Menu.Dropdown>
        {/* <Menu.Label>Application</Menu.Label>
        <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
        <Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>
        <Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item>
        <Menu.Item
          icon={<IconSearch size={14} />}
          rightSection={
            <Text size="xs" color="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>

        <Menu.Divider /> */}

        <Menu.Label>Message actions</Menu.Label>
        <Menu.Item
          icon={<IconCopy size={14} />}
          onClick={() => {
            // @ts-ignore
            navigator.clipboard.writeText(text);
          }}
        >
          Copy{" "}
        </Menu.Item>
        <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
        <Menu.Item
          color="red"
          icon={<IconTrash size={14} />}
          onClick={() => {
            console.log("clicked", id);
            // subscriptionAction?.setState("deletedMsg");
            deleteMsg({ variables: { id } });
          }}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
