import {Block, Textblock, emptyFragment, Fragment, Attribute, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"

export class CheckItem extends Textblock {
	static get kinds() { return "checkitem" }
	get attrs() {
		return {
			name: new Attribute,
			value: new Attribute,
			class: new Attribute({default: "widgets-checkitem"})
		}
	}
	create(attrs, content, marks) {
		// remove any checkboxes from split/join operations
		let result = []
		for (let iter = content.iter(), n; n = iter.next().value;) 
			if (n.type.name != "checkbox") result.push(n)
		// prepend the new checkbox
		result.unshift(this.schema.node("checkbox",{name: attrs.name+"-"+attrs.value, value: attrs.value}))
		return super.create(attrs,Fragment.from(result),marks)
	}
}

export class CheckList extends Block {
	static get kinds() { return super.kinds + " checklist"}
	static get contains() { return "checkitem" }
	get attrs() {
		return {
			name: new Attribute,
			layout: new Attribute({default: "vertical"}),
			class: new Attribute({default: "widgets-checklist widgets-edit"})
		}
	}
	get isList() { return true }
	create(attrs, content, marks) {
		return super.create(attrs,this.schema.node("checkitem",{name: attrs.name, value:1}, emptyFragment),marks)
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
	    if (pm.doc.path(from.path).type != this) return false
	    let toParent = from.shorten(), cl = pm.doc.path(toParent.path)
	    let tr = pm.tr.delete(from, to).split(from, 1, this, {name:cl.attrs.name, value: cl.size+1}).apply(pm.apply.scroll)
	    renumber(pm, toParent)
	    return tr
	  },
	  keys: ["Enter(10)"]
	})


CheckItem.register("command", "delete",{
	label: "delete this checkitem or checklist",
	run(pm) {
		let {from,to} = pm.selection
		if (from.offset > 1) return pm.tr.delete(from,to).apply(pm.apply.scroll)
		pm.tr.delete(new Pos(from.path,0),to).apply(pm.apply.scroll)
		pm.execCommand("joinBackward")
		renumber(pm, from.shorten())
	},
	keys: ["Backspace(20)", "Mod-Backspace(20)"]
})

CheckList.register("command", "insert", {
	label: "Check List",
	run(pm, name, layout) {
		return pm.tr.replaceSelection(this.create({name, layout})).apply(pm.apply.scroll)
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
 			  title: nameTitle}},
	    { name: "Layout", label: "vertical or horizontal", type: "select", default: "vertical",
	      prefill: function(pm) { return selectedNodeAttr(pm, this, "layout") },
	      options: [
	       	  {value: "vertical", label: "vertical"},
     	      {value: "horizontal", label: "horizontal"}
     	  ]}
	]
})

defParamsClick(CheckList,"checklist:insert")

insertCSS(`

.ProseMirror .widgets-checkitem input {
	float: left;
}

.widgets-checklist {
	padding-left: 8px;
	padding-top: 8px;
}

.ProseMirror .widgets-checkitem:hover {
	cursor: text;
}


`)