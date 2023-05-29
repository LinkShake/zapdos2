import { Title, Avatar, useMantineTheme } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface ChatNavbarProps {
  userName: string;
  profile: string;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  userName,
  profile,
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
        onClick={() => {}}
      />
      <Avatar src={profile} alt="user_profile" radius={"xl"} />
      <Title>{userName}</Title>
    </nav>
  );
};
