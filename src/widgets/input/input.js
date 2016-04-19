import {Block, Inline, Attribute,NodeKind} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"

const css = "widgets-input"
	
export class Input extends Inline {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "text"}),
			value: new Attribute
		}
	}
	get selectable() { return false }
	get contains() { return null }
}

defParser(Input,css)

Input.prototype.serializeDOM = node => elt("input",node.attrs)

insertCSS(`
		
.${css} {}

`)