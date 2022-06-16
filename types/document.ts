import { BaseElement, BaseText, Descendant } from "slate";

enum ElementTypes {
  paragraph = "paragraph",
  code = "code",
  header = "header"
}

type BlockElement = Paragraph | Code | Header;

interface Paragraph extends BaseElement {
  type: ElementTypes.paragraph
}

enum HeaderLevel {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6
}
interface Header extends BaseElement {
  type: ElementTypes.header,
  headerLevel: HeaderLevel
}

interface Code extends BaseElement {
  type: ElementTypes.code
}

type InlineElement = Text

interface Text extends BaseText {
  bold?: boolean,
  italic?: boolean,
  strikethrough?: boolean
}


export type {
  Paragraph,
  BlockElement,
  InlineElement,
  Header
}

export {
  ElementTypes,
  HeaderLevel
}