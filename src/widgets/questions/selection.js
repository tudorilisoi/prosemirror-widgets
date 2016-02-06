import {Block, Attribute} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {Select} from "../input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked} from "../../utils"

export class Selection extends Block {
	get attrs() {
		return {
			name: new Attribute,
			options: new Attribute,
			size: new Attribute({default: 1}),
		    multiple: new Attribute({default: "single"}),
		    class: new Attribute({default: "widgets-selection widgets-edit"})
		}
	}
	create(attrs, content, marks) {
		return super.create(attrs,[
		    this.schema.nodes.paragraph.create(null,"",marks),
		    this.schema.nodes.select.create(attrs,null,marks)],marks)
	}
}

defParser(Selection,"div","widgets-selection")


Selection.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)

Selection.register("command", "insert", {
	label: "Selection",
	run(pm, name, options, size, multiple) {
		let {from,to,node} = pm.selection
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, {name,options,size,multiple}).apply()
			return tr
		} else
			return pm.tr.replaceSelection(this.create({name,options,size,multiple})).apply(pm.apply.scroll)
  	},
	menu: {group: "question", rank: 75, display: {type: "label", label: "Selection"}},
	params: [
	   	    { name: "Name", label: "Short ID", type: "text",
	      	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
	    		  options: {
	    			  pattern: namePattern, 
	    			  size: 10, 
	    			  title: nameTitle}},
	       	{ name: "Options", label: "comma separated names", type: "text", 
	 		  prefill: function(pm) { return selectedNodeAttr(pm, this, "options") }},
 		    { name: "Size", label: "options displayed", type: "number", default: 1,
 			  prefill: function(pm) { return selectedNodeAttr(pm, this, "options") },
 			  options: { min: 1, max:10}
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

defParamsClick(Selection,"selection:insert")

insertCSS(`

.ProseMirror .widgets-selection p:hover {
    cursor: text;
}

.ProseMirror .widgets-selection {
	border-top: 1px solid #AAA;
	padding: 8px;
}

`)