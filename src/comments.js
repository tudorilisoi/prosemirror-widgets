import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {widgetSchema, readonlyCommands} from "./schema" 
import {setReadOnly} from "prosemirror/dist/transform/transform"
import {initComments} from "./widgets/tool" 

let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: {float: false, content: null},
  schema: widgetSchema,
  commands: readonlyCommands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})

setReadOnly(function(step) { return true })

initComments(pm)

