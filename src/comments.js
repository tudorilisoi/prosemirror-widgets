import {ProseMirror} from "prosemirror/dist/edit"
import {Pos} from "prosemirror/dist/model"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {widgetSchema, commentCommands, commentOnlyCommands, commentMenuBar, mainMenuBar} from "./schema" 
import {initComments} from "./widgets/tool" 

let pm, place = document.querySelector("#editor"), content = document.querySelector("#content"), commentStyle = document.querySelector("#commentstyle")
commentStyle.value = "peer"
	
let pmOptions = {place: place, schema: widgetSchema, autoInput: true, doc: content, docFormat: "dom" }

setCommentStyle(place.getAttribute("commentstyle") || "peer")

function setCommentStyle(type) {
  place.innerHTML = ''
  if (type == "peer") {
	place.className = "peer"
	pmOptions.commands = commentOnlyCommands,
	pmOptions.menuBar = commentMenuBar,
	pm = window.pm = new ProseMirror(pmOptions)
	pm.on("filterTransform", () => true) // turn off editing
	initComments(pm)
  } else {
	place.className = ""
	pmOptions.commands = commentCommands
	pmOptions.menuBar = mainMenuBar
	pm = window.pm = new ProseMirror(pmOptions)
	initComments(pm,true)
  }
}

if (commentStyle) commentStyle.addEventListener("change", () => setCommentStyle(commentStyle.value))


 