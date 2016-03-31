import {Graph} from "../utils"

createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
createjs.Ticker.frameRate = 30

function getData() {
	return {
	"pressure": [1000,990,980,970,960,950,940,930,920,910,900,890,880,870,860,850,840],
		"altitude": [0,80.9705308,162.852307,245.694059,329.485335,414.246019,499.996631,586.758344,674.4897,763.115875,852.640464,942.952656,1034.00407,1125.84507,1218.44313,1311.81595,1405.99922 ],
		"sand-day": [285,284.2,283.4,282.5,281.7,280.9,280,279.2,278.3,277.4,276.5,275.5,274.8,274,273,272.2,271.3],
		"plowed-day": [283,282.2,281.4,280.5,279.7,278.9,278,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"grass-day": [281,280.2,279.4,278.6,277.7,276.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"snow-day": [273,273.2,273.4,273.7,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"sand-night": [278.4,278.5,278.7,278.8,279.5,280.1,280,279.2,278.3,277.4,276.5,275.2,274.8,274,273,272.2,271.3],
		"plowed-night": [278.4,278.5,278.7,278.8,279.5,280.1,280,279.2,278.3,277.4,276.5,275.2,274.8274,273,272.2,271.3],
		"grass-night": [274.4,274.5,274.7,274.9,275.5,276.1,276.8,277.2,277,276.8,276.5,275.2,274.8,274,273,272.2,271.3],
		"snow-night": [268,270,271.8,273.2,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3]
	}
}

function toFahrenheit(kelvin) {
	return (kelvin - 273) * 9 / 5 + 32;
}


class Trial {
	constructor() {
		this.start = null
		this.surface = "sand"
		this.time = "day"
	    this.temp = 0
	    this.altitude = 0
	    this.history = null
	}
	
	init(start) {
		this.start = start
	    this.surface = start.surface
	    this.time = start.time
	    this.temp = 0
	    this.altitude = 0
	    this.history = []
	}
	
	getCol(val) {
		let v = val.toFixed(2)
		let td = document.createElement("td")
		td.appendChild(document.createTextNode(v))
		return td
	}
	
	getColText(val) {
		let td = document.createElement("td")
		td.appendChild(document.createTextNode(val))
		return td
	}
	
	addData(t,a) {
		this.altitude = a/1000.0
		this.temp = toFahrenheit(t)
		this.history.push({temp: this.temp, altitude:this.altitude})
	}
	
	getRow() {
		let tr = document.createElement("tr")
		tr.appendChild(this.getColText(this.start.surface))
		tr.appendChild(this.getColText(this.start.time))
		for (let i = 0; i < this.history.length; i += 2) {
			tr.appendChild(this.getCol(this.history[i].temp))
			tr.appendChild(this.getCol(this.history[i].altitude))
		}
		return tr
	}
}

class Image {
	constructor(src) {
		this.day = new createjs.Bitmap(src)
		this.day.x = -1000
		this.day.y = 0
		this.night = new createjs.Bitmap(src)
		this.night.x = -1000
		this.night.y = 0
		this.night.filters = [ new createjs.ColorFilter(1,1,1,1, -70,-70,-70) ]
		this.night.cache(0,0,300,200)
	}
	
	show(time) {
		if (time == "day")
			this.day.x = 0 
		else
			this.night.x = 0
	}
	
	hide() { 
		this.day.x = this.night.x = -1000
	}
}

class Settings {
	constructor() {
		this.setValue(document.querySelector('input[name="choice"]:checked').value)
		this.listener = null
		let radios = document.querySelectorAll('input[name="choice"]')
		for (let i = 0; i < radios.length; i++) {
			radios[i].addEventListener("change", e => {
				this.setValue(e.target.value)
				if (this.listener) this.listener(this.surface,this.time)
			})
		}
	}
	
	setValue(value) {
		this.value = value
		let v = value.split("-")
		this.surface = v[0]
		this.time = v[1]
	}
	
	getValue() { return this.value }
	
	getSurface() { return this.surface }

	getTime() { return this.time }

	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.restart = document.getElementById("restart")
		this.clear = document.getElementById("clear")
	}
	
	addListener(listener) { 
		this.run.addEventListener("click", e => listener(e))
		this.pause.addEventListener("click", e => listener(e))
		this.restart.addEventListener("click", e => listener(e))
		this.clear.addEventListener("click", e => listener(e))
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
			minX: 20,
			maxX: 54,
			minY: 0,
			maxY: 1.5,
			majorX: 4,
			minorX: 1,
			majorY: 0.3,
			minorY: 0.1,
			precisionY : 1
		})
		this.surface = "sand"
		this.temp = 0
	}
	
	update(trial) {
		this.plot(trial.temp,trial.altitude)
	}
}

