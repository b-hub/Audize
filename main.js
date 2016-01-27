//-- AUDIO API SETUP ------------------------------------------
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var myAudio = document.querySelector('audio');
var source = audioCtx.createMediaElementSource(myAudio);

// analyser settings
var analyser = audioCtx.createAnalyser();
analyser.smoothingTimeConstant = 0; // default = 0.8

// connect everything up
source.connect(analyser);
analyser.connect(audioCtx.destination);

//------------------------------------------------------------

var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array( bufferLength );
var timeData = new Uint8Array( bufferLength );

var can = makeCanvas();
document.querySelector("#vHolder").appendChild(can);
var d = document.querySelector("#data");

var freqVisualiser = new BarGraph("f", can, frequencyData);
var waveVisualiser = new LineGraph("t", can, timeData);
    
var monitor = new FpsMonitor(50);

var matrix = new AdjacencyMatrix(5);
console.log("start");

//-- RENDER LOOP ----------------------------------------------
function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    if (myAudio.paused) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    
    freqVisualiser.clear();
    freqVisualiser.draw();
    waveVisualiser.draw();
    
    matrix.add(frequencyData.slice(0));

    d.innerHTML = monitor.getFPS();
}
//------------------------------------------------------------
renderFrame();