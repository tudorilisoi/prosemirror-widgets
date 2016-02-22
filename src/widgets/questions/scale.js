import {Fragment, Block, Paragraph, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, insertWidget} from "../../utils"
import {Question} from "./question"

export class ScaleDisplay extends Block {
	get attrs() {
		return {
			name: new Attribute,
			startvalue: new Attribute({default: "1"}),
			startlabel: new Attribute({default: "low"}),
			endvalue: new Attribute({default: "10"}),
			endlabel: new Attribute({default: "high"}),
		}
	}
}

ScaleDisplay.prototype.serializeDOM = (node,s) => {
	let startVal = Number(node.attrs.startvalue)
	let endVal = Number(node.attrs.endvalue)
	let mid = String(Math.round((Math.abs(endVal - startVal))/2))
	let out = elt("output",{for: node.attrs.name},mid)
	let setOutputValue
	if (startVal < endVal) {
		setOutputValue = function(val) { out.value = val }
	} else {
		let max = startVal
		setOutputValue = function(val) { out.value = max - val }
		endVal = startVal - endVal; startVal = 0
	}
	let range = elt("input",{class: "widgets-input", value: mid, name:node.attrs.name, id: node.attrs.name, type: "range", min: startVal, max: endVal, contenteditable: false})
	range.addEventListener("input",e => {
    	e.stopPropagation()
    	setOutputValue(e.originalTarget.valueAsNumber)
	})
	return elt("div",node.attrs,
		elt("span", null, node.attrs.startlabel),
		range,
		elt("span", null,node.attrs.endlabel),
		out
	)
}

export class Scale extends Question {
	static get contains() { return "text"}
	get attrs() {
		return {
			name: new Attribute,
			startvalue: new Attribute({default: "1"}),
			startlabel: new Attribute({default: "low"}),
			endvalue: new Attribute({default: "10"}),
			endlabel: new Attribute({default: "high"}),
			class: new Attribute({default: "widgets-scale"})
		}
	}
	create(attrs, content, marks) {
		let sd = this.schema.nodes.scaledisplay.create(attrs)
		if (content) {
			// remove scaledisplay and update with new node
			let nodes = content.toArray(); nodes.pop()
			content = Fragment.fromArray(nodes.concat(sd))
		} else
			content = Fragment.from([this.schema.nodes.paragraph.create(null,""),sd])
		return super.create(attrs,content,marks)
	}
}

defParser(Scale,"div","widgets-scale")

Scale.register("command", "insert",{
	label: "Scale",
	run(pm, name, startvalue, startlabel, endvalue, endlabel) {
		let {from,to,node} = pm.selection
		if (node && node.type == this)
			return pm.tr.setNodeType(from, this, {name,startvalue,startlabel,endvalue,endlabel}).apply(pm.apply.scroll)
		else 
			return insertWidget(pm,from,this.create({name,startvalue,startlabel,endvalue,endlabel}))
  	},
	menu: {group: "question", rank: 74, display: {type: "label", label: "Scale"}},
	params: [
  	    { name: "Name", attr: "name", label: "Short ID", type: "text",
     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
   		  options: {
   			  pattern: namePattern, 
   			  size: 10, 
   			  title: nameTitle}},
     	{ label: "Start value", attr: "startvalue", type: "number", default: 1, 
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "startvalue") }},
     	{ name: "Start Label", attr: "startlabel", label: "Text on left", type: "text", default: "low",
		  prefill: function(pm) { return selectedNodeAttr(pm, this, "startlabel") }},
     	{ label: "End value", attr: "endvalue", type: "number", default: 10,
  	      prefill: function(pm) { return selectedNodeAttr(pm, this, "endvalue") }},
     	{ name: "End Label", attr: "endlabel", label: "Text on right", type: "text", default: "high", 
  		  prefill: function(pm) { return selectedNodeAttr(pm, this, "endlabel") }}
	]
})

defParamsClick(Scale,"scale:insert")

insertCSS(`

.widgets-scaleitem {
	display: inline-block;
	text-align: center;
}

.widgets-scale input {
	vertical-align: middle;
	display: inline;
}

.widgets-scale output {
	vertical-align: middle;
	border-radius: 4px;
	text-align: right;
	height: 20px;
	border: 1px solid #AAA;
	display: inline;
	padding: 2px;
	margin: 4px;
	background: white;
}

.widgets-scale span {
	vertical-align: middle;
	font-weight: normal;
	display: inline;
}

.widgets-scale div {
	display: inline-block;
	padding: 4px;
    border-radius: 6px;
    border: 1px solid #AAA;
	background: #EEE;
}
`)