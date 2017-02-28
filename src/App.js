import React, { Component } from 'react';
import './App.css';
import fontData from './data/fonts.js';
import {
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryScatter,
  VictoryLine
} from 'victory';
import {
  Table,
  Column,
  Cell
} from 'fixed-data-table';

console.log(fontData)

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
  },
  {
    name: "Godia",
    interpolations: [
      { style: 'Regular',      weight:  80 },
      { style: 'Bold',         weight: 200 }
    ]
  }
];

const data = [...fontData, ...myFonts]

const getColor = (i, arr, value) => {
  const hue = Math.floor(i / arr.length * 255)
  const sat = Math.min(value + 50, 100)
  const hsl = `hsl(${hue}, ${sat}%, ${value}%)`
  return hsl
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <VictoryChart
          domainPadding={20}
        >
          <VictoryAxis
            tickFormat={(el) => `${el}`}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(el) => `${el}`}
          />
          {data.map((font, i, arr) => (
            <VictoryGroup
              data={font.interpolations}
              x="index"
              y="weight"
              >
              <VictoryLine
                style={{
                  data: { stroke: getColor(i, arr, 60) },
                  labels: { fill: '#333' }
                }}
                interpolation="catmullRom"
                label=""
                />
              <VictoryScatter
                style={{ data: {
                  fill: getColor(i, arr, 45)
                }}}
                labels={(data) => (data.style)}
                />
            </VictoryGroup>
          ))}
        </VictoryChart>

      </div>
    );
  }
}

export default App;
