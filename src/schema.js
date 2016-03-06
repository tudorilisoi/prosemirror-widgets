import {CommandSet} from "prosemirror/dist/edit"
import {insertCSS} from "prosemirror/dist/dom"
import {inlineGroup, insertMenu, textblockMenu, blockGroup, historyGroup} from "prosemirror/dist/menu/menu"
import {Doc, Textblock, BlockQuote, OrderedList, BulletList, ListItem, HorizontalRule,
	Paragraph, Heading, Text, HardBreak,
	EmMark, StrongMark, LinkMark, CodeMark, Schema, SchemaSpec, NodeKind} from "prosemirror/dist/model"
import {Question, TextBox, ShortAnswer, Essay, Choice, MultipleChoice, 
	ScaleDisplay, Scale, CheckItem, CheckList, Selection} from "./widgets/question"
import {Input, RadioButton, CheckBox, Select, TextField, TextArea} from "./widgets/input"
import {Website, InlineMath, BlockMath, Image, SpreadSheet, CarryForward, Graph } from "./widgets/content"
import {alignGroup, LeftAlign, CenterAlign, RightAlign, UnderlineMark, StrikeThroughMark, contentInsertMenu, questionInsertMenu, toolGroup} from "./widgets"
import {analyzeCmdSpec, commentCmdSpec} from "./widgets/tool"

export const TopKind = new NodeKind("toplevel")
const TopKindOrBlock = new NodeKind("block",TopKind)

class WDoc extends Doc {
	get kind() { return null }
	get contains() { return TopKind }
}

class WHeading extends Heading {
	get kind() { return TopKind }
}

class WBlockQuote extends BlockQuote {
	get kind() { return TopKind }
	get contains() { return TopKindOrBlock }
}

class WParagraph extends Paragraph {
	get kind() { return TopKindOrBlock }
}

class WBulletList extends BulletList {
	get kind() { return TopKindOrBlock }
}

class WOrderedList extends OrderedList {
	get kind() { return TopKindOrBlock }
}

class WListItem extends ListItem {
	get contains() { return TopKindOrBlock }
}

const widgetSpec = new SchemaSpec({
	doc: WDoc,
	blockquote: WBlockQuote,
	ordered_list: WOrderedList,
	bullet_list: WBulletList,
	list_item: WListItem,

	paragraph: WParagraph,
	heading: WHeading,

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

export const mainMenuBar = {
	float: true,
	content: [[inlineGroup, insertMenu], [blockGroup,textblockMenu],alignGroup,[contentInsertMenu,questionInsertMenu],historyGroup]	 
}

export const grammarMenuBar = {
	float: true,
	content: [[inlineGroup, insertMenu], [blockGroup,textblockMenu],alignGroup,[contentInsertMenu,questionInsertMenu], toolGroup, historyGroup]	 
}


textblockMenu.options.label = "Format"

export const commands = CommandSet.default.update({
    selectParentNode: { menu: null},
    lift: { menu: null},
    "code:toggle": {menu: {group: "textblock", rank: 99, display: {type: "label", label: "Code" }}},
    analyze: analyzeCmdSpec
})

export const readonlyCommands = new CommandSet(null, () => null)

insertCSS(`
		
.ProseMirror {
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

