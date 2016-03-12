import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {defineFileHandler} from "./utils"
import {widgetSchema, commands, grammarMenuBar} from "./schema" 

let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: grammarMenuBar,
  schema: widgetSchema,
  commands: commands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})

defineFileHandler(function(files) {
	console.log(files)
})

 