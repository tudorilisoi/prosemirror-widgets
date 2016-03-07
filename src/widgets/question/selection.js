import {Fragment,Block, Attribute, Pos} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {Select} from "../input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked, insertWidget} from "../../utils"
import {Question, qclass} from "./question"

const css = "widgets-selection"
	
export class Selection extends Question {
	get attrs() {
		return {
			name: new Attribute({default: ""}),
			options: new Attribute({default: ""}),
			size: new Attribute({default: 1}),
		    multiple: new Attribute({default: "single"}),
		    class: new Attribute({default: css+" "+qclass})
		}
	}
	defaultContent(attrs) {
		if (!attrs) attrs = getDefaultAttrs()
		return Fragment.from([
		     this.schema.nodes.paragraph.create(null,""),
		     this.schema.nodes.select.create(attrs)
		])
	}
}

defParser(Selection,"div",css)

Selection.register("command", "insert", {
	label: "Selection",
	run(pm, name, options, size, multiple) {
		let {from,to,node} = pm.selection
		let attrs = {name,options,size,multiple}
		if (node && node.type == this)
			return pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll)
		else
			return insertWidget(pm,from,this.create(attrs,this.defaultContent(attrs)))
  	},
	menu: {group: "question", rank: 75, display: {type: "label", label: "Selection"}},
	params: [
	   	    { name: "Name", attr: "name", label: "Short ID", type: "text",
	      	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
	    		  options: {
	    			  pattern: namePattern, 
	    			  size: 10, 
	    			  title: nameTitle}},
	       	{ name: "Options", attr: "options", label: "comma separated names", type: "text", 
	 		  prefill: function(pm) { return selectedNodeAttr(pm, this, "options") }},
 		    { name: "Displayed", attr: "size", label: "options displayed", type: "number", default: 1,
 			  prefill: function(pm) { return selectedNodeAttr(pm, this, "size") },
 			  options: { min: 1, max:10}
 			},
	      	{ name: "Selection", attr: "multiple", label: "Selection (single or multiple)", type: "select", default:"single", 
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

`)