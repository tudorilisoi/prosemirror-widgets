import {Block, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {Input} from "./input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class TextArea extends Block {
	get attrs() {
		return {
			name: new Attribute,
			rows: new Attribute,
			cols: new Attribute,
			class: new Attribute({default: "widgets-textarea"})
		}
	}
}

defParser(TextArea,"textarea","widgets-textarea")

TextArea.prototype.serializeDOM = (node,s) => elt("textarea",node.attrs)
TextArea.register("command", "insert",{
	label: "TextArea",
	run(pm, name, rows, cols) {
    	return pm.tr.replaceSelection(this.create({name,rows,cols})).apply(pm.apply.scroll)
  	},
	params: [
   	    { name: "Name", label: "Short ID", type: "text",
       	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name")},
     		  options: {
     			  pattern: namePattern, 
     			  size: 10, 
     			  title: nameTitle
     		  }},
     		  { name: "Rows", label: "In lines", type: "number", default: "4", options: {min: 2, max:24}, 
     			  prefill: function(pm) { return selectedNodeAttr(pm, this, "rows") }
     		  },
     	      { name: "Columns", label: "In characters", type: "number", default: "40", 
     			  prefill: function(pm) { return selectedNodeAttr(pm, this, "cols") },
     			  options: {min: 2, max:80}
     		  }
   	]
})

insertCSS(`

.ProseMirror .widgets-textarea:hover {
	cursor: pointer;
}

`)