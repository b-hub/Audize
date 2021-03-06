//-- AUDIO API SETUP ------------------------------------------
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var myAudio = document.querySelector('audio');
var source = audioCtx.createMediaElementSource(myAudio);
var analyser = audioCtx.createAnalyser();

// analyser settings
analyser.fftSize = 2048; // default = 2048
analyser.smoothingTimeConstant = 0; // default = 0.8
//analyser.minDecibels = -75;  //default -100
//analyser.maxDecibels = -30; // default -30

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
var n = 16;

for (var i = 0; i < n; i++) graph.newNode({label: i, size: 10, color: "white"});

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

var lastNode = graph.nodes[0];
var N = 1;
function merge(graph, changes) {
    if (changes.merged) {
        graph.mergeInto(graph.nodes[changes.merged.from], 
                        graph.nodes[changes.merged.to]);
        
    }
    
    var mergedIndex = (changes.merged) ? changes.merged.to : changes.new;
    
    var ps = matrix.points;
    var newN = 0;
    for (var i = 0; i < ps.length; i++) {
        var node = graph.nodes[i];
        var point = ps[i];
        node.data.label = i + "(" + point.n + ")";
        node.data.size = 60 * point.n / N;
        newN += point.n;
        if (i == mergedIndex) node.data.color = "red";
        else node.data.color = "white";
    }
    N = newN;
    
    var newNode = graph.nodes[changes.new];
    var es = graph.getEdges(lastNode, newNode);
    if (es.length == 0) {
        graph.newEdge(lastNode, newNode, {label: 1, color: "white"});
    
    } else {
        graph.adjacency[lastNode.id][newNode.id][0].data.label++;
    }
    lastNode = newNode;
}

//------------------------------------------------------------

// Initialising frequency / time domain buffers
var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array( bufferLength );
var timeData = new Uint8Array( bufferLength );

var can = makeCanvas(window.innerWidth, 200);
document.querySelector("#vHolder").appendChild(can);
var hilbert = makeCanvas(window.innerWidth, window.innerWidth);
document.querySelector("#vHolder").appendChild(hilbert);

var info = document.querySelector("#data");

var freqVisualiser = new BarGraph("f", can, frequencyData);
var waveVisualiser = new LineGraph("t", can, timeData);
var dynamicLine = new DynamicLine("dl", can, 1, 0);
var hilbertImg = new HilbertImage("hilbert", hilbert, frequencyData, 5);
    
var monitor = new FpsMonitor(50);

var matrix = new AdjacencyMatrix(n);
var prevNode = 0;

//-- RENDER LOOP ----------------------------------------------
function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    if (myAudio.paused) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    
    freqVisualiser.clear();
    freqVisualiser.draw();
    waveVisualiser.draw();
    hilbertImg.draw();
    
    var changes = matrix.add(frequencyData);
    merge(graph, changes);
    

    info.innerHTML = monitor.getFPS();
}


//------------------------------------------------------------

renderFrame();