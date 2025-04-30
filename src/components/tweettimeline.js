import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function tweetTimeline(tweets, events) {
  const margin = { top: 100, right: 30, bottom: 60, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const container = document.createElement("div");
  Object.assign(container.style, {
    background: "#000",
    color: "#fff",
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: "2rem",
    borderRadius: "10px",
    display: "flex",
    gap: "3rem",
    maxWidth: "1300px",
    margin: "0 auto",
    overflow: "visible",
    position: "relative"
  });

  const left = Object.assign(document.createElement("div"), { style: "flex:3;min-width:0" });
  const right = Object.assign(document.createElement("div"), { style: "flex:1.3;color:#ccc;font-size:14px;line-height:1.6" });

  const tooltip = d3.select("body").append("div")
    .attr("class", "tweet-tooltip")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("z-index", 9999)
    .style("background", "#2a2a2a")
    .style("color", "#fff")
    .style("padding", "14px 18px")
    .style("border-radius", "10px")
    .style("font-family", "'IBM Plex Sans', sans-serif")
    .style("box-shadow", "0 4px 20px rgba(0,0,0,0.4)")
    .style("border-left", "5px solid #f5b942")
    .style("max-width", "360px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("line-height", "1.5")
    .style("transition", "opacity .2s")
    .style("display", "block");

  function setDefaultSidebar() {
    right.innerHTML = `
      <div style="background:rgba(76,175,80,0.12); border-radius:10px; padding:28px 32px; margin-top:80px; margin-left:auto; box-shadow:0 8px 24px rgba(0,0,0,0.35); max-width:280px;">
        <h3 style="color:#4caf50; font-weight:600; font-size:26px; margin:0 0 16px 0; text-shadow:0 1px 2px rgba(0,0,0,0.4);">
          What This Data Reveals
        </h3>
        <p><strong>Presidential Rhetoric Reflects Foreign Policy Shifts.</strong> Tweet volume spikes during conflict or diplomacy.</p>
        <p><strong>Media Strategy Differs by Administration.</strong> Trump shows sharp bursts, Obama is steadier.</p>
        <p><strong>Event Context Matters.</strong> Hover over points to view geopolitical events.</p>
      </div>`;
  }

  setDefaultSidebar();
  container.append(left, right);

  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 100)
    .style("background", "#111")
    .style("border-radius", "8px");

  const defs = svg.append("defs");

  const obamaGradient = defs.append("linearGradient")
    .attr("id", "obama-gradient")
    .attr("x1", "0").attr("x2", "1")
    .attr("y1", "0").attr("y2", "0");
  obamaGradient.append("stop").attr("offset", "0%").attr("stop-color", "steelblue");
  obamaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#9ecae1");

  const trumpGradient = defs.append("linearGradient")
    .attr("id", "trump-gradient")
    .attr("x1", "0").attr("x2", "1")
    .attr("y1", "0").attr("y2", "0");
  trumpGradient.append("stop").attr("offset", "0%").attr("stop-color", "#f5b942");
  trumpGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffe4a3");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  left.append(svg.node());

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Zoom";
  Object.assign(resetButton.style, {
    background: "#333",
    color: "#fff",
    border: "1px solid #888",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "1rem"
  });
  left.prepend(resetButton);

  const allCountries = Array.from(new Set(tweets.map(d => d.country))).sort();
  const color = d3.scaleOrdinal().domain(["Obama", "Trump"]).range(["url(#obama-gradient)", "url(#trump-gradient)"]);
  const fillColor = d3.scaleOrdinal().domain(["Obama", "Trump"]).range(["steelblue", "#f5b942"]);
  const active = { Obama: true, Trump: true };

  const x = d3.scaleTime().domain(d3.extent(tweets, d => d.month)).range([0, width]);
  const originalX = x.copy();

  const y = d3.scaleLinear().domain([0, d3.max(tweets, d => d.count)]).nice().range([height, 0]);
  const line = d3.line().x(d => x(d.month)).y(d => y(d.count));
  const area = d3.area().x(d => x(d.month)).y0(height).y1(d => y(d.count));

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text").style("fill", "#fff");

  g.append("g").call(d3.axisLeft(y)).selectAll("text").style("fill", "#fff");

  g.append("text").attr("x", width / 2).attr("y", height + 45).attr("text-anchor", "middle").style("fill", "#fff").text("Month");
  g.append("text").attr("x", -height / 2).attr("y", -40).attr("transform", "rotate(-90)").attr("text-anchor", "middle").style("fill", "#fff").text("Number of Mentions");

  const pathGroup = g.append("g");
  const areaGroup = g.append("g");
  const eventGroup = g.append("g");

  const filterDiv = document.createElement("div");
  filterDiv.style.marginBottom = "1rem";
  filterDiv.innerHTML = `
    <label style="margin-right:.5rem">Filter by country:</label>
    <select style="background:#333;color:#fff;padding:4px;border:1px solid #555;border-radius:4px">
      <option value="all">All Countries</option>
      ${allCountries.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>`;
  left.prepend(filterDiv);
  const select = filterDiv.querySelector("select");

  const focusHeight = 60;
  const focusY = d3.scaleLinear().domain(y.domain()).range([focusHeight, 0]);
  const focusGroup = svg.append("g").attr("transform", `translate(${margin.left},${height + margin.top + 60})`);
  const focusLine = d3.line().x(d => originalX(d.month)).y(d => focusY(d.count));

  const brush = d3.brushX().extent([[0, 0], [width, focusHeight]]).on("brush end", brushed);
  focusGroup.append("g").attr("transform", `translate(0,${focusHeight})`).call(d3.axisBottom(originalX).tickFormat(d3.timeFormat("%Y")));
  focusGroup.append("g").attr("class", "brush").call(brush);

  function brushed({ selection }) {
    if (!selection) return;
    const [x0, x1] = selection.map(originalX.invert);
    x.domain([x0, x1]);
    render(select.value);
  }

  resetButton.addEventListener("click", () => {
    x.domain(originalX.domain());
    render(select.value);
    focusGroup.select(".brush").call(brush.move, null);
  });

  function render(selectedCountry) {
    setDefaultSidebar();
    areaGroup.selectAll("*").remove();
    pathGroup.selectAll("*").remove();
    eventGroup.selectAll("*").remove();

    const filteredTweets = selectedCountry === "all" ? tweets : tweets.filter(d => d.country === selectedCountry);
    const visibleEvents = selectedCountry === "all" ? events : events.filter(d => d.country === selectedCountry);
    const grouped = d3.group(filteredTweets, d => d.country, d => d.president);

    grouped.forEach(byPresident => {
      byPresident.forEach((vals, pres) => {
        const sorted = vals.sort((a, b) => d3.ascending(a.month, b.month));

        areaGroup.append("path")
          .datum(sorted)
          .attr("fill", fillColor(pres))
          .attr("opacity", 0.15)
          .attr("d", area);

        const path = pathGroup.append("path")
          .datum(sorted)
          .attr("class", `line-${pres}`)
          .attr("fill", "none")
          .attr("stroke", color(pres))
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("opacity", 0.9)
          .style("display", active[pres] ? null : "none");

        const L = path.node().getTotalLength();
        path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
          .transition().duration(1200).ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      });
    });

    visibleEvents.forEach(evt => {
      const month = d3.timeMonth.floor(new Date(evt.date));
      const dot = eventGroup.append("circle")
        .attr("cx", x(month)).attr("cy", height * 0.1)
        .attr("r", 4)
        .attr("fill", evt.president === "Trump" ? "#f5b942" : "#ddd")
        .attr("stroke", "#333").attr("stroke-width", 1)
        .style("opacity", 0.8).style("cursor", "pointer")
        .on("mouseover", function () {
          const br = svg.node().getBoundingClientRect();
          const dotX = +d3.select(this).attr("cx");
          const dotY = +d3.select(this).attr("cy");
          tooltip.html(`
            <div>
              <div style="font-weight:bold;color:#f5b942;font-size:15px;">${evt.country}</div>
              <div style="margin-top:4px;">${evt.text}</div>
              <div style="margin-top:6px;font-style:italic;font-size:13px;color:#aaa;">
                ${new Date(evt.date).toLocaleDateString()} 
              </div>
            </div>`)
            .style("left", `${br.left + dotX + margin.left + 60}px`)
            .style("top", `${br.top + dotY + margin.top - 100}px`)
            .style("opacity", 1);
          d3.select(this).attr("r", 6).style("opacity", 1);
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this).attr("r", 4).style("opacity", 0.8);
        });
    });

    focusGroup.selectAll("path.focus-line").remove();
    const groupedFocus = d3.group(tweets, d => d.president);
    groupedFocus.forEach((vals, pres) => {
      focusGroup.append("path")
        .datum(vals.sort((a, b) => d3.ascending(a.month, b.month)))
        .attr("fill", "none")
        .attr("stroke", fillColor(pres))
        .attr("stroke-width", 1.2)
        .attr("class", "focus-line")
        .attr("d", focusLine);
    });
  }

  select.addEventListener("change", e => render(e.target.value));
  render("all");
  container.cleanup = () => tooltip.remove();
  return container;
}