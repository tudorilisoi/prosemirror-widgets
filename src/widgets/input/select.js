import {Block, Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class Select extends Inline {
	get contains() { return null}
	get attrs() {
		return {
			name: new Attribute,
			options: new Attribute,
			size: new Attribute({default: 1}),
		    multiple: new Attribute({default: "single"})
		}
	}
}

defParser(Select,"select","widgets-select")

Select.prototype.serializeDOM = node => {
	let selection = node.attrs.multiple == "multiple"
	let select = elt("select",node.attrs)
	node.attrs.options.split(",").map(function(option) {
		select.appendChild(elt("option", {value: option.trim()}, option))
	})
	return select
}

//hack to lock 
Select.register("command", "delete", {
  run(pm) { 
	  let {from, node} = pm.selection
	  return node && node.type == this? true: false
  },
  keys: ["Backspace(10)", "Mod-Backspace(10)"]
})

Select.register("command", "insert", {
	label: "Select",
	run(pm, name, options, size, multiple) {
    	return pm.tr.replaceSelection(this.create({name,options,size,multiple})).apply(pm.apply.scroll)
  	},
	params: [
  	    { name: "Name", label: "Short ID", type: "text",
     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
   		  options: {
   			  pattern: namePattern, 
   			  size: 10, 
   			  title: nameTitle}},
      	{ name: "Options", label: "comma separated names", type: "text", 
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "options") }},
	    { name: "Size", label: "options displayed", type: "range", 
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "options") },
		  options: { min: 1, max:10, default: 1}
		},
     	{ name: "Selection", label: "Selection (single or multiple)", type: "select", 
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "multiple") },
		  options: [
     	      {value: "multiple", label:"multiple"},
     	      {value: "single", label:"single"}
     	  ]
		}
	]
})

insertCSS(`

.ProseMirror .widgets-select {}

`)