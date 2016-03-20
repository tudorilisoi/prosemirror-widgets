import {Axis} from "./axis"
export class Graph {
	constructor(spec) {
		this.stage = spec.stage
		this.xaxis = new Axis({
			stage: this.stage,
			label: spec.xlabel,
			dim: { w: spec.w, h: spec.h, min: -20, max: 30 },
			orient: "horizontal",
			scale: spec.xscale,
			major: 10,
			minor: 5
		})
		this.xcoords = new createjs.Rectangle(spec.x,spec.y,spec.w-10,40)
		this.yaxis = new Axis({
			stage: this.stage,
			label: spec.ylabel,
			dim: { w: spec.w, h: spec.h, min: 0, max: 50 },
			orient: "vertical",
			scale: spec.yscale,
			major: 10,
			minor: 5
		})
		this.ycoords = new createjs.Rectangle(spec.x,18,spec.x,spec.h-40)
		this.last = null
		this.point = false
		this.color = "#000"
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

    plot(x,y) {
    	plotBuffer(x,y)
    }

    clear() {
    	this.stage.removeAllChildren()
    	render()
    }

    drawMarker(x,y) {
    	let shape = new createjs.Shape();
    	shape.graphics.beginFill(this.color).drawRect(x-2,y-2,4,4)
    	this.stage.addChild(shape)
    }

	drawLine(x1,y1,x2,y2) {
		let line = new createjs.Shape()
		line.graphics.setStrokeStyle(1)
		line.graphics.beginStroke(this.color)
		line.graphics.moveTo(x1, y1)
		line.graphics.lineTo(x2, y2)
		line.graphics.endStroke();
		this.stage.addChild(line)
	}
	
    plotBuffer(xv,yv) {
        if (xv >= this.xaxis.min && xv <= this.xaxis.max &&
            yv >= this.yaxis.min && yv <= this.yaxis.max) {                
                let x = this.xaxis.getLoc(xv)
                let y = this.yaxis.getLoc(yv)
                if (this.last == null)  {
                    this.drawLine(x,y,x,y)
                    this.last = new createjs.Point(x,y)
                    //drawMarker(x,y)
                } else {
                    //drawMarker(last.x,last.y)
                    if (this.point) 
                    	this.drawLine(x,y,x,y) 
                    else 
                    	this.drawLine(this.last.x,this.last.y,x,y)
                    this.last = new createjs.Point(x,y)
                   //drawMarker(x,y)
                }
        }
    }
}
