export {Input, TextBox, CheckList, CheckItem, MultipleChoice, Choice, ScaleDisplay, Scale, Essay, ShortAnswer, Selection} from "./questions"
export {BlockMath,CarryForward,Image,InlineMath,SpreadSheet,Website} from "./content"
export {Input, CheckBox, RadioButton, Select, TextField, TextArea} from "./input"
import {insertCSS} from "prosemirror/dist/dom"

insertCSS(`

.ProseMirror .widgets-edit:hover {
	background-image: url('icons/settings.png');
	background-repeat: no-repeat;
	background-position: top left;
	cursor: pointer;
 }

`)








