import { BaseElement, BaseText, Descendant } from "slate";

enum ElementTypes {
  paragraph = "paragraph",
  code = "code"
}

type BlockElement = Paragraph | Code;

interface Paragraph extends BaseElement {
  type: ElementTypes.paragraph
}

interface Code extends BaseElement {
  type: ElementTypes.code
}

type InlineElement = Text

interface Text extends BaseText {
  bold?: boolean,
  italic?: boolean,
  strikethrough?:boolean
}


export type{
    Paragraph,
    BlockElement,
    InlineElement
}

export {
  ElementTypes
}