import { useContext, useEffect } from "react";
import { NewChatModalContext } from "../../apps/client/context/NewChatModalContext";

export const NewChatModal = () => {
  const ctx = useContext(NewChatModalContext);

  useEffect(() => {
    const onEscapeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") ctx?.setState("closed");
    };

    // @ts-ignore
    window?.addEventListener("keydown", onEscapeKey);
    // @ts-ignore
    return () => window?.removeEventListener("keydown", onEscapeKey);
  });

  return (
    <>
      <div
        className="new-chat-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: " blur(4px)",
          zIndex: 100,
          transition: "all 0.5s",
        }}
        onClick={() => ctx?.setState("closed")}
      ></div>
      <div
        className="new-chat-component"
        style={{
          width: "50vw",
          height: "50vh",
          position: "absolute",
          left: "30%",
          top: "15%",
          backgroundColor: "red",
          zIndex: 100,
        }}
      >
        <div className="new-chat-modal">this is a modal</div>
      </div>
    </>
  );
};
