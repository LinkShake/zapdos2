"use client";
import { useEffect } from "react";
import { MsgMenu } from "./MsgMenu";
import { useMessagesContext } from "../../apps/client/hooks/useMessagesContext";

interface ChatProps {
  id: string;
  // useQuery: (
  //   props: any,
  //   {
  //     variables: { id },
  //   }: { variables: { id: string } }
  // ) => any;
  // MSGS_QUERY: any;
  // MSGS_SUBSCRIPTION: any;
  sendMsg: ({
    variables: { text, id },
  }: {
    variables: { text: string; id: string };
  }) => void;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  inputField: string;
  deleteMsg: ({ variables: { id } }: { variables: { id: number } }) => void;
  // msgsArr: Array<{ text: string; id: number; chatId: string }>;
}

interface Message {
  id: number;
  text: string;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  sendMsg,
  setInputField,
  inputField,
  deleteMsg,
}) => {
  // const [{ data, error, loading, subscribeToMore }, subscription] =
  //   useMessagesContext({ id });
  // console.log(data);

  // @ts-expect-error
  const [{ data, loading, error, subscribeToMore }, subscription] =
    useMessagesContext({ id });
  console.log("id", id);

  useEffect(() => {
    subscribeToMore({
      document: subscription,
      variables: { id },
      // @ts-ignore
      updateQuery: (prev, { subscriptionData }) => {
        console.log("we are sub");
        console.log(subscriptionData.data);
        if (!subscriptionData.data) return prev;

        if (subscriptionData.data.msgsSub.type === "newMsg") {
          return Object.assign({}, prev, {
            msgs: [...prev.msgs, subscriptionData.data.msgsSub.msg],
          });
        } else if (subscriptionData.data.msgsSub.type === "deletedMsg") {
          return Object.assign({}, prev, {
            msgs: [...subscriptionData.data.msgsSub.msgArr],
          });
        }
      },
    });
  }, []);

  return (
    <ul
      style={{
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
        gap: "10px",
      }}
    >
      {data?.msgs?.map(({ text, id }: { text: string; id: number }) => (
        <MsgMenu key={id} text={text} id={id} deleteMsg={deleteMsg} />
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(inputField);
          // subscriptionAction?.setState("newMsg");
          sendMsg({ variables: { text: inputField, id: id } });
          console.log("message sent");
          setInputField("");
        }}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        <input
          type="text"
          style={{
            width: "85%",
            marginLeft: 0,
            paddingLeft: 0,
          }}
          placeholder="Type something..."
          value={inputField}
          onChange={(e) => {
            const evt =
              e.target as unknown as React.ChangeEvent<HTMLInputElement>;
            // @ts-ignore
            setInputField(evt?.value);
          }}
        />
      </form>
    </ul>
  );
};
