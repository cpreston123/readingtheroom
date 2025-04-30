import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function tweetTimeline(tweets, events) {
  const margin = { top: 100, right: 30, bottom: 60, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const container = document.createElement("div");
  container.style.background = "#000";
  container.style.color = "#fff";
  container.style.fontFamily = "'IBM Plex Sans', sans-serif";
  container.style.padding = "2rem";
  container.style.borderRadius = "10px";
  container.style.display = "flex";
  container.style.gap = "1.5rem";
  container.style.maxWidth = "1300px";
  container.style.margin = "0 auto";
  container.style.overflow = "visible";
  container.style.position = "relative";

  const left = document.createElement("div");
  left.style.flex = "3";
  left.style.minWidth = "0";
  container.appendChild(left);

  const right = document.createElement("div");
  right.style.flex = "1.3";
  right.style.color = "#ccc";
  right.style.fontSize = "14px";
  right.style.lineHeight = "1.6";
  right.innerHTML = `
    <div style="border-left: 3px solid #f5b942; padding-left: 30px; margin-top: 100px; margin-left: 30px;">
      <h3 style="color: #f5b942; font-weight: 600; font-size: 30px; margin-top: 0;">What This Data Reveals</h3>
      <p><strong>Presidential Rhetoric Reflects Foreign Policy Shifts.</strong> Tweet volume spikes during conflict or diplomacy.</p>
      <p><strong>Media Strategy Differs by Administration.</strong> Trump shows sharp bursts, Obama is steadier.</p>
      <p><strong>Event Context Matters.</strong> Hover over points to view geopolitical events.</p>
    </div>
  `;
  container.appendChild(right);

  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background", "#111")
    .style("border-radius", "8px");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  left.appendChild(svg.node());

  // First, remove any existing tooltips with the same class to avoid duplicates
  d3.selectAll(".tweet-tooltip").remove();

  // Create a new tooltip with a unique class
  const tooltip = d3.select(document.body)
    .append("div")
    .attr("class", "tweet-tooltip") // Use a unique class
    .style("position", "fixed") // Use fixed instead of absolute
    .style("opacity", 0)
    .style("z-index", 9999)
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
    .style("line-height", "1.5")
    .style("transition", "opacity 0.2s")
    .style("display", "block"); // Make sure it's "block" not "none"

  const allCountries = Array.from(new Set(tweets.map(d => d.country))).sort();

  const color = d3.scaleOrdinal()
    .domain(["Obama", "Trump"])
    .range(["steelblue", "crimson"]);

  const x = d3.scaleTime()
    .domain(d3.extent(tweets, d => d.month))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(tweets, d => d.count)]).nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.month))
    .y(d => y(d.count));

  const filterDiv = document.createElement("div");
  filterDiv.style.marginBottom = "1rem";

  const label = document.createElement("label");
  label.innerText = "Filter by country: ";
  label.style.marginRight = "0.5rem";
  filterDiv.appendChild(label);

  const select = document.createElement("select");
  select.style.backgroundColor = "#333";
  select.style.color = "#fff";
  select.style.padding = "4px";
  select.style.border = "1px solid #555";
  select.style.borderRadius = "4px";
  select.innerHTML = `<option value="all">All Countries</option>` +
    allCountries.map(c => `<option value="${c}">${c}</option>`).join("");
  filterDiv.appendChild(select);
  left.prepend(filterDiv);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text").style("fill", "#fff");

  g.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text").style("fill", "#fff");

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .text("Month");

  g.append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .text("Number of Mentions");

  const pathGroup = g.append("g");
  const eventGroup = g.append("g");

  function render(selectedCountry) {
    const filteredTweets = selectedCountry === "all" ? tweets : tweets.filter(d => d.country === selectedCountry);
    const visibleEvents = selectedCountry === "all" ? events : events.filter(d => d.country === selectedCountry);
    const grouped = d3.group(filteredTweets, d => d.country, d => d.president);

    pathGroup.selectAll("*").remove();
    eventGroup.selectAll("*").remove();

    grouped.forEach((byPresident) => {
      byPresident.forEach((values, president) => {
        pathGroup.append("path")
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
        .style("cursor", "pointer"); // Add pointer cursor to indicate interactivity

      // Add mouse events
      dot.on("mouseover", function(event) {
        // Get correct positioning
        const boundingRect = svg.node().getBoundingClientRect();
        const dotX = parseFloat(d3.select(this).attr("cx"));
        const dotY = parseFloat(d3.select(this).attr("cy"));
        
        // Calculate window coordinates with appropriate offsets
        const windowX = boundingRect.left + dotX + margin.left;
        const windowY = boundingRect.top + dotY + margin.top;
        
        // Set tooltip content and make it visible
        tooltip
          .html(`
            <div>
              <div style="font-weight: bold; color: #f5b942; font-size: 15px;">${evt.country}</div>
              <div style="margin-top: 4px;">${evt.text}</div>
              <div style="margin-top: 6px; font-style: italic; font-size: 13px; color: #aaa;">
                ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
              </div>
            </div>
          `)
          .style("left", `${windowX + 60}px`)
          .style("top", `${windowY - 100}px`)
          .style("opacity", 1);
        
        // Highlight the dot
        d3.select(this)
          .attr("r", 6)
          .attr("fill", "#f5b942")
          .style("opacity", 1);
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.style("opacity", 0);
        
        // Return dot to original appearance
        d3.select(this)
          .attr("r", 4)
          .attr("fill", evt.president === "Trump" ? "#f5b942" : "#ddd")
          .style("opacity", 0.8);
      });
    });
  }

  // Add a cleanup function to properly remove the tooltip when the component is removed
  container.cleanup = function() {
    tooltip.remove();
  };

  select.addEventListener("change", e => render(e.target.value));
  render("all");

  return container;
}