import {Block, Textblock, Fragment, emptyFragment, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {TextBox} from "./textbox"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class Choice extends Block {
	static get kinds() { return "choice" }
	get contains() {return "text"}
	get attrs() {
		return {
			name: new Attribute(),
			value: new Attribute(),
			class: new Attribute({default: "widgets-choice"})
		}
	}
	create(attrs, content, marks) {
		content = content? content.content[0]:this.schema.nodes.textbox.create(null," ",marks)
		return super.create(attrs,[this.schema.nodes.radiobutton.create(attrs),content],marks)
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
		return super.create(attrs,this.schema.nodes.choice.create({name: attrs.name, value:1},marks))
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
    let toParent = from.shorten(), parent = pm.doc.path(toParent.path)
    if (parent.type != this) return false
    let tr = pm.tr.delete(from, to).split(from, 2).apply(pm.apply.scroll)
    //renumber(pm, toParent)
    return tr
  },
  keys: ["Enter(10)"]
})

Choice.register("command", "delete", {
  label: "delete text, this choice or choicelist",
  run(pm) {
	let {from,to,head} = pm.selection
	if (from.offset > 1) return pm.tr.delete(from,to).apply(pm.apply.scroll)
	// check if text is still remaining
	if (pm.doc.path(from.path).size > 1) return false;
    // if this is the only choice then delete whole choicelist
    let toParent = from.shorten(), cl = pm.doc.path(toParent.path)
    if (cl.size > 1) {
    	let tr = pm.tr.delete(new Pos(from.path,0),to).apply(pm.apply.scroll)
    	pm.execCommand("joinBackward")
    	renumber(pm, from.shorten())
    	return tr
    } else {
        let before, cut
        for (let i = head.path.length - 1; !before && i >= 0; i--) if (head.path[i] > 0) {
          cut = head.shorten(i)
          before = pm.doc.path(cut.path).child(cut.offset - 1)
        }
    	return pm.tr.delete(cut, cut.move(1)).apply(pm.apply.scroll)
    }
  },
  keys: ["Backspace(20)", "Mod-Backspace(20)"]
})

ChoiceList.register("command", "insert", {
	label: "ChoiceList",
	run(pm, name) {
		let {from,to,head} = pm.selection
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