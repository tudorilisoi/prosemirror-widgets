export {Question, Input, TextBox, CheckList, CheckItem, MultipleChoice, Choice, ScaleDisplay, Scale, Essay, ShortAnswer, Selection} from "./questions"
export {BlockMath,CarryForward,Image,InlineMath,SpreadSheet,Website} from "./content"
export {Input, CheckBox, RadioButton, Select, TextField, TextArea} from "./input"

import {insertCSS} from "prosemirror/dist/dom"
import {Dropdown, MenuCommandGroup} from "prosemirror/dist/menu/menu"

export const contentInsertMenu = new Dropdown({label: "Content..", displayActive: true, class: "ProseMirror-widgetinsert-dropdown"}, [new MenuCommandGroup("content")])
export const questionInsertMenu = new Dropdown({label: "Question..", displayActive: true, class: "ProseMirror-widgetinsert-dropdown"}, [new MenuCommandGroup("question")])

insertCSS(`

.ProseMirror .widgets-edit:hover {
	background-image: url('icons/settings.png');
	background-repeat: no-repeat;
	background-position: top right;
	cursor: pointer;
 }

.ProseMirror-menu-dropdown-item {
	white-space: nowrap;
}

.ProseMirror-menu-dropdown-menu {
	border-radius: 6px;
}

.ProseMirror-menu-submenu {
	border-radius: 6px;
}

`)








