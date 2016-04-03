import {Graph} from "../utils"
 
createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
createjs.Ticker.frameRate = 30

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
		this.temp.addEventListener(event, e => slidef(e,temp,tempout,this.listener))
		this.vapor.addEventListener(event, e => slidef(e,vapor,vaporout,this.listener))
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
	
	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.restart = document.getElementById("restart")
		this.mute = document.getElementById("mute")
	}
	
	addListener(listener) { 
		this.run.addEventListener("click", e => listener(e))
		this.pause.addEventListener("click", e => listener(e))
		this.restart.addEventListener("click", e => listener(e))
	}
	
	mute() { return this.mute.checked }
}

class RateGraph extends Graph {
	constructor(stage,settings) {
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
			maxY: 10,
			majorX: 1,
			minorX: .5,
			majorY: 2,
			minorY: 1
		})
		this.settings = settings
		this.settings.addListener(slider => {
            if (slider.id == "inflow")
                this.inflow = slider.valueAsNumber
            else if (slider.id == "outflow")
                this.outflow = slider.valueAsNumber
            //move level?
		})
	}
	
	render() {
		this.inflow = this.settings.getInflow()
		this.outflow = this.settings.getOutflow()
		super.render()
	}
	
	clear() {
		super.clear()
		this.stage.addChild(this.leaf)
	}
	
	update(trial) {
		this.temp = trial.temp
		this.vapor = trial.vapor
		this.plot(trial.temp,trial.vapor)
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
			majorX: 1,
			minorX: 0.5,
			majorY: 10,
			minorY: 10
		})
		this.time = 0
		this.level = 0
	}
	
	update(trial) {
		this.plot(trial.temp,trial.altitude)
	}
}

class Tank {
	constructor(stage, settings, finish) {
		this.stage = stage
		this.settings = settings
		this.finish = finish
		createjs.Sound.registerSound({id: "stream", src:"assets/stream.mp3"})
	}
	
	render() {
/*		var rectangle1 = new createjs.Shape();
		rectangle1.graphics.beginLinearGradientFill(["#00abe5","#005f7f"], [0.2, 0.8], x/8, y/2, x, y/2).drawRect(x, 210 , -height, 15);
		stage.addChild(rectangle1);
	    
		var ellipse1 = new createjs.Shape();
		// ellipse1.graphics.beginStroke("#C0C0C0"); 
		ellipse1.graphics.beginLinearGradientFill(["#939393","#d3d3d3"], [0.8, 0.2], 7*x/4, x, x, x).drawEllipse(x, 55, width, 2*height / 24);
	// ellipse1.graphics.endStroke(); 
		stage.addChild(ellipse1);
		
		ellipse1.graphics.moveTo(x, y + height / 8);
	    ellipse1.graphics.lineTo(x, y + 7 * height / 8);
	    ellipse1.graphics.moveTo(x, y + height / 8);
	    ellipse1.graphics.lineTo(x, y + 7 * height / 8);
		
		var ellipse2 = new createjs.Shape();
		ellipse2.graphics.beginLinearGradientFill(["#0098cc","#005f7f"], [0.2, 0.8], 7*x/5, y, 7*x/10, x).drawEllipse(x, 210, width, 2*height / 11);
		stage.addChild(ellipse2);
		
		var rectangle2 = new createjs.Shape();
		rectangle2.graphics.beginLinearGradientFill(["#bdbdbd","#939393"], [0.7, 0.3], 2*x, x, y, 2*y).drawRect(x, 66, width, height / 6);
		stage.addChild(rectangle2);
		

		var rectangle3 = new createjs.Shape();
		rectangle3.graphics.beginLinearGradientFill(["#005f7f","#0098cc"], [0.7, 0.3], 2*x, 2*y, y, 2*y).drawRect(x, 100, width, 130);
		stage.addChild(rectangle3);
		
		
		var rectangle4 = new createjs.Shape();
		rectangle4.graphics.beginLinearGradientFill(["#0098cc","#00abe5"], [0.7, 0.3], x/2, y/4, x/4, y/6)
		rectangle4.graphics.beginLinearGradientFill(["#FFFFFF", "#0098cc", "#FFFFFF"], [0.2, 0.6, 0.2], [0, 127, 255], 120 , y, x, y).drawRect(x+width, 95, 122, 15);
		rectangle4.graphics.beginLinearGradientFill(["rgba(255,255,255,0)", "rgba(0,133,178,1)","rgba(255,198,255,0)"], [0.1,0.7, 0.3], 0, 50, 0,   130).drawRect(x+width, 95, 122, 15);
		stage.addChild(rectangle4)	
*/		
	}
	
	clear() {
		this.stage.removeAllChildren()
		this.render()
	}
	
	play() {
		this.inflow = this.settings.getInflow()
		this.outflow = this.settings.getOutflow()
		this.running = true
		this.playSound("stream")
	}
	
	pause(pause) { 
		if (this.stream) this.stream.paused = pause
		this.running = !pause
	}
	
	playSound(sound) {
		if (!this.settings.mute.checked) {
			this.sream = createjs.Sound.play(sound,{loop: 20})
		}
	}
 	
	update() {
	}
	
	tick(rategraph, levelgraph) {
		if (this.running === true) {
			this.update()
			rategraph.update()
			levelgraph.update()
		}
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
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.pause = false
				this.tank.play()
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
				break;
			}
		})
	}
		
	reset() {
		this.enablePlay(true)
		this.settings.setTemp(20.0)
		this.settings.setVapor(7.0)
		this.etgraph.showLeaf(true)
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
		this.buttons.restart.disabled = !play
	}
	
	render() {
		this.buttons.run.disabled = false
		this.buttons.mute.checked = false
		this.buttons.pause.disabled = true
		this.buttons.restart.disabled = true
		this.rategraph.render()
		this.levelgraph.render()
		this.tank.render()
		createjs.Ticker.addEventListener("tick", e => {
			this.tank.tick(this.rategraph, this.levelgraph)
			this.ratestage.update()
			this.levelstage.update()
			this.mainstage.update()
		})
	}
}

(new BudgetSim()).render()
