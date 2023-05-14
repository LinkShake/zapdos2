import { Avatar, Navbar } from "@mantine/core";

interface User {
  id: string;
  username: string;
  image: string;
}

interface ChatAvatarProps {
  id: string;
  chatUser: User;
  notifications: {
    id: string;
    counter: number;
  };
  setChat: React.Dispatch<React.SetStateAction<boolean>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  id: chatId,
  chatUser,
  notifications,
  setChat,
  setOpened,
  setChatId,
}) => {
  return (
    <Navbar.Section
      className="chat-avatar"
      onClick={() => {
        setChatId(chatId);
        setChat(() => {
          setOpened(false);
          return true;
        });
      }}
      style={{
        width: "100%",
        borderBottomStyle: "inset",
        borderBottomColor: "gray",
        borderWidth: "0.1rem",
      }}
    >
      <Avatar src={chatUser.image} alt="user_profile" radius={"xl"} />
      <h3>{chatUser.username}</h3>
    </Navbar.Section>
  );
};
