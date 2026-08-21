import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from './world-110m.json';

interface Location {
  city: string;
  value: string;
  coords: [number, number];
  color: string;
}

const masterLocation: Location = { city: 'Iran (Hub)', value: 'Main Hub', coords: [51.3890, 35.6892], color: '#10b981' };

const slaveLocations: Location[] = [
  { city: 'Washington', value: '98,320,300', coords: [-77.0369, 38.9072], color: '#3b82f6' },
  { city: 'Israel', value: 'Active', coords: [34.7818, 32.0853], color: '#10b981' },
  { city: 'Shanghai', value: '239,570,110', coords: [121.4737, 31.2304], color: '#a855f7' },
  { city: 'Manaus', value: '12,320,300', coords: [-60.0217, -3.1190], color: '#f59e0b' },
  { city: 'Canada', value: 'Active', coords: [-75.6972, 45.4215], color: '#f59e0b' },
  { city: 'London', value: 'Active', coords: [-0.1276, 51.5074], color: '#3b82f6' },
  { city: 'Tokyo', value: 'Active', coords: [139.6503, 35.6762], color: '#a855f7' },
  { city: 'Sydney', value: 'Active', coords: [151.2093, -33.8688], color: '#f59e0b' },
  { city: 'Cape Town', value: 'Active', coords: [18.4233, -33.9249], color: '#10b981' },
  { city: 'Buenos Aires', value: 'Active', coords: [-58.3816, -34.6037], color: '#3b82f6' }
];

const allLocations = [masterLocation, ...slaveLocations];

export default function WorldMap({ isDarkMode = true }: { isDarkMode?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1000;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const projection = d3.geoNaturalEarth1()
      .scale(180)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Use imported local map data synchronously
    const countries = topojson.feature(worldData as any, worldData.objects.countries as any) as any;
    
    // Filter out Antarctica
    countries.features = countries.features.filter((d: any) => d.properties.name !== "Antarctica");

    // Draw countries
    const g = svg.append("g");

    g.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", (d: any) => 
        d.properties.name === "Iran" 
          ? "fill-red-600/50 stroke-red-500 animate-heartbeat" 
          : isDarkMode 
            ? "fill-zinc-700/30 stroke-zinc-500/50" 
            : "fill-zinc-300 stroke-zinc-400"
      )
      .attr("d", path)
      .style("transition", "fill 0.3s ease, stroke 0.3s ease");

    // Broadcast Waves from Iran (Distress Signal)
    const masterPos = projection(masterLocation.coords)!;
    const wavesGroup = svg.append("g");
    
    function createWave() {
      wavesGroup.append("circle")
        .attr("cx", masterPos[0])
        .attr("cy", masterPos[1])
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", "#ef4444") // Red for distress
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr("r", 800)
        .attr("opacity", 0)
        .remove();
    }

    const waveInterval = setInterval(createWave, 1500);

    // Connection lines
    const lineGroup = svg.append("g");

    slaveLocations.forEach((conn, i) => {
      const start = projection(masterLocation.coords)!;
      const end = projection(conn.coords)!;
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const dr = Math.sqrt(dx * dx + dy * dy);
      const d = `M${start[0]},${start[1]}A${dr},${dr} 0 0,1 ${end[0]},${end[1]}`;

      // Static line
      lineGroup.append("path")
        .attr("d", d)
        .attr("fill", "none")
        .attr("stroke", conn.color)
        .attr("stroke-width", 0.3)
        .attr("stroke-dasharray", "1 3")
        .attr("opacity", 0.15);

      // Animated pulse
      const pulse = lineGroup.append("path")
        .attr("d", d)
        .attr("fill", "none")
        .attr("stroke", "#ef4444") // Red for distress
        .attr("stroke-width", 1)
        .attr("opacity", 0);

      const length = (pulse.node() as SVGPathElement).getTotalLength();

      function repeat() {
        pulse
          .attr("stroke-dasharray", `0, ${length}`)
          .attr("stroke-dashoffset", 0)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 0.6)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr("stroke-dasharray", `10, ${length}`)
          .attr("stroke-dashoffset", -length)
          .transition()
          .duration(500)
          .style("opacity", 0)
          .on("end", repeat);
      }

      setTimeout(repeat, i * 400);
    });

    // Markers
    const markers = svg.append("g")
      .selectAll("g")
      .data(allLocations)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${projection(d.coords)})`);

    // Pulse circle (smaller)
    markers.append("circle")
      .attr("r", d => d.city.includes('Hub') ? 4 : 2)
      .attr("fill", d => d.color)
      .attr("opacity", 0.4)
      .append("animate")
      .attr("attributeName", "r")
      .attr("from", d => d.city.includes('Hub') ? 4 : 2)
      .attr("to", d => d.city.includes('Hub') ? 12 : 8)
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    markers.append("circle")
      .attr("r", d => d.city.includes('Hub') ? 4 : 2)
      .attr("fill", d => d.color)
      .attr("opacity", 0.4)
      .append("animate")
      .attr("attributeName", "opacity")
      .attr("from", 0.4)
      .attr("to", 0)
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    // Static dot (smaller)
    markers.append("circle")
      .attr("r", d => d.city.includes('Hub') ? 2.5 : 1.5)
      .attr("fill", d => d.color)
      .attr("stroke", isDarkMode ? "white" : "white")
      .attr("stroke-width", 0.5)
      .attr("class", isDarkMode ? "" : "shadow-sm");
      
    // Labels (smaller)
    markers.append("text")
      .text(d => d.city)
      .attr("dy", -8)
      .attr("text-anchor", "middle")
      .attr("fill", isDarkMode ? "white" : "#18181b")
      .attr("font-size", "6px")
      .attr("font-family", "monospace")
      .attr("opacity", isDarkMode ? 0.8 : 1);

    return () => clearInterval(waveInterval);
  }, [isDarkMode]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full opacity-90"
      />
    </div>
  );
}

