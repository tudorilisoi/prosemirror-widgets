import {Block, Pos} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick} from "../../utils"
import {joinPoint, joinableBlocks, canLift} from "prosemirror/dist/transform"

export class Question extends Block {
//	get draggable() { return true }
}

defParser(Question,"div","widgets-question")

Question.prototype.serializeDOM = (node,s) => 
	elt("div",{class: "widgets-question widgets-edit"},s.renderAs(node,"div",node.attrs))

insertCSS(`
		
.widgets-question {
	counter-increment: qcnt;
	border: 1px solid #DDD;
    border-radius: 4px;
	padding: 8px;
	margin-top: 1em;
}

.widgets-question:before {
	content: "Question " counter(qcnt) ".";
	font-size: 80%;
	font-weight: bold;
	cursor: move;
}

.ProseMirror .widgets-question p:hover {
    cursor: text;
}

`)