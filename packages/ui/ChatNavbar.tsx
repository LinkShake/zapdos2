import { Title, Avatar } from "@mantine/core";

interface ChatNavbarProps {
  userName: string;
  profile: string;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  userName,
  profile,
}) => {
  return (
    <nav
      style={{
        display: "flex",
        border: "2px solid white",
        width: "100%",
        position: "absolute",
        height: "4rem",
        zIndex: "2",
      }}
    >
      <Avatar src={profile} alt="user_profile" radius={"xl"} />
      <Title>{userName}</Title>
    </nav>
  );
};
