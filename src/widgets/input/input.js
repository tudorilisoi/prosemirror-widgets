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
	get contains() { return null}
}

defParser(Input,"widgets-input")

Input.prototype.serializeDOM = node => elt("input",node.attrs)

// hack to lock 
Input.register("command", "delete", {
  run(pm) { 
	  let {from, node} = pm.selection
	  return node && node.type == this? true: false
  },
  keys: ["Backspace(10)", "Mod-Backspace(10)"]
})

insertCSS(`
		
.widgets-input {}

`)