//Fetching data
const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',true);
req.send();
req.onload = function(){
const json = JSON.parse(req.responseText);
baseTemperature = json.baseTemperature
dataset = json.monthlyVariance



// Define the dimensions
const w = window.innerWidth * 0.95;
const h = window.innerHeight * 0.77;
const padding = 90;
const yearRange = dataset[dataset.length - 1].year - dataset[0].year

// Create scales
const xScale = d3.scaleTime()
       .domain([d3.min(dataset, d => parseYear(d.year)), d3.max(dataset, d => parseYear(d.year))])
       .range([padding, w - padding]);

const yScale = d3.scaleTime()
       .domain([d3.timeDay.offset(d3.max(dataset, d => parseMonth(d.month)), 15), d3.timeDay.offset(d3.min(dataset, d => parseMonth(d.month)), -15)])
       .range([h - padding, padding/4])

// Create SVG container
const svg = d3.select(".container")
       .append("svg")
       .attr("width", w)
       .attr("height", h)

// Create and append x-axis
const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(10)).tickFormat(d3.timeFormat('%Y'));
const xAxisGroup  = svg.append("g")
                      .attr('id', 'x-axis')
                      .attr("transform", `translate(0,${h - padding})`)
                      .call(xAxis);

const xAxisWidth = xAxisGroup.node().getBBox().width;
const barW = xAxisWidth/yearRange

// Add x-axis label
svg.append("text")
   .attr("y", h - padding / 2)
   .attr("x", (w - padding)/2)
   .style("font-size", "1.2em")
   .style("font-family", "Arial")
   .style("font-weight", "bold")
   .style("text-anchor", "middle")
   .text("Years");


// Create and append y-axis
const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));
const yAxisGroup  = svg.append('g')
                     .attr('id', 'y-axis')
                     .attr('transform', `translate(${padding},0)`)
                     .call(yAxis);
const yAxisHeight = yAxisGroup.node().getBBox().height;
const barH = yAxisHeight/12 

// Add y-axis label
svg.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0)
   .attr("x", 0 - ((h - padding) / 2))
   .attr("dy", "1.5em")
   .style("font-family", "Arial")
   .style("font-size", "1.2em")
   .style("font-weight", "bold")
   .style("text-anchor", "middle")
   .text("Months");
 
// Define a color scale
const tempRange = [Math.floor(d3.min(dataset, d => baseTemperature + d.variance)), Math.ceil(d3.max(dataset, d => baseTemperature + d.variance))]
const colorScale = d3.scaleQuantize()
                     .domain(tempRange)
                     .range(d3.schemeRdYlBu[11].reverse())

// Create plots
svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
       .attr('x', d => xScale(parseYear(d.year)))
       .attr('y', d => yScale(parseMonth(d.month)))
       .attr('width', barW)
       .attr('height', barH)
       .attr('transform', `translate(0,${-barH/2})`)
       .attr("class", "cell")
       .attr('data-month',d => d.month)
       .attr('data-year',d => d.year)
       .attr('data-temp',d => d.variance + baseTemperature)
       .attr('fill', d => colorScale(d.variance + baseTemperature))
       .on("mouseover", function(event, d) {
              let dataYear = this.getAttribute('data-year')
              d3.select("#tooltip")
                  .style("opacity", 1)
                  .style("z-index", 0)
                  .attr('data-year', dataYear)
                  .html(`${d.year} - ${d3.timeFormat('%B')(parseMonth(d.month))}<br>${decimalFormat(d.variance + baseTemperature)}℃<br>${decimalFormat(d.variance)}℃`)
                  .style("left", `${event.pageX + 15}px`)
                  .style("top", `${event.pageY - 30}px`)
          })
       .on("mouseout", function() {
       d3.select("#tooltip")
              .style("opacity", 0)
              .style("z-index", -1)
       });


// Create legend scale
const legendScale = d3.scaleLinear()
                     .domain(tempRange)
                     .range([padding, (w - padding)/3]);

// Create legend-axis
const legendAxis = d3.axisBottom(legendScale);

// Add legend
const legend = svg.append("g")
              .attr('id', 'legend')
              .attr("transform", `translate(0,${h - padding/3})`)


legend.call(legendAxis);

const rectSize = ((w - padding)/3 - padding) / 13
legend.selectAll("rect")
       .data(d3.range(2, 15))
       .enter()
       .append('rect')
       .attr("class", "rect-legend")
       .attr("transform", `translate(0,${-rectSize})`)
       .attr('x', (d,i) => `${padding + i*rectSize}px`)
       .attr('width', rectSize)
       .attr('height', rectSize)
       .attr('fill', d => colorScale(d))

}


const parseYear= d3.timeParse("%Y");
const parseMonth= d3.timeParse("%m");
const parseFullMonth= d3.timeParse("%B");
const decimalFormat = num =>  Math.round(num * 10) / 10 