export {widgetParamHandler, defineFileHandler, namePattern, nameTitle, defParamsClick, selectedNodeAttr} from "./params"
import {Pos} from "prosemirror/dist/model"
import {selectableNodeAbove} from "prosemirror/dist/edit/selection"
import {widgetParamHandler} from "./params"

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
	parent.forEach((node,start) => { i = node == child?start: 0 })
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

export function insertWidget(pm, pos, w) {
  for (;;) {
    if (pos.depth == 0) {
    	pm.tr.insert(pos,w).apply(pm.apply.scroll)
    	if (w.firstChild && w.firstChild.isTextblock)
    		pm.on("change",() => {
	        	let side = getPosInParent(pm,pos,w)
	        	let p = new Pos(side.toPath(), 0)
	    		pm.setTextSelection(new Pos(p.toPath(),0))
    		})
    	return true
    }
    pos = pos.shorten(null,1)
  }
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

