//-- AUDIO API SETUP ------------------------------------------
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var myAudio = document.querySelector('audio');
var source = audioCtx.createMediaElementSource(myAudio);
var analyser = audioCtx.createAnalyser();

// analyser settings
analyser.smoothingTimeConstant = 0; // default = 0.8

// connect everything up
source.connect(analyser);
analyser.connect(audioCtx.destination);

//------------------------------------------------------------

// Initialising frequency / time domain buffers
var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array( bufferLength );
var timeData = new Uint8Array( bufferLength );

var can = makeCanvas(window.innerWidth, 200);
document.querySelector("#vHolder").appendChild(can);
var d = document.querySelector("#data");

var freqVisualiser = new BarGraph("f", can, frequencyData);
var waveVisualiser = new LineGraph("t", can, timeData);
var dynamicLine = new DynamicLine("dl", can, 1, 0);
    
var monitor = new FpsMonitor(50);

var matrix = new AdjacencyMatrix(4);

//-- RENDER LOOP ----------------------------------------------
function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    //if (myAudio.paused) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    
    freqVisualiser.clear();
    freqVisualiser.draw();
    waveVisualiser.draw();
    
    var ctx = test.getContext('2d');
    ctx.clearRect(0, 0, window.innerWidth, 500);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < matrix.points.length; i++){
        var x = matrix.points[i].p[0];
        var y = matrix.points[i].p[1]
        ctx.fillText(i + "(" + matrix.points[i].n + ")", x, y);
    }
    

    d.innerHTML = monitor.getFPS();
}


//------------------------------------------------------------

var test = makeCanvas(window.innerWidth, 500);
document.querySelector("#vHolder").appendChild(test);

test.onclick = function(e) {
    var rect = this.getBoundingClientRect();
    var xPos = e.clientX - rect.left;
    var yPos = e.clientY - rect.top;
    
    matrix.add([xPos, yPos]);
}

renderFrame();