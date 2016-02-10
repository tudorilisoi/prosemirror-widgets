export {Question, Input, TextBox, CheckList, CheckItem, MultipleChoice, Choice, ScaleDisplay, Scale, Essay, ShortAnswer, Selection} from "./questions"
export {BlockMath,CarryForward,Image,InlineMath,SpreadSheet,Website} from "./content"
export {Input, CheckBox, RadioButton, Select, TextField, TextArea} from "./input"

import {insertCSS} from "prosemirror/dist/dom"
import {Dropdown, DropdownSubmenu, MenuCommandGroup} from "prosemirror/dist/menu/menu"

const contentInsertMenu = new DropdownSubmenu({label: "Content"}, [new MenuCommandGroup("content")])
const questionInsertMenu = new DropdownSubmenu({label: "Question"}, [new MenuCommandGroup("question")])

export const widgetInsertMenu = new Dropdown(
  {label: "Insert..", displayActive: true, class: "ProseMirror-widgetinsert-dropdown"},
  [contentInsertMenu, questionInsertMenu]
)

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








