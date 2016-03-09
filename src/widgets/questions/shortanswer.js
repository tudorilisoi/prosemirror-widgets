import {Fragment, Block, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {TextField} from "../input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, insertQuestion} from "../../utils"
import {Question, qclass, setChildAttrs} from "./question"

const css = "widgets-shortanswer"
	 
export class ShortAnswer extends Question {
	get attrs() {
		return {
			name: new Attribute,
			size: new Attribute({default: "20"}),
			class: new Attribute({default: css+" "+qclass})
		}
	}
	defaultContent(attrs) {
		return Fragment.from([
		    this.schema.nodes.paragraph.create(null,""),
		    this.schema.nodes.textfield.create(attrs)
		])
	}
	create(attrs, content, marks) {
		if (!content) content = this.defaultContent(attrs)
		return super.create(attrs,content,marks)
	}
}

defParser(ShortAnswer,"div",css)

ShortAnswer.register("command", "insert", {
	label: "Short Answer",
	run(pm, name, size) {
		let {from,to,node} = pm.selection
		let attrs = {name,size}
		if (node && node.type == this) {
			pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll)
			from = new Pos(from.path.concat(from.offset),0)
			return setChildAttrs(pm,from,"textfield",attrs)
		} else
			return insertQuestion(pm,from,this.create(attrs))
  	},
	menu: {group: "question", rank: 71, display: {type: "label", label: "Short Answer"}},
	params: [
  	    { name: "Name", attr: "name", label: "Short ID", type: "text",
     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
   		  options: {
   			  pattern: namePattern, 
   			  size: 10, 
   			  title: nameTitle}},
     	{ name: "Size", attr: "size", label: "Size in characters", type: "number", default: "20", 
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "size") },
	      options: {min: 1, max:80}}
	]
})

defParamsClick(ShortAnswer, "shortanswer:insert")

insertCSS(`
`)