import {Block, Inline, Textblock, Fragment, Attribute, TextNode, NodeKind, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, namePattern, nameTitle, selectedNodeAttr} from "../../utils"
import {Question, qclass, insertQuestion} from "./question"

const cssc = "widgets-choice"
const cssm = "widgets-multiplechoice"
	
export class Choice extends Textblock {
	get contains() { return NodeKind.text}
	get attrs() {
		return {
			name: new Attribute({default: ""}),
			value: new Attribute({default: 1}),
			class: new Attribute({default: cssc})
		}
	}
	create(attrs, content, marks) {
		if (content.content) {
			let len = content.content.length
			content = Fragment.from([this.schema.nodes.radiobutton.create(attrs),content.content[len-1]])
		} 
		return super.create(attrs,content,marks)
	}
}
 
export class MultipleChoice extends Question {
	get attrs() {
		return {
			name: new Attribute,
			title: new Attribute({default: ""}),
			class: new Attribute({default: cssm+" "+qclass})
		}
	}
	get isList() { return true }
	defaultContent(attrs) {
		let choice_content = Fragment.from([
		    this.schema.nodes.radiobutton.create(attrs),
		    this.schema.nodes.textbox.create()
		])
		return Fragment.from([
		    this.schema.nodes.paragraph.create(null,""),
		    this.schema.nodes.choice.create(attrs,choice_content)
		])
	}
	create(attrs, content, marks) {
		if (!content) content = this.defaultContent(attrs)
		return super.create(attrs,content,marks)
	}
} 
 
defParser(Choice,"div",cssc)
defParser(MultipleChoice,"div",cssm)
 
Choice.prototype.serializeDOM = (node,s) => s.renderAs(node,"div",node.attrs)
 
function renumber(pm, $pos) {
	let i = 1, mc = $pos.node($pos.depth-1), parentpos = $pos.start($pos.depth-1)
	mc.forEach((node,start) => {
		if (node.type instanceof Choice) {
			pm.tr.setNodeType(parentpos+start, node.type, {name: mc.attrs.name+"-"+i, value:i++}).apply()
		}
	})
}

Choice.register("command", "split", {
	label: "Split the current choice",
	run(pm) {
	    let {from, to, node} = pm.selection, $from = pm.doc.resolve(from), $to = pm.doc.resolve(to)
	    if ((node && node.isBlock) || from.depth < 2 || !$from.sameParent($to)) return false
	    let chc = $from.node($from.depth-1)
	    if (chc.type != this) return false    
	    let tr = pm.tr.split(from, 2).apply(pm.apply.scroll)
	    tr = pm.tr.insert(from+3,this.schema.nodes.radiobutton.create(chc.attrs)).apply(pm.apply.scroll)
	    renumber(pm, pm.doc.resolve(from+1))
	    return tr
	},
	keys: ["Enter(20)"]
})

Choice.register("command", "delete",{
	label: "delete this choice or multiplechoice",
	run(pm) {
		let {from,to,head,node} = pm.selection, $from = pm.doc.resolve(from)
		if (node && node.type instanceof MultipleChoice)
			return pm.tr.delete(from,to).apply(pm.apply.scroll)
		if (node) return false
		let chc = $from.node($from.depth-1)
	    if (!(chc.type instanceof Choice)) return false
		if ($from.parentOffset > 0) return pm.tr.delete(from,to).apply(pm.apply.scroll)
	    let mc = $from.node($from.depth-2)
	    // if only one choice or still text then ignore
	    if (mc.childCount == 2 || chc.lastChild.content.size > 0) return true
	    // delete the choice
	    let before = $from.before($from.depth-1)
	    let after = $from.after($from.depth-1)
	    let tr = pm.tr.delete(before,after).apply(pm.apply.scroll)
	    let $pos = pm.doc.resolve(from)
	    chc = $pos.nodeAfter
	    pm.setTextSelection($pos.end($pos.depth))
	    //renumber(pm, pm.doc.resolve(from-5))
	    return tr
	},
	keys: ["Backspace(9)", "Mod-Backspace(9)"]
})

MultipleChoice.register("command", "insert", {
	label: "MultipleChoice",
	run(pm, name,title) {
	let {from,node} = pm.selection, $from = pm.doc.resolve(from)
		let attrs = {name,title,value:1}
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, attrs).apply()
			renumber(pm,pm.doc.resolve(from+1))
			return tr
		} else
			return insertQuestion(pm,from,this.create(attrs))
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
   	  	},
		{ name: "Title", attr: "title", label: "(optional)", type: "text", default: "",
	     	  prefill: function(pm) { return selectedNodeAttr(pm, this, "title") },
	   	  options: {
	     		required: '' 
	    }}
	]
})

defParamsClick(MultipleChoice,"multiplechoice:insert")

insertCSS(`

.${cssc} input {
	float: left;
}

.ProseMirror .${cssc}:hover {
	cursor: text;
}

`)