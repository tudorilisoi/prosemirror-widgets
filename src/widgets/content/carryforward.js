import {Block, Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"
 
function getCarryOptions(names) {
	return names.map(w => ({value: w, label: w}))
}
 
export class CarryForward extends Inline {
	get attrs() {
		return {
			name: new Attribute,
			model: new Attribute({default: "user_response"}),
			type: new Attribute({default: "carry_forward"}),
			class: new Attribute({default: "widgets-carryforward widgets-edit"})
		}
	}
}
                             
defParser(CarryForward,"thinkspace","widgets-carryforward")

CarryForward.prototype.serializeDOM = node => {
	return elt("thinkspace",node.attrs,
		elt("img",{src: "forward.png", width:16, height:16, title:"Carry forward "+node.attrs.name})
	)
}

CarryForward.register("command", "insert", {
	derive: {
		params: [ 
		   { name: "Name", attr: "name", label: "Element name", type: "select",
	         prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
	  		 options: function() { return getCarryOptions(["test1","test2"])}}
	 	]
	},
	label: "CarryForward",
	menu: {group: "content", rank: 73, display: {type: "label", label: "Carry Forward"}},
})

defParamsClick(CarryForward,"carryforward:insert",["all"])

insertCSS(`

.ProseMirror .widgets-carryforward img:hover {
	cursor: pointer;
}

`)