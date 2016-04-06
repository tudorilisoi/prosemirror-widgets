import {Graph} from "../utils"
 
createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])

const water_color = "#EBF4FA", pipe_color ="#AAA", line_color = "#111"
	
class Settings {
	constructor() {
		this.inflow = document.getElementById("inflow")
		this.outflow = document.getElementById("outflow")
		this.inflowout = document.getElementById("inflowout")
		this.outflowout = document.getElementById("outflowout")
		this.mute = document.getElementById("mute")
		this.listener = null
		function slidef(e,input, out, f) {
	    	e.stopPropagation()
	    	out.value = input.valueAsNumber
	    	if (f) f(input)
		}
		// IE doesn't have an input event but a change event
		let event = /msie|trident/g.test(window.navigator.userAgent.toLowerCase())?"change":"input"
		this.inflow.addEventListener(event, e => slidef(e,inflow,inflowout,this.listener))
		this.outflow.addEventListener(event, e => slidef(e,outflow,outflowout,this.listener))
	}
	
	getInflow() { return this.inflow.valueAsNumber }

	getOutflow() { return this.outflow.valueAsNumber }

	setInflow(value) {
		this.inflow.value = value
		this.inflowout.value = value
	}
	
	setOutflow(value) {
		this.outflow.value = value
		this.outflowout.value = value
	}

	getMute() { return this.mute.checked }

	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.restart = document.getElementById("restart")
	}
	
	addListener(listener) { 
		this.run.addEventListener("click", e => listener(e))
		this.pause.addEventListener("click", e => listener(e))
		this.restart.addEventListener("click", e => listener(e))
	}
}

class RateGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Time(hour)",
			ylabel: "Rate(liter/hour)",
			xscale: "linear",
			yscale: "linear",
			minX: 0,
			maxX: 24,
			minY: 0,
			maxY: 6,
			majorX: 4,
			minorX: 2,
			majorY: 1,
			minorY: .5
		})
		this.stage = stage
		this.lastInflow = null
		this.lastOutflow = null
	}
	
	render() {
		super.render()
		this.legend()
	}
	
	legend() {
		let inflowline = new createjs.Shape()
		inflowline.graphics.beginStroke(line_color).moveTo(50,10).lineTo(70,10).endStroke()
		let inflowText = new createjs.Text("Inflow","12px Arial")
		inflowText.x = 75
		inflowText.y = 5
		let outflowline = new createjs.Shape()
		outflowline.graphics.setStrokeDash([1,4]).beginStroke(line_color).moveTo(130,10).lineTo(150,10).endStroke()
		let outflowText = new createjs.Text("Outflow","12px Arial")
		outflowText.x = 155
		outflowText.y = 5
		this.stage.addChild(inflowline)
		this.stage.addChild(inflowText)
		this.stage.addChild(outflowline)
		this.stage.addChild(outflowText)
	}
	
	clear() {
		super.clear()
		this.lastInflow = null
		this.lastOutflow = null
		this.render()
	}
	
	update(time, inflow, outflow) {
		this.dotted = false
		this.last = this.lastInflow
		this.plot(time,inflow)
		this.lastInflow = this.last
		this.dotted = true
		this.last = this.lastOutflow
		this.plot(time,outflow)
		this.lastOutflow = this.last
	}
}

class LevelGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Time(hour)",
			ylabel: "Level(liter)",
			xscale: "linear",
			yscale: "linear",
			minX: 0,
			maxX: 24,
			minY: 0,
			maxY: 100,
			majorX: 4,
			minorX: 2,
			majorY: 10,
			minorY: 10
		})
		this.time = 0
		this.level = 0
	}
	
	update(time,level) {
		this.plot(time,level)
		this.time = time
		this.level = level
	}
}

class Tank {
	constructor(stage, settings, finish) {
		this.stage = stage
		this.settings = settings
		this.finish = finish
		this.level = 0
		this.time = 0
		createjs.Sound.registerSound({id: "stream", src:"assets/stream.mp3"})
		createjs.Sound.on("fileload", e => {
			this.streamSound = createjs.Sound.play("stream",{loop: -1})
			this.streamSound.paused = true
		})
	}
	
