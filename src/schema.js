import {CommandSet} from "prosemirror/dist/edit"
import {insertCSS} from "prosemirror/dist/dom"
import {Doc, Textblock, BlockQuote, OrderedList, BulletList, ListItem, HorizontalRule,
	Paragraph, Heading, Text, HardBreak,
	EmMark, StrongMark, LinkMark, CodeMark, Schema, SchemaSpec} from "prosemirror/dist/model"
import {Input, RadioButton, CheckBox, Select, TextField, TextArea} from "./widgets"
import {Question, TextBox, ShortAnswer, Essay, Choice, MultipleChoice, ScaleDisplay, Scale, CheckItem, CheckList, Selection} from "./widgets"
import {Website, InlineMath, BlockMath, Image, SpreadSheet, CarryForward, Graph } from "./widgets"
import {alignGroup,LeftAlign,CenterAlign,RightAlign,UnderlineMark,StrikeThroughMark} from "./widgets"
import {textblockMenu} from "prosemirror/dist/menu/menu"

const widgetSpec = new SchemaSpec({
	doc: Doc,
	blockquote: BlockQuote,
	ordered_list: OrderedList,
	bullet_list: BulletList,
	list_item: ListItem,

	paragraph: Paragraph,
	heading: Heading,

	text: Text,
	hard_break: HardBreak,
	
	input: Input,
	checkbox: CheckBox,
	radiobutton: RadioButton,
	select: Select,
	textfield: TextField,
	textarea: TextArea,

	question: Question,
	textbox: TextBox,
	choice: Choice,
	multiplechoice: MultipleChoice,
	scaledisplay: ScaleDisplay,
	scale: Scale,
	checkitem: CheckItem,
	checklist: CheckList,
	shortanswer: ShortAnswer,
	essay: Essay,
	selection: Selection,
	
	horizontal_rule: HorizontalRule,
	image: Image,
	inlinemath: InlineMath,
	blockmath: BlockMath,
	website: Website,
	carryforward: CarryForward,
	spreadsheet: SpreadSheet,
	graph: Graph,
	
	leftalign: LeftAlign,
	centeralign: CenterAlign,
	rightalign: RightAlign
}, {
	em: EmMark,
	strong: StrongMark,
	link: LinkMark,
	code: CodeMark,
	underline: UnderlineMark,
	strikethrough: StrikeThroughMark
})

export const widgetSchema = new Schema(widgetSpec)

textblockMenu.options.label = "Format"


export const commands = CommandSet.default.update({
    selectParentNode: { menu: null},
    lift: { menu: null},
    "code:toggle": {menu: {group: "textblock", rank: 99, display: {type: "label", label: "Code" }}}
})

insertCSS(`
		
.ProseMirror {
	width: 800px;
	min-height: 200px;
}

.ProseMirror-menu {
	background: white;
	color: black;
}

div.ProseMirror-dropdown-menu {
  position: absolute;
  background: white;
  color: black;
  border-radius: 6px;
  border: 1px solid silver;
  padding: 2px 2px;
  z-index: 15;
}

div.ProseMirror-dropdown-menu {
  cursor: pointer;
  padding: 0 1em 0 2px;
}

div.ProseMirror-menubar-inner {
  background: linear-gradient(to bottom, white, #0191C8);
}

div.ProseMirror-menu form {
	background: linear-gradient(to bottom, white, #0191C8);
	width: 300px;
}

div.ProseMirror-menu form select {
	width: 100px;
	background: white;
}

div.ProseMirror-menu input[type = "text"] {
	background: white;
}

`)

