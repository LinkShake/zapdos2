import { Avatar, Navbar, Title } from "@mantine/core";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  image: string;
}

interface ChatAvatarProps {
  id?: string;
  myId?: string;
  chatUser: User;
  notifications?: {
    id: string;
    counter: number;
  };
  setChat?: React.Dispatch<React.SetStateAction<boolean>>;
  setOpened?: React.Dispatch<React.SetStateAction<boolean>>;
  setChatId?: React.Dispatch<React.SetStateAction<string>>;
  setChatUserId?: React.Dispatch<React.SetStateAction<string>>;
  variant: "chatAvatar" | "userAvatar";
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  id: chatId,
  chatUser,
  myId,
  notifications,
  setChat,
  setOpened,
  setChatId,
  setChatUserId,
  variant,
}) => {
  const router = useRouter();
  const [createChat] = useMutation(
    gql`
      mutation createChat($id: String!, $id2: String!) {
        createChat(id: $id, id2: $id2) {
          id
        }
      }
    `
  );
  return (
    <Navbar.Section
      className="chat-avatar"
      onClick={() => {
        if (variant === "chatAvatar") {
          if (setChatId && chatId && setChat && setOpened && setChatUserId) {
            setChatUserId(chatUser.id);
            setChatId(chatId);
            setChat(() => {
              setOpened(false);
              return true;
            });
          }
        } else if (variant === "userAvatar") {
          createChat({ variables: { id: myId, id2: chatUser.id } });
          // router.refresh();
        }
      }}
      style={{
        width: "100%",
        borderBottomStyle: "inset",
        borderBottomColor: "gray",
        borderWidth: "0.1rem",
      }}
    >
      <Avatar src={chatUser.image} alt="user_profile" radius={"xl"} />
      <Title order={4}>{chatUser.username}</Title>
    </Navbar.Section>
  );
};
