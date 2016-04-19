import {Block, Attribute} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, selectedNodeAttr} from "../../utils"
import {insertWidget} from "./index"

const css = "widgets-website"
	
export class Website extends Block {
	get attrs() {
		return {
			src: new Attribute,
			width: new Attribute({default: 200}),
			height: new Attribute({default: 200})
		}
	}
	get contains() { return null }
}

defParser(Website, "website", css)

Website.prototype.serializeDOM = (node, s) => s.renderAs(node, "iframe",{ 
	src: node.attrs.src,
	width: node.attrs.width,
	height: node.attrs.height,
	content: "text/html;charset=UTF-8",
	class: css+" widgets-edit",
	frameborder: "1",
	allowfullscreen: "1"
})

Website.register("command", "insert", {
	label: "Website",
	run(pm, src,width,height) {
		let {from,to,node} = pm.selection
		if (node && node.type == this) {
			let tr = pm.tr.setNodeType(from, this, {src,width,height}).apply()
			return tr
		} else
			return insertWidget(pm,from,this.create({src,width,height}))
	},
	select(pm) {
  		return true
	},
	menu: {group: "content", rank: 74, select: "disable", display: {type: "label", label: "Website"}},
	params: [
      	{ name: "URL", attr: "src", label: "Link to website, youTube, Google Maps ...", type: "url",
        	  prefill: function(pm) { return selectedNodeAttr(pm, this, "src") }},
      	{ name: "Width", attr: "width", label: "Width in pixels", type: "number", default: 400, 
           prefill: function(pm) { return selectedNodeAttr(pm, this, "width") },
        	  options: {min: 50, height:800}},
      	{ name: "Height", attr: "height", label: "Height in pixels", type: "number", default: 400, 
           prefill: function(pm) { return selectedNodeAttr(pm, this, "height") },
        	  options: {min: 50, height:800}}
 	]
})

defParamsClick(Website,"website:insert")

insertCSS(`

.ProseMirror .${css} {
	border: 1px solid red;
    padding-top: 16px;
}

`)