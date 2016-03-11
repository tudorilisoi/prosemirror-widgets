import {elt,insertCSS} from "prosemirror/dist/dom"
import {Pos} from "prosemirror/dist/model"
import {eventMixin} from "prosemirror/dist/util/event"
import {getID, onResize} from "../../utils"

let commentsNode = document.querySelector("#comments")
let commentStore = null
let commentMenu = null
let editId = null

class Comment {
	constructor(id, text, range) {
		this.id = id
		this.text = text
		this.range = range
	}
	get height() { 
		let r = this.dom.getBoundingClientRect()
		return r.bottom-r.top
	}
	get dom() { return document.getElementById(this.id) }
	get newDom() {
		let dom = elt("div",{class: "comment",id:this.id},this.text)
		dom.addEventListener("click", e => {
	    	e.stopPropagation()
			let r = e.target.getBoundingClientRect()
			if (e.clientX > (r.right-16) && e.clientY < (r.top+16)) {
				showMenu(this,e.target.style.top)
			} else {
				if (dom.className == "comment")
					commentStore.highlightComment(this.id)
				else
					commentStore.clearHighlight()
			}
		})
		return dom
	}
}

function showMenu(comment,top) {
	if (commentMenu.className == "commentMenu") {
		commentMenu.className += " show"
		commentMenu.style.top = top
		editId = comment.id
	} else {
		commentMenu.className = "commentMenu"
		editId = null
	}
}

function getTop() {
	let {from} = pm.selection
	let r = pm.coordsAtPos(from)
	let rect = pm.content.getBoundingClientRect()
	return Math.round(r.top - rect.top)
}

function getCommentMenu() {
	let edit = elt("li",null,elt("span",null,"Edit"))
	let reply = elt("li",null,elt("span",null,"Reply"))
	let remove = elt("li",null,elt("span",null,"Remove"))
	edit.addEventListener("click", e => {
    	e.stopPropagation()
		showMenu()
	})
	reply.addEventListener("click", e => {
    	e.stopPropagation()
		showMenu()
	})
	remove.addEventListener("click", e => {
		e.stopPropagation()
		commentStore.removeComment(editId)
		editId = null;
		showMenu()
	})
	return elt("div",{class: "commentMenu"},elt("ul",null,edit,reply,remove))
}

export function initComments(pm) {
	commentStore = new CommentStore(pm,0)
	eventMixin(CommentStore)
	let commentHeader = elt("div",{class: "comment-header"}, elt("span",null,"Comments:"))
	let addButton = elt("span",{class: "comment-button"},"Add Comment")
	let textArea = 	elt("textarea",{name:"newcomment"})
	let addComment = elt("div",{class: "addComment hide"},textArea,addButton)
	addButton.addEventListener("click", e => {
		addComment.className = "addComment hide"
		if (textArea.value.length > 0)
			commentStore.createComment(textArea.value)
	})
	commentsNode.addEventListener("click", e => {
		commentMenu.className = "commentMenu"
		editId = null
	})
	pm.content.addEventListener("mouseup", e => {
    	e.stopPropagation()
		addComment.className = addComment.className == "addComment"? "addComment hide": "addComment"
		textArea.value = ''
		textArea.focus()
		if (addComment.className == "addComment")
			addComment.style.top = getTop()+"px"				
	})
	onResize(pm.wrapper, () => { commentStore.reflow() })

	commentMenu = getCommentMenu()
	commentsNode.appendChild(commentHeader)
	commentsNode.appendChild(addComment)
	commentsNode.appendChild(commentMenu)
}

