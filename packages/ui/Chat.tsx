"use client";
import { useEffect, useRef, useState } from "react";
import { MsgMenu } from "./MsgMenu";
import { useMessagesContext } from "hooks";
import { Grid, Textarea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChatNavbar } from "./ChatNavbar";
import { useQuery, gql } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { IconSend } from "@tabler/icons-react";

interface ChatProps {
  id: string;
  chatUserId: string;
  sendMsg: ({
    variables: { text, id, to, from },
  }: {
    variables: {
      text: string;
      id: string;
      to: string;
      from: string | undefined;
    };
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
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  setChat: React.Dispatch<React.SetStateAction<boolean>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  chatUserId,
  sendMsg,
  setInputField,
  inputField,
  deleteMsg,
  updateMsg,
  setChatId,
  setChat,
  setOpened,
}) => {
  // const matchPaddingChange = useMediaQuery("(max-width: 990px)");
  const { data: user } = useQuery(
    gql`
      query getUser($id: String) {
        getUser(id: $id) {
          username
          image
        }
      }
    `,
    {
      variables: { id: chatUserId },
    }
  );
  const { user: me } = useUser();
  const chatMsgsRef: null | React.RefObject<any> = useRef(null);
  const [userMsgAction, setUserMsgAction] = useState<"sendMsg" | "updateMsg">(
    "sendMsg"
  );
  const inputRef: any = useRef(null);
  const [currMsgId, setCurrMsgId] = useState<number>(0);

  // @ts-expect-error
  const [{ data, error, subscribeToMore, loading }, subscription] =
    useMessagesContext({
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

  const onSubmit = () => {
    userMsgAction === "sendMsg"
      ? sendMsg({
          variables: {
            text: inputField,
            id: id,
            to: chatUserId,
            from: me?.id,
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
        top: 0,
        right: 0,
        margin: 0,
        padding: 0,
        gap: "5rem",
        width: "100%",
        //maxHeight: "90vh",
        height: "100vh",
        //overflowY: "auto",
        gridTemplateRows: "10fr 80fr 10fr",
        scrollbarWidth: "none",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      <ChatNavbar
        profile={user?.getUser?.image}
        userName={user?.getUser?.username}
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
          maxHeight: "91.5%",
          height: "91.5%",
          // overflowY: "auto",
          padding: "2rem",
          paddingTop: ".5rem",
          // border: "2px solid red",
        }}
      >
        {data?.msgs?.map(
          ({
            text,
            id: msgId,
            from,
            to,
          }: {
            text: string;
            id: number;
            from: string;
            to: string;
          }) => (
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
          )
        )}
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
                  from: me?.id,
                },
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
          flexDirection: "column",
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
