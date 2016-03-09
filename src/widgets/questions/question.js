import {Block, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick} from "../../utils"
import {joinPoint, joinableBlocks, canLift} from "prosemirror/dist/transform"

const css = "widgets-question"
	
export const qclass = css+" widgets-edit"

export function setChildAttrs(pm, pos, type, attrs) {
	pm.doc.path(pos.path).forEach((node,start) => {
		if (node.type.name == type)
			return pm.tr.setNodeType(new Pos(pos.path,start), node.type, attrs).apply()
	})
	return false
}

export class Question extends Block {
	get draggable() { return true }
}

Question.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)

// disable deletion of first question paragraph
Question.register("command", "delete", {
	label: "delete text from question",
	run(pm) {
		let {from,to,head} = pm.selection, para = pm.doc.path(from.path)
		if (from.offset > 0 || para.type.name != "paragraph") return false
		from = from.shorten()
		let parent = pm.doc.path(from.path)
		if (!(parent.type instanceof Question)) return false
		return parent.firstChild == para
	},
	keys: ["Backspace(10)", "Mod-Backspace(10)"]
})

// disable lifting on empty paragraph
Question.register("command", "enter", {
	label: "process enter",
	run(pm) {
		let {from,node} = pm.selection, para = pm.doc.path(from.path) 
		if (node && node.type instanceof Question) {
			let parent = pm.doc.path(from.path)
			if (parent.lastChild == node || !parent.child(from.offset+1).isTextblock) {
				let side = from.move(1)
			    pm.tr.insert(side, pm.schema.defaultTextblockType().create()).apply(pm.apply.scroll)
			    pm.setTextSelection(new Pos(side.toPath(), 0))
			}
			return true
		}
		if (from.offset > 0 || para.type.name != "paragraph") return false
		let parent = pm.doc.path(from.shorten().path)
		return (parent.type instanceof Question)
	},
	keys: ["Enter(10)", "Mod-Enter(10)"]
})

insertCSS(`
		
.${css} {
	counter-increment: qcnt;
	border: 1px solid #DDD;
    border-radius: 4px;
	padding: 8px;
	margin-top: 1em;
}

.${css}:before {
	content: counter(qcnt) ".";
	font-size: 80%;
	font-weight: bold;
//	cursor: move;
}

.ProseMirror .${css} p:hover {
    cursor: text;
}

`)