export class CommentStore {
	constructor(pm) {
		pm.mod.comments = this
		this.pm = pm
		this.comments = Object.create(null)
		this.unsent = []
		this.highlight = null
	}
    createComment(text,top) {
        let id = getID()
        let sel = this.pm.selection
        this.addComment(sel.from, sel.to, text, id)
        this.unsent.push({ type: "create", id: id })
        this.signal("mustSend")
    }
    addComment(from, to, text, id) {
    	if (!comments[id]) {
    		if (!from.cmp(to)) to = from.move(1)
    		let range = pm.markRange(from, to, { className: "range"})
    		// readonly can't remove ranges
    		//range.on("removed", function () { return comments[id].range = null })
    		comments[id] = new Comment(id, text, range)
    		let dom = comments[id].newDom
    		commentsNode.appendChild(dom)
    		this.reflow()
    		this.highlightComment(id)
    	}
    }
    renderComments() {
    	comments.forEach(c=> { commentsNode.appendChild(c.newDom) })
    	this.reflow()
    }
    removeComment(id) {
    	let found = comments[id];
    	if (found) {
    		if (this.highlight && id == this.highlight.id) this.clearHighlight()
    		if (found.range) pm.removeRange(found.range)
    		delete comments[id]
    		commentsNode.removeChild(found.dom)
    		this.reflow()
    		return true;
    	}
    }
    reflow() {
    	let r = pm.content.getBoundingClientRect()
    	let sorted = []
        Object.keys(comments).forEach(id => {
        	let c = comments[id]
        	let top = Math.round(pm.coordsAtPos(c.range.from).top-r.top+10)
        	sorted.push({dom:c.dom,top,h:c.height})
    	})
    	sorted.sort((a, b) => a.top - b.top)
    	let bottom = 20
    	sorted.forEach(r => {
    		let top = r.top
    		if(top < bottom) top = bottom
    		r.dom.style.top = top+"px"
    		bottom = top + r.h + 1
    	})
	}
	highlightComment(id) {
		let comment = comments[id]
	    this.clearHighlight();
	    comment.dom.className += " select"
	    this.highlight = comment
    	let {from, to} = comment.range
    	pm.removeRange(comment.range)
    	comment.range = pm.markRange(from, to, { className: "range-select"})
	}
	clearHighlight() {
	    if (this.highlight) {
	    	let c = this.highlight
	    	c.dom.className = "comment"
	    	if (c.range) {
		    	let r = c.range
		    	let {from,to} = r
		    	pm.removeRange(r)
	    		c.range = pm.markRange(from, to, { className: "range"})
	    	}
	        this.highlight = null;
	    }
	}
}

insertCSS(`
.comments {
	display: block;
	margin: 0 auto;
	width: 100%;
}
		
.comments #editor {
	float: left;
	width: 60%;
	display: inline-block;
}

.comments #comments {
	border: 1px solid #AAA;
	margin-left: 1px;
	padding: 0;
	height: 500px;
	width: 250px;
	display: inline-block;
	overflow: auto;
	position:relative;
 }


.comments .comment-header {
	font-weight: bold;
	font-size: 80%;
	width: 100%;
	background: skyblue;
	color: white;
	margin: 0;
	padding: 2px 2px 0px 2px;
	border-bottom: 1px solid #AAA;
	display: inline-block;
}
 
.comments .newcomment {
	margin-left: 10px;
	display: inline-block;
}

.comments .newcomment a {
	padding: 0 4px 0 4px;
	background: skyblue;
	color: white;
	text-decoration: none;
}

.comments .newcomment a:hover {
	padding: 0 4px 0 4px;
	background: white;
	color: skyblue;
	cursor: pointer;
}

.comments .comment {
	background: white;
	border-radius: 6px;
	border: 1px solid #AAA;
	width: 92%;
	font-size: 90%;
	padding: 4px;
	min-height: 30px;
	position: absolute;	
	left: 8px;
}

.comments .comment:after {
	content: ' ';
	height: 0;
	position: absolute;
	width: 0;
	border: 8px solid transparent;
	border-right-color: skyblue;
	left: -16px;
	top: 5px;
}

.comments .comment:hover {
	background-image: url('icons/menu.png');
	background-repeat: no-repeat;
	background-position: top right;
	cursor: pointer;
}

.comments .select {
	border: 1px solid skyblue;
}

.comment-button {
	margin: 4px;
	padding: 2px;
	border-radius: 4px;
	border: 1px solid #AAA;
	background: skyblue;
	color: white;
	cursor: pointer;
}

.addComment {
	background: white;
	margin: 2px;
	border-radius: 6px;
	border: 1px solid #AAA;
	visibility: visible;
	font-size: 80%;
	padding: 4px;
	display: inline-block;
	position: absolute;
	left: 0;
	width: 93%;
	z-index: 100;
}

.addComment textarea {
	width: 95%;
	resize: none;
	margin: 4px;
}

.range {
	background: skyblue;
}


.range-select {
	background: dodgerblue;
	color: white;
}

.commentMenu {
	font-size: 90%;
	border: 1px solid #AAA;
	display: none;
	position:relative;
	left: 180px;
	width: 60px;
	z-index: 100;
	cursor: pointer;
}

.commentMenu ul {
	display: block;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: white;
}

.commentMenu li {
}

.commentMenu li span {
    display: inline-block;
    color: black;
    padding: 1px;
    text-decoration: none;
}

.commentMenu li span:hover {
    background: skyblue;
	color: white;
}

.hide {
	display: none;
}

.show {
	display: block;
}
`)