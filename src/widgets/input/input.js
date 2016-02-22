import {Block, Inline, Attribute} from "prosemirror/dist/model"
import {elt, insertCSS} from "prosemirror/dist/dom"
import {defParser} from "../../utils"

export class Input extends Block {
	get attrs() {
		return {
			name: new Attribute,
			type: new Attribute({default: "text"}),
			value: new Attribute
		}
	}
	get selectable() { return false }
	get contains() { return null}
}

defParser(Input,"widgets-input")

Input.prototype.serializeDOM = node => elt("input",node.attrs)

insertCSS(`
		
.widgets-input {}

/*.widgets-input input[type=range] {
    -webkit-appearance: none;
    border: 1px solid white;
    width: 300px;
}

.widgets-input input[type=range]::-webkit-slider-runnable-track {
    width: 300px;
    height: 5px;
    background: #ddd;
    border: none;
    border-radius: 3px;
}

.widgets-input input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: goldenrod;
    margin-top: -4px;
}

.widgets-input input[type=range]:focus {
    outline: none;
}

.widgets-input input[type=range]:focus::-webkit-slider-runnable-track {
    background: #ccc;
}

.widgets-input input[type=range]::-moz-range-track {
    width: 300px;
    height: 5px;
    background: #ddd;
    border: none;
    border-radius: 3px;
}

.widgets-input input[type=range]::-moz-range-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: goldenrod;
}

hide the outline behind the border
.widgets-input input[type=range]:-moz-focusring{
    outline: 1px solid white;
    outline-offset: -1px;
}

.widgets-input input[type=range]::-ms-track {
    width: 300px;
    height: 5px;
    
    remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead 
    background: transparent;
    
    leave room for the larger thumb to overflow with a transparent border 
    border-color: transparent;
    border-width: 6px 0;

    remove default tick marks
    color: transparent;
}

.widgets-input input[type=range]::-ms-fill-lower {
    background: #777;
    border-radius: 10px;
}

.widgets-input input[type=range]::-ms-fill-upper {
    background: #ddd;
    border-radius: 10px;
}

.widgets-input input[type=range]::-ms-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: goldenrod;
}

.widgets-input input[type=range]:focus::-ms-fill-lower {
    background: #888;
}

.widgets-input input[type=range]:focus::-ms-fill-upper {
    background: #ccc;
}
*/
`)