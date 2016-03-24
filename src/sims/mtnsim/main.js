import {Graph} from "../utils"

createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
createjs.Ticker.frameRate = 60

function dewpoint(temp,vapor) { return temp - ((100.0-humidity(temp,vapor))/5.0) }
function humidity(temp, vapor) { return 100.0 * vapor/saturation(temp)}
function saturation(temp) { return 10 * 0.611 * Math.exp(17.27*temp/(temp+237.3)) }


class Trial {
	constructor() {
		this.start = null
	    this.cloudbase = 0
	    this.temp = 0
	    this.altitude = 0
	    this.vapor = 0
	    this.humidity = 0
	    this.dewpoint = 0
	}
	
	init(start) {
		this.start = start
	    this.cloudbase = 0
	    this.temp = start.temp
	    this.altitude = 0
	    this.vapor = start.vapor
	    this.humidity = start.humidity
	    this.dewpoint = start.dewpoint
	}
	
	getCol(val) {
		let v = val.toPrecision(2)
		let td = document.createElement("td")
		td.appendChild(document.createTextNode(v))
		return td
	}
	
	getRow() {
		let tr = document.createElement("tr")
		tr.appendChild(this.getCol(this.start.temp))
		tr.appendChild(this.getCol(this.start.vapor))
		tr.appendChild(this.getCol(this.start.dewpoint))
		tr.appendChild(this.getCol(this.temp))
		tr.appendChild(this.getCol(this.vapor))
		tr.appendChild(this.getCol(this.dewpoint))
		if (this.cloudbase > 0)
			tr.appendChild(this.getCol(this.cloudbase))
		else
			tr.appendChild(document.createElement("td").appendChild(document.createTextNode("Clear")))
		return tr
	}
}

class Settings {
	constructor() {
		this.temp = document.getElementById("temp")
		this.vapor = document.getElementById("vapor")
		this.tempout = document.getElementById("tempout")
		this.vaporout = document.getElementById("vaporout")
		this.mute = document.getElementById("mute")
		this.listener = null
		function slidef(e,input, out, f) {
	    	e.stopPropagation()
	    	out.value = input.value
	    	if (f) f(input)
		}
		this.temp.addEventListener("input", e => slidef(e,temp,tempout,this.listener))
		this.vapor.addEventListener("input", e => slidef(e,vapor,vaporout,this.listener))
	}
	
	getTemp() { return parseFloat(temp.value) }

	getVapor() { return parseFloat(vapor.value) }

	setTemp(value) {
		this.temp.value = value.toString()
		this.tempout.value = value.toString()
	}
	
	setVapor(value) {
		this.vapor.value = value.toString()
		this.vaporout.value = value.toString()
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

class ETGraph extends Graph {
	constructor(stage,settings) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Temperature(C)",
			ylabel: "Vapor Pressure(mb)",
			xscale: "linear",
			yscale: "linear",
			minX: -20,
			maxX: 30,
			minY: 0,
			maxY: 50,
			majorX: 10,
			minorX: 5,
			majorY: 10,
			minorY: 5
		})
		this.settings = settings
		this.lasth = 0
		this.leaf = new createjs.Bitmap("assets/leaf.gif")
		this.marker = new createjs.Shape()
		this.marker.graphics.beginFill("#000").drawRect(this.xaxis.getLoc(this.temp)-2,this.yaxis.getLoc(this.vapor)-2,4,4)
		stage.addChild(this.leaf)
		stage.addChild(this.marker)
		this.settings.addListener(slider => {
            if (slider.id == "temp")
                this.temp = slider.value
            else if (slider.id == "vapor")
                this.vapor = slider.value
            this.moveMarker(true)
		})
	}
	
	render() {
		this.temp = this.settings.getTemp()
		this.vapor = this.settings.getVapor()
		super.render()
		this.plotSaturation()
		this.moveMarker(true)
	}
	
	plotSaturation() {
        for (let t = this.xaxis.min; t <= this.xaxis.max; t++) this.plot(t,Math.round(saturation(t)))
        this.endPlot()
	}
	
	clear() {
		super.clear()
		this.stage.addChild(this.leaf)
	}
	
	moveLeaf(x,y) {
		this.leaf.x = x-10
		this.leaf.y = y-10
	}
	
	showLeaf(on) {
		if (on === true) {
	       let x = this.xaxis.getLoc(this.temp)
	       let y = this.yaxis.getLoc(this.vapor)
	       this.moveLeaf(x,y)
		} else
		   this.leaf.x = -1000
	}
		
    moveMarker(updateSettings) {
        let sat = saturation(this.temp)
        if (this.vapor >= sat) {
        	this.vapor = sat
        	if (updateSettings === true) {
        		this.settings.setTemp(this.temp)
        		this.settings.setVapor(Math.round(sat))
        	}
        }
        let x = this.xaxis.getLoc(this.temp)
        let y = this.yaxis.getLoc(this.vapor)
        this.marker.x = x - 2
        this.marker.y = y - 2
        if (updateSettings === true) this.moveLeaf(x,y)
    }
    
	update(trial) {
		this.temp = trial.temp
		this.vapor = trial.vapor
		this.plot(trial.temp,trial.vapor)
		this.moveMarker(false)
	}
}

class ATGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Temperature(C)",
			ylabel: "Altitude(km)",
			xscale: "linear",
			yscale: "linear",
			minX: -20,
			maxX: 30,
			minY: 0,
			maxY: 5,
			majorX: 10,
			minorX: 5,
			majorY: 1,
			minorY: 0.5
		})
		this.temp = 20
		this.altitude = 0
		this.cloudbase = 0
	}
	
	update(trial) {
		this.plot(trial.temp,trial.altitude)
	}
}

