import {Fragment, Block, Attribute, Pos} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked, insertWidget} from "../../utils"
import {Question} from "./question"

export class Essay extends Question {
	get attrs() {
		return {
			name: new Attribute,
			rows: new Attribute,
			cols: new Attribute,
			class: new Attribute({default: "widgets-essay"})
		}
	}
	create(attrs, content, marks) {
		let ta = this.schema.nodes.textarea.create(attrs)
		if (content) {
			// remove textarea and update with new node
			let nodes = content.toArray(); nodes.pop()
			content = Fragment.fromArray(nodes.concat(ta))
		} else
			content = Fragment.from([this.schema.nodes.paragraph.create(null,""),ta])
		return super.create(attrs,content,marks)
	}
}

defParser(Essay,"div","widgets-essay")

Essay.register("command", "insert", {
	label: "Essay",
	run(pm, name, rows, cols) {
		let {from,to,node} = pm.selection
		if (node && node.type == this) {
			let sdisplay = new Pos(from.path.concat(from.offset),node.size-1)
			return pm.tr.setNodeType(from, this, {name,rows,cols}).apply(pm.apply.scroll)
		} else
			return insertWidget(pm,from,this.create({name,rows,cols}))
  	},
    select(pm) { return pm.doc.path(pm.selection.from.path).type.canContainType(this)},
	menu: {group: "question", rank: 72, display: {type: "label", label: "Essay"}, select: "ignore"},
	params: [
  	    { name: "Name", attr: "name", label: "Short ID", type: "text",
     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name")},
   		  options: {
   			  pattern: namePattern, 
   			  size: 10, 
   			  title: nameTitle
   		  }},
   		  { name: "Rows", attr: "rows", label: "In lines lines", type: "number", default: "4", options: {min: 2, max:24}, 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "rows") }
   		  },
   	      { name: "Columns", attr: "cols", label: "In characters", type: "number", default: "40", 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "cols") },
   			  options: {min: 2, max:80}
   		  }
	]
}) 

defParamsClick(Essay,"essay:insert")

insertCSS(`

`)