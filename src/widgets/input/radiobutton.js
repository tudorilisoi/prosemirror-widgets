import {Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"
import {Input} from "./input"

export class RadioButton extends Input {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "radio"}),
			value: new Attribute,
			class: new Attribute({default: "widgets-radiobutton"})
		}
	}
}

defParser(RadioButton,"input","widgets-radiobutton")

insertCSS(`

.widgets-radiobutton {}

`)