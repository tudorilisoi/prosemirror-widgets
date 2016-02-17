import {MenuCommandGroup} from "prosemirror/dist/menu/menu"
import {Doc, Paragraph, Textblock, Block, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {canWrap} from "prosemirror/dist/transform"
import {defParser,getPosInParent} from "../../utils"

function getTextblockPos(pm,pos) {
	let node
	for (;;) {
		node = pm.doc.path(pos.path)
		if (node.type instanceof Textblock || pos.depth == 0) break
	    pos = pos.shorten()
	}
    return pos.depth > 0?pos.shorten():pos	
}

function findAlignWrapper(pm,align) {
	let {from, to, node} = pm.selection, isLeft = align.name == "leftalign"
	let start = getTextblockPos(pm,from)
	let parent = pm.doc.path(start.path)
	if (parent.type instanceof Align) {
		if (isLeft)
			return pm.tr.lift(new Pos(start.path,0), new Pos(start.path,parent.size)).apply(pm.apply.scroll)
		else
			return pm.tr.setNodeType(getPosInParent(pm,start.shorten(),parent),align,{class: align.style}).apply(pm.apply.scroll)
	} else {
		if (isLeft) return false  //left is default and doesn't need wrapper
		let end = from.cmp(to)? getTextblockPos(pm,to): start
		return pm.tr.wrap(start,end.move(1),align,{class: align.style}).apply(pm.apply.scroll)
	}
}

class Align extends Block {
	get attrs() { return {class: new Attribute({default: "widgets-leftalign"})} }
	get contains() { return "block" }
}

Align.prototype.serializeDOM = (node,s) => s.renderAs(node,"div", node.attrs)

export const alignGroup = new MenuCommandGroup("align")

export class LeftAlign extends Align { get style() { return  "widgets-leftalign"}}
export class CenterAlign extends Align { get style() { return "widgets-centeralign"}}
export class RightAlign extends Align { get style() { return  "widgets-rightalign"}}


defParser(LeftAlign,"div","icons/leftalign.png")
defParser(CenterAlign,"div","widgets-centeralign")
defParser(RightAlign,"div","widgets-rightalign")

function alignApplies(pm,type) {
	let {from, to, node} = pm.selection, isLeft = type.name == "leftalign"
	let start = getTextblockPos(pm,from)
	let parent = pm.doc.path(start.path)
	if (isLeft && !(parent.type instanceof Align)) return true
	return parent.type.name == type.name
}

function defAlign(type,label,path) {
	type.register("command", "align", {
		run(pm) { return findAlignWrapper(pm,this)},
		active(pm) { return alignApplies(pm, this)},
		label: label,
		menu: {
			group: "align", rank: 51,
		    display: {
		      type: "icon",
		      width: 8, height: 8,
		      path: path
		    }
		}
	}
)}

defAlign(LeftAlign,"Left Align","M0 0v1h8v-1h-8zm0 2v1h6v-1h-6zm0 2v1h8v-1h-8zm0 2v1h6v-1h-6z")
defAlign(CenterAlign,"Center Align","M0 0v1h8v-1h-8zm1 2v1h6v-1h-6zm-1 2v1h8v-1h-8zm1 2v1h6v-1h-6z")
defAlign(RightAlign,"Right Align","M0 0v1h8v-1h-8zm2 2v1h6v-1h-6zm-2 2v1h8v-1h-8zm2 2v1h6v-1h-6z")

insertCSS(`
div.widgets-leftalign {
	text-align: left;
}

div.widgets-centeralign {
	text-align: center;
}

div.widgets-rightalign {
	text-align: right;
}

div.widgets-justifyalign {
	text-align: justify;
}

`)