function makeCanvas(width, height) {
    var c = document.createElement('CANVAS');
    c.width = width || window.innerWidth;
    c.height = height || 200;
    return c;
}

function Visualiser(name, canvas) {
    this.name = name || "";
    if (canvas) {
        this.width = canvas.width || 0;
        this.height = canvas.height || 0;
        this.ctx = canvas.getContext('2d') || null;
        var grd = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "blue");
        this.ctx.fillStyle = grd;
        this.ctx.strokeStyle = "#ffffff";
        this.clear = function() {this.ctx.clearRect(0, 0, this.width, this.height);}
    }      
}

// data :: Uint8Array. Plots as bar graph
function BarGraph(name, canvas, data) {
    Visualiser.call(this, name, canvas);
    this.data = data;
    this.bins = data.length;
    this.binWidth = this.width / this.bins;
    
    this.draw = function() {
        var bins = this.bins;
        var height = this.height;
        var ctx = this.ctx;
        for (var i = 0; i < bins; i++) {
            var amp = this.data[i] / 255;
            ctx.fillRect( this.binWidth * i, height * (1 - amp), this.binWidth, height );
        }
    }
    
}
BarGraph.prototype = new Visualiser;

// data :: Uint8Array. Plots as Line graph
function LineGraph(name, canvas, data) {
    Visualiser.call(this, name, canvas);
    this.data = data;
    this.bins = data.length;
    this.binWidth = this.width / this.bins;
    
    this.draw = function() {
        var bins = this.bins;
        var height = this.height;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (var i = 0; i < bins; i++) {
            var amp = this.data[i] / 255;
            ctx.lineTo( this.binWidth * (i+0.5), height * (1 - amp));
        }
        ctx.stroke();
    }
}
LineGraph.prototype = new Visualiser;


// used in render loop
// higher the n, the smoother the FPS reading.
function FpsMonitor(n) {
    this.n = n;
    this.meanFPS = 0;
    var date = new Date();
    this.prevTime = date.getTime();
    this.getFPS = function() {
        var date = new Date();
        var t = date.getTime();
        var n = this.n;
        this.meanFPS = (this.meanFPS*(n-1) + 1000/(t - this.prevTime))/n;
        this.prevTime = t;
        return Math.round(this.meanFPS);
    }
    
}

