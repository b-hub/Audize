function getDistance( v1, v2 ) {
    var sum = 0;
    for ( var i = 0; i < v1.length; i++ ) {
        sum += Math.pow( v1[ i ] - v2[ i ], 2 );
    }
    return Math.sqrt( sum );
}

function AdjacencyMatrix(n) {
    // returns the length of an array to store non-redundent adjacency matrix
    // with x nodes. Equivilent to xChoose2.
    this.getDIndex = function(x) {return 0.5 * x * (x-1);}
    
    this.n = n;
    this.points = [];
    this.distances = new Array(this.getDIndex(n));
    
    this.merge = function(p1, p2) {
        var n1 = p1.n;
        var n2 = p2.n;
        var n = n1 + n2;
        var avg = new Array(p1.p.length);
        
        for (var i = 0; i < avg.length; i++) {
            avg[i] = Math.round((n1*p1.p[i] + n2*p2.p[i]) / n);
        }
        
        return {p: avg, n: n};
    }
    
    this.recalculateDistances = function(newPoint, index) {
        var ps = this.points;
        var ds = this.distances;
        
        // replace primary d(p1,_) dependent distances
        var dIndex = this.getDIndex(index);
        for (var i = 0; i < index; i++) {
            ds[dIndex + i] = getDistance(newPoint, ps[i].p);
        }

        // replace secondary d(_,p1) dependent distances
        for (var i = index+1; i < ps.length; i++) {
            var dIndex = this.getDIndex(i);
            ds[dIndex + index] = getDistance(ps[i].p, newPoint);
        }
    }
    
    this.add = function(newPoint) {
        var ps = this.points;
        var ds = this.distances;
        var len = ps.length;
        var n = this.n;
        
        var changes = {merged: null, new: len};
        
        if (len == 0) {
            ps.push({p: newPoint, n: 1});
            
        } else if (len < n) {
            var dIndex = this.getDIndex(len);
            
            for (var i = 0; i < len; i++) {
                var d = getDistance(ps[i].p, newPoint);
                ds[dIndex + i] = d;
            }
            
            ps.push({p: newPoint, n: 1});
        
        // if matrix has reached it's limited size n
        // merge closest 2 points and do some really fancy replacing
        // 2n - 3 distance elements will need recalculating / replacing
        } else {
            var minIndex = this.minDistanceIndex();
            
            // if the new point in closest to an existing point - just merged it.
            var minDist = ds[minIndex];
            var smallerDistWith = undefined;
            for (var i = 0; i < ps.length; i++) {
                var d = getDistance(newPoint, ps[i].p);
                if (d <= minDist) {
                    minDist = d;
                    smallerDistWith = i;
                }
            }
            
            if (smallerDistWith !== undefined) {
                var mergedPoint = this.merge({p:newPoint, n:1}, ps[smallerDistWith]);
                ps[smallerDistWith] = mergedPoint;
                this.recalculateDistances(mergedPoint.p, smallerDistWith);
                
                changes.new = smallerDistWith;
            
            // otherwise fancy stuff
            } else {
                var closest = this.getCorrespondingPoints(minIndex);
                var p1Index = closest.p1;
                var p2Index = closest.p2;
                var mergedPoint = this.merge(ps[p1Index], ps[p2Index]);

                // swap (p1 and p2) for (merged and new point)
                ps[p1Index] = {p: newPoint, n: 1};
                ps[p2Index] = mergedPoint;

                this.recalculateDistances(newPoint, p1Index);
                this.recalculateDistances(mergedPoint.p, p2Index);

                changes.merged = {from: p1Index, to: p2Index};
                changes.new = p1Index;
            }
            
        }
        
        return changes;
    }
    
    // given an index in the distances array
    // returns the 2 points array indexes the distance was calculated from.
    this.getCorrespondingPoints = function(dIndex) {
        var n = Math.floor(0.5 * (1 + Math.sqrt(8 * dIndex + 1)));
        var p1 = n;
        var p2 = dIndex - (0.5 * n * (n-1));
        
        return {p1: p1, p2: p2};    
    }
    
    this.minDistanceIndex = function() {
        var ds = this.distances;
        var min = ds[0];
        var minIndex = 0;
        
        for (var i = 0; i < ds.length; i++) {
            var d = ds[i];
            if (d < min) {
                min = d;
                minIndex = i;
            }
        }
        
        return minIndex;
    }
}

function hilbert_mapping_helper(curPos, curDir, instructions, order) {
    var rules = {'A': "-BF+AFA+FB-", 'B': "+AF-BFB-FA+"}
    var map = [];

    for (var i = 0; i < instructions.length; i++) {
        var move = instructions[i];
        if (rules[move] !== undefined && order > 0) {
            map = map.concat(hilbert_mapping_helper(curPos, curDir, rules[move], order - 1));
        } else if (move == '-') {
            curDir = (curDir.x == 0) ? {x: curDir.y, y: curDir.x} : {x: 0, y: -curDir.x};
        } else if (move == '+') {
            curDir = (curDir.y == 0) ? {x: curDir.y, y: curDir.x} : {x: -curDir.y, y: 0};
        } else if (move == 'F') {
            curPos.x += curDir.x;
            curPos.y += curDir.y;
            map.push({x: curPos.x, y: curPos.y});
        }
    }
    return map
}

function hilbert_mapping(order) {
    return [{x:0,y:0}].concat(hilbert_mapping_helper({x:0,y:0}, {x:1,y:0}, 'B', order));
}

console.log(hilbert_mapping(1));