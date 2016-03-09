import {Fragment, Block, Attribute, Pos} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked, insertQuestion} from "../../utils"
import {Question, qclass, setChildAttrs} from "./question"
import {checkUniqueName} from "../../widgets"

const css = "widgets-essay"
	
export class Essay extends Question {
	get attrs() {
		return {
			name: new Attribute({default: ""}),
			rows: new Attribute({default: 4}),
			cols: new Attribute({default: 60}),
			class: new Attribute({default: css+" "+qclass})
		}
	}
	defaultContent(attrs) {
		return Fragment.from([
		    this.schema.nodes.paragraph.create(null,""),
		    this.schema.nodes.textarea.create(attrs)
		])
	}
	create(attrs, content, marks) {
		if (!content) content = this.defaultContent(attrs)
		return super.create(attrs,content,marks)
	}
}

defParser(Essay,"div",css)

Essay.register("command", "insert", {
	label: "Essay",
	run(pm, name, rows, cols) {
		let {from,to,node} = pm.selection
		let attrs = {name,rows,cols}
		if (node && node.type == this) {
			pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll)
			from = new Pos(from.path.concat(from.offset),0)
			return setChildAttrs(pm,from,"textarea",attrs)
		} else
			return insertQuestion(pm,from,this.create(attrs))
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
   		  { name: "Rows", attr: "rows", label: "In lines lines", type: "number", default: 4, options: {min: 2, max:24}, 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "rows") }
   		  },
   	      { name: "Columns", attr: "cols", label: "In characters", type: "number", default: 60, 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "cols") },
   			  options: {min: 2, max:80}
   		  }
	]
}) 

defParamsClick(Essay,"essay:insert")

insertCSS(`

.ProseMirror .${css} textarea {
	resize: none;
}

`)