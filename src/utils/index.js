export {widgetParamHandler, defineFileHandler, namePattern, nameTitle, defParamsClick, selectedNodeAttr} from "./params"
import {Pos} from "prosemirror/dist/model"
import {selectableNodeAbove} from "prosemirror/dist/edit/selection"
import {widgetParamHandler} from "./params"

export const onResize = require("prosemirror/node_modules/element-resize-event/index.js")	 

export function defParser(type,tag,cls) {
	type.register("parseDOM", tag, {
		parse(dom, state) {
			if (!dom.classList.contains(cls)) return false
		    let attrs = Object.create(null)
		    for (let name in this.attrs) attrs[name] = dom.getAttribute(name)
			state.wrapIn(dom,this,attrs)
		}
	})	
}

export function getPosInParent(pm, pos, child) {
	let i = 0, parent = pm.doc.path(pos.path)
	parent.forEach((node,start,end) => { if (node == child) i = start })
	return new Pos(pos.path,i)
}

export function nodeBefore(pm, pos) {
    let before, cut
    for (let i = pos.path.length - 1; !before && i >= 0; i--) if (pos.path[i] > 0) {
      cut = pos.shorten(i)
      before = pm.doc.path(cut.path).child(cut.offset - 1)
    }
    return {before,at: new Pos(cut.path,cut.offset-1)}
}

export function getID() {
	return Math.floor(Math.random() * 0xffffffff)
}

export function getTopPos(pos) {
	for (;;) {
		if (pos.depth == 0) return pos
		pos = pos.shorten(null,1)
	}	
}

export function getBlockPos(pm,pos) {
	for (;;) {
		if (pos.depth == 0) return pos
		let node = pm.doc.path(pos.path)
		if (node.isBlock) {
			let p = getPosInParent(pm,pos.shorten(),node)
			return pos.offset? p.move(1): p
		}
		pos = pos.shorten(null,1)
	}	
}

export function insertQuestion(pm,pos,q) {
	let p = getTopPos(pos)
	pm.tr.insert(p,q).apply(pm.apply.scroll)
	// set text cursor to paragraph in widget
	let side = getPosInParent(pm,p,q)
	p = new Pos(side.toPath(), 0)
	if (q.firstChild && q.firstChild.isTextblock)
    	pm.setTextSelection(new Pos(p.toPath(),0))
	return true
}

export function insertWidget(pm, pos, w) {
	return pm.tr.insert(getBlockPos(pm,pos),w).apply(pm.apply.scroll)
}

export function addDropListeners(pm) {
	pm.content.addEventListener("drop", e => {
		return false
		let html = e.dataTransfer.getData("text/html")
		console.log(html)
		e.preventDefault()
		return true
	})
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

