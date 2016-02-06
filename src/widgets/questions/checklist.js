import {Block, Textblock, emptyFragment, Fragment, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {TextBox} from "./textbox"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class CheckItem extends Block {
	static get kinds() { return "checkitem" }
	get attrs() {
		return {
			name: new Attribute,
			value: new Attribute,
			class: new Attribute({default: "widgets-checkitem"})
		}
	}
	create(attrs, content, marks) {
		content = content? content.content[0]:this.schema.nodes.textbox.create(null,"",marks)
		return super.create(attrs,[this.schema.nodes.checkbox.create(attrs),content],marks)
	}
}

export class CheckList extends Block {
	static get kinds() { return super.kinds + " checklist"}
	static get contains() { return "checkitem" }
	get attrs() {
		return {
			name: new Attribute,
			class: new Attribute({default: "widgets-checklist widgets-edit"})
		}
	}
	get isList() { return true }
	create(attrs, content, marks) {
		return super.create(attrs,[
		   this.schema.nodes.paragraph.create(null,"",marks),
		   this.schema.nodes.checkitem.create({name: attrs.name, value:1}, content,marks)
		])
	}
}

defParser(CheckItem,"div","widgets-checkitem")
defParser(CheckList,"div","widgets-checklist")

CheckItem.prototype.serializeDOM = (node,s) => s.renderAs(node,"div", node.attrs)

CheckList.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)

function renumber(pm, pos) {
	let cl = pm.doc.path(pos.path), i = 1
	cl.forEach((node,start) => {
		pm.tr.setNodeType(new Pos(pos.path,start), node.type, {name: node.attrs.name+"-"+i, value:i++}).apply()
	})
}

CheckItem.register("command", "split", {
	  label: "Split the current checkitem",
	  run(pm) {
	    let {from, to, node} = pm.selection
	    if ((node && node.isBlock) || from.path.length < 2 || !Pos.samePath(from.path, to.path)) return false
	    let toParent = from.shorten(), parent = pm.doc.path(toParent.path)
	    if (parent.type != this) return false    
	    let tr = pm.tr.delete(from, to).split(from, 2).apply(pm.apply.scroll)
	    renumber(pm, toParent.shorten())
	    return tr
	  },
	  keys: ["Enter(10)"]
	})


CheckItem.register("command", "delete",{
	label: "delete this checkitem or checklist",
	run(pm) {
		let {from,to,head} = pm.selection
		if (from.offset > 0) return pm.tr.delete(from,to).apply(pm.apply.scroll)
	    let toCH = from.shorten(), ch = pm.doc.path(toCH.path)
	    let toMC = toCH.shorten(), mc = pm.doc.path(toMC.path)
	    // if more than one choice then delete choice otherwise delete whole multiplechoice
	    if (mc.size > 1) {
	    	let cut = getPosInParent(pm, toMC, ch)
	    	pm.tr.lift(head).apply()
	    	return pm.tr.delete(cut, cut.move(1)).apply(pm.apply.scroll)
	     	//renumber(pm, toMC)
	    } else {
	    	// don't delete if still content in first choice
	    	if (pm.doc.path(from.path).size > 0) return true
	    	let cut = getPosInParent(pm, toMC.shorten(), mc)
	    	return pm.tr.delete(cut, cut.move(1)).apply(pm.apply.scroll)
	    }
	},
	keys: ["Backspace(20)", "Mod-Backspace(20)"]
})

CheckList.register("command", "insert", {
	label: "Check List",
	run(pm, name) {
		let {from,to,node} = pm.selection
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, {name: name}).apply()
			renumber(pm,Pos.from(from.toPath().concat(from.offset),0))
			return tr
		} else
			return pm.tr.replaceSelection(this.create({name})).apply(pm.apply.scroll)
	 	},
	select(pm) {
  		return true
	},
	menu: {group: "question", rank: 70, display: {type: "label", label: "CheckList"}},
	params: [
 	    { name: "Name", label: "Short ID", type: "text",
   	  	  prefill: function(pm) { return selectedNodeAttr(pm, this, "name") },
 		  options: {
 			  pattern: namePattern, 
 			  size: 10, 
 			  title: nameTitle}}
	]
})

defParamsClick(CheckList,"checklist:insert")

insertCSS(`

.ProseMirror .widgets-checkitem input {
	float: left;
}

.widgets-checklist {
	border-top: 1px solid #DDD;
	padding-left: 8px;
	padding-top: 8px;
}
.ProseMirror .widgets-checklist p {
    cursor: text;
}


.ProseMirror .widgets-checkitem {
	cursor: text;
}


`)