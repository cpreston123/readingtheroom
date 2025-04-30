import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = { top: 60, right: 30, bottom: 60, left: 60 },
  width = 900 - margin.left - margin.right, // Increased from 860
  height = 500 - margin.top - margin.bottom;

document.body.style.backgroundColor = "#000";
document.body.style.color = "#fff";
document.body.style.margin = "0";
document.body.style.padding = "40px";

document.querySelector("h2").style.color = "#fff";

document.querySelector("head").innerHTML += `
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">
`;

const container = d3.select("#viz")
  .style("background", "#000")
  .style("padding", "2rem")
  .style("border-radius", "8px")
  .style("color", "#fff")
  .style("font-family", "'IBM Plex Sans', sans-serif")
  .style("display", "flex")
  .style("gap", "1.5rem") // Reduced from 2rem
  .style("justify-content", "space-between")
  .style("max-width", "1300px") // Set a max-width for better control
  .style("margin", "0 auto"); // Center the container

const contentColumn = container.append("div")
  .style("flex", "3") // Increased from 2.5
  .style("min-width", "0"); // Prevent flex items from overflowing

const textColumn = container.append("div")
  .style("flex", "3") // Reduced from 1.3
  .style("color", "#ccc")
  .style("font-size", "14px")
  .style("line-height", "1.6")
  .style("min-width", "300px") // Slightly smaller min-width
  .style("max-width", "300px"); // Add max-width to constrain

textColumn.html(`
  <div style="border-left: 3px solid #f5b942; padding-left: 16px">
    <h3 style="color: #f5b942; font-weight: 600; font-size: 16px; margin-top: 0;">What This Data Reveals</h3>
    <p><strong>Presidential Rhetoric Reflects Foreign Policy Shifts.</strong> The volume and frequency of tweets referencing countries spikes in moments of international conflict, diplomacy, or major global events.</p>
    <p><strong>Media Strategy Differs by Administration.</strong> Trump's timeline shows more frequent spikes aligned with announcements or escalations, whereas Obama's is more steady with notable peaks tied to pivotal moments.</p>
    <p><strong>Event context matters.</strong> Hovering over key points reveals major international developments, placing the tweet patterns in real-world geopolitical context.</p>
  </div>
`);

const headerContainer = d3.select("body")
  .insert("div", "#viz")
  .style("display", "flex")
  .style("align-items", "center")
  .style("justify-content", "space-between")
  .style("margin-bottom", "20px")
  .style("max-width", "1300px") // Match container max-width
  .style("margin", "0 auto 20px auto"); // Center and add bottom margin

const originalH2 = document.querySelector("h2");
const h2Text = originalH2.textContent;
originalH2.remove();

headerContainer.append("h2")
  .text(h2Text)
  .style("color", "#fff")
  .style("margin", "0")
  .style("font-family", "'IBM Plex Sans', sans-serif");

const headerLegend = headerContainer.append("div")
  .style("display", "flex")
  .style("align-items", "center");

// Move the filter wrapper to the contentColumn instead of container
const filterWrapper = contentColumn.append("div")
  .style("margin-bottom", "1rem");

filterWrapper.append("label")
  .text("Filter by country: ")
  .style("margin-right", "0.5rem");

const svg = contentColumn
  .append("svg")
  .attr("width", "100%") // Make SVG responsive with percentage width
  .attr("height", height + margin.top + margin.bottom)
  .style("min-width", width + margin.left + margin.right + "px") // Ensure minimum width
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", "0")
  .style("background", "#2a2a2a")
  .style("color", "#fff")
  .style("padding", "14px 18px")
  .style("border-radius", "10px")
  .style("font-family", "'IBM Plex Sans', sans-serif")
  .style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.4)")
  .style("border-left", "5px solid #f5b942")
  .style("max-width", "360px")
  .style("pointer-events", "none")
  .style("font-size", "14px")
  .style("line-height", "1.5");

const drawPointerLine = (x1, y1, x2, y2) => {
  return `M${x1},${y1} C${x1 + 40},${y1 - 60},${x2 - 40},${y2 + 60},${x2},${y2}`;
};

