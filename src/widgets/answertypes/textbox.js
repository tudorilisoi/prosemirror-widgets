import {Text, Inline, Textblock, Fragment} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"

export class TextBox extends Text {
}

defParser(TextBox,"div","widgets-textbox")

TextBox.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",{class: "widgets-textbox"})


insertCSS(`

.widgets-textbox {
	margin-left: 1.2em;
    border: 1px solid #EEE;
}

.ProseMirror .widgets-textbox:empty:before {
	content: "enter stuff here";
	opacity: 0.3;
}

`)