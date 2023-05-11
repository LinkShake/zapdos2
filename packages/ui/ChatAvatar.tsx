import { Avatar } from "@mantine/core";

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
    <div
      className="chat-avatar"
      onClick={() => {
        setChatId(chatId);
        setChat(() => {
          setOpened(false);
          return true;
        });
      }}
      style={{
        border: "2px solid red",
      }}
    >
      <Avatar src={chatUser.image} alt="user_profile" radius={"xl"} />
      <h3>{chatUser.username}</h3>
    </div>
  );
};