class Mtn {
	constructor(stage, settings) {
		this.stage = stage
		this.settings = settings
		createjs.Sound.registerSound({id: "thunder", src:"assets/thunder.mp3"})
		createjs.Sound.registerSound({id: "wind", src:"assets/wind.mp3"})
		this.wind = null
		this.thunder = null
		this.mtn = new createjs.Bitmap("assets/mountain.png")
		this.leaf = new createjs.Bitmap("assets/leaf.gif")
		this.cloud = new createjs.Bitmap("assets/cloud.png")
		this.leaftween = null
		this.mtn.x = 0
		this.mtn.y = 0
		this.mtn.scaleX = 0.5
		this.mtn.scaleY = 0.5
		this.running = false
		this.path = [50,164, 74,152, 90,131, 112,122, 137,92, 151,64, 173,56, 204,70, 221,92, 224,105, 246,121, 268,141, 290,164]
		this.results = document.getElementById("results_table")
		this.trial = new Trial()
	}
	
	render() {
		this.stage.addChild(this.mtn)
		this.stage.addChild(this.leaf)
		this.stage.addChild(this.cloud)
		this.leaf.x = 50
		this.leaf.y = 165
		this.cloud.x = -1000
		this.cloud.y = 0
		this.lastalt = 0
		this.cloud.scaleX = 0.1
		this.cloud.scaleY = 0.1
	}
	
	clear() {
		this.stage.removeAllChildren()
		this.render()
	}
	
	play() {
		this.temp = this.settings.getTemp()
		this.vapor = this.settings.getVapor()
		this.trial.init({
			temp: this.temp,
			vapor: this.vapor,
			humidity: humidity(this.temp,this.vapor),
			dewpoint: dewpoint(this.temp,this.vapor)		
		})
		this.factor = 10.0
		this.lastalt = 0
		this.leaftween = createjs.Tween.get(this.leaf).to({guide:{path:this.path}},10000)
		this.leaftween.call(() => {
			if (this.wind) this.wind.stop()
			this.running = false
			this.results.appendChild(this.trial.getRow())
		})
		this.running = true
		this.leaftween.play()
		this.playSound("wind")
	}
	
	pause(pause) { 
		this.leaftween.setPaused(pause) 
		if (this.wind) this.wind.paused = pause
		if (this.thunder) this.thunder.paused = pause
		this.running = !pause
	}
	
	playSound(sound) {
		return
		if (!this.settings.mute.checked) {
			switch(sound) {
			case "wind":
				this.wind = createjs.Sound.play(sound,{loop: 2})
				break
			case "thunder":
				this.thunder = createjs.Sound.play(sound)
				break
			}
		}
	}
	
	update(trial) {
		let oldA = this.trial.altitude, oldT = this.trial.temp
		this.trial.altitude = (165 - this.leaf.y)/165 * 5
		if (this.trial.altitude < 0) this.trial.altitude = 0
		this.trial.temp = Number(oldT - this.factor * (this.trial.altitude - oldA))
		this.trial.humidity = humidity(this.trial.temp,this.trial.vapor)
		this.trial.dewpoint = dewpoint(this.trial.temp,this.trial.vapor)
		if (trial.humidity >= 100) {
			this.animateClouds()
			this.trial.vapor = saturation(this.trial.temp)
			this.trial.humidity = 100
			this.factor = 6.0
		}
		if (trial.temp > oldT) this.factor = 10.0;
	}
	
	animateClouds() {
		if (this.trial.cloudbase == 0) {
			this.trial.cloudbase = this.trial.altitude
			if (this.trial.temp == 0) this.playSound("thunder")
			this.cloud.x = this.leaf.x - 2
			this.cloud.y = this.leaf.y
			this.lasty = this.leaf.y
		}
		if ((this.trial.altitude - this.lastalt) > .1) {
			this.lastalt = this.trial.altitude
			this.cloud.scaleX += .02
			this.cloud.scaleY += .04
			this.cloud.x -= 2
			this.cloud.y = this.leaf.y
		}
	}
	
	newTrial() {
		this.trial = new Trial()
	}
	
	tick(etgraph, atgraph) {
		if (this.running == true) {
			this.update(this.trial)
			etgraph.update(this.trial)
			atgraph.update(this.trial)
		}
	}
}

class MtnSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.etstage = new createjs.Stage("etgraph")
		this.atstage = new createjs.Stage("atgraph")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.etgraph = new ETGraph(this.etstage,this.settings)
		this.atgraph = new ATGraph(this.atstage)
		this.mtn = new Mtn(this.mainstage, this.settings)
		this.pause = false
		this.buttons.mute.checked = false
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.etgraph.showLeaf(false)
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.pause = false
				this.mtn.play()
				break
			case "pause":
				this.pause = !this.pause
				this.mtn.pause(this.pause)
				e.target.value = this.pause? "Resume":"Pause"
				break
			case "restart":
				this.reset()
				this.mtn.clear()
				this.etgraph.clear()
				this.atgraph.clear()
				this.etgraph.render()
				this.atgraph.render()
				this.mtn.newTrial()
				break;
			}
		})
	}
		
	reset() {
		this.enablePlay(true)
		this.settings.setTemp(25)
		this.settings.setVapor(7)
		this.etgraph.showLeaf(true)
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
	}
	
	render() {
		this.buttons.pause.disabled = true
		this.buttons.run.disabled = false
		this.reset()
		this.etgraph.render()
		this.atgraph.render()
		this.mtn.render()
		createjs.Ticker.addEventListener("tick", e => {
			this.mtn.tick(this.etgraph, this.atgraph)
			this.etstage.update()
			this.atstage.update()
			this.mainstage.update()
		})
	}
}

new MtnSim().render()
