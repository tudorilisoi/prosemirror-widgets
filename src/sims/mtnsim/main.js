import {Graph} from "../utils"

class SliderPanel {
	constructor() {
		this.temp = document.getElementById("temp")
		this.vapor = document.getElementById("vapor")
		this.wind = document.getElementById("wind")
		this.tempout = document.getElementById("tempout")
		this.vaporout = document.getElementById("vaporout")
		this.windout = document.getElementById("windout")
		function slidef(e,input, out) {
	    	e.stopPropagation()
	    	out.value = input.value
		}
		this.temp.addEventListener("input", e => slidef(e,temp,tempout))
		this.vapor.addEventListener("input", e => slidef(e,vapor,vaporout))
		this.wind.addEventListener("input", e => slidef(e,wind,windout))
	}	
}

class ButtonPanel {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.trial = document.getElementById("trial")
		this.run.addEventListener("click", e => {
			console.log("run")
		})
		this.pause.addEventListener("click", e => {
			console.log("pause")
		})
		this.trial.addEventListener("click", e => {
			console.log("trial")
		})
	}
}

class ETGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Temperature(C)",
			ylabel: "Vapor Pressure(mb)",
			xscale: "linear",
			yscale: "linear"
		})
		this.temp = 25.0
		this.humidity = 7.0
	}
	
	static calcDewpoint(vapor, air) {
        return (2354.0/(9.4041-Math.log(vaporPress)/Math.log(10))-273.0)
	}
	   
	static calcSaturation(temp) {
		return (6.112 * Math.exp((17.67*temp)/(temp + 243.5)))
	}
	
	render() {
		super.render()
		this.plotSaturation()
	}
	
	plotSaturation() {
        for (let t = this.xaxis.min; t <= this.xaxis.max; t++) {
            let h = Math.pow(10.0,-2937.4/(t+273.0)-4.9283*Math.log(t+273.0)/Math.log(10) + 23.5471)
            this.plotBuffer(t,Math.round(h))
        }
	}
	
	clear() {
		super.clear()
		this.render()
	}
	
	humidity() { return this.humidity }
	
	temp() { return this.temp }
	
	dewpoint() { return calcDewpoint(this.humidity,1000) }
/*    public boolean handleEvent(Event e)
    {
        if (e.target instanceof Scrollbar)
        {
            if ((e.target == tempsb) && (e.id > 600) && (e.id < 606))
            {
                tempValue = (tempsb.getValue()/ReadoutPanel.Md)-ReadoutPanel.tempOffset;
                moveMarker("temp");
                return true;
            }
            else if ((e.target == humidsb) && (e.id > 600) && (e.id < 606))
            {//e.id > 600 and e.id <=605 are scroll events
                humidValue = (((Integer)(e.arg)).doubleValue())/ReadoutPanel.Md;//humidsb.getValue()/ReadoutPanel.Md;
                moveMarker("humid");
                return true;

            }
        }
		return super.handleEvent(e);
	}
*/
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
			yscale: "linear"
		})
		this.temp = 25.0
		this.altitude = 1.0
	}	
}

class Mtn {
	constructor(stage) {
		this.stage = stage
	}
	
	render() {
		let bitmap = new createjs.Bitmap("assets/mountain.png")
		bitmap.x = 0
		bitmap.y = 0
		bitmap.scaleX = 0.5
		bitmap.scaleY = 0.5
		this.stage.addChildAt(bitmap)
	}	
}

class MtnSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas");
		this.etstage = new createjs.Stage("etgraph");
		this.atstage = new createjs.Stage("atgraph");
		this.button_panel = new ButtonPanel()
		this.slider_panel = new SliderPanel()
		this.etgraph = new ETGraph(this.etstage)
		this.atgraph = new ATGraph(this.atstage)
		this.mtn = new Mtn(this.mainstage)
	}
	
	run() {
		this.etgraph.render()
		this.atgraph.render()
		this.mtn.render()
		createjs.Ticker.addEventListener("tick", () => {
			this.etstage.update()
			this.atstage.update()
			this.mainstage.update()
		})
	}
}

let mtnsim = new MtnSim()
mtnsim.run()
/*let bitmap = new createjs.Bitmap("assets/mtn.png")
bitmap.x = 0
bitmap.y = 170
mainstage.addChildAt(bitmap)
mainstage.update()*/