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

var matrix = new AdjacencyMatrix(10);

//-- RENDER LOOP ----------------------------------------------
function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    if (myAudio.paused) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    
    freqVisualiser.clear();
    freqVisualiser.draw();
    waveVisualiser.draw();
    
    matrix.add(frequencyData);
    

    d.innerHTML = monitor.getFPS();
}


//------------------------------------------------------------

renderFrame();