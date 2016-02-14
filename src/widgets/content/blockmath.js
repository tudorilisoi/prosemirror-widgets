import {Block, Attribute} from "prosemirror/dist/model"
import {elt,insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, selectedNodeAttr,insertWidget} from "../../utils"
 
export class BlockMath extends Block {
	get attrs() {
		return {
			tex: new Attribute({default: ""})
		}
	}
	get contains() { return null }
}

defParser(BlockMath,"div","widgets-blockmath")

BlockMath.prototype.serializeDOM = node => {
	if (node.rendered) {
		node.rendered = node.rendered.cloneNode(true)
	} else {
		node.rendered = elt("div", {class: "widgets-blockmath widgets-edit"}, "\\["+node.attrs.tex+"\\]");
		// wait until node is attached to document to render
		MathJax.Hub.Queue(["Delay",MathJax.Callback,100],["Typeset",MathJax.Hub,node.rendered])
	}
	return node.rendered; 
}

BlockMath.register("command", "insert", {
	derive: {
		params: [
	      	{ name: "Latex", attr: "tex", label: "Latex Expression", type: "text", 
	      	  prefill: function(pm) { return selectedNodeAttr(pm, this, "tex") }}
	    ]
	},
	label: "BlockMath",
	menu: {group: "content", rank: 72, display: {type: "label", label: "Block Math"}},
})

defParamsClick(BlockMath,"blockmath:insert")

insertCSS(`

.ProseMirror .widgets-blockmath {}

`)