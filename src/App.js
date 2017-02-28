import React, { Component } from 'react';
import './App.css';
import fontData from './data/fonts.js';
import {
  VictoryChart,
  VictoryGroup,
  VictoryAxis,
  VictoryScatter,
  VictoryLine,
  VictorySharedEvents
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
  }
];

const fontList = [...fontData, ...myFonts]

const getColor = (i, arr, value) => {
  const hue = Math.floor(i / arr.length * 255)
  const sat = Math.min(value + 50, 100)
  const hsl = `hsl(${hue}, ${sat}%, ${value}%)`
  return hsl
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeLine: null
    }
  }
  render() {
    return (
      <div className="App">
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
          {fontList.map((font, index, arr) => (
            <VictoryGroup
              data={font.interpolations}
              x="index"
              y="weight"
              style={{
                data: { opacity: this.state.activeLine === index ? 1 : 0.5 },
                labels: { display: this.state.activeLine === index ? "block" : "none" }
              }}
              events={[
                {
                  childName: ["line", "scatter"],
                  target: "data",
                  eventHandlers: {
                    onMouseEnter: () => {
                      this.setState({ activeLine: index })
                    },
                    onMouseLeave: () => {
                      this.setState({ activeLine: null })
                    }
                  }
                }
              ]}
              >
              <VictoryLine
                name="line"
                font={font}
                eventKey={index}
                style={{
                  data: { stroke: getColor(index, arr, 60) }
                }}
                interpolation="catmullRom"
                label={font.name}
                />
              <VictoryScatter
                name="scatter"
                eventKey={index}
                style={{
                  data: { fill: getColor(index, arr, 45) }
                }}
                labels={(data) => (data.style)}
                />
            </VictoryGroup>
          ))}
        </VictoryChart>
        <table>
          {fontList.map((font, index, arr) => (
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
