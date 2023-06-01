import { Loader } from "@mantine/core";

export const Loading = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loader variant="bars" />
    </div>
  );
};
