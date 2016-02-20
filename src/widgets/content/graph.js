import "prosemirror/node_modules/amcharts3/amcharts/amcharts"
import "prosemirror/node_modules/amcharts3/amcharts/serial"
import "prosemirror/node_modules/amcharts3/amcharts/gantt"
import "prosemirror/node_modules/amcharts3/amcharts/pie"
import "prosemirror/node_modules/amcharts3/amcharts/funnel"
import "prosemirror/node_modules/amcharts3/amcharts/gauge"
import "prosemirror/node_modules/amcharts3/amcharts/radar"
import "prosemirror/node_modules/amcharts3/amcharts/xy"

import {Block, Attribute} from "prosemirror/dist/model"
import {elt,insertCSS} from "prosemirror/dist/dom"
import {defParser, defParamsClick, selectedNodeAttr,insertWidget} from "../../utils"

const graphs = ["graphs/line.json","graphs/column.json","graphs/pie.json","graphs/gantt.json"]
                
function getJSONData(id,url) {
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    	let data = JSON.parse(xmlhttp.responseText)
	    	AmCharts.makeChart(id, data)
	    }
	}
	xmlhttp.open("GET", url, true)
	xmlhttp.send()
}

function getGraphOptions() {
	return graphs.map(w => ({value: w, label: w}))
}
 

export class Graph extends Block {
	get attrs() {
		return {
			data: new Attribute({default: ""}),
			size: new Attribute({default: "small"})
		}
	}
	get contains() { return null }
}

defParser(Graph,"div","widgets-graph")

Graph.prototype.serializeDOM = node => {
	if (node.rendered) {
		node.rendered = node.rendered.cloneNode(true)
	} else {
		node.rendered = elt("div", {
			class: "widgets-graph widgets-edit widgets-graph-"+node.attrs.size, 
			id: "amchart"
		})
		getJSONData("amchart",node.attrs.data)
	}
	return node.rendered; 
}

Graph.register("command", "insert", {
	derive: {
		params: [
	      	{ name: "Data URL", attr: "data", label: "Data URL", type: "select", 
	      	  prefill: function(pm) { return selectedNodeAttr(pm, this, "data") },
	  		  options: function() { return getGraphOptions()}
	      	},
	      	{ name: "Size", attr: "size", label: "Size", type: "select", default: "small",
		      	  prefill: function(pm) { return selectedNodeAttr(pm, this, "size") },
	        	  options: [
	        	      {value: "small", label:"small"},
	    	      	  {value: "medium", label:"medium"},
	    	      	  {value: "large", label:"large"}
	        	  ]
		    }
	    ]
	},
	label: "Graph",
	menu: {group: "content", rank: 74, display: {type: "label", label: "Graph"}},
})

defParamsClick(Graph,"graph:insert")

insertCSS(`

.ProseMirror .widgets-graph {}

.widgets-graph-small {
	border-radius: 6px;
	border: 1px solid #DDD;
	width: 400px;
    height: 300px;
}

.widgets-graph-medium {
	border-radius: 6px;
border: 1px solid #DDD;
	width: 600px;
    height: 400px;
}

.widgets-graph-large {
	border-radius: 6px;
	border: 1px solid #DDD;
	width: 800px;
    height: 600px;
}

`)