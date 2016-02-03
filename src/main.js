import {insertCSS} from "prosemirror/dist/dom"
import {ProseMirror, baseCommands} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import {InputRule} from "prosemirror/dist/inputrules"
import "prosemirror/dist/inputrules/autoinput"
import {Pos} from "prosemirror/dist/model"
import {widgetParamHandler, defineFileHandler} from "./utils"
 
import {Doc, Textblock, BlockQuote, OrderedList, BulletList, ListItem, HorizontalRule,
	Paragraph, Heading, Text, HardBreak,
	EmMark, StrongMark, LinkMark, CodeMark, Schema, SchemaSpec} from "prosemirror/dist/model"

// basic form input elements
import {Input, RadioButton, CheckBox, Select, TextField, TextArea} from "./widgets"
// question elements
import {TextBox, ShortAnswer, Essay, Choice, MultipleChoice, ScaleDisplay, Scale, CheckItem, CheckList, Selection} from "./widgets"
// content elements
import {Website, InlineMath, BlockMath, Image, SpreadSheet, CarryForward } from "./widgets"

// remove these commands for default use
delete baseCommands.selectParentNode
CodeMark.register("command","toggle",null)

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
	spreadsheet: SpreadSheet
}, {
	em: EmMark,
	strong: StrongMark,
	link: LinkMark,
	code: CodeMark
})

const widgetSchema = new Schema(widgetSpec)

let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: {
	float: true,
	groups: ["inline", "block", "insert", "history"]
  },
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom",
  schema: widgetSchema
})

/*pm.setOption("menuBar", false)
pm.setOption("tooltipMenu", {selectedBlockMenu: true})
*/	
defineFileHandler(function(files) {
	console.log(files)
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

