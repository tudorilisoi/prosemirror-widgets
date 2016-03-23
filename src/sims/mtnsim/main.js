import {Graph} from "../utils"

createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
//createjs.Sound.addEventListener("fileload", e => { console.log("Preloaded:", e.id, e.src) })

class Trial {
	constructor(temp,alt,vapor,hum,td,cb) {
	    this.tempStart = temp
	    this.altStart = alt
	    this.vaporStart = vapor
	    this.humStart = hum
	    this.tdStart = td
	    this.cloudbase = cb
	    this.temp = temp
	    this.altitude = alt
	    this.vapor = vapor
	    this.humidity = hum
	    this.td = td
	    this.taSlope = 0
	}
	
	getCol(val) {
		return document.createElement("td").appendChild(document.createTextNode(val))	
	}
	
	getRow() {
		let tr = document.createElement("tr")
		tr.appendChild(this.getCol(this.tempStart))
		tr.appendChild(this.getCol(this.altStart))
		tr.appendChild(this.getCol(this.vaporStart))
		tr.appendChild(this.getCol(this.humStart))
		tr.appendChild(this.getCol(this.tdStart))
		tr.appendChild(this.getCol(this.temp))
		tr.appendChild(this.getCol(this.altitude))
		tr.appendChild(this.getCol(this.vapor))
		tr.appendChild(this.getCol(this.humidity))
		tr.appendChild(this.getCol(this.td))
		tr.appendChild(this.getCol(this.cloudbase))
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
		this.temp = settings.temp.value
		this.vapor = settings.vapor.value
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
            this.moveMarker(slider.id)
		})
	}
	
	static calcDewpoint(vapor, air) {
        return (2354.0/(9.4041-Math.log(vapor)/Math.log(10))-273.0)
	}
	   
	static calcSaturation(temp) {
		return (6.112 * Math.exp((17.67*temp)/(temp + 243.5)))
	}
	
	render() {
		super.render()
		this.plotSaturation()
		this.moveMarker("temp")
	}
	
	plotSaturation() {
        for (let t = this.xaxis.min; t <= this.xaxis.max; t++) {
            let h = Math.pow(10.0,-2937.4/(t+273.0)-4.9283*Math.log(t+273.0)/Math.log(10) + 23.5471)
            this.plot(t,Math.round(h))
        }
	}
	
	clear() {
		super.clear()
		this.stage.addChild(this.leaf)
	}
	
	dewpoint() { return ETGraph.calcDewpoint(this.vapor,1000) }

	moveLeaf(x,y) {
		this.leaf.x = x-10
		this.leaf.y = y-10
	}
	
    moveMarker(slider) {
        let x = this.xaxis.getLoc(this.temp)
        let y = this.yaxis.getLoc(this.vapor)
        let sat = ETGraph.calcSaturation(this.temp)
        if (this.vapor >= sat) {
            this.settings.vapor.value = sat
            this.settings.vapor.max = sat
            this.settings.temp.value = this.temp
            y = this.yaxis.getLoc(sat)
        }
        this.marker.x = x - 2
        this.marker.y = y - 2
        this.moveLeaf(x,y)
    }
    
	update(trial) {
        let x = this.xaxis.getLoc(this.temp)
        let y = this.yaxis.getLoc(this.vapor)
		this.temp = trial.temp
		this.vapor = trial.vapor
		this.plot(x,y)
		this.moveMarker("temp")
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
		this.temp = 25.0
		this.altitude = 1.0
		this.cloudbase = 0
	}
	
	update(trial) {
		this.plot(this.xaxis.getLoc(trial.temp),this.yaxis.getLoc(trial.altitude))
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
		this.leaftween = null
		this.mtn.x = 0
		this.mtn.y = 0
		this.mtn.scaleX = 0.5
		this.mtn.scaleY = 0.5
		this.clouds = []
		for (let i = 0; i < 10; i++) {
			let cloud = new createjs.Bitmap("assets/cloud"+(i+1)+"n.gif")
			this.clouds.concat(cloud)
		}
		this.running = false
		this.path = [50,164, 74,152, 90,131, 112,122, 137,92, 151,64, 173,56, 204,70, 221,92, 224,105, 246,121, 268,141, 290,164]
		this.factor = 10.0
		this.results = document.getElementById("results_table")
		this.trial = new Trial()
		this.lastH = 1.0
	}
	
	render() {
		this.stage.addChild(this.mtn)
		this.stage.addChild(this.leaf)
		this.leaf.x = 50
		this.leaf.y = 165
	}
	
	clear() {
		this.stage.removeAllChildren()
		this.render()
	}
	
	animateClouds() {
		let h = 5.0 * this.trial.altitude
		if (this.trial.cloudbase == 0) {
			this.trial.cloudbase = this.trial.altitude
			if (this.trial.temp == 0 || (9 - h) >= 0) playSound("thunder")
		}
		if (Math.abs(lastH - h) >= 1) {
			for (let i = 0; i < 9 - Math.abs(h); i++) {
				let h1 = clouds[i].height
				clouds[i].x = this.leaf.x - 20
				clouds[i].y = this.leaf.y - h1 / 2
			}
			lastH = h
		}
	}
	
	play() {
		this.factor = 10.0
		this.clouds.forEach(cloud => {this.stage.addChild(cloud)})
		this.leaftween = createjs.Tween.get(this.leaf).to({guide:{path:this.path}},5000)
		this.leaftween.call(() => {
			if (this.wind) this.wind.stop()
			this.running = false
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
		let oldA = trial.altitude, oldT = trial.temp, oldP = trial.pressure
		trial.altitude = trial.startHeight + ((165 - this.leaf.y)/165) * 10
		if (trial.altitude < 0) trial.altitude = 0
		trial.pressure = trial.pressStart - 125 * (trial.altitude - trial.altStart)
		trial.humidity = trial.humidity * trial.pressure / oldP
		trial.td = ETGraph.calcDewpoint(trial.humidity, trial.pressure)
		trial.temp = oldT - this.factor * (trial.altitude - oldA)
		let h = ETGraph.calcSaturation(trial.temp)
		if (trial.altitude != oldA) trial.taSlope = (trial.temp - oldT) / (trial.altitude - oldA)
		if (trial.humidity > h) {
			animateClouds()
			trial.humidity = h
			this.factor = 6.0
		}
		if (trial.temp > oldT) this.factor = 10.0;
	}
	
	newTrial() {
		this.results.appendChild(this.trial.getRow())
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
		this.settings.temp.value = 20
		this.settings.vapor.value = 1
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
