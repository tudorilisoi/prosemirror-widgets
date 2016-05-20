import {Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, selectedNodeAttr} from "../../utils"

const css = "widgets-inlinemath"
	
export class InlineMath extends Inline {
	serializeDOM(node,s) {
		if (node.rendered) {
			node.rendered = node.rendered.cloneNode(true)
		} else {
			node.rendered = elt("span", {class: css+" widgets-edit"}, " \\("+node.attrs.tex+"\\) ")
			// wait until node is attached to document to render
			MathJax.Hub.Queue(["Delay",MathJax.Callback,100],["Typeset",MathJax.Hub,node.rendered])
		}
		return node.rendered;
	}
	get attrs() {
		return {
			tex: new Attribute
		}
	}
}

defParser(InlineMath, "span", css)

InlineMath.register("command", "insert", {
	derive: {
		params: [
	      	{ name: "Latex", attr: "tex", label: "Latex Expression", type: "text", 
	          prefill: function(pm) { return selectedNodeAttr(pm, this, "tex") }}
	    ]
	},
	label: "InlineMath",
	menu: {group: "insert", rank: 71, select: "disable", display: {type: "label", label: "Inline Math"}},
})

defParamsClick(InlineMath,"inlinemath:insert")

insertCSS(`

.ProseMirror .${css} {}

`)