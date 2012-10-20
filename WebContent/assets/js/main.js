NV = (typeof NV == 'undefined')?{}:NV;
NV.game = (typeof NV.game == 'undefined')?{}:NV.game;

var globalWorld = null;

function globalRenderFrame() {
	globalWorld.renderFrame();
}
function globalWorldToggle() {
	globalWorld.toggle();
}

NV.game.Map = Class.extend({
	width: 0,
	height: 0,
	init: function(initParam) {
		this.width = initParam.width;
		this.height = initParam.height;		
	}	
});



NV.game.Util ={
	distance: function(loc1, loc2) {
		var x2 = Math.pow(loc1.x - loc2.x, 2);
		var y2 = Math.pow(loc1.y - loc2.y, 2);
		return Math.sqrt(x2+y2);	
	}	
};

NV.game.BaseObject = Class.extend({
	state: 0,
	init: function(initParam) {
		this._x = initParam.loc.x;
		this._y = initParam.loc.y;
		this._size = initParam.size;
		this._direction = initParam.direction; //Radian
		this._velocity = initParam.velocity; //Pixels per second
		//this._world = initParam.map; //map object
	}, 
	setWorld: function(world) {
				this._world = world;		
				this._map = world.map;
			},
	getLocation: function() {
		return {x: this._x, y: this._y};
	},
	
	move: function(sec) {
		
		if (this.state == 1) {
			return; // no move
		}
		
		var dx = Math.cos(this._direction) * this._velocity * sec;
		var dy = Math.sin(this._direction) * this._velocity * sec;
		
		var x2 = this._x + dx;
		var y2 = this._y + dy;
		
		var oobX = x2 < 0 || x2 > this._map.width;
		var oobY = y2 < 0 || y2 > this._map.height;
		if (oobX || oobY) {
			//outside of the map, change direction
			this.bounce(oobX, oobY);
			dx = Math.cos(this._direction) * this._velocity * sec;
			dy = Math.sin(this._direction) * this._velocity * sec;
		}
		this._x = this._x + dx;
		this._y = this._y + dy;
	},
	
	animate: function(sec) {
		this.move(sec);
	},
	
	bounce: function(oobX, oobY) {
		//turn around for now
		//this._direction = this._direction + Math.PI;
		this._direction *= -1;
		if (this._direction > (Math.PI * 2)) {
			this._direction -= (Math.PI * 2);
		} else if (this._direction < (Math.PI *2)) {
			this._direction += (Math.PI *2);
		}
		if (oobX) {
			this._direction = this._direction + Math.PI;
		}
	},
	render: function(ctx) {
		var x = this._x;
		var y = this._y;
		var size = this._size;
		
		if (this.state == 0) {
			ctx.fillStyle = "#000000";
		} else {
			ctx.fillStyle = "#ff0000";
		}
		
		ctx.fillRect(x-size, y-size, size*2, size*2);
	},
	isInside: function(loc) {
		var dist = NV.game.Util.distance(loc, {x: this._x, y: this. _y});
		return dist <= this._size;
	},
	
	select: function() {
		this.state = 1;
	}
});

NV.game.BigObject = NV.game.BaseObject.extend({
	
	state: 0,
	
	animate: function(sec) {
		this.move(sec);
	}
	
});

NV.game.World = Class.extend({	
	init: function(initParam) {
		this._canvas = initParam.canvas;
		this._ctx = this._canvas.getContext("2d");
		this._objects = [];
		this.continueAnimate = false;
		this.selectedObject = false;
		
		this._canvas.addEventListener('mousedown', function(e) { globalWorld.mouseDown(e); });
		this._canvas.addEventListener('touchstart', function(e) { globalWorld.touchStart(e); });
		this._canvas.addEventListener('mouseup', function(e) { globalWorld.mouseUp(e); });
		/*this._canvas.addEventListener('mousemove', function(e) { var s = e.offsetX+","+e.offsetY;
		document.getElementById("mouseloc").innerHTML = s;});*/
	},
	
	addObject: function(obj) {
		this._objects.push(obj);		
		obj.setWorld(this);
	},
	
	initObjects:  function() {		
		var map = new NV.game.Map({width: this._canvas.width, height: this._canvas.height});
		this.map = map;		
		
		var o1 = new NV.game.BaseObject({
			loc: {x: 300, y: 300},
			size: 10,
			direction: Math.PI/6,
			velocity: 60		
		});
		var o2 = new NV.game.BigObject({
			loc: {x: 400, y: 400},
			size: 60,
			direction: Math.PI/3,
			velocity: 50		
		});		
		//this.addObject(o1);
		this.addObject(o2);		
	},	
	renderFrame: function() {
		var timeElapsed = ((new Date().getTime()) - this._timestamp)/1000;
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		for(var i=0; i < this._objects.length; i++) {
			var obj = this._objects[i];
			obj.animate(timeElapsed);
			obj.render(this._ctx);
		}
		this._timestamp = new Date().getTime();
		if (this.continueAnimate) {
			this.requestAnimateFrame.call(window, globalRenderFrame);
		}
	},
	
	animate: function() {
		this._timestamp = new Date().getTime();
		this.requestAnimateFrame.call(window, globalRenderFrame);
		this.continueAnimate = true;
	},
	
	toggle: function() {
		this.continueAnimate = !(this.continueAnimate);
		if (this.continueAnimate) {
			this.animate();
		}
	},
	
	mouseDown: function(e) {
		
		var s = e.offsetX+","+e.offsetY;
		document.getElementById("mouseloc").innerHTML = s;
		
		var x = e.offsetX;
		var y = e.offsetY;
		
		//select object?
		for(var i=0; i < this._objects.length; i++) {
			var obj = this._objects[i];
			if (obj.isInside({x: x*2, y: y*2})) {
				obj.select();
				this.selectedObject = obj;
				break;
			}
		}
	},
	
	touchStart: function(e) {
		//simulate mouseDown
		if (e.touches.length == 1) {
			this.mouseDown(e,touches[0]);
		}
	},
	
	mouseUp: function(e) {
		if (this.selectedObject == null) return;
		this.selectedObject.state = 0;
		var x = e.offsetX * 2;
		var y = e.offsetY * 2;
		var loc = this.selectedObject.getLocation();
		var dx = x - loc.x;
		var dy = y - loc.y;
		var direction = Math.atan(dy/dx);
		if (x < loc.x) {
			direction += Math.PI;
		}
		this.selectedObject._direction = direction;
		this.selectedObject = null;
	},
	
	requestAnimateFrame: (function(callback) {
        return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })()
});

/*
var a = new NV.game.BaseObject({ loc: {x: 5, y: 5} });
var b = new NV.game.BaseObject({ loc: {x: 10, y: 10} });

console.log(a.getLocation());
console.log(b.getLocation());
*/

$(document).ready( function() {
	var canvas = document.getElementById("main");
	canvas.style.width = "800px";
	canvas.style.height = "600px";
	
	var initParam = { 
		canvas:	document.getElementById("main")
	};
	var world = new NV.game.World(initParam);	
	globalWorld = world;
	world.initObjects();
	world.animate();
	
	var toggleBtn = document.getElementById("toggleBtn");
	toggleBtn.addEventListener('click', globalWorldToggle);
	
});