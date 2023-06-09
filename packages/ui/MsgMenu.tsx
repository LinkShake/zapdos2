"use client";
import { Menu, Text } from "@mantine/core";
import { IconTrash, IconEdit, IconCopy } from "@tabler/icons-react";
import { forwardRef, useMemo } from "react";
import Linkify from "linkify-react";
import Highlighter from "react-highlight-words";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

const findChunks = ({
  // @ts-ignore
  autoEscape,
  // @ts-ignore
  caseSensitive,
  // @ts-ignore
  sanitize,
  // @ts-ignore
  searchWords,
  // @ts-ignore
  textToHighlight,
}) => {
  // @ts-ignore
  const chunks = [];
  const textLow = textToHighlight.toLowerCase();
  const sep = /[\s]+/;

  const singleTextWords = textLow.split(sep);

  let fromIndex = 0;
  const singleTextWordsWithPos = singleTextWords.map((s) => {
    const indexInWord = textLow.indexOf(s, fromIndex);
    fromIndex = indexInWord;
    return {
      word: s,
      index: indexInWord,
    };
  });

  // @ts-ignore
  searchWords.forEach((sw) => {
    const swLow = sw.toLowerCase();
    // @ts-ignore
    singleTextWordsWithPos.forEach((s) => {
      if (s.word.includes(swLow)) {
        const start = s.index;
        const end = s.index + s.word.length;
        chunks.push({
          start,
          end,
        });
      }
    });
  });

  // @ts-ignore
  return chunks;
};

interface MsgMenuProps {
  text: string;
  id: number;
  myId?: string;
  from: string;
  to: string;
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
  onTryUpdatingMsg: (
    actionType: "sendMsg" | "updateMsg",
    msgBody: string,
    msgId: number
  ) => void;
  msgRef: any;
  chatId: string;
}

export const MsgMenu: React.FC<MsgMenuProps> = forwardRef(
  function MsgMenuWithRef(
    { text, id, deleteMsg, onTryUpdatingMsg, chatId, myId, from, to },
    msgRef
  ) {
    const theme = useMantineTheme();
    const matchFirstBreak = useMediaQuery("(max-width: 945px)");
    const matchSecondBreak = useMediaQuery("(max-width: 840px)");
    const matchThirdBreak = useMediaQuery("(max-width: 768px)");
    const matchFinalBreak = useMediaQuery("(max-width: 665px)");
    const isMsgMine = useMemo(() => {
      return from === myId;
    }, [myId, from]);
    return (
      <div
        className={`${isMsgMine ? "my-msg" : "not-my-msg"}`}
        style={{
          width: "fit-content",
          overflow: "hidden !important",
          height: "auto !important",
        }}
      >
        <Menu
          shadow="md"
          width={200}
          positionDependencies={[window?.innerHeight]}
        >
          <Menu.Target>
            <Text
              className="msg"
              style={{
                backgroundColor: isMsgMine
                  ? theme.colors.blue[6]
                  : theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : "white",
                padding: ".5rem",
                paddingRight: "1rem",
                paddingLeft: "1rem",
                color: isMsgMine ? "white" : "auto",
                maxWidth: matchFirstBreak
                  ? matchSecondBreak
                    ? matchThirdBreak
                      ? matchFinalBreak
                        ? "200px"
                        : "25rem"
                      : "20rem"
                    : "25rem"
                  : "30rem",
                // height: "auto",
                // minHeight: "fit-content",
                overflow: "hidden !important",
                overflowY: "auto",
                height: "auto !important",
              }}
              lineClamp={18}
            >
              <Highlighter
                highlightClassName="YourHighlightClass"
                textToHighlight={text}
                searchWords={["http"]}
                autoEscape={true}
                findChunks={findChunks}
                highlightTag={({ children, highlightIndex }) => (
                  <Linkify>
                    <div
                      style={{
                        color: "#67e8f9",
                        overflow: "hidden !important",
                        height: "auto !important",
                        border: "2px solid yellow",
                      }}
                    >
                      {children}
                    </div>
                  </Linkify>
                )}
              />

              {/* {text} */}
            </Text>
          </Menu.Target>

          <Menu.Dropdown
            id="msg-actions"
            style={{
              zIndex: "100",
              overflow: "visible !important",
            }}
          >
            {/* <Menu.Label>Application</Menu.Label>
        <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
        <Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>
        <Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item>
        <Menu.Item
          icon={<IconSearch size={14} />}
          rightSection={
            <Text size="xs" color="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>

        <Menu.Divider /> */}

            <Menu.Label>Message actions</Menu.Label>
            <Menu.Item
              icon={<IconCopy size={14} />}
              onClick={() => navigator.clipboard.writeText(text)}
            >
              Copy{" "}
            </Menu.Item>
            <Menu.Item
              icon={<IconEdit size={14} />}
              onClick={() => onTryUpdatingMsg("updateMsg", text, id)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              icon={<IconTrash size={14} />}
              onClick={() => {
                // console.log("clicked", id);
                // subscriptionAction?.setState("deletedMsg");
                console.log("id: ", id);
                console.log("chatId: ", chatId);
                deleteMsg({ variables: { id: +id, chatId } });
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    );
  }
);

// const MsgMenuWithRef = forwardRef(() => MsgMenu)