class Rad {
	constructor(stage, settings, atgraph, finish) {
		this.stage = stage
		this.settings = settings
		this.atgraph = atgraph
		this.finish = finish
		this.images = [
		    new Image("assets/desert.jpg"),
		    new Image("assets/plowedfield.jpg"),
		    new Image("assets/grassfield.jpg"),
		    new Image("assets/snow.jpg")
		]
		this.lastImage = this.images[0]
		this.surfaces = ["sand","plowed","grass","snow"]
		this.balloon = new createjs.Bitmap("assets/balloon.png")
		this.balloon.x = 150
		this.balloon.y = 160
		this.balloon.scaleX = 0.1
		this.balloon.scaleY = 0.1
		this.baltween = null
		this.path = [150,160, 140,100, 160,40, 150,20, 150, -20 ]
		this.data = getData()
		this.lastIndex = 0
		this.colors = {
			"sand-day":"#F3E5AB","plowed-day": "#966F33", "grass-day": "#7Fe817", "snow-day": "#FDEEF4",
			"sand-night":"#FFD809","plowed-night": "#493D26", "grass-night": "#667C26", "snow-night": "#E3E4FA"
		}
		this.sun = new createjs.Shape().set({x:320,y:20})
		this.sun.graphics.beginFill("#FFFF00").drawCircle(0,0,10)
		this.moon = new createjs.Shape().set({x:320,y:20})
		this.moon.graphics.beginFill("#FFFFFF").drawCircle(0,0,10)

		this.results = document.getElementById("results_table")
		this.trial = new Trial()
		this.settings.addListener((s,t) => this.changeSetting(s,t))
	}
	
	render() {
		this.addChildren()
		this.changeSetting(this.settings.getSurface(),this.settings.getTime())
		this.balloon.y = 160
	}
	
	addChildren() {
		this.images.forEach(img => {
			this.stage.addChild(img.day)
			this.stage.addChild(img.night)
		})
		this.stage.addChild(this.balloon)
		this.stage.addChild(this.sun)
		this.stage.addChild(this.moon)
	}
	
	changeSetting(surface,time) {
		this.lastImage.hide()
		this.lastImage = this.images[this.surfaces.indexOf(surface)]
		this.lastImage.show(time)
		this.showTime()
	}
	
	showTime() {
		let path = [320,20, 300,20, 280,20]
		if (this.settings.getTime() == "day") {
			this.moon.x = 320
			createjs.Tween.get(this.sun).to({guide:{path:path}},1000).play()
		} else {
			this.sun.x = 320
			createjs.Tween.get(this.moon).to({guide:{path:path}},1000).play()
		}
	}

	clear() {
		this.stage.removeAllChildren()
		this.render()
	}
	
	play() {
		this.surface = this.settings.getSurface()
		this.time = this.settings.getTime()
		this.trial.init({
			surface: this.surface,
			time: this.time,
			temp: 20,
		})
		this.atgraph.setColor(this.colors[this.settings.getValue()])
		this.baltween = createjs.Tween.get(this.balloon).to({guide:{path:this.path}},4000)
		this.baltween.call(() => {
			this.running = false
			this.atgraph.endPlot()
			this.results.appendChild(this.trial.getRow())
			if (this.finish) this.finish()
		})
		this.running = true
		this.baltween.play()
	}
	
	pause(pause) { 
		this.baltween.setPaused(pause) 
		this.running = !pause
	}
	
	update(trial) {
		let profile = this.data[this.settings.getValue()]
		let alt = 1500.0 * (160-this.balloon.y)/160
		let i = 0
		while(alt > this.data.altitude[i]) i++
		// to avoid stairstep, only plot when altitude index changes
		if (this.data.altitude[i] && this.lastIndex != i) {
			this.lastIndex = i
			this.trial.addData(profile[i],alt)
			this.atgraph.update(this.trial)
		}
	}
	
	newTrial() {
		this.trial = new Trial()
	}
	
	tick(atgraph) {
		if (this.running === true) {
			this.update(this.trial)
		}
	}
}

class RadSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.atstage = new createjs.Stage("atgraph")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.atgraph = new ATGraph(this.atstage)
		this.rad = new Rad(this.mainstage, this.settings, this.atgraph, () => {
			this.buttons.restart.disabled = false
			this.buttons.pause.disabled = true
		})
		this.rad.render()
		this.pause = false
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.pause = false
				this.rad.play()
				break
			case "pause":
				this.pause = !this.pause
				this.mtn.pause(this.pause)
				e.target.value = this.pause? "Resume":"Pause"
				break
			case "restart":
				this.reset()
				this.rad.clear()
				this.rad.newTrial()
				break;
			case "clear":
				this.atgraph.clear()
				this.atgraph.render()
				break;
			}
		})
	}
		
	reset() {
		this.enablePlay(true)
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
		this.buttons.restart.disabled = !play
	}
	
	render() {
		this.buttons.run.disabled = false
		this.buttons.pause.disabled = true
		this.buttons.restart.disabled = true
		this.atgraph.render()
		this.rad.render()
		createjs.Ticker.addEventListener("tick", e => {
			this.rad.tick(this.atgraph)
			this.atstage.update()
			this.mainstage.update()
		})
	}
}

(new RadSim()).render()
