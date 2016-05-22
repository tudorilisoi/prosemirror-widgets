let Random = require("prosemirror/node_modules/random-js")
createjs.MotionGuidePlugin.install()
createjs.Ticker.frameRate = 1

const points = 17, maxMolecules = 500, temp = 1.66

let random = new Random(Random.engines.mt19937().autoSeed())

const surface_times = ["sand-day","plowed-day","grass-day","snow-day","sand-night","plowed-night","grass-night","snow-night"]
                      
function getData() {
	return {
		"pressure": [1000,990,980,970,960,950,940,930,920,910,900,890,880,870,860,850,840],
		"altitude": [0,80.9705308,162.852307,245.694059,329.485335,414.246019,499.996631,586.758344,674.4897,763.115875,852.640464,942.952656,1034.00407,1125.84507,1218.44313,1311.81595,1405.99922 ],
		"sand-day": [285,284.2,283.4,282.5,281.7,280.9,280,279.2,278.3,277.4,276.5,275.5,274.8,274,273,272.2,271.3],
		"plowed-day": [283,282.2,281.4,280.5,279.7,278.9,278,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"grass-day": [281,280.2,279.4,278.6,277.7,276.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"snow-day": [273,273.2,273.4,273.7,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"sand-night": [278.4,278.5,278.7,278.8,279.5,280.1,280,279.2,278.3,277.4,276.5,275.2,274.8,274,273,272.2,271.3],
		"plowed-night": [276.4,276.5,276.7,276.8,277.5,278.1,278,277.5,278.1,278,276.8,276.5,275.2,274.8,274,273,271.2,271.3],
		"grass-night": [274.4,274.5,274.7,274.9,275.5,276.1,276.8,277.2,277,276.8,276.5,275.2,274.8,274,273,272.2,271.3],
		"snow-night": [268,270,271.8,273.2,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3]
	}
}

function toFahrenheit(kelvin) {
	return (kelvin - 273.15) * 9 / 5 + 32
}

function toCentigrade(kelvin) {
	return (kelvin - 273.15)
}

class Vector {
	constructor(x,y) {
		this.x = x || 0
		this.y = y || 0
	}
	
	add(vector) {
		this.x += vector.x
		this.y += vector.y
	}
	
	magnitude() {return Math.sqrt(this.x * this.x + this.y * this.y)}
	
	angle() {return Math.atan2(this.y,this.x)}
	
	fromAngle (angle, magnitude) {return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))}
}

class Molecule {
	constructor(rect) {
		this.rect = rect
		this.position = new Vector(0, 0)
		this.velocity = new Vector(0, 0)
		this.acceleration = new Vector(0, 0)
		this.dot = 	new createjs.Shape()
		this.dot.graphics.beginStroke("#888").setStrokeStyle(1).drawCircle(0,0,2).endStroke()
		this.place()
	}

	randomBetween(min,max) { return random.integer(min,max)}
	
	place() {
		this.position.x = this.randomBetween(this.rect.x,this.rect.x+this.rect.width)
		this.position.y = this.randomBetween(this.rect.y,this.rect.y+this.rect.height)
		this.velocity.x = random.real(-2.0,2.0,false)
		this.velocity.y = random.real(-2.0,2.0,false)
	}

	updateAcceleration(oldy,newy) {
		let midy = (this.rect.y+this.rect.height)/2
		if (oldy < midy && newy > midy) {
			this.acceleration.x = this.velocity.x > 0? temp: -temp
			this.acceleration.y = this.velocity.y > 0? temp: -temp
		} else if (oldy > midy && newy < midy) {
			this.acceleration.x = this.velocity.x > 0? -temp: temp
			this.acceleration.y = this.velocity.y > 0? -temp: temp
		} else {
			this.acceleration.x = 0
			this.acceleration.y = 0
		}
	}
	
	move() {
		this.velocity.add(this.acceleration)
		this.position.add(this.velocity)
		if (this.position.x < this.rect.x) {
			this.position.x = this.rect.x
			this.velocity.x = -this.velocity.x
		} else if (this.position.x > (this.rect.x+this.rect.width+20)) {
			this.position.x = this.rect.x+this.rect.width+20
			this.velocity.x = -this.velocity.x
		} else if (this.position.x < this.rect.x+20 && this.position.y < this.rect.y) {
			this.position.x += 2
			this.velocity.x = -this.velocity.x
		}
		if (this.position.y < this.rect.y-20) {
			this.position.y = this.rect.y-20
			this.velocity.y = -this.velocity.y
		} else if (this.position.y > (this.rect.y+this.rect.height)) {
			this.position.y = this.rect.y+this.rect.height
			this.velocity.y = -this.velocity.y
		} else if (this.position.x > this.rect.x+this.rect.width && this.position.y > this.rect.y+this.rect.height-20) {
			this.position.y -= 2
			this.velocity.y = -this.velocity.y
		}
		this.updateAcceleration(this.dot.y,this.position.y)
		this.dot.x = this.position.x
		this.dot.y = this.position.y
	}
}	

class AirColumn {
	constructor(stage,rect) {
		this.rect = rect
		let front = new createjs.Shape()
		front.graphics.beginStroke("#888").setStrokeStyle(1).drawRect(rect.x,rect.y,rect.width,rect.height).endStroke()
		let back = new createjs.Shape()
		back.graphics.beginStroke("#888").setStrokeStyle(1).drawRect(rect.x+20,rect.y-20,rect.width,rect.height).endStroke()
		let lefttop = new createjs.Shape()
		lefttop.graphics.beginStroke("#888").setStrokeStyle(1).moveTo(rect.x,rect.y).lineTo(rect.x+20,rect.y-20).endStroke()
		let righttop = new createjs.Shape()
		righttop.graphics.beginStroke("#888").setStrokeStyle(1).moveTo(rect.x+rect.width,rect.y).lineTo(rect.x+rect.width+20,rect.y-20).endStroke()
		let leftbottom = new createjs.Shape()
		leftbottom.graphics.beginStroke("#888").setStrokeStyle(1).moveTo(rect.x,rect.y+rect.height).lineTo(rect.x+20,rect.y+rect.height-20).endStroke()
		let rightbottom = new createjs.Shape()
		rightbottom.graphics.beginStroke("#888").setStrokeStyle(1).moveTo(rect.x+rect.width,rect.y+rect.height).lineTo(rect.x+rect.width+20,rect.y+rect.height-20).endStroke()
		let midpoint = new createjs.Shape()
		midpoint.graphics.beginStroke("#888").setStrokeStyle(1).setStrokeDash([2,2]).moveTo(rect.x,rect.y+rect.height/2).lineTo(rect.x+20,rect.y+rect.height/2-20).lineTo(rect.x+rect.width+20,rect.y+rect.height/2-20).lineTo(rect.x+rect.width,rect.y+rect.height/2).lineTo(rect.x,rect.y+rect.height/2).endStroke()
		stage.addChild(front)
		stage.addChild(back)
		stage.addChild(lefttop)
		stage.addChild(righttop)
		stage.addChild(leftbottom)
		stage.addChild(rightbottom)
		stage.addChild(midpoint)
		this.molecules = []
	}
	
	populate(stage) {
		for (let i = 0; i < maxMolecules; i++) {
			let molecule = new Molecule(this.rect)
			this.molecules.push(molecule)
			molecule.move()
			stage.addChild(molecule.dot)
		}
	}
	
	update() {
		this.molecules.forEach(m => m.move())
	}	
}

class AirSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		let rect = new createjs.Rectangle(300,50,100,300)
		this.leftcol = new AirColumn(this.mainstage,rect)
	}	
	render() {
		this.leftcol.populate(this.mainstage)
		createjs.Ticker.addEventListener("tick", e => {
			this.leftcol.update()
			this.mainstage.update()
		})
	}
}

(new AirSim()).render()
