export {BlockMath} from "./blockmath"
export {Website} from "./website"
export {InlineMath} from "./inlinemath"
export {Image} from "./image"
export {SpreadSheet} from "./spreadsheet"
export {CarryForward} from "./carryforward"
export {Graph} from "./graph"

if (window.MathJax)
	MathJax.Hub.Queue(function () {
	    MathJax.Hub.Config({
	    	tex2jax: {
	        	displayMath: [ ["\\[","\\]"] ], 
	        	inlineMath: [ ["\\(","\\)"] ],
	        	processEscapes: true
	    	},
	    	displayAlign:"left"
		})
	})

