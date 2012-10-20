NJV = { };
NJV.main = {
	cellSize : 30,
	viewPort : { height: 0, width: 0},
	viewPortCenter : {x : 0, y: 0},
	mapSize: {width: 300, height: 300},
	centerCell: {x: 0, y: 0},
	cos30 : 0,
	sin30 : 0,
	tan30 : 0,
	cos60 : 0,
	sin60 : 0,
	init : function() {
		var c = document.getElementById("main");
		c.width = $("#main").width();
		c.height = $("#main").height();
		var ctx = c.getContext("2d");
		ctx.lineWidth = 1;
		
		this.viewPort.width = c.width;
		this.viewPort.height = c.height;
		
		this.cos30 = Math.cos( (30/360) * 2 * Math.PI);
		this.sin30 = Math.sin( (30/360) * 2 * Math.PI);
		this.cos60 = Math.cos( (60/360) * 2 * Math.PI);
		this.sin60 = Math.sin( (60/360) * 2 * Math.PI);
		this.tan30 = Math.tan( (30/360) * 2 * Math.PI);
		
		this.viewPortCenter.x = this.viewPort.width / 2;
		this.viewPortCenter.y = this.viewPort.height;
		
		ctx.fillStyle = "rgba(0,0,255,0.2)";
		
		for(var x=0; x < 10; x++) {
			for (var y=0; y < 10; y++) {
				this.renderGrid(ctx, x, y, true);
			}
		}
				
	},
	
	renderGrid: function(ctx, cellX, cellY, fill) {
		p0 = this.convertLoc(cellX, cellY);
		p1 = this.convertLoc(cellX, cellY+1);
		p2 = this.convertLoc(cellX+1, cellY+1);
		p3 = this.convertLoc(cellX+1, cellY);
		
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.lineTo(p3.x, p3.y);
		ctx.closePath();
		if (fill) {
			ctx.fill();
		}
		ctx.stroke();		
	},
	convertLoc : function(cellX, cellY) {
		var vx = cellX - this.centerCell.x;
		var vy = cellY - this.centerCell.y;
		
		var y = (this.cellSize * vy) * this.sin30;
		var x = (this.cellSize * vy) * this.cos30;
		
		y = y + (this.cellSize * vx) * this.sin30;
		x = x - (this.cellSize * vx) * this.cos30;
		
		//transalate to viewport
		y = this.viewPortCenter.y - y;
		x = this.viewPortCenter.x - x;
		
		var ret = {x: x, y: y};
		
		return ret;
	},
	convertCoord : function(x,y) {
		var vy = this.viewPortCenter.y - y;
		var vx = this.viewPortCenter.x - x;
		
		var dy = vx * this.tan30;
		
		var cellX = (vy-dy) * this.sin60 / this.cellSize;
		
		
	},
	drawLine : function (ctx, x,y,xx,yy) {
		ctx.moveTo(x,y);
		ctx.lineTo(xx,yy);
		ctx.stroke();
	}
};

$(document).ready( function() { NJV.main.init(); });	