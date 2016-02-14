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
    return pos.shorten()	
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
export class JustifyAlign extends Align { get style() { return "widgets-justifyalign"}}


defParser(LeftAlign,"div","icons/leftalign.png")
defParser(CenterAlign,"div","widgets-centeralign")
defParser(RightAlign,"div","widgets-rightalign")
defParser(JustifyAlign,"div","widgets-justifyalign")

function defAlign(type,label,icon) {
	type.register("command", "align", {
		run(pm) { return findAlignWrapper(pm,this)},
		label: label,
		menu: {
			group: "align", rank: 51,
			display: {
				render(cmd) { return elt("img",{src: icon, width: "14px", height: "14px", title: label, style: "margin: 0 4px 0 4px"}) }
			}
		}
	})
}

defAlign(LeftAlign,"Left Align","icons/leftalign.png")
defAlign(CenterAlign,"Center Align","icons/centeralign.png")
defAlign(RightAlign,"Right Align","icons/rightalign.png")
defAlign(JustifyAlign,"Justify Align","icons/justifyalign.png")

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