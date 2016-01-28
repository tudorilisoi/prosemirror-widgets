import {Block, Textblock, Fragment, emptyFragment, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class Choice extends Textblock {
	static get kinds() { return "choice" }
	get attrs() {
		return {
			name: new Attribute(),
			value: new Attribute(),
			class: new Attribute({default: "widgets-choice"})
		}
	}
	create(attrs, content, marks) {
		// remove any radiobuttons from split/join operations
		let result = []
		for (let iter = content.iter(), n; n = iter.next().value;) 
			if (n.type.name != "radiobutton") result.push(n)
		// prepend the new radiobutton
		result.unshift(this.schema.node("radiobutton",attrs))
		return super.create(attrs,Fragment.from(result),marks)
	}
}
 
export class ChoiceList extends Block {
	static get kinds() { return super.kinds + " choicelist"}
	get contains() { return "choice"}
	get attrs() {
		return {
			name: new Attribute,
			class: new Attribute({default: "widgets-choicelist widgets-edit"})
		}
	}
	get isList() { return true }
	create(attrs, content, marks) {
		return super.create(attrs,this.schema.node("choice",{name: attrs.name, value:1}, emptyFragment),marks)
	}
} 
  
defParser(Choice,"div","widgets-choice")
defParser(ChoiceList,"div","widgets-choicelist")
 
Choice.prototype.serializeDOM = (node,s) => { 
	return s.renderAs(node,"div",node.attrs)
}
 
ChoiceList.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)
 
function renumber(pm, pos) {
	let cl = pm.doc.path(pos.path), i = 1
	cl.forEach((node, start) => {
		pm.tr.setNodeType(new Pos(pos.path,start), node.type, {name: node.attrs.name, value:i++}).apply()
	})
}

Choice.register("command", "split", {
  label: "Split the current choice",
  run(pm) {
    let {from, to, node} = pm.selection
    if ((node && node.isBlock) || from.path.length < 2 || !Pos.samePath(from.path, to.path)) return false
    if (pm.doc.path(from.path).type != this) return false
    let toParent = from.shorten(), cl = pm.doc.path(toParent.path)
    let tr = pm.tr.delete(from, to).split(from, 1, this, {name:cl.attrs.name, value: cl.size+1}).apply(pm.apply.scroll)
    renumber(pm, toParent)
    return tr
  },
  keys: ["Enter(10)"]
})

Choice.register("command", "delete", {
  label: "delete text, this choice or choicelist",
  run(pm) {
	let {from,to} = pm.selection
	if (from.offset > 1) return pm.tr.delete(from,to).apply(pm.apply.scroll)
	let tr = pm.tr.delete(new Pos(from.path,0),to).apply(pm.apply.scroll)
	pm.execCommand("joinBackward")
	renumber(pm, from.shorten())
	return tr
  },
  keys: ["Backspace(20)", "Mod-Backspace(20)"]
})

ChoiceList.register("command", "insert", {
	label: "ChoiceList",
	run(pm, name) {
   		return pm.tr.replaceSelection(this.create({name})).apply(pm.apply.scroll)
	},
	select(pm) {
		return true
	},
	params: [
 	    { name: "Name", label: "Short ID", type: "text",
   	  	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
 		  options: {
 			  pattern: namePattern, 
 			  size: 10, 
 			  title: nameTitle}
   	  	}
	]
})

defParamsClick(ChoiceList,"choicelist:insert")

insertCSS(`

.widgets-choice input {
	float: left;
}

.widgets-choicelist {
	padding-left: 8px;
	padding-top: 8px;
}

.ProseMirror .widgets-choice:hover {
	cursor: text;
}

`)