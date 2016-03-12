import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {widgetSchema, noCommands} from "./schema" 
import {initComments} from "./widgets/tool" 

let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: {float: false, content: null},
  schema: widgetSchema,
  commands: noCommands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})
 
// turn off editing
pm.on("filterTransform", () => true)

initComments(pm)

 