import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {elt,insertCSS} from "prosemirror/dist/dom"
import {Pos} from "prosemirror/dist/model"
import {inlineGroup, insertMenu, textblockMenu, blockGroup, historyGroup} from "prosemirror/dist/menu/menu"
import {contentInsertMenu, questionInsertMenu, alignGroup,Graph} from "./widgets"
import {defineFileHandler} from "./utils"
import {widgetSchema,commands} from "./schema" 

let comments = document.querySelector("#comments")

let granges = null

function clearSelection() {
	for (let i = 0; i < comments.childNodes.length; i++)
		if (comments.childNodes[i].className)
			comments.childNodes[i].className = comments.childNodes[i].className.replace(" selected","")
	if (granges) {
		granges.forEach(r => {
			pm.removeRange(r)
		})
		granges = null
	}
}

let grammar = null

class GrammarItem {
	constructor(words,msg) {
		this.words = words
		this.msg = msg;
		let re = ""
		words.split(",").forEach(w => {
			w = w.trim()
			if (w.includes(".")) w = w.replace(/\./g,"\\.")
			w = "\\b"+w+"\\W"
			re += w+"|"
		})
		re = re.slice(0,-1)
		this.regexp = new RegExp(re,"ig")
		this.clear()
	}
	
	clear() {
		this.loc = []
	}
	
	recordLoc(from, to, path) {
	    from = new Pos(path.slice(), from)
	    to = to == null ? from : new Pos(from.path, to)
	    this.loc.push({from, to})
	}
	
	get dom() {
		let dom = elt("div", {class: "comment"}, elt("div",{class:"words"},this.words),elt("div",{class:"message"},this.msg))
	    dom.addEventListener("click", () => {
			clearSelection()
			granges = []
	    	dom.className += " selected";
			this.loc.forEach(loc => {
		    	let {from, to} = loc
		    	granges.push(pm.markRange(from, to, {className: "highlight-word"}))			
		    })
	    })
		return dom
	}
		  
}

function getGrammar() {
	grammar = []
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    	JSON.parse(xmlhttp.responseText).forEach(g => {
	    		grammar.push(new GrammarItem(g[0],g[1]))
	    	})
	    }
	}
	xmlhttp.open("GET", "grammar.json", true)
	xmlhttp.send()
}

function clearGrammar() {
	  grammar.forEach(g => g.clear())	
}

function scanGrammar(doc) {
  clearGrammar()
  let result = [], lastHead = null, path = []

  function scan(node, offset) {
    let updatePath = node.isBlock && offset != null
    if (updatePath) path.push(offset)

    if (node.isText)
      grammar.forEach(g => {
    	  let m
    	  while (m = g.regexp.exec(node.text))
    		  g.recordLoc(offset + m.index, offset + m.index + m[0].length, path)
      })
    node.forEach(scan)
    	if (updatePath) path.pop()
  }
  
  scan(doc)
  grammar.forEach(g => { if (g.loc.length > 0) result.push(g)})
  return result
}

Graph.register("command","analyze", {
	label: "Analyze Grammar",
	select(pm) {return true },
	run(pm) {
		scanGrammar(pm.doc).forEach(g => {
			comments.appendChild(g.dom)
		})
		return true
	},
	menu: {
		group: "content", rank: 72, 
		display: {
			type: "label", label: "Analyze Grammar"
		}
	}
})


getGrammar()


let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: {
	float: true,
	content: [[inlineGroup, insertMenu], [blockGroup,textblockMenu],alignGroup,[contentInsertMenu,questionInsertMenu],historyGroup]	 
  },
  schema: widgetSchema,
  commands: commands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})
	
defineFileHandler(function(files) {
	console.log(files)
})


insertCSS(`
.grammar {
	display: block;
	margin: 0 auto;
}
		
#editor {
	border-radius: 6px;
	min-height: 500px;
	float: left;
	display: inline-block;
}

#comments {
	border-radius: 6px;
	border: 1px solid #AAA;
	margin-left: 20px;
	padding: 4px;
	min-height: 300px;
	max-height: 300px;
	width: 200px;
	display: inline-block;
	vertical-align: top;
	overflow: scroll;
 }

.comment {
	margin: 2px;
	border-radius: 4px;
	border: 1px solid #AAA;
	padding: 2px;
	font-size: 14px;
}

.words {
	padding: 2px;
	color: blue;
}

.message {
	padding: 2px;	
}

.selected {
	background: #EEE;
}

.highlight-word {
	background: yellow;
}

`)		
