$(document).ready(function(){
  var w = 5000,
    h = 5000,
    rx = w / 2,
    ry = h / 2,
    rotate = 0;
  
  var cluster = d3.layout.cluster()
      .nodeSize([2, 2])
//      .size([w - 100, h - 100])
      .sort(null);
  
  var diagonal = d3.svg.diagonal.radial()
      .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
  
  var svg = d3.select("#canvas").append("div")
      .style("width", w + "px")
      .style("height", w + "px");
  
  var vis = svg.append("svg:svg")
      .attr("width", w)
      .attr("height", w)
    .append("svg:g")
      .attr("transform", "translate(" + rx + "," + ry + ")");
  
  vis.append("svg:path")
      .attr("class", "arc")
      .attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI))
//      .on("mousedown", mousedown);
  
    $.get("TestDB_4.txt", function(text){
    var db = DBParser(text);
    var nodes = cluster.nodes(db);
 
/*
  d3.json("https://mbostock.github.io/d3/talk/20111018/flare.json", function(json) {
    var nodes = cluster.nodes(json);
*/
  
    var link = vis.selectAll("path.link")
        .data(cluster.links(nodes))
      .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal);
  
    var node = vis.selectAll("g.node")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
  
    node.append("svg:circle")
        .attr("r", 3);
  
    node.append("svg:text")
        .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
        .text(function(d) { return d.name; });
  });
  
/*
  d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);
*/
});
/*
function mouse(e) {
  return [e.pageX - rx, e.pageY - ry];
}

function mousedown() {
  m0 = mouse(d3.event);
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
        tx = "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)";
    svg
        .style("-moz-transform", tx)
        .style("-ms-transform", tx)
        .style("-webkit-transform", tx);
  }
}

function mouseup() {
  if (m0) {
    var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
        tx = "rotate3d(0,0,0,0deg)";

    rotate += dm;
    if (rotate > 360) rotate -= 360;
    else if (rotate < 0) rotate += 360;
    m0 = null;

    svg
        .style("-moz-transform", tx)
        .style("-ms-transform", tx)
        .style("-webkit-transform", tx);

    vis
        .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
      .selectAll("g.node text")
        .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
        .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
  }
}
*/

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}


function DBParser(text){
  var linesArray = text.split("&&");
  var db = linesArray.map(function(line){
    lineary = line.split("||");
    var obj = {
      depth: parseInt(lineary[0]),
      name: lineary[1]
      };
    if(lineary[2]){
      obj.weight = parseInt(lineary[2]);
    }
    return obj;
  });
  var i = 0; // so db acts as a stream
  function parseTree(db, n, parent, hasParent){
    var node = db[i];
    var obj = node;
    obj.parent = parent;
    obj.depth = n;
    if(parent == null){
      var prop = [];
    } else{
      var prop = parent.properties.slice();
      obj.hasParent = hasParent;
      if(hasParent){
        prop.push(parent.name);
      }
    }
    obj.properties = prop;
    i++;
    if(node.weight){ // neither leaf node nor undefined
      if(node.weight == 1){
      //Trim tree to leaf
        var right = parseTree(db, n, parent, true);
        var left = parseTree(db, n, parent, false);
        if(right.name == null){
          left.hasParent = hasParent;
          return left;
        } else{
          right.hasParent = hasParent;
          return right;
        }
      } else{
        obj.children = []
        obj.children[0] = parseTree(db, n + 1, obj, true);
        obj.children[1] = parseTree(db, n + 1, obj, false);
      }
    } else if(node.weight == undefined){ // null node
      obj.name = null; 
    }
    return obj;
  }
  var tree = parseTree(db, 0, null);
  return tree;
}
