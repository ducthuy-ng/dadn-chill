// import * as d3 from 'd3';

// export interface TimeSeriesValue {
//   date: Date;
//   value: number;
// };

// interface LineChartProps {
//   data: TimeSeriesValue[],
//   format: string
// }


// export default function LineChart({data, format} : LineChartProps) {
//   const width = 600;
//   const height = 400;
//   const margin = { top: 20, right: 30, bottom: 30, left: 40 };

//   const x = d3
//     .scaleUtc()
//     .domain(d3.extent(data, (d) => d.date) as [Date, Date])
//     .range([margin.left, width - margin.right]);

//   const y = d3
//     .scaleLinear<number>()
//     .domain([0, d3.max(data, (d) => d.value)] as [number, number])
//     .nice()
//     .range([height - margin.bottom, margin.top]);

//   const line = d3
//     .line<TimeSeriesValue>()
//     .defined((d) => !isNaN(d.value))
//     .x((d) => x(d.date))
//     .y((d) => y(d.value));

//   const getXAxis = (ref: SVGSVGElement) => {
//     const xAxis = d3.axisBottom(x);
//     d3.select(ref).call(
//       xAxis.tickFormat(
//         d3.timeFormat(format) as (
//           value: Date | { valueOf(): number },
//           i: number
//         ) => string
//       )
//     );
//   };

//   const getYAxis = (ref: SVGSVGElement) => {
//     const yAxis = d3.axisLeft(y).tickSize(-width).tickPadding(7);
//     d3.select(ref).call(yAxis);
//   };

//   return (
//     <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
//       <g
//         transform={`translate(0,${height - margin.bottom})`}
//         ref={getXAxis}
//       ></g>
//       <g transform={`translate(${margin.left},0)`} ref={getYAxis}></g>
//       <path
//         fill="none"
//         stroke="steelblue"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//         strokeLinecap="round"
//         d={line(data) as string}
//       />
//     </svg>
//   );
// }
