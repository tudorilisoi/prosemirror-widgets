import {Fragment, Block, Paragraph, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, insertWidget} from "../../utils"
import {Question, qclass} from "./question"

export class ScaleDisplay extends Block {
	get attrs() {
		return {
			name: new Attribute,
			startvalue: new Attribute({default: "1"}),
			startlabel: new Attribute({default: "low"}),
			endvalue: new Attribute({default: "10"}),
			endlabel: new Attribute({default: "high"}),
			class: new Attribute({default: "widgets-scaledisplay"})
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
	return elt("div",node.attrs,elt("span", null, node.attrs.startlabel),range,elt("span", null,node.attrs.endlabel),out)
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
			class: new Attribute({default: "widgets-scale "+qclass})
		}
	}
}

defParser(Scale,"div","widgets-scaledisplay")
defParser(Scale,"div","widgets-scale")

Scale.register("command", "insert",{
	label: "Scale",
	run(pm, name, startvalue, startlabel, endvalue, endlabel) {
		let {from,to,node} = pm.selection
		if (node && node.type == this)
			return pm.tr.setNodeType(from, this, {name,startvalue,startlabel,endvalue,endlabel}).apply(pm.apply.scroll)
		else {
			let content = Fragment.from([
			    this.schema.nodes.paragraph.create(null,""),
			    this.schema.nodes.scaledisplay.create({name,startvalue, startlabel, endvalue, endlabel})
			])
			return insertWidget(pm,from,this.create({name,startvalue,startlabel,endvalue,endlabel},content))
		}
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

.widgets-scaledisplay {
	display: inline-block;
	text-align: center;
	font-size: 80%;
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
}

.widgets-scale input[type=range] {
    /*removes default webkit styles*/
    -webkit-appearance: none;
    
    /*fix for FF unable to apply focus style bug */
    border: 1px solid white;
    
    /*required for proper track sizing in FF*/
    width: 200px;
}
.widgets-scale input[type=range]::-webkit-slider-runnable-track {
    width: 200px;
    height: 5px;
    background: skyblue;
    border: none;
    border-radius: 3px;
}
.widgets-scale input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: navy;
    margin-top: -4px;
}
.widgets-scale input[type=range]:focus {
    outline: none;
}
.widgets-scale input[type=range]:focus::-webkit-slider-runnable-track {
    background: #ccc;
}

.widgets-scale input[type=range]::-moz-range-track {
    width: 200px;
    height: 5px;
    background: skyblue;
    border: none;
    border-radius: 3px;
}
.widgets-scale input[type=range]::-moz-range-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: navy;
}

/*hide the outline behind the border*/
.widgets-scale input[type=range]:-moz-focusring{
    outline: 1px solid white;
    outline-offset: -1px;
}

.widgets-scale input[type=range]::-ms-track {
    width: 200px;
    height: 5px;
    
    /*remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead */
    background: transparent;
    
    /*leave room for the larger thumb to overflow with a transparent border */
    border-color: transparent;
    border-width: 6px 0;

    /*remove default tick marks*/
    color: transparent;
}
.widgets-scale input[type=range]::-ms-fill-lower {
    background: ;
    border-radius: 10px;
}
.widgets-scale input[type=range]::-ms-fill-upper {
    background: #ddd;
    border-radius: 10px;
}
.widgets-scale input[type=range]::-ms-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: navy;
}
.widgets-scale input[type=range]:focus::-ms-fill-lower {
    background: #888;
}
.widgets-scale input[type=range]:focus::-ms-fill-upper {
    background: #ccc;
}
`)