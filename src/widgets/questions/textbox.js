import {Inline, Block, Textblock} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"

export class TextBox extends Textblock {
}

defParser(TextBox,"div","widgets-textbox")

TextBox.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",{class: "widgets-textbox"})


insertCSS(`

.widgets-textbox {
	margin-left: 1.2em;
}

`)