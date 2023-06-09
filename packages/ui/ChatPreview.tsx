import { Avatar, Navbar, Title, Button } from "@mantine/core";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useCreateChatMutation } from "hooks";

interface User {
  id: string;
  username: string;
  image: string;
}

interface ChatPreviewProps {
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
  onClick?: ({
    variables: { id, userId },
  }: {
    variables: { id: string; userId: string };
  }) => any;
  variant: "chatAvatar" | "userAvatar";
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  id: chatId,
  chatUser,
  myId,
  notifications,
  setChat,
  setOpened,
  setChatId,
  setChatUserId,
  onClick,
  variant,
}) => {
  const [createChat] = useCreateChatMutation();

  return (
    <Navbar.Section
      className="chat-avatar"
      onClick={() => {
        if (variant === "chatAvatar") {
          // @ts-ignore
          onClick?.({ variables: { id: chatId, userId: myId } });
          setChatUserId?.(chatUser.id);
          // @ts-ignore
          setChatId?.(chatId);
          setChat?.(() => {
            setOpened?.(false);
            return true;
          });
          // }
        } else if (variant === "userAvatar") {
          createChat({ variables: { id: myId as string, id2: chatUser.id } });
        }
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        borderBottomStyle: "inset",
        borderBottomColor: "gray",
        borderWidth: "0.1rem",
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        <Avatar
          src={chatUser.image}
          alt="user_profile"
          radius={"xl"}
          style={{
            marginRight: "10px",
          }}
        />
        <Title order={4}>{chatUser.username}</Title>
      </div>
      {notifications?.counter ? (
        <Button
          color="blue"
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            fontSize: "12px",
            padding: "0",
          }}
        >
          {notifications?.counter}
        </Button>
      ) : (
        <></>
      )}
    </Navbar.Section>
  );
};
