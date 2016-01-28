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

//-- SPRING GRAPH SETUP --------------------------------------
var graph = new Springy.Graph();

jQuery(function(){
    var springy = window.springy = jQuery('#springydemo').springy({
        graph: graph,
        stiffness: 10.0,
        repulsion: 100.0,
        damping: 0.5,
        nodeSelected: function(node){
            console.log('Node selected: ' + JSON.stringify(node.data));
        }
    });
});
var n = 8;

for (var i = 0; i < n; i++) graph.newNode({label: i, size: 10, color: "white"});
var ns = graph.nodes;
for (var i = 1; i < n; i++) {
    for (var j = 0; j < i; j++) {
        graph.newEdge(ns[i], ns[j], {label: 0, length: 0, directional:false, color: "#aaa"});
    }
}

function graphStuff(matrix, graph) {
    var changes = matrix.add(frequencyData);
    var mergedIndex = (changes.merged) ? changes.merged.to : changes.new;
    var ps = matrix.points;
    for (var i = 0; i < ps.length; i++) {
        var node = graph.nodes[i];
        var point = ps[i];
        node.data.label = i + "(" + point.n + ")";
        node.data.size = Math.log(point.n) * 10;
        if (i == mergedIndex) node.data.color = "red";
        else node.data.color = "white";
    }
    var ds = matrix.distances;
    for (var i = 0; i < ds.length; i++) {
        var d = ds[i];
        
        if (d !== "undefined") {
            var edge = graph.edges[i];
            edge.data.label = Math.round(d) + 1;
            edge.data.length = d
        }
        
    }
    
    graph.notify();
}

//------------------------------------------------------------

// Initialising frequency / time domain buffers
var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array( bufferLength );
var timeData = new Uint8Array( bufferLength );

var can = makeCanvas(window.innerWidth, 200);
document.querySelector("#vHolder").appendChild(can);
var info = document.querySelector("#data");

var freqVisualiser = new BarGraph("f", can, frequencyData);
var waveVisualiser = new LineGraph("t", can, timeData);
var dynamicLine = new DynamicLine("dl", can, 1, 0);
    
var monitor = new FpsMonitor(50);

var matrix = new AdjacencyMatrix(n);

//-- RENDER LOOP ----------------------------------------------
function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    if (myAudio.paused) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    
    freqVisualiser.clear();
    freqVisualiser.draw();
    waveVisualiser.draw();
    
    graphStuff(matrix, graph);

    info.innerHTML = monitor.getFPS();
}


//------------------------------------------------------------

renderFrame();