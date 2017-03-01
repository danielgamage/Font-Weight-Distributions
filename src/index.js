import './index.css'
import './App.css'
import fontData from './data/fonts.js'
import * as d3 from "d3"

const myFonts = [
  {
    name: "Alloca Mono",
    interpolations: [
      { style: 'Thin',        weight:  10 },
      { style: 'Extra Light', weight:  24 },
      { style: 'Light',       weight:  42 },
      { style: 'Book',        weight:  64 },
      { style: 'Regular',     weight:  90 },
      { style: 'Medium',      weight: 122 },
      { style: 'Bold',        weight: 160 },
      { style: 'Black',       weight: 200 }
    ]
  }
]

const data = [...fontData, ...myFonts]

const getColor = (i, arr, value) => {
  const hue = Math.floor(i / arr.length * 255)
  const sat = Math.min(value + 50, 100)
  const hsl = `hsl(${hue}, ${sat}%, ${value}%)`
  return hsl
}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 480 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleLinear()
        .domain([...Array(9).keys()])
        .range([...Array(9).keys()].map((el, i, arr) => width / arr.length * i))
var y = d3.scaleLinear()
        .domain([0, 2000])
        .range([height, 0])

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#root").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const drawGraph = (data) => {
  data.map((el, i, arr) => {
    // define the line
    const valueline = d3.line()
        .curve(d3.curveCatmullRomOpen)
        .x((d) => {
          return x(el.interpolations.indexOf(d))
        })
        .y((d) => {
          console.log(d)
          return y(d.weight)
        })
    // Add the valueline path.
    svg.append("path")
        .data([el.interpolations])
        .attr("d", valueline)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", getColor(i, arr, 80))
        .attr("stroke-width", "2px")
        .attr("vector-effect", "non-scaling-stroke")

    el.interpolations.filter(function(d) { return d; })
      .map((interpolation, interpolationIndex) => {
        svg.selectAll("dot")
            .data([interpolation])
          .enter().append("circle")
            .attr("class", "dot")
            .attr("stroke", getColor(i, arr, 80))
            .attr("cx", valueline.x())
            .attr("cy", valueline.y())
            .attr("r", 3.5)
            .exit()
      })

  })


  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y).ticks(8));

}

//drawGraph
drawGraph(data);
