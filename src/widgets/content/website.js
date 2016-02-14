import {Block, Attribute} from "prosemirror/dist/model"
import {insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, selectedNodeAttr,insertWidget} from "../../utils"

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

defParser(Website, "website", "widgets-website")

Website.prototype.serializeDOM = (node, s) => s.renderAs(node, "iframe",{ 
	src: node.attrs.src,
	width: node.attrs.width,
	height: node.attrs.height,
	content: "text/html;charset=UTF-8",
	class: "widgets-website widgets-edit",
	frameborder: "1",
	allowfullscreen: "1"
})

Website.register("command", "insert", {
	derive: {
		params: [
	      	{ name: "URL", attr: "src", label: "Link to website, youTube, Google Maps ...", type: "url",
	        	  prefill: function(pm) { return selectedNodeAttr(pm, this, "src") }},
	      	{ name: "Width", attr: "width", label: "Width in pixels", type: "number", default: 200, 
	           prefill: function(pm) { return selectedNodeAttr(pm, this, "width") },
	        	  options: {min: 50, height:800}},
	      	{ name: "Height", attr: "height", label: "Height in pixels", type: "number", default: 200, 
	           prefill: function(pm) { return selectedNodeAttr(pm, this, "height") },
	        	  options: {min: 50, height:800}}
	 	]
	},
	label: "Website",
	menu: {group: "content", rank: 74, display: {type: "label", label: "Website"}},
})

defParamsClick(Website,"website:insert")

insertCSS(`

.ProseMirror .widgets-website:hover {
    padding-top: 16px;
}

`)