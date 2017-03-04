import './index.css'
import fontData from './data/fonts.js'
import * as d3 from "d3"
import rebound from "rebound"

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

const springSystem = new rebound.SpringSystem();
const springConfig = [60, 10] // tension, friction
const scrollSpring = springSystem.createSpring(...springConfig);

const fonts = [...fontData, ...myFonts]

const getColor = (i, length, value) => {
  const hue = Math.floor(i / length * 255)
  const sat = Math.min(value + 50, 100)
  const hsl = `hsl(${hue}, ${sat}%, ${value}%)`
  return hsl
}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 0, bottom: 50, left: 40},
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
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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
    .attr("transform", "translate(" + width / 2 + "," + (height + margin.top + margin.bottom - 30) + ")")
// Add the Y Axis
lineChart.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSize(8));
lineChart.append("g")
    .call(d3.axisLeft(y).ticks(15).tickSize(4).tickFormat(""));

// add group
var family = lineChart.selectAll("g.family")
    .data(fonts)
  .enter().append("g")
    .attr("class", "family")
    .attr("stroke", (d, i) => getColor(i, fonts.length, 70))

family
  .on("mouseover", (d, i) => {
    lineChart.append("text")
      .attr("class", "legend")
      .attr("transform", `translate(${width},${margin.top})`)
      .text(d.name)
  })
  .on("mouseout", (d, i) => {
    lineChart.select(".legend")
      .remove()
  })

// define the line
const valueline = d3.line()
    .curve(d3.curveCatmullRom)
    .x((d, i) => {
      return x(i)
    })
    .y((d) => {
      return y(d.weight)
    })

// Add the valueline path.
family.append("path")
    .attr("d", (d) => valueline(d.interpolations))
    .attr("class", "line")
family.selectAll(".dot")
    .data((d) => d.interpolations)
  .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", valueline.x())
    .attr("cy", valueline.y())
    .attr("r", 3)
    .exit()

const table = d3.select(".table")

const handleMouseOver = (font, value) => {
  d3.select(`.pie.${font.name}`)
    .append("text")
    .text(value)
    .attr("transform", "translate(64, 64)")
    .attr("class", "text")
}
const handleMouseOut = (font, value) => {
  d3.select(`.pie.${font.name}`)
    .select("text")
    .remove()
}

fonts.map((el, i, arr) => {
  const row = table.append("div")
    .attr("class", "row")
  row.data(el)

  const pieChart = row.append("svg")
      .attr("class", `pie ${el.name}`)
      .attr("width",  128)
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
      .endAngle(arc.endAngle)

    pieChart.append("path")
        .attr("d", arcRendered)
        .attr("class", "arc")
        .attr("transform", "translate(64, 64)")
        .attr("fill", getColor(i, arcs.length, 90 - arcIndex * 40 / arcs.length))

  })
  row.append("div")
    .text(el.name)

})

let rows
let container
const initSlideshow = () => {
  // add some html for controls
  container = document.querySelector('.table')
  container.addEventListener('scroll', handleScroll)

  ;[...document.querySelectorAll(`.pager`)].map(el => {
    el.addEventListener(`click`, (e) => {
      const val = scrollThumbnails(e)
      scrollSpring.setEndValue(val)
    })
  })

  rows = [...document.querySelectorAll(`.row`)]

  handleScroll()
  window.onload = () => { handleScroll() }

  scrollSpring.addListener({ onSpringUpdate: function(scrollSpring) {
    container.scrollTop = scrollSpring.getCurrentValue()
  }})
}
const handleScroll = () => {
  const maxScrollTop = container.scrollHeight - container.clientHeight
  const prev = (container.scrollTop === 0)
  const next = (container.scrollTop === maxScrollTop)
  document.querySelector(`.pager[data-dir="prev"]`).disabled = prev
  document.querySelector(`.pager[data-dir="next"]`).disabled = next
  if (springSystem._activeSprings.indexOf(scrollSpring) === -1) {
    scrollSpring.setCurrentValue(container.scrollTop)
  }
}
const scrollThumbnails = (e) => {
  const direction = e.target.getAttribute('data-dir') === `next` ? 1 : -1
  const distance = (rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top)
  return (container.scrollTop + distance * direction)
}

initSlideshow()
