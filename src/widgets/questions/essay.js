import {Block, Attribute} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getLastClicked} from "../../utils"

export class Essay extends Block {
	get attrs() {
		return {
			name: new Attribute,
			rows: new Attribute,
			cols: new Attribute,
			class: new Attribute({default: "widgets-essay widgets-edit"})
		}
	}
	create(attrs, content, marks) {
		return super.create(attrs,[
		    this.schema.nodes.paragraph.create(null,"",marks),
		    this.schema.nodes.textarea.create(attrs,null,marks)],marks)
	}
}

defParser(Essay,"div","widgets-essay")


Essay.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)

Essay.register("command", "insert", {
	label: "Essay",
	run(pm, name, rows, cols) {
		let {from,to,node} = pm.selection
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, {name,rows,cols}).apply()
			return tr
		} else
			return pm.tr.replaceSelection(this.create({name,rows,cols})).apply(pm.apply.scroll)
  	},
    select(pm) { return pm.doc.path(pm.selection.from.path).type.canContainType(this)},
	menu: {group: "question", rank: 72, display: {type: "label", label: "Essay"}, select: "ignore"},
	params: [
  	    { name: "Name", label: "Short ID", type: "text",
     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name")},
   		  options: {
   			  pattern: namePattern, 
   			  size: 10, 
   			  title: nameTitle
   		  }},
   		  { name: "Rows", label: "In lines lines", type: "number", default: "4", options: {min: 2, max:24}, 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "rows") }
   		  },
   	      { name: "Columns", label: "In characters", type: "number", default: "40", 
   			  prefill: function(pm) { return selectedNodeAttr(pm, this, "cols") },
   			  options: {min: 2, max:80}
   		  }
	]
}) 

defParamsClick(Essay,"essay:insert")

insertCSS(`

.ProseMirror .widgets-essay p:hover {
    cursor: text;
}

.ProseMirror .widgets-essay {
	border-top: 1px solid #AAA;
	padding: 8px;
}

`)