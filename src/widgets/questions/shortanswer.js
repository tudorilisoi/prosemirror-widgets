import {Block, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {TextField} from "../input"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class ShortAnswer extends Block {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "text"}),
			size: new Attribute({default: "20"}),
			class: new Attribute({default: "widgets-shortanswer widgets-edit"})
		}
	}	
	create(attrs, content, marks) {
		return super.create(attrs,[
		    this.schema.nodes.paragraph.create(null,"",marks),
		    this.schema.nodes.textfield.create(attrs)],marks)
	}
}

ShortAnswer.prototype.serializeDOM = (node, s) => s.renderAs(node,"div",node.attrs)


defParser(ShortAnswer,"div","widgets-shortanswer")

ShortAnswer.register("command", "insert", {
	label: "Short Answer",
	run(pm, name, size) {
    	return pm.tr.replaceSelection(this.create({name,size})).apply(pm.apply.scroll)
  	},
	menu: {group: "question", rank: 71, display: {type: "label", label: "Short Answer"}},
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

defParamsClick(ShortAnswer, "shortanswer:insert")

insertCSS(`

.ProseMirror .widgets-shortanswer p:hover {
    cursor: text;
}


.ProseMirror .widgets-shortanswer {
	border-top: 1px solid #AAA;
	padding: 8px;
}

`)