function getDistance( v1, v2 ) {
    var sum = 0;
    for ( var i = 0; i < v1.length; i++ ) {
        sum += Math.pow( v1[ i ] - v2[ i ], 2 );
    }
    return Math.sqrt( sum );
}

function AdjacencyMatrix(n) {
    this.n = n;
    this.points = [];
    this.distances = new Array(0.5 * n * (n-1));
    console.log(this.points);
    console.log(this.distances);
    
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
    
    this.add = function(newPoint) {
        var ps = this.points;
        var ds = this.distances;
        var len = ps.length;
        var n = this.n;
        
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
            var closest = this.getCorrespondingPoints(this.minDistanceIndex());
            var p1Index = closest.p1;
            var p2Index = closest.p2;
            var mergedPoint = this.merge(ps[p1Index], ps[p2Index]);
            
            // swap (p1 and p2) for (merged and new point)
            ps[p1Index] = mergedPoint;
            ps[p2Index] = {p: newPoint, n: 1};
            
            // replace primary d(p1,_) dependent distances
            var dIndex = this.getDIndex(p1Index);
            for (var i = 0; i < p1Index; i++) {
                ds[dIndex + i] = getDistance(mergedPoint.p, ps[i].p);
            }
            
            // replace secondary d(_,p1) dependent distances
            for (var i = p1Index+1; i < len; i++) {
                var dIndex = this.getDIndex(i);
                ds[dIndex + p1Index] = getDistance(ps[i].p, mergedPoint.p);
            }
            
            // replace primary d(p2,_) dependent distances
            var dIndex = this.getDIndex(p2Index);
            for (var i = 0; i < p2Index; i++) {
                ds[dIndex + i] = getDistance(newPoint, ps[i].p);
            }
            
            // replace secondary d(_,p2) dependent distances
            for (var i = p2Index+1; i < len; i++) {
                var dIndex = this.getDIndex(i);
                ds[dIndex + p2Index] = getDistance(ps[i].p, newPoint);
            }
            
        }
    }
    
    this.getDIndex = function(x) {
        return 0.5 * x * (x-1);
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