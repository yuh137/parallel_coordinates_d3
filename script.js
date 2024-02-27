// document.getElementById('dropdown-btn').addEventListener('hover', function() {
//   var dropdownContent = document.getElementById('dropdown-content');
//   dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
// });

let classification = "Domain Region";
// const options = document.querySelectorAll('.dropdown-content a');

// set the dimensions and margins of the graph
const margin = {top: 30, right: 10, bottom: 10, left: 120}
width = 1200 - margin.left - margin.right
height = 900 - margin.top - margin.bottom

// append the svg object to the body of the page
const svg = d3.select("#parcoor")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
        `translate(${margin.left},${margin.top})`);
d3.csv("data_org.csv").then(data => {
    let dimensions = Object.keys(data[0]).filter(key => key === "Reputation" || key === "Ranking" || key === "Domain Age" || key === "Category")

    let categories = data.map(obj => obj["Category"])
    categories = [...new Set(categories)]
    let regions = data.map(obj => obj["Domain Region"])
    regions = [...new Set(regions)]
    console.log(regions)

    let urls = {}
    data.forEach((value, index) => {
      urls[index + 1] = value["URL"]
    })

    // console.log(Object.keys(urls))

    const Yscales = {}
    for (i in dimensions) {
        name = dimensions[i]
        Yscales[name] = d3.scaleLinear()
        // Yscales[name] = d3.scalePoint()
        // .domain( data.map(d => d[name]) )
        .domain( d3.extent(data, function(d) { return +d[name]; }) )
        .range([height, 0])
    }

    Yscales["URL"] = d3.scalePoint()
        .domain( data.map(d => d["URL"]) )
        .range([height, 0])
    Yscales["Category"] = d3.scalePoint()
        .domain( data.map(d => d["Category"]) )
        .range([height, 0])

    dimensions.unshift("Category")
    dimensions.unshift("URL")

    let color = d3.scaleOrdinal()
        .domain(categories)
        .range(["#1E92D7", "#F9A12A", "#5983C3", "#FFC15C", "#3EB489", "#E65100", "#83BFCB", "#D07400", "#24A8D9", "#FFEA8C", "#00D27F", "#EC407A", "#6DC7B3", "#FF8A65", "#00B894", "#F5B651", "#3399CC", "#FC6E51", "#00E0C3", "#FBAF4A", "#65C5DB", "#FF5993", "#1E84B8", "#E9425C", "#42C0FB"])
    // console.log(Yscales)

    // Build the X scale -> it find the best position for each Y axis
    let x = d3.scalePoint()
        .range([0, width])
        .padding(0.2)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    let it = 1;
    function path(d) {
        return d3.line()(dimensions.map(function(p) { 
          console.log(d[p] === urls[it++])
          if (p != "URL" ) return [x(p), Yscales[p](d[p])]; 
          // return [x(p), Yscales[p](d[p] === urls[it] ? it++ : it)]
        }));
    }
    
    // Highlight the region that is hovered
    let highlight = function(d){

        let selected_category = d.target.classList
        console.log(d)         

        // first every group turns grey
        d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
        // d3.selectAll("g + .tick")
        // .transition().duration(200)
        // .style("stroke", "lightgrey")
        // .style("opacity", "0.2")
        // Second the hovered specie takes its color
        d3.selectAll("." + selected_category[1])
        .transition().duration(200)
        .style("stroke", color(selected_category[1]))
        .style("opacity", "1")  
        // d3.selectAll("g + .tick")
        // .transition().duration(200)
        // .style("stroke", "lightgrey")
        // .style("opacity", "0.2")

        // const text_note = d.target.__data__['Category'] + '\n' + d.target.__data__['URL'] + '\n' + d.target.__data__['Domain Region']
        const text_note = d.target.__data__['Domain Region']

        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .text(text_note)
        
        // Position tooltip relative to mouse pointer
        // tooltip
        tooltip.style('left', event.pageX + 'px')
            .style('top', event.pageY + 'px')
            .style('visibility', 'visible');
    }

    // Unhighlight
    let doNotHighlight = function(d){
        d3.selectAll(".line")
        .transition().duration(200).delay(1000)
        .style("stroke", function(d){ return( color(d["Domain Region"]))} )
        // .style("stroke", function(d){ return( color(d["Category"]))} )
        .style("opacity", "1")

        d3.select('.tooltip').remove();
    }

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), Yscales[p](d[p])]; }));
    }

    function sketch(option) {
      // Draw the lines
      svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("class", function (d) { return "line " + d[option].replace(/\s/g, "") } ) // 2 class for each line: 'line' and the group name
      // .attr("class", function (d) { return "line " + d["Category"].replace(/\s/g, "") } ) // 2 class for each line: 'line' and the group name
      .attr("d",  path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color(d[option]))} )
      // .style("stroke", function(d){ return( color(d["Category"]))} )
      .style("opacity", 0.5)
      .style("stroke-width", 3)
      .on("mouseover", highlight )
      .on("mouseleave", doNotHighlight )

      // Draw the axis:
      svg.selectAll("axis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter()
      .append("g")
      .attr("class", "axis")
      // Translate this element to its right position on the x axis
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      // Build the axis with the call function
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(Yscales[d])); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
    }

    // d3.select(".axis")
    //   .selectAll(".tick")
    //   .attr('data-class', function(d) { return "tick " + d[option].replace(/\s/g, "") })
    
    sketch("Domain Region");

    // options.forEach(option => {
    //   option.addEventListener('click', function (e) {
    //     e.preventDefault();
    
    //     classification = option.getAttribute('value');
    //     // console.log(optionValue)
    //     sketch(classification);
    //   })
    // })
})