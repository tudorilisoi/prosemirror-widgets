import {Fragment,Block, Attribute, Pos} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {Select} from "../input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked, insertWidget} from "../../utils"
import {Question, qclass} from "./question"

export class Selection extends Question {
	get attrs() {
		return {
			name: new Attribute,
			options: new Attribute,
			size: new Attribute({default: 1}),
		    multiple: new Attribute({default: "single"}),
		    class: new Attribute({default: "widgets-selection "+qclass})
		}
	}
}

defParser(Selection,"div","widgets-selection")

Selection.register("command", "insert", {
	label: "Selection",
	run(pm, name, options, size, multiple) {
		let {from,to,node} = pm.selection
		if (node && node.type == this)
			return pm.tr.setNodeType(from, this, {name,options,size,multiple}).apply(pm.apply.scroll)
		else {
			let content = Fragment.from([
			     this.schema.nodes.paragraph.create(null,""),
			     this.schema.nodes.select.create({name,options,size,multiple})
			])
			return insertWidget(pm,from,this.create({name,options,size,multiple},content))
		}
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
 		    { name: "Size", attr: "size", label: "options displayed", type: "number", default: 1,
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