Promise.all([
  d3.csv("./data/tweet_mentions_by_month.csv", d3.autoType),
  d3.csv("./data/events.csv", d3.autoType)
]).then(([tweets, events]) => {
  const allCountries = Array.from(new Set(tweets.map(d => d.country))).sort();

  const color = d3.scaleOrdinal()
    .domain(["Obama", "Trump"])
    .range(["steelblue", "crimson"]);

  ["Obama", "Trump"].forEach((label) => {
    const legendItem = headerLegend.append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-left", "20px");

    legendItem.append("div")
      .style("width", "15px")
      .style("height", "15px")
      .style("background-color", color(label))
      .style("margin-right", "8px");

    legendItem.append("span")
      .text(label)
      .style("color", "#fff");
  });

  const x = d3.scaleTime()
    .domain(d3.extent(tweets, d => d.month))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(tweets, d => d.count)])
    .nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.month))
    .y(d => y(d.count));

  const select = filterWrapper.append("select")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "4px")
    .style("border", "1px solid #555")
    .style("border-radius", "4px")
    .on("change", function () {
      render(this.value);
    });

  select.append("option")
    .attr("value", "all")
    .text("All Countries");

  select.selectAll("option.country")
    .data(allCountries)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text")
    .style("fill", "#fff");

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#fff");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .text("Month");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .text("Number of Mentions");

  const pathGroup = svg.append("g");
  const eventGroup = svg.append("g");

  function render(selectedCountry) {
    const filtered = selectedCountry === "all" ? tweets : tweets.filter(d => d.country === selectedCountry);
    const visibleEvents = selectedCountry === "all" ? events : events.filter(d => d.country === selectedCountry);
    const grouped = d3.group(filtered, d => d.country, d => d.president);

    pathGroup.selectAll("path").remove();
    eventGroup.selectAll("circle, .tooltip-line").remove();

    grouped.forEach((byPresident, country) => {
      byPresident.forEach((values, president) => {
        pathGroup
          .append("path")
          .datum(values.sort((a, b) => d3.ascending(a.month, b.month)))
          .attr("fill", "none")
          .attr("stroke", color(president))
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("opacity", 0.8);
      });
    });

    visibleEvents.forEach(evt => {
      const date = new Date(evt.date);
      const month = d3.timeMonth.floor(date);
      const yPos = height * 0.1;
      const dot = eventGroup.append("circle")
        .attr("cx", x(month))
        .attr("cy", yPos)
        .attr("r", 4)
        .attr("fill", evt.president === "Trump" ? "#f5b942" : "#ddd")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("opacity", 0.8)
        .on("mouseover", function () {
          const dotX = parseFloat(dot.attr("cx"));
          const dotY = parseFloat(dot.attr("cy"));
          const svgNode = svg.node();
          const svgRect = svgNode.getBoundingClientRect();
          const screenX = svgRect.left + dotX + margin.left;
          const screenY = svgRect.top + dotY + margin.top;

          tooltip
            .style("opacity", 1)
            .style("left", (screenX + 60) + "px")
            .style("top", (screenY - 180) + "px")
            .html(`
              <div>
                <div style="font-weight: bold; color: #f5b942; font-size: 15px;">${evt.country}</div>
                <div style="margin-top: 4px;">${evt.text}</div>
                <div style="margin-top: 6px; font-style: italic; font-size: 13px; color: #aaa;">
                  ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                </div>
              </div>
            `);

          eventGroup.append("path")
            .attr("d", drawPointerLine(dotX, dotY, dotX + 70, dotY - 90))
            .attr("stroke", "#f5b942")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("class", "tooltip-line");

          dot.attr("fill", "#f5b942").attr("r", 6).style("opacity", 1);
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("fill", evt.president === "Trump" ? "#f5b942" : "#ddd")
            .attr("r", 4)
            .style("opacity", 0.8);

          tooltip.style("opacity", 0);
          eventGroup.selectAll(".tooltip-line").remove();
        });
    });
  }

  render("all");
});