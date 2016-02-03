import {Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {Input} from "./input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class TextField extends Input {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "text"}),
			size: new Attribute({default: "20"}),
			class: new Attribute({default: "widgets-textfield"})
		}
	}
}

defParser(TextField,"input","widgets-textfield")

TextField.register("command", "insert",{
	label: "TextField",
	run(pm, name) {
    	return pm.tr.replaceSelection(this.create({name})).apply(pm.apply.scroll)
  	},
 	params: [
 	  	    { name: "Name", label: "Short ID", type: "text",
 	     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
 	   		  options: {
 	   			  pattern: namePattern, 
 	   			  size: 10, 
 	   			  title: nameTitle}},
 	     	{ name: "Size", label: "Size in characters", type: "number", default: "20", 
 			  prefill: function(pm) { return selectedNodeAttr(pm, this, "size") },
 		      options: {min: 1, max:80}}
 		]
})

insertCSS(`

.ProseMirror .widgets-textfield:hover {
	cursor: pointer;
}

`)