	render() {
		let top = new createjs.Shape()
		top.graphics.beginStroke(line_color).drawEllipse(90,10,120,20).endStroke()
		let bottom = new createjs.Shape()
		bottom.graphics.beginStroke(line_color).beginFill(water_color).drawEllipse(90,170,120,20).endStroke()
		let left = new createjs.Shape()
		left.graphics.beginStroke(line_color).moveTo(90,20).lineTo(90,180).endStroke()
		let right = new createjs.Shape()
		right.graphics.beginStroke(line_color).moveTo(210,20).lineTo(210,180).endStroke()
		let inflowText = new createjs.Text("Inflow","16px Arial")
		inflowText.x = 15
		inflowText.y = 15
		let inpipe = new createjs.Shape()
		inpipe.graphics.beginStroke(pipe_color).beginFill(pipe_color).drawRect(0,30,90,5).endStroke()
		let inflowArrow = new createjs.Shape()
		inflowArrow.graphics.beginStroke(line_color).moveTo(15,45).lineTo(75,45).endStroke()
		this.stage.addChild(inflowArrow)
		this.drawArrow(0,75,45)
		
		let outpipe = new createjs.Shape()
		outpipe.graphics.beginStroke(pipe_color).beginFill(pipe_color).drawRect(210,170,280,5).endStroke()
		let outflowText = new createjs.Text("Outflow","16px Arial")
		outflowText.x = 230
		outflowText.y = 155
		let outflowArrow = new createjs.Shape()
		outflowArrow.graphics.beginStroke(line_color).moveTo(230,185).lineTo(280,185).endStroke()
		this.stage.addChild(outflowArrow)
		this.drawArrow(0,280,185)
		
		
		this.surface = new createjs.Shape()
		this.surface.graphics.beginStroke(water_color).beginFill(water_color).drawEllipse(91,170,118,20).endStroke()
		this.water = new createjs.Shape()
		this.water.graphics.beginStroke(water_color).beginFill(water_color).drawRect(91,180,118,0).endStroke()
		
		this.stream = new createjs.Shape()
		this.stream.graphics.beginStroke(water_color).setStrokeStyle(5).moveTo(91,32).bezierCurveTo(105,30,120,40,120,185).endStroke()
		this.stream.visible = false
		

		this.stage.addChild(top)
		this.stage.addChild(bottom)
		this.stage.addChild(left)
		this.stage.addChild(right)
		this.stage.addChild(inpipe)
		this.stage.addChild(inflowText)
		this.stage.addChild(outpipe)
		this.stage.addChild(outflowText)
		this.stage.addChild(this.stream)
		this.stage.addChild(this.surface)
		this.stage.addChild(this.water)

	}
	
	drawArrow(radian, x, y) {
	    let arrow = new createjs.Shape();
	    arrow.graphics.beginStroke(line_color).moveTo(-5, +5).lineTo(0, 0).lineTo(-5, -5)
	    let degree = radian / Math.PI * 180
	    arrow.x = x
	    arrow.y = y
	    arrow.rotation = degree
	    this.stage.addChild(arrow)
	}
	
	clear() {
		this.stop()
		this.stage.removeAllChildren()
		this.render()
		this.time = 0
		this.level = 0
	}
	
	run() {
		this.running = true
	}
	
	stop() {
		this.running = false;
		this.streamSound.paused = true
		if (this.finish) this.finish()
	}
	
	showStream() {
		if (this.settings.getInflow() > 0) {
			this.stream.visible = true
			this.streamSound.paused = this.settings.getMute()
		} else {
			this.stream.visible = false
			this.streamSound.paused = true
		}
	}
	
	pause(pause) { 
		this.running = !pause
		this.stream.visible = this.running
		if (pause === true) this.streamSound.paused = true
	}
	
	update() {
		let inflow = this.settings.getInflow()
		let outflow = this.settings.getOutflow()
		this.level += inflow - outflow
		if (this.level < 0) this.level = 0
		if (this.level > 99) {
			this.stop()
			return
		}
		let y = 170 - 1.7 * this.level
		this.surface.graphics.clear().beginStroke(water_color).beginFill(water_color).drawEllipse(91,y,118,20).endStroke()
		this.water.graphics.clear().beginStroke(water_color).beginFill(water_color).drawRect(91,y+10,118,170-y).endStroke()
		this.showStream()
		this.time++
	}
	
	tick(rategraph, levelgraph) {
		if (!this.running) return
		if (this.time >= 24) { 
			this.stop()
			return
		}
		this.update()
		rategraph.update(this.time,this.settings.getInflow(),this.settings.getOutflow())
		levelgraph.update(this.time,this.level)
	}
}

class BudgetSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.ratestage = new createjs.Stage("rategraph")
		this.levelstage = new createjs.Stage("levelgraph")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.rategraph = new RateGraph(this.ratestage,this.settings)
		this.levelgraph = new LevelGraph(this.levelstage)
		this.tank = new Tank(this.mainstage, this.settings, () => {
			this.buttons.restart.disabled = false
			this.buttons.pause.disabled = true
		})
		this.pause = false
		this.settings.setInflow(0)
		this.settings.setOutflow(0)
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.pause = false
				this.tank.run()
				break
			case "pause":
				this.pause = !this.pause
				this.tank.pause(this.pause)
				e.target.value = this.pause? "Resume":"Pause"
				break
			case "restart":
				this.reset()
				this.tank.clear()
				this.rategraph.clear()
				this.levelgraph.clear()
				this.rategraph.render()
				this.levelgraph.render()
				break
			}
		})
	}
		
	reset() {
		this.enablePlay(true)
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
	}
	
	render() {
		this.settings.mute.checked = false
		this.buttons.run.disabled = false
		this.buttons.pause.disabled = true
		this.buttons.restart.disabled = false
		this.rategraph.render()
		this.levelgraph.render()
		this.tank.render()
		createjs.Ticker.framerate = 2
		createjs.Ticker.addEventListener("tick", e => {
			this.tank.tick(this.rategraph, this.levelgraph)
			this.ratestage.update()
			this.levelstage.update()
			this.mainstage.update()
		})
	}
}

(new BudgetSim()).render()
