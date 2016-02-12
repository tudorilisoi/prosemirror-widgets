import {Block, Textblock, Fragment, emptyFragment, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr, getPosInParent, nodeBefore, insertWidget} from "../../utils"
import {Question} from "./question"

export class Choice extends Block {
	get attrs() {
		return {
			name: new Attribute(),
			value: new Attribute(),
			class: new Attribute({default: "widgets-choice"})
		}
	}
	create(attrs, content, marks) {
		let len = content.content.length
		content = Fragment.from([this.schema.nodes.radiobutton.create(attrs),content.content[len-1]])
		return super.create(attrs,content,marks)
	}
}
 
export class MultipleChoice extends Question {
	get attrs() {
		return {
			name: new Attribute,
			class: new Attribute({default: "widgets-multiplechoice"})
		}
	}
	get isList() { return true }
} 

defParser(Choice,"div","widgets-choice")
defParser(MultipleChoice,"div","widgets-multiplechoice")
 
Choice.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)
 
function renumber(pm, pos) {
	let cl = pm.doc.path(pos.path), i = 1
	cl.forEach((node, start) => {
		if (node.type.name == "choice") {
			pm.tr.setNodeType(new Pos(pos.path,start), node.type, {name: cl.attrs.name, value: i++}).apply()
		}
	})
}

Choice.register("command", "split", {
  label: "Split the current choice",
  run(pm) {
    let {from, to, node} = pm.selection
    if ((node && node.isBlock) || from.path.length < 2 || !Pos.samePath(from.path, to.path)) return false
    let toParent = from.shorten(), parent = pm.doc.path(toParent.path)
    if (parent.type != this) return false    
    let tr = pm.tr.delete(from, to).split(from, 2).apply(pm.apply.scroll)
    renumber(pm, toParent.shorten())
    return tr
  },
  keys: ["Enter(20)"]
})

Choice.register("command", "delete", {
  label: "delete text, this choice or choicelist",
  run(pm) {
	let {from,to,head} = pm.selection
    let toCH = from.shorten(), ch = pm.doc.path(toCH.path)
    if (ch.type != this) return false
	if (from.offset > 0) return pm.tr.delete(from,to).apply(pm.apply.scroll)
    let toMC = toCH.shorten(), mc = pm.doc.path(toMC.path)
    let {before,at} = nodeBefore(pm,toCH)
    // if only question and one choice then ignore
    if (mc.size == 2 || before.type != this || ch.lastChild.size > 0) return true;
    let tr = pm.tr.delete(toMC,toMC.move(1)).apply()
    renumber(pm, toMC)
    return tr
  },
  keys: ["Backspace(20)", "Mod-Backspace(20)"]
})

MultipleChoice.register("command", "insert", {
	label: "MultipleChoice",
	run(pm, name) { 
		let {from,to,node} = pm.selection 
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, {name: name}).apply()
			renumber(pm,Pos.from(from.toPath().concat(from.offset),0))
			return tr
		} else {
			let choice_content = Fragment.from([
			    this.schema.nodes.radiobutton.create({name: name, value: 1}),
			    this.schema.nodes.textbox.create()
			])
			let content = Fragment.from([
			    this.schema.nodes.paragraph.create(null,""),
			    this.schema.nodes.choice.create({name: name, value: 1},choice_content)
			])
			return insertWidget(pm,from,this.create({name},content))
			return tr
		}
	},
	select(pm) {
		return true
	},
	menu: {group: "question", rank: 70, display: {type: "label", label: "MultipleChoice"}},
	params: [
 	    { name: "Name", attr: "name", label: "Short ID", type: "text",
   	  	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
 		  options: {
 			  pattern: namePattern, 
 			  size: 10, 
 			  title: nameTitle}
   	  	}
	]
})

defParamsClick(MultipleChoice,"multiplechoice:insert")

insertCSS(`

.widgets-choice input {
	float: left;
}

.ProseMirror .widgets-choice:hover {
	cursor: text;
}

`)