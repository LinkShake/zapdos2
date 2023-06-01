import { Skeleton, Navbar, Flex } from "@mantine/core";

export const ChatsLoading = () => {
  return (
    <Navbar.Section
      //   className="chat-avatar"
      style={{
        display: "flex",
        flexDirection: "row",
        // justifyContent: "space-between",
        gap: "10px",
        width: "100%",
        borderBottomStyle: "inset",
        borderBottomColor: "gray",
        borderWidth: "0.1rem",
        height: "3.5rem",
        padding: ".2rem",
      }}
    >
      <Skeleton
        height={40}
        circle
        mb="xl"
        style={{
          marginRight: "10px",
        }}
      />
      <Skeleton height={10} mt={6} width="30%" radius="xl" />
    </Navbar.Section>
  );
};
