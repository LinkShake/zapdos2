import { Title, Avatar, useMantineTheme } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface ChatNavbarProps {
  userName: string;
  profile: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  setChat: React.Dispatch<React.SetStateAction<boolean>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  userName,
  profile,
  setChatId,
  setChat,
  setOpened,
}) => {
  const theme = useMantineTheme();
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        // border: "2px solid white",
        width: "100%",
        position: "absolute",
        height: "4rem",
        zIndex: "2",
        gap: "10px",
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : "white",
      }}
    >
      <IconArrowLeft
        size={35}
        style={{
          marginLeft: ".5rem",
        }}
        onClick={() => {
          setChatId("");
          setChat(false);
          setOpened(true);
        }}
      />
      <Avatar src={profile} alt="user_profile" radius={"xl"} />
      <Title>{userName}</Title>
    </nav>
  );
};
