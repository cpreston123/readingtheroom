import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createTooltip() {
  return d3.select("body").append("div")
    .attr("class", "tweet-tooltip")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("z-index", 9999)
    .style("background", "rgba(30,30,30,0.95)")
    .style("color", "#fff")
    .style("padding", "16px 20px")
    .style("border-radius", "12px")
    .style("font-family", "'IBM Plex Sans', sans-serif")
    .style("box-shadow", "0 8px 30px rgba(0,0,0,0.5)")
    .style("border-left", "4px solid #f5b942")
    .style("max-width", "400px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("line-height", "1.6")
    .style("transition", "all 0.2s ease-out")
    .style("backdrop-filter", "blur(4px)");
}

export function createGradients(svg) {
  const defs = svg.append("defs");

  // Obama gradient
  const ObamaGradient = defs.append("linearGradient")
    .attr("id", "obama-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");
  
  ObamaGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(25, 82, 186, 0.8)");
  ObamaGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(25, 82, 186, 0.1)");

  // Trump gradient
  const TrumpGradient = defs.append("linearGradient")
    .attr("id", "trump-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");
  
  TrumpGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(237, 164, 27, 0.8)");
  TrumpGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(237, 164, 27, 0.1)");

  return { ObamaGradient, TrumpGradient };
}

export function createColorScales() {
  return {
    color: d3.scaleOrdinal()
      .domain(["Obama", "Trump"])
      .range(["rgb(25, 82, 186)", "rgb(237, 164, 27)"]),
    
    fillColor: d3.scaleOrdinal()
      .domain(["Obama", "Trump"])
      .range(["url(#obama-gradient)", "url(#trump-gradient)"])
  };
}

export function wrapText(text, width) {
  text.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1;
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy"));
    let tspan = text.text(null).append("tspan")
      .attr("x", text.attr("x"))
      .attr("y", y)
      .attr("dy", dy + "em");
    
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("x", text.attr("x"))
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
} 