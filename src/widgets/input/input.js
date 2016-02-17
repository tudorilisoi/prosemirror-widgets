import {Block, Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"

export class Input extends Block {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "text"}),
			value: new Attribute
		}
	}
	get selectable() { return false }
	get contains() { return null}
}

defParser(Input,"widgets-input")

Input.prototype.serializeDOM = node => elt("input",node.attrs)

insertCSS(`
		
.widgets-input {}

`)