"use client";
import { useEffect, useRef, useState } from "react";
import { MsgMenu } from "./MsgMenu";
import {
  OnMessageDocument,
  useDeleteMsgMutation,
  useGetUserQuery,
  useMessagesContext,
  useMsgsQuery,
  useSendMsgMutation,
  useUpdateMsgMutation,
} from "hooks";
import { Grid, Textarea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChatNavbar } from "./ChatNavbar";
import { useQuery, gql } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { IconSend } from "@tabler/icons-react";

interface ChatProps {
  id: string;
  chatUserId: string;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  inputField: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  setChat: React.Dispatch<React.SetStateAction<boolean>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  chatUserId,
  setInputField,
  inputField,
  setChatId,
  setChat,
  setOpened,
}) => {
  // const matchPaddingChange = useMediaQuery("(max-width: 990px)");
  const { data: user } = useGetUserQuery({
    variables: { id: chatUserId },
  });
  const { user: me } = useUser();
  const chatMsgsRef: null | React.RefObject<any> = useRef(null);
  const [userMsgAction, setUserMsgAction] = useState<"sendMsg" | "updateMsg">(
    "sendMsg"
  );
  const inputRef: any = useRef(null);
  const [currMsgId, setCurrMsgId] = useState<number>(0);

  const { data, error, subscribeToMore, loading } = useMsgsQuery({
    variables: { chatId: id },
  });
  const [sendMsg] = useSendMsgMutation();
  const [updateMsg] = useUpdateMsgMutation();
  const [deleteMsg] = useDeleteMsgMutation();

  const match = useMediaQuery("(max-width: 768px)");

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

  const onSubmit = () => {
    userMsgAction === "sendMsg"
      ? sendMsg({
          variables: {
            text: inputField,
            id,
            to: chatUserId,
            from: me?.id as string,
          },
        })
      : updateMsg({
          variables: { id: currMsgId, chatId: id, text: inputField },
        });
    setInputField("");
    setUserMsgAction("sendMsg");
  };

  useEffect(() => {
    if (chatMsgsRef.current) {
      chatMsgsRef.current?.scrollTo(0, 0);
    }
    subscribeToMore({
      document: OnMessageDocument,
      variables: { topic: id },
      // @ts-ignore
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        console.log("sub data: ", subscriptionData.data);

        // @ts-ignore
        if (subscriptionData.data.msgsSub.type === "newMsg") {
          return Object.assign({}, prev, {
            // @ts-ignore
            msgs: [...prev.msgs, subscriptionData.data.msgsSub.msg],
          });
          // @ts-ignore
        } else if (subscriptionData.data.msgsSub.type === "deletedMsg") {
          // @ts-ignore
          console.log(subscriptionData.data.msgsSub.msgsArr);
          return Object.assign({}, prev, {
            // @ts-ignore
            msgs: [...subscriptionData.data.msgsSub.msgsArr],
          });
          // @ts-ignore
        } else if (subscriptionData.data.msgsSub.type === "updatedMsg") {
          const updatedMsgsQueue = prev.msgs.map(
            // @ts-ignore
            (data: { id: number; text: string }) => {
              // @ts-ignore
              if (data.id === subscriptionData.data.msgsSub.msg.id) {
                return {
                  id: data.id,
                  // @ts-ignore
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
        top: 0,
        right: 0,
        margin: 0,
        padding: 0,
        gap: "5rem",
        width: "100%",
        //maxHeight: "90vh",
        height: "100vh",
        // overflowY: "auto",
        gridTemplateRows: "10fr 80fr 10fr !important",
        scrollbarWidth: "none",
        position: "relative",
        overflowY: "auto",
        // border: "2px solid yellow",
      }}
    >
      <ChatNavbar
        profile={user?.getUser?.image as string}
        userName={user?.getUser?.username as string}
        setChatId={setChatId}
        setChat={setChat}
        setOpened={setOpened}
      />
      <ul
        className="msgs-chat-list"
        ref={chatMsgsRef}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          alignItems: "flex-start",
          width: "100%",
          gap: "10px",
          top: "4.2rem",
          maxHeight: "1200px",
          // height: "auto",
          overflowY: "auto",
          padding: "2rem",
          paddingTop: ".5rem",
          border: "2px solid red",
          // zIndex: "100",
        }}
      >
        {data?.msgs?.map(({ text, id: msgId, from, to }) => (
          <MsgMenu
            key={msgId}
            text={text}
            id={msgId}
            deleteMsg={deleteMsg}
            updateMsg={updateMsg}
            onTryUpdatingMsg={onTryUpdatingMsg}
            chatId={id}
            myId={me?.id}
            from={from}
            to={to}
            msgRef={chatMsgsRef}
          />
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          userMsgAction === "sendMsg"
            ? sendMsg({
                variables: {
                  text: inputField,
                  id: id,
                  to: chatUserId,
                  from: me?.id as string,
                },
              })
            : updateMsg({
                variables: { id: currMsgId, chatId: id, text: inputField },
              });
          setInputField("");
          setUserMsgAction("sendMsg");
        }}
        style={{
          // float: "right",
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          position: match ? "fixed" : "absolute",
          height: "2.5rem",
          bottom: 0,
          width: "100%",
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: "2px",
        }}
      >
        {/* <TextInput
          ref={inputRef}
          type="text"
          style={{
            width: "100%",
            height: "2.5rem",
            marginTop: "2px",
            // resize: "vertical",
          }}
          placeholder="Type something..."
          value={inputField}
          onChange={(e) => {
            const evt =
              e.target as unknown as React.ChangeEvent<HTMLInputElement>;
            // @ts-ignore
            setInputField(evt?.value);
          }}
        /> */}
        <Textarea
          ref={inputRef}
          // label="msg-textarea"
          style={{
            width: "100%",
            // border: "2px solid red",
            height: "2.5rem",
            marginTop: "2px",
            bottom: "0",
            maxWidth: "none",
            resize: "vertical",
          }}
          placeholder="Type something..."
          value={inputField}
          onChange={(e) => setInputField(e.target?.value)}
          minRows={1}
          required
          disabled={loading}
          rightSection={<SendMsgBtn onSubmit={onSubmit} />}
        />
      </form>
    </Grid>
  );
};

const SendMsgBtn = ({ onSubmit }: { onSubmit: () => void }) => {
  return (
    <IconSend
      className="send-msg-btn"
      size={20}
      type="submit"
      role="button"
      onClick={onSubmit}
      style={{
        cursor: "pointer",
      }}
    />
  );
};
