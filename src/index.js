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
var margin = {top: 20, right: 0, bottom: 50, left: 60},
    width = 480 - margin.left - margin.right,
    height = 240 - margin.top - margin.bottom

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
const lineChart = d3.select(".chart--line").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const table = d3.select(".table table")

const drawGraph = (data) => {
  data.map((el, i, arr) => {
    // define the line
    const valueline = d3.line()
        .curve(d3.curveCatmullRom)
        .x((d) => {
          return x(el.interpolations.indexOf(d))
        })
        .y((d) => {
          return y(d.weight)
        })
    // Add the valueline path.
    lineChart.append("path")
        .data([el.interpolations])
        .attr("d", valueline)
        .attr("class", "line")
        .attr("stroke", getColor(i, arr, 70))
        el.interpolations.filter(function(d) { return d; })
          .map((interpolation, interpolationIndex) => {
            lineChart.selectAll("dot")
                .data([interpolation])
              .enter().append("circle")
                .attr("class", "dot")
                .attr("stroke", getColor(i, arr, 70))
                .attr("cx", valueline.x())
                .attr("cy", valueline.y())
                .attr("r", 2)
                .exit()
          })

    const row = table.append("tr")
    row.data(el)

    const pieChart = row.append("td").append("svg")
        .attr("class", "pie")
        .attr("width", 128)
        .attr("height", 128)
        .attr("viewBox", `0 0 128 128`)
    const arcs =  d3.pie()([...el.interpolations].map(interpolation => interpolation.weight))
    arcs.map((arc, arcIndex) => {
      const arcRendered = d3.arc()
        .innerRadius(48)
        .outerRadius(64)
        .cornerRadius(2)
        .padAngle(.03)
        .startAngle(arc.startAngle)
        .endAngle(arc.endAngle);
      pieChart.append("path")
          .attr("d", arcRendered)
          .attr("class", "arc")
          .attr("transform", "translate(64, 64)")
          .attr("fill", getColor(i, arcs, 90 - arcIndex * 40 / arcs.length))
    })
    row.append("td")
      .text(el.name)
    el.interpolations.map(interpolation => {
      row.append("td")
        .text(interpolation.weight)
    })

  })
}

// gridlines in x axis function
function make_x_gridlines() {
  return d3.axisBottom(x)
    .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {
  return d3.axisLeft(y)
    .ticks(5)
}

// add the X gridlines
lineChart.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
lineChart.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    )

// Add the X Axis
lineChart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5).tickSize(8))
lineChart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(10).tickSize(4).tickFormat(""))
lineChart.append("text")
    .text("Steps")
    .style("text-anchor", "middle")
    .attr("font-size", "10")
    .attr("transform", "translate(" + width / 2 + "," + (height + margin.top + 10) + ")")


// Add the Y Axis
lineChart.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSize(8));
lineChart.append("g")
    .call(d3.axisLeft(y).ticks(15).tickSize(4).tickFormat(""));

//drawGraph
drawGraph(data);
