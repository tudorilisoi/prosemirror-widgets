import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {inlineGroup, textblockMenu, blockGroup, historyGroup} from "prosemirror/dist/menu/menu"
import {contentInsertMenu, questionInsertMenu} from "./widgets"
import {defineFileHandler,alignGroup} from "./utils"
import {widgetSchema,commands} from "./schema" 

let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: {
	float: true,
	content: [inlineGroup, [blockGroup,textblockMenu],alignGroup,[contentInsertMenu,questionInsertMenu],historyGroup]	 
  },
  schema: widgetSchema,
  commands: commands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})

//pm.setOption("menuBar", false)
//pm.setOption("tooltipMenu", {selectedBlockMenu: true})
	
defineFileHandler(function(files) {
	console.log(files)
})

