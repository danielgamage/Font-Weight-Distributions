import React, { Component } from 'react';
import './App.css';
import {
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryScatter,
  VictoryLine,
  VictoryVoronoiTooltip
} from 'victory';

const fonts = [
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
]
;

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
        {fonts.map(font => (
          <VictoryGroup
            data={font.interpolations}
            x="style"
            y="weight" >
            <VictoryLine
              interpolation="catmullRom"
              />
            <VictoryScatter />
          </VictoryGroup>
        ))}
        </VictoryChart>
      </div>
    );
  }
}

export default App;
