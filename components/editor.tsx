import {
  ChangeEvent,
  ChangeEventHandler,
  FunctionComponent,
  KeyboardEvent,
  useMemo,
} from "react";
import {
  BlockElement,
  ElementTypes,
  Header,
  HeaderLevel,
  InlineElement,
  Paragraph,
} from "../types/document";
import {
  Editable,
  ReactEditor,
  Slate,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import {
  createEditor,
  Descendant,
  BaseEditor,
  Transforms,
  Editor,
  Node,
  Element,
  Text,
  BasePoint,
  NodeEntry,
} from "slate";
import isHotkey from "is-hotkey";

interface EditorArgs {
  document: Descendant[];
}

const renderElement = (props: RenderElementProps) => {
  const { element, children, attributes } = props;

  switch (element.type) {
    case ElementTypes.paragraph:
      return (
        <p className="border-2 border-black" {...attributes}>
          {children}
        </p>
      );
    case ElementTypes.code:
      return (
        <pre className="border-2 border-green-400" {...attributes}>
          <code>{children}</code>
        </pre>
      );
    case ElementTypes.header: {
      switch (element.headerLevel) {
        case HeaderLevel.h1:
          return (
            <h1 className="text-4xl border-2 border-pink-400" {...attributes}>
              {children}
            </h1>
          );
        case HeaderLevel.h2:
          return (
            <h2 className="text-3xl border-2 border-pink-400" {...attributes}>
              {children}
            </h2>
          );
        case HeaderLevel.h3:
          return (
            <h3 className="text-2xl border-2 border-pink-400" {...attributes}>
              {children}
            </h3>
          );
        case HeaderLevel.h4:
          return (
            <h4 className="text-xl border-2 border-pink-400" {...attributes}>
              {children}
            </h4>
          );
        case HeaderLevel.h5:
          return (
            <h5 className="text-lg border-2 border-pink-400" {...attributes}>
              {children}
            </h5>
          );
        case HeaderLevel.h6:
          return (
            <h6 className="text-base border-2 border-pink-400" {...attributes}>
              {children}
            </h6>
          );
      }
    }
    default:
      return (
        <div className="bg-orange-700" {...attributes}>
          {children}
        </div>
      );
  }
};

function getLineAtOffset(
  text: string,
  offset: number
): { start: number; end: number } {
  let start = offset;
  let end = offset;

  const arr = [...text];

  for (let i = offset; i >= 0; i--) {
    if (i != offset && (i == 0 || arr[i - 1] == "\n")) {
      start = i;
      break;
    }
  }
  for (let i = offset; i < text.length; i++) {
    if (i != offset && (i + 1 == text.length || arr[i] == "\n")) {
      end = i;
      break;
    }
  }

  return { start, end };
}

function getLineFromEndpoints(
  text: string,
  start: number,
  end: number
): string {
  let res = "";

  [...text].forEach((v, i) => {
    if (i >= start && i <= end) {
      res += v;
    }
  });

  return res;
}

function onKeyParagraph(
  event: KeyboardEvent<HTMLDivElement>,
  editor: Editor,
  node: NodeEntry<Paragraph>
): void {
  if (isHotkey("enter", event)) {
    event.preventDefault();
    Transforms.insertText(editor, "\n");
    return;
  }

  if (isHotkey("space", event)) {
    const text = Node.string(node[0]);
    const line = getLineAtOffset(
      text,
      editor.selection?.focus.offset as number
    );
    const lineText = getLineFromEndpoints(text, line.start, line.end);
    console.log(lineText);

    const headerRegex = /^#+ /g;

    if ((lineText + " ").search(headerRegex) >= 0) {
      const headerType = lineText.length > 6 ? 6 : lineText.length;
      event.preventDefault();
      Transforms.delete(editor, {
        distance:
          line.start != 0 && text.charAt(line.start - 1) == "\n"
            ? lineText.length + 1
            : lineText.length,
        reverse: true,
      });
      Transforms.splitNodes(editor);
      Transforms.insertNodes(editor, {
        type: ElementTypes.header,
        headerLevel: headerType - 1,
        children: [
          {
            text: "",
          },
        ],
      });
    }
  }
}

function onKeyHeader(
  event: KeyboardEvent<HTMLDivElement>,
  editor: Editor,
  node: NodeEntry<Header>
): void {
  if (isHotkey("enter", event)) {
    event.preventDefault();
    Transforms.insertNodes(editor, {
      type: ElementTypes.paragraph,
      children: [
        {
          text: "",
        },
      ],
    });
    return;
  }

  if (isHotkey("space", event)) {
    const text = Node.string(node[0]);
    const line = getLineAtOffset(
      text,
      editor.selection?.focus.offset as number
    );
    const lineText = getLineFromEndpoints(text, line.start, line.end);
    console.log(lineText);

    const headerRegex = /^#+ /g;

    if ((lineText + " ").search(headerRegex) >= 0) {
      const headerType = lineText.length > 6 ? 6 : lineText.length;
      event.preventDefault();
      Transforms.delete(editor, {
        distance:
          line.start != 0 && text.charAt(line.start - 1) == "\n"
            ? lineText.length + 1
            : lineText.length,
        reverse: true,
      });
      Transforms.splitNodes(editor);
      Transforms.insertNodes(editor, {
        type: ElementTypes.header,
        headerLevel: headerType - 1,
        children: [
          {
            text: "",
          },
        ],
      });
    }
  }
}

const renderLeaf = (props: RenderLeafProps) => {
  const { leaf, children, attributes } = props;

  return (
    <span
      className={`${leaf.bold ? "font-bold" : "font-normal"}
                ${leaf.italic ? "font-serif" : ""}
                ${leaf.strikethrough ? "line-through" : ""}`}
      {...attributes}
    >
      {children}
    </span>
  );
};

const editorChangehandler: ChangeEventHandler = (props: ChangeEvent) => {
  // console.error("update");
  // console.error(props);
};

const MarkdownEditor: FunctionComponent<EditorArgs> = ({ document }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate
      editor={editor}
      value={document}
      onChange={(value) => {
        //console.log(value);
      }}
    >
      <Editable
        onKeyDown={(event) => {
          //handle keyboard shortcuts

          if (isHotkey("mod", event)) {
            console.log("cmd pressed");
          }

          const [match] = Editor.nodes(editor, {
            match: (n) => Element.isElement(n),
          });

          if (!match) {
            console.error("No node found");
            return;
          }

          if (Text.isText(match)) {
            console.log("is in text");
            return;
          }

          switch ((match[0] as Element).type) {
            case ElementTypes.paragraph:
              onKeyParagraph(event, editor, match as NodeEntry<Paragraph>);
              break;
            case ElementTypes.header:
              onKeyHeader(event, editor, match as NodeEntry<Header>);
              break;
            case ElementTypes.code:
              console.log("is in code");
              break;
          }
        }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onChange={editorChangehandler}
      ></Editable>
    </Slate>
  );
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: BlockElement;
    Text: InlineElement;
  }
}

export { MarkdownEditor };
