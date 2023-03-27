"use strict"

var margin = {top: 10, right: 30, bottom: 30, left: 40},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var nodesSelected = 0;
var isClicking = false;

let svg = d3.select("#graph_container")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");



d3.json("../data/data.json").then((data) => {

    let links = [];
    data.links.forEach(link => {
      let nLink = link;
      nLink["selected"] = 0;
      links.push(nLink);
    });
    const nodes = data.nodes;

    console.log(links);
    console.log(nodes);


    const simulation = d3.forceSimulation(nodes)                
    .force("link", d3.forceLink(links).id(d => d.name))                             
    .force("charge", d3.forceManyBody().strength(-400))        
    .force("center", d3.forceCenter(width / 2, height / 2))

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value))
      .style("stroke", (d) =>{return d.type;});

    const nodeContainer = svg.append("g")
    .selectAll(".node")
      .data(nodes, d => d.name)
      .attr('class', 'node')
    .join("g")
      .call(drag(simulation))
      .on("click", clicked)

    nodeContainer.append("title").text(d => d.name)

    const circle = nodeContainer.append("circle")
    .attr("r", 20)
    .attr("fill", d => d.house)
    .attr("stroke-width", 1.5)
    .attr("stroke",  d => d.house)

    const image = nodeContainer.append("svg:image")                          
    .attr('width', 20)
    .attr('height', 24)
    .attr("xlink:href", (d) => d.avatar)

    simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    image
      .attr("x", d => d.x -10 )
        .attr("y", d => d.y - 10 );
    
   
    circle
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })

    function clicked(event, d)
    {
      if (event.defaultPrevented || isClicking) return; // dragged
      isClicking = true;
      if(this.children[1].attributes["stroke"].value === "rgb(255, 255, 255)")//selected
      {
        //unselect

        d3.select(this.children[1])
        .transition()
          .attr("fill", "white")
        .transition()
          .attr("fill", d.house)
          .attr("stroke", d.house)

        if (nodesSelected == 1) //exit selection mode
        {
          d3.selectAll("line")
            .style("stroke", link => link.type)
            nodesSelected = 0;

          return;
        }

        nodesSelected -= 1;

          d3.selectAll("line").filter(link => 
        {
          link.selected -= ((link.source === d) || (link.target === d));
          return link.selected === 0;
        })
        .style("stroke", "grey")
      }
      else
      {
        //select

        d3.select(this.children[1])
        .transition()
          .attr("fill", "white")
          .attr("stroke", "#fff")
        .transition()
          .attr("fill", d.house)

        if (nodesSelected == 0)
        {
          d3.selectAll("line")
            .style("stroke", "grey")
        }
        nodesSelected += 1;

          d3.selectAll("line").filter(link => 
        {
          link.selected += ((link.source === d) || (link.target === d));
          return link.selected > 0;
        })
        .style("stroke", link => link.type)
      }
      
      console.log(links);
      isClicking = false;
    }

    function drag(simulation) {    
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

});



