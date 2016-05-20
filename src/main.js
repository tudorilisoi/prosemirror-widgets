import {ProseMirror} from "prosemirror/dist/edit"
import "prosemirror/dist/menu/tooltipmenu"
import "prosemirror/dist/menu/menubar"
import "prosemirror/dist/inputrules/autoinput"
import {insertCSS} from "prosemirror/dist/dom"
import {defineFileHandler} from "./utils"
import {widgetSchema, commands, mainMenuBar} from "./schema" 
 
let pm = window.pm = new ProseMirror({
  place: document.querySelector("#editor"),
  menuBar: mainMenuBar,
  schema: widgetSchema,
  commands: commands,
  autoInput: true,
  doc: document.querySelector("#content"),
  docFormat: "dom"
})
 
/*
pm.setOption("tooltipMenu", {
	selectedBlockMenu: true,
	inlineContent: [inlineGroup,insertMenu],
	blockContent: [[blockGroup, textblockMenu,alignGroup], [contentInsertMenu, questionInsertMenu]],
})*/
	
defineFileHandler(function(files) {
	console.log(files)
})

insertCSS(`
#editor {
	width: 800px;
}

`)

 