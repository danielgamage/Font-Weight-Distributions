import React, { Component } from 'react';
import './App.css';
import fontData from './data/fonts.js';
import {
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryScatter,
  VictoryLine,
  VictoryVoronoiTooltip
} from 'victory';

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

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <VictoryChart
          domainPadding={100}
        >
          <VictoryAxis
            tickFormat={(el) => `${el}`}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(el) => `${el}`}
          />
          {data.map(font => (
            <VictoryGroup
              data={font.interpolations}
              x="style"
              y="weight" >
              <VictoryLine
                interpolation="catmullRom"
                label={font.name}
                />
              <VictoryScatter />
            </VictoryGroup>
          ))}
        </VictoryChart>
        <table>
          {data.map(font => (
            <tr>
              <td>{font.name}</td>
              {font.interpolations.map(interpolation => (
                <td>{interpolation.weight}</td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    );
  }
}

export default App;
