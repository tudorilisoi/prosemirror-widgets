export {widgetParamHandler, defineFileHandler, namePattern, nameTitle, defParamsClick, selectedNodeAttr} from "./params"
import {Pos} from "prosemirror/dist/model"
import {selectableNodeAbove} from "prosemirror/dist/edit/selection"
import {widgetParamHandler} from "./params"

if (window.MathJax)
	MathJax.Hub.Queue(function () {
	    MathJax.Hub.Config({
	    	tex2jax: {
	        	displayMath: [ ["\\[","\\]"] ], 
	        	inlineMath: [ ["\\(","\\)"] ],
	        	processEscapes: true
	    	},
	    	displayAlign:"left"
		})
	})

export function defParser(type,tag,cls) {
	type.register("parseDOM", {
		tag: tag,
		rank: 25,
		parse: (dom, context, type, attrs) => {
			let contains = dom.classList.contains(cls)
			if (!contains) return false
			context.insertFrom(dom, type, attrs)
		}
	})	
}

export function getPosInParent(pm, pos, child) {
	let i = 0, parent = pm.doc.path(pos.path)
	parent.forEach((node,start) => { i = node == child?start: 0 })
	return new Pos(pos.path,i)
}

/*import {InputRule} from "prosemirror/dist/inputrules"
let urlex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/
LinkMark.register("autoInput","startLink", new InputRule(urlex," ",
	function(pm, match, pos) {
		let url = match[0]
		console.log(url)
		pm.setMark(this,pos,{href: url, title: ""})
	}
))*/

