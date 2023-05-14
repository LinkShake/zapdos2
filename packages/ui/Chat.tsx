"use client";
import { useEffect, useRef, useState } from "react";
import { MsgMenu } from "./MsgMenu";
import { useMessagesContext } from "../../apps/client/hooks/useMessagesContext";
import { TextInput, Grid, MediaQuery } from "@mantine/core";

interface ChatProps {
  id: string;
  sendMsg: ({
    variables: { text, id },
  }: {
    variables: { text: string; id: string };
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
  updateMsg,
}) => {
  const [userMsgAction, setUserMsgAction] = useState<"sendMsg" | "updateMsg">(
    "sendMsg"
  );
  const inputRef: any = useRef(null);
  const [currMsgId, setCurrMsgId] = useState<number>(0);

  // @ts-expect-error
  const [{ data, loading, error, subscribeToMore }, subscription] =
    useMessagesContext({ id });

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
  }, []);

  return (
    <Grid
      columns={1}
      grow
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          width: "fit-content",
          gap: "10px",
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
            />
          )
        )}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          userMsgAction === "sendMsg"
            ? sendMsg({ variables: { text: inputField, id: id } })
            : updateMsg({
                variables: { id: currMsgId, chatId: id, text: inputField },
              });
          setInputField("");
          setUserMsgAction("sendMsg");
        }}
        style={{
          position: "fixed",
          bottom: 0,
          width: "85%",
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        <TextInput
          ref={inputRef}
          type="text"
          style={{
            // backgroundColor: theme.colors.dark[6],
            // color: theme.colors.dark[6],
            width: "100%",
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
