import { UserButton, useUser } from "@clerk/clerk-react";
import {
  IconSearch,
  IconSun,
  IconMoonStars,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useMantineColorScheme, ActionIcon, TextInput } from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatsRefetchCxt } from "context";

export const DashboardNavbar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [navbarState, setNavbarState] = useState<"ui" | "search">("ui");
  const searchBarRef: null | React.RefObject<any> = useRef(null);
  const [inputField, setInputField] = useState<string>("");
  const ctx = useContext(ChatsRefetchCxt);
  const { user } = useUser();
  const id = user?.id as string;

  useEffect(() => {
    if (navbarState === "search") searchBarRef.current.focus();
  }, [navbarState]);

  return (
    <nav
      className="dashboard-navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        // border: "2px solid red",
        borderBottomStyle: "inset",
        borderBottomColor: "gray",
        borderWidth: "0.1rem",
        height: "4rem",
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
      }}
    >
      {navbarState === "ui" ? (
        <>
          <IconSearch
            className="search-btn"
            size={20}
            style={{
              cursor: "pointer",
            }}
            onClick={() => setNavbarState("search")}
          />
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <ActionIcon
              className="change-theme-btn"
              variant="outline"
              color={colorScheme === "dark" ? "yellow" : "blue"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun
                  size={20}
                  style={{
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <IconMoonStars
                  size={20}
                  style={{
                    borderRadius: "50%",
                  }}
                />
              )}
            </ActionIcon>
            <div id="user-btn">
              <UserButton />
            </div>
          </div>
        </>
      ) : (
        <>
          <IconArrowLeft
            size={20}
            className="back-btn"
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setNavbarState("ui");
              ctx?.refetch({ id, params: "" });
            }}
          />
          <TextInput
            ref={searchBarRef}
            style={{
              width: "85%",
            }}
            placeholder="Search for a chat..."
            value={inputField}
            onChange={(e) => {
              setInputField(e.target.value);
              ctx?.refetch({ id, params: e.target.value });
            }}
          />
        </>
      )}
    </nav>
  );
};
