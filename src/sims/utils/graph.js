import {Axis} from "./axis"
export class Graph {
	constructor(spec) {
		this.stage = spec.stage
		this.xaxis = new Axis({
			stage: this.stage,
			label: spec.xlabel,
			dim: { w: spec.w, h: spec.h, min: spec.minX, max: spec.maxX },
			orient: "horizontal",
			scale: spec.xscale,
			major: spec.majorX,
			minor: spec.minorX,
			precision: spec.precisionX
		})
		this.yaxis = new Axis({
			stage: this.stage,
			label: spec.ylabel,
			dim: { w: spec.w, h: spec.h, min: spec.minY, max: spec.maxY },
			orient: "vertical",
			scale: spec.yscale,
			major: spec.majorY,
			minor: spec.minorY,
			precision: spec.precisionY
		})
		this.last = null
		this.point = false
		this.color = "#000"
		this.marker = new createjs.Shape()
    	this.marker.graphics.beginFill(this.color).drawRect(0,0,2,2)
    	this.stage.addChild(this.marker)

	}
	
	setMode(mode) {
		this.point = mode
        this.last = null
	}
	
	setColor(color) {
		this.color = color
	}

    render() {
    	this.xaxis.render()
    	this.yaxis.render()
    }

    clear() {
    	this.stage.removeAllChildren()
    	this.last = null
    }

    moveMarker(x,y) {
    	this.marker.x = x-2
    	this.marker.y = y-2
    }

	drawLine(x1,y1,x2,y2) {
		let line = new createjs.Shape()
		line.graphics.setStrokeStyle(1)
		line.graphics.beginStroke(this.color)
		line.graphics.moveTo(x1, y1)
		line.graphics.lineTo(x2, y2)
		line.graphics.endStroke()
		this.stage.addChild(line)
	}
	
    plot(xv,yv) {
        if (xv >= this.xaxis.min && xv <= this.xaxis.max && yv >= this.yaxis.min && yv <= this.yaxis.max) {                
            let x = this.xaxis.getLoc(xv)
            let y = this.yaxis.getLoc(yv)
            if (!this.last)  {
                this.drawLine(x,y,x,y)
            } else {
                this.moveMarker(this.last.x,this.last.y)
                if (this.point) 
                	this.drawLine(x,y,x,y) 
                else 
                	this.drawLine(this.last.x,this.last.y,x,y)
            }
            this.last = new createjs.Point(x,y)
            this.moveMarker(x,y)
        }
    }
    
    endPlot() { this.last = null }
    
}
