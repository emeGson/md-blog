import {
  ChangeEvent,
  ChangeEventHandler,
  FunctionComponent,
  useMemo,
} from "react";
import { BlockElement, ElementTypes, InlineElement } from "../types/document";
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
} from "slate";

interface EditorArgs {
  document: Descendant[];
}

const renderElement = (props: RenderElementProps) => {
  const { element, children, attributes } = props;

  switch (element.type) {
    case ElementTypes.paragraph:
      return <p {...attributes}>{children}</p>;
    case ElementTypes.code:
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <div className="bg-orange-700" {...attributes}>
          {children}
        </div>
      );
  }
};

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
  console.error("update");
  console.error(props);
};

const MarkdownEditor: FunctionComponent<EditorArgs> = ({ document }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate
      editor={editor}
      value={document}
      onChange={(value) => {
        console.log(value);
      }}
    >
      <Editable
        onKeyDown={(event) => {
          if (event.key === "&") {
            event.preventDefault();
            editor.insertText("and");
          } else if (event.key === "l" && event.ctrlKey) {
            event.preventDefault();
            const [match] = Editor.nodes(editor, {
              match: (n) =>
                Element.isElement(n) && n.type === ElementTypes.code,
            });
            Transforms.setNodes(
              editor,
              { type: match ? ElementTypes.paragraph : ElementTypes.code },
              { match: (n) => Editor.isBlock(editor, n) }
            );
            console.log("set to code");
          } else if (event.key === "b" && event.ctrlKey) {
            event.preventDefault();
            Transforms.setNodes(
              editor,
              { bold: true },
              { match: (n) => Text.isText(n), split: true }
            );
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
