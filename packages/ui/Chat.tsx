"use client";
import { useEffect, useRef, useState } from "react";
import { MsgMenu } from "./MsgMenu";
import { useMessagesContext } from "../../apps/client/hooks/useMessagesContext";
import { TextInput, Grid, MediaQuery } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface ChatProps {
  id: string;
  chatUserId: string;
  sendMsg: ({
    variables: { text, id, to },
  }: {
    variables: { text: string; id: string; to: string };
  }) => void;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  inputField: string;
  deleteMsg: ({
    variables: { id, chatId },
  }: {
    variables: { id: number; chatId: string };
  }) => void;
  updateMsg: ({
    variables: { id, chatId, text },
  }: {
    variables: { id: number; chatId: string; text: string };
  }) => void;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  chatUserId,
  sendMsg,
  setInputField,
  inputField,
  deleteMsg,
  updateMsg,
}) => {
  const chatMsgsRef: null | React.RefObject<any> = useRef(null);
  const match = useMediaQuery("(max-width: 768px)");
  const [userMsgAction, setUserMsgAction] = useState<"sendMsg" | "updateMsg">(
    "sendMsg"
  );
  const inputRef: any = useRef(null);
  const [currMsgId, setCurrMsgId] = useState<number>(0);

  // @ts-expect-error
  const [{ data, error, subscribeToMore }, subscription] = useMessagesContext({
    id,
  });

  const onTryUpdatingMsg = (
    actionType: "sendMsg" | "updateMsg",
    msgBody: string,
    msgId: number
  ) => {
    setUserMsgAction(actionType);
    setInputField(msgBody);
    setCurrMsgId(msgId);
    inputRef?.current?.focus();
  };

  useEffect(() => {
    if (chatMsgsRef.current) {
      chatMsgsRef.current?.scrollTo(0, 0);
    }
    subscribeToMore({
      document: subscription,
      variables: { id },
      // @ts-ignore
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        if (subscriptionData.data.msgsSub.type === "newMsg") {
          return Object.assign({}, prev, {
            msgs: [...prev.msgs, subscriptionData.data.msgsSub.msg],
          });
        } else if (subscriptionData.data.msgsSub.type === "deletedMsg") {
          return Object.assign({}, prev, {
            msgs: [...subscriptionData.data.msgsSub.msgArr],
          });
        } else if (subscriptionData.data.msgsSub.type === "updatedMsg") {
          const updatedMsgsQueue = prev.msgs.map(
            (data: { id: number; text: string }) => {
              if (data.id === subscriptionData.data.msgsSub.msg.id) {
                return {
                  id: data.id,
                  text: subscriptionData.data.msgsSub.msg.text,
                };
              }
              return data;
            }
          );

          return Object.assign({}, prev, {
            msgs: [...updatedMsgsQueue],
          });
        }
      },
    });

    // eslint-disable-next-line
  }, []);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Grid
      columns={1}
      grow
      style={{
        margin: 0,
        padding: 0,
        gap: "5rem",
        border: "2px solid red",
        //maxHeight: "90vh",
        height: "90vh",
        //overflowY: "auto",
        gridTemplateRows: "90fr 10fr",
        scrollbarWidth: "none",
        position: "relative",
      }}
    >
      <ul
        className="msgs-chat-list"
        ref={chatMsgsRef}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          width: "fit-content",
          gap: "10px",
          maxHeight: "93%",
          overflowY: "auto",
          border: "2px solid blue",
        }}
      >
        {data?.msgs?.map(
          ({ text, id: msgId }: { text: string; id: number }) => (
            <MsgMenu
              key={msgId}
              text={text}
              id={msgId}
              deleteMsg={deleteMsg}
              updateMsg={updateMsg}
              onTryUpdatingMsg={onTryUpdatingMsg}
              chatId={id}
              msgRef={chatMsgsRef}
            />
          )
        )}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          userMsgAction === "sendMsg"
            ? sendMsg({
                variables: { text: inputField, id: id, to: chatUserId },
              })
            : updateMsg({
                variables: { id: currMsgId, chatId: id, text: inputField },
              });
          setInputField("");
          setUserMsgAction("sendMsg");
        }}
        style={{
          float: "right",
          display: "flex",
          flexWrap: "wrap",
          position: "absolute",
          height: "2.5rem",
          bottom: 0,
          width: "100%",
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: "2px",
          border: "2px solid yellow",
        }}
      >
        <TextInput
          ref={inputRef}
          type="text"
          style={{
            width: "100%",
            height: "2.5rem",
            marginTop: "2px",
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
    </Grid>
  );
};
