function mapRange(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

const svg = d3.select('svg');

const projection =
  // d3.geoEckert4()
  d3
    .geoKavrayskiy7()
    // d3.geoMollweide()
    .scale(300)
    .translate([830, 500])
    .precision(0.1);

const path = d3.geoPath().projection(projection);

const group = svg.append('g');

d3.json('./maps/world_1715.geojson').then((data, error) => {
  if (error) {
    throw error;
  }

  const colors = d3.scaleOrdinal(d3.schemePaired);

  group
    .append('g')
    .attr('class', 'states')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => {
      if (d.properties.ABBREVNAME === 'Antarctica') {
        return 'white';
      }
      if (d.properties.NAME === null || d.properties.NAME == 'unclaimed') {
        return 'grey';
      }
      return colors(d.properties.NAME);
      // return(colors[Math.floor(Math.random() * colors.length)])
    });

  group
    .append('g')
    .attr('class', 'names')
    .selectAll('text')
    .data(data.features)
    .enter()
    .append('text')
    .attr('d', path)
    .style('font-size', d => {
      const bounds = path.bounds(d);
      const widthCountry = bounds[1][0] - bounds[0][0];
      let fontSize = widthCountry / 7;

      const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;
      const letterCountRatio = mapRange(letterCount, 4, 20, 1.5, 0.7);
      fontSize *= letterCountRatio;

      const maximumFontSize = 15;
      return fontSize > maximumFontSize
        ? `${maximumFontSize}px`
        : `${fontSize}px`;
    })
    .style('text-anchor', 'middle')
    .attr('transform', d => {
      return `translate(${path.centroid(d)})`;
    })
    .text(d => d.properties.NAME);
});

const graticule = d3.geoGraticule().extent([
  [-180, -90],
  [180, 90],
]);
group
  .append('path')
  .datum(graticule)
  .attr('class', 'graticule')
  .attr('d', path)
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 0.2);

group
  .append('path')
  .datum(graticule.outline)
  .attr('class', 'graticule outline')
  .attr('d', path)
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 1);

svg.call(
  d3
    .zoom()
    .scaleExtent([1, 40])
    .on('zoom', () => {
      group.attr('transform', d3.event.transform);
    })
);
