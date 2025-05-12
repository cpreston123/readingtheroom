import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function tweetTimeline(tweets, events) {
  // Enhanced margins and dimensions with better space allocation
  const margin = { top: 80, right: 270, bottom: 60, left: 100 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create main container with better styling
  const container = document.createElement("div");
  Object.assign(container.style, {
    background: "linear-gradient(135deg, #111 0%, #222 100%)",
    color: "#fff",
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: "2rem",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    overflow: "hidden",
    position: "relative"
  });

  // Create visualization content
  const contentWrapper = document.createElement("div");
  contentWrapper.style.display = "flex";
  contentWrapper.style.gap = "2rem";
  
  // Create left and right panels
  const left = Object.assign(document.createElement("div"), { 
    style: "flex:3;min-width:0;position:relative" 
  });
  const right = Object.assign(document.createElement("div"), { 
    style: "flex:1.3;color:#ccc;font-size:14px;line-height:1.6;position:relative;overflow-y:auto;max-height:600px" 
  });

  // Enhanced tooltip with smoother animations
  const tooltip = d3.select("body").append("div")
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
    .style("border-left", "4px solid #1976d2") // Changed to blue only
    .style("max-width", "400px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("line-height", "1.6")
    .style("transition", "opacity 0.15s, transform 0.15s")
    .style("transform", "translateY(10px)")
    .style("backdrop-filter", "blur(4px)");

  // Title and description section at the top
  const header = document.createElement("div");
  header.style.marginBottom = "0.5rem";
  
  const title = document.createElement("h2");
  title.textContent = "Presidential Tweet Mentions by Country";
  title.style.margin = "0";
  title.style.color = "#fff";
  title.style.fontSize = "24px";
  title.style.fontWeight = "600";
  
  const description = document.createElement("p");
  description.textContent = "Explore how often countries were mentioned in tweets by Presidents Obama and Trump over time.";
  description.style.color = "#aaa";
  description.style.fontSize = "15px";
  description.style.margin = "0.5rem 0 0 0";
  
  header.appendChild(title);
  header.appendChild(description);

  // Create control panel with improved layout
  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "12px";
  controls.style.alignItems = "center";
  controls.style.background = "rgba(20,20,20,0.5)";
  controls.style.padding = "12px";
  controls.style.borderRadius = "8px";
  controls.style.marginBottom = "1rem";

  // Country information database (new addition)
  const countryInfo = {
    "Russia": {
      "overview": "US-Russia relations were complex from 2012-2020, marked by tensions over Ukraine, Syria, and alleged election interference.",
      "keyEvents": [
        "2014: Russia annexed Crimea, leading to US sanctions",
        "2016: Allegations of Russian interference in US elections",
        "2018: Trump-Putin Helsinki summit",
        "2019: US withdrawal from INF Treaty"
      ],
      "diplomaticRelations": "Strained with periods of limited cooperation on certain global issues.",
      "tradeVolume": "Trade remained relatively modest, with US exports to Russia around $6 billion annually."
    },
    "China": {
      "overview": "US-China relations transformed from strategic cooperation to strategic competition during 2012-2020.",
      "keyEvents": [
        "2012-2016: Obama's 'Pivot to Asia' strategy",
        "2018-2020: Trade war under Trump administration",
        "2019: Concerns over Hong Kong protests",
        "2020: Tensions over COVID-19 pandemic origins"
      ],
      "diplomaticRelations": "Complex relationship balancing cooperation and competition across economic, security, and technological domains.",
      "tradeVolume": "Major trading partner with bilateral trade exceeding $500 billion annually, despite recent tensions."
    },
    "Iran": {
      "overview": "US-Iran relations fluctuated dramatically, from diplomatic engagement to renewed tensions.",
      "keyEvents": [
        "2015: Iran Nuclear Deal (JCPOA) signed",
        "2018: US withdrawal from JCPOA under Trump",
        "2019: Increased sanctions on Iranian oil exports",
        "2020: US airstrike killing General Qasem Soleimani"
      ],
      "diplomaticRelations": "Largely hostile with no formal diplomatic relations, communicating through intermediaries.",
      "tradeVolume": "Near-zero official trade due to comprehensive sanctions."
    },
    "Mexico": {
      "overview": "Close but sometimes tense relations focused on trade, immigration, and border security.",
      "keyEvents": [
        "2016: Trump campaign rhetoric on border wall",
        "2018-2019: Migration issues at US-Mexico border",
        "2018-2020: NAFTA renegotiation into USMCA",
        "2019: Tariff threats related to immigration enforcement"
      ],
      "diplomaticRelations": "Strong diplomatic and economic ties despite periodic tensions over immigration and trade.",
      "tradeVolume": "One of America's largest trading partners with approximately $600 billion in annual bilateral trade."
    },
    "North Korea": {
      "overview": "Relations evolved from 'strategic patience' under Obama to direct engagement under Trump.",
      "keyEvents": [
        "2013: North Korea's third nuclear test",
        "2017: 'Fire and fury' rhetoric and missile tests",
        "2018: Singapore Summit between Trump and Kim Jong-un",
        "2019: Hanoi Summit ending without agreement"
      ],
      "diplomaticRelations": "No formal diplomatic relations, with communications occurring through special envoys and third parties.",
      "tradeVolume": "Virtually no official trade due to comprehensive sanctions."
    },
    "Israel": {
      "overview": "Strong alliance with policy shifts under different administrations.",
      "keyEvents": [
        "2015: Tensions over Iran nuclear deal",
        "2017: US recognition of Jerusalem as Israel's capital",
        "2018: US embassy moved to Jerusalem",
        "2020: Abraham Accords facilitating Israel-Arab normalization"
      ],
      "diplomaticRelations": "Close strategic alliance with strong military and intelligence cooperation.",
      "tradeVolume": "Approximately $50 billion in annual bilateral trade with significant US military aid."
    },
    "United Kingdom": {
      "overview": "The 'Special Relationship' remained strong with cooperation across defense, intelligence, and trade.",
      "keyEvents": [
        "2016: Brexit referendum implications for US-UK relations",
        "2018: Trump's first official visit to the UK",
        "2019: Discussions on post-Brexit trade deal",
        "2020: Coordination on COVID-19 response"
      ],
      "diplomaticRelations": "Exceptionally close alliance with extensive cooperation across government sectors.",
      "tradeVolume": "Over $260 billion in annual bilateral trade and substantial cross-investment."
    },
    "France": {
      "overview": "Traditional alliance with occasional tensions over trade and multilateral initiatives.",
      "keyEvents": [
        "2015: Paris Climate Agreement",
        "2017: Macron-Trump relationship development",
        "2018: US withdrawal from Iran deal and Paris Agreement",
        "2019: Disagreements over digital services tax"
      ],
      "diplomaticRelations": "Strong NATO allies with broad cooperation despite policy differences.",
      "tradeVolume": "Approximately $130 billion in annual bilateral trade."
    },
    "Germany": {
      "overview": "Key European ally with tensions over defense spending and trade balance.",
      "keyEvents": [
        "2013: NSA surveillance controversy",
        "2017-2020: NATO spending disagreements",
        "2018: Trade tensions and tariff threats",
        "2019: Dispute over Nord Stream 2 pipeline"
      ],
      "diplomaticRelations": "Strong institutional ties with periodic tensions under Trump administration.",
      "tradeVolume": "Around $200 billion in annual bilateral trade with significant German investment in US."
    },
    "Japan": {
      "overview": "Robust security alliance and economic partnership across administrations.",
      "keyEvents": [
        "2014: Obama's 'pivot to Asia' strengthening US-Japan alliance",
        "2016: Obama's historic visit to Hiroshima",
        "2017: Trump-Abe alliance development",
        "2019: US-Japan Trade Agreement"
      ],
      "diplomaticRelations": "Strong security alliance with extensive military cooperation and shared regional concerns.",
      "tradeVolume": "Approximately $220 billion in annual bilateral trade with substantial Japanese investment in US."
    }
  };

  // Default country information for countries not specifically listed
  const defaultCountryInfo = {
    "overview": "The relationship with the US varied during the 2012-2020 period, influenced by regional dynamics and global events.",
    "keyEvents": [
      "Specific diplomatic engagements occurred throughout the period",
      "Trade and economic cooperation continued through established channels",
      "Security cooperation followed regional and global patterns"
    ],
    "diplomaticRelations": "Maintained through standard diplomatic channels with varying levels of engagement.",
    "tradeVolume": "Trade volumes fluctuated based on economic conditions and policy priorities."
  };

  // Initialize with default sidebar content
  function setDefaultSidebar() {
    right.innerHTML = `
      <div style="background:rgba(30,30,30,0.7);border-radius:10px;padding:20px;margin-bottom:20px;border:1px solid #333;">
        <h3 style="margin-top:0;color:#1976d2;border-bottom:1px solid #444;padding-bottom:8px;">About This Visualization</h3>
        <p>This interactive visualization compares mentions of countries in tweets by Presidents Barack Obama and Donald Trump.</p>
        <p>Use the filters to explore specific countries or time periods. Hover over elements for detailed information.</p>
        <p>Select a country to view detailed information about US relations with that country from 2012-2020.</p>
      </div>
      <div style="background:rgba(30,30,30,0.7);border-radius:10px;padding:20px;border:1px solid #333;">
        <h3 style="margin-top:0;color:#1976d2;border-bottom:1px solid #444;padding-bottom:8px;">Quick Stats</h3>
        <div id="stats-container" style="font-size:13px;"></div>
      </div>
    `;
  }

  setDefaultSidebar();
  container.appendChild(header);
  container.appendChild(controls);
  contentWrapper.append(left, right);
  container.appendChild(contentWrapper);

  // Create SVG with improved styling
  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 100)
    .style("background", "rgba(20,20,20,0.7)")
    .style("border-radius", "10px")
    .style("border", "1px solid #333");

  const defs = svg.append("defs");

  // Add gradient definitions
  const ObamaGradient = defs.append("linearGradient")
    .attr("id", "obama-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");
  
  ObamaGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(25, 82, 186, 0.8)");
  ObamaGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(25, 82, 186, 0.1)");

  // Add Trump gradient back
  const TrumpGradient = defs.append("linearGradient")
    .attr("id", "trump-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");
  
  TrumpGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255, 87, 34, 0.8)");
  TrumpGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255, 87, 34, 0.1)");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  left.append(svg.node());

  // Reset zoom button with improved styling and fixed functionality
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset View";
  resetButton.id = "reset-zoom-button"; // Add ID for easier referencing
  Object.assign(resetButton.style, {
    background: "linear-gradient(to bottom, #444, #333)",
    color: "#fff",
    border: "1px solid #555",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  });
  resetButton.addEventListener("mouseover", () => {
    resetButton.style.background = "linear-gradient(to bottom, #555, #444)";
    resetButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  });
  resetButton.addEventListener("mouseout", () => {
    resetButton.style.background = "linear-gradient(to bottom, #444, #333)";
    resetButton.style.boxShadow = "none";
  });
  controls.appendChild(resetButton);

  // Toggle buttons for presidents
  const toggleDiv = document.createElement("div");
  toggleDiv.style.display = "flex";
  toggleDiv.style.gap = "8px";
  toggleDiv.style.alignItems = "center";
  controls.appendChild(toggleDiv);

  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = "Show:";
  toggleLabel.style.color = "#aaa";
  toggleDiv.appendChild(toggleLabel);

  const allCountries = Array.from(new Set(tweets.map(d => d.country))).sort();
  const color = d3.scaleOrdinal()
    .domain(["Obama", "Trump"])
    .range(["rgb(25, 82, 186)", "rgb(255, 87, 34)"]); // Changed Trump back to orange

  const fillColor = d3.scaleOrdinal()
    .domain(["Obama", "Trump"])
    .range(["url(#obama-gradient)", "url(#trump-gradient)"]); // Changed Trump to use orange gradient
  
  const active = { Obama: true, Trump: true };

  // Create toggle buttons for each president
  ["Obama", "Trump"].forEach(president => {
    const btn = document.createElement("button");
    btn.textContent = president;
    btn.dataset.president = president;
    Object.assign(btn.style, {
      background: active[president] ? color(president) : "#333",
      color: active[president] ? "#fff" : "#aaa",
      border: `1px solid ${active[president] ? color(president) : "#555"}`,
      padding: "6px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      transition: "all 0.2s"
    });
    
    btn.addEventListener("click", () => {
      active[president] = !active[president];
      btn.style.background = active[president] ? color(president) : "#333";
      btn.style.color = active[president] ? "#fff" : "#aaa";
      btn.style.border = `1px solid ${active[president] ? color(president) : "#555"}`;
      
      // Apply filter and update visualization
      render(select.value);
    });
    
    toggleDiv.appendChild(btn);
  });

  // Country filter with separator
  const separator = document.createElement("div");
  separator.style.width = "1px";
  separator.style.height = "24px";
  separator.style.background = "#444";
  separator.style.margin = "0 8px";
  controls.appendChild(separator);

  // Country filter
  const filterDiv = document.createElement("div");
  filterDiv.style.display = "flex";
  filterDiv.style.gap = "8px";
  filterDiv.style.alignItems = "center";
  controls.appendChild(filterDiv);

  const filterLabel = document.createElement("label");
  filterLabel.textContent = "Country:";
  filterLabel.style.color = "#aaa";
  filterDiv.appendChild(filterLabel);

  const select = document.createElement("select");
  Object.assign(select.style, {
    background: "#333",
    color: "#fff",
    padding: "6px 10px",
    border: "1px solid #555",
    borderRadius: "6px",
    minWidth: "180px",
    fontSize: "14px"
  });

  const optionAll = document.createElement("option");
  optionAll.value = "all";
  optionAll.textContent = "All Countries";
  select.appendChild(optionAll);

  // Add countries in alphabetical order
  allCountries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
  filterDiv.appendChild(select);

  // Another separator
  const separator2 = document.createElement("div");
  separator2.style.width = "1px";
  separator2.style.height = "24px";
  separator2.style.background = "#444";
  separator2.style.margin = "0 8px";
  controls.appendChild(separator2);

  // Enhanced time period filter - CHANGED TO YEARLY ONLY
  const timeDiv = document.createElement("div");
  timeDiv.style.display = "flex";
  timeDiv.style.gap = "8px";
  timeDiv.style.alignItems = "center";
  controls.appendChild(timeDiv);

  const timeLabel = document.createElement("label");
  timeLabel.textContent = "Year:";
  timeLabel.style.color = "#aaa";
  timeDiv.appendChild(timeLabel);

  const timeSelect = document.createElement("select");
  Object.assign(timeSelect.style, {
    background: "#333",
    color: "#fff",
    padding: "6px 10px",
    border: "1px solid #555",
    borderRadius: "6px",
    minWidth: "120px",
    fontSize: "14px"
  });

  // Get unique years from the data
  const uniqueYears = Array.from(new Set(tweets.map(d => d.month.getFullYear()))).sort();
  const timeOptions = [
    { value: "all", text: "All Years" },
    { value: "obama", text: "Obama Years" },
    { value: "trump", text: "Trump Years" }
  ];

  // Add year options
  uniqueYears.forEach(year => {
    timeOptions.push({ value: `year-${year}`, text: year.toString() });
  });

  timeOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    timeSelect.appendChild(option);
  });
  timeDiv.appendChild(timeSelect);

  // Initialize scales
  const x = d3.scaleTime().domain(d3.extent(tweets, d => d.month)).range([0, width]);
  const originalX = x.copy(); // Store original x scale for reset functionality

  const y = d3.scaleLinear().domain([0, d3.max(tweets, d => d.count)]).nice().range([height, 0]);
  const line = d3.line().x(d => x(d.month)).y(d => y(d.count)).curve(d3.curveMonotoneX); // Smoother curve
  const area = d3.area().x(d => x(d.month)).y0(height).y1(d => y(d.count)).curve(d3.curveMonotoneX);

  // Add axes with improved styling
  const xAxis = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")).ticks(6))
    .selectAll("text")
      .style("fill", "#aaa")
      .style("font-size", "12px")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("fill", "#aaa")
    .style("font-size", "13px")
    .text("Time");

  // Y-axis for line charts only (initially hidden)
  const yAxis = g.append("g")
    .attr("class", "y-axis")
    .style("opacity", 0)
    .call(d3.axisLeft(y).ticks(5));

  // Y-axis label (initially hidden)
  const yAxisLabel = g.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("fill", "#aaa")
    .style("font-size", "13px")
    .style("opacity", 0)
    .text("Number of Mentions");

  // Create groups for different chart elements
  const pathGroup = g.append("g").attr("class", "path-group");
  const areaGroup = g.append("g").attr("class", "area-group");
  const pointsGroup = g.append("g").attr("class", "points-group");
  const barcodeGroup = g.append("g").attr("class", "barcode-group");
  const countryLabelsGroup = g.append("g").attr("class", "country-labels-group");
  const eventMarkersGroup = g.append("g").attr("class", "event-markers-group");
  const annotationGroup = g.append("g").attr("class", "annotation-group");

  // Add legend with improved positioning and styling
  const legend = g.append("g")
    .attr("transform", `translate(${width - 180}, -50)`);

  ["Obama", "Trump"].forEach((president, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    legendItem.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 3)
      .attr("fill", color(president))
      .attr("stroke", "#444")
      .attr("stroke-width", 1);

    legendItem.append("text")
      .attr("x", 22)
      .attr("y", 9)
      .attr("dominant-baseline", "middle")
      .style("fill", "#fff")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .text(`${president} mentions`);
  });

  // Add focus chart for brushing/zooming with improved styling
  const focusHeight = 60;
  const focusMargin = { top: 10, bottom: 20 };
  const focusY = d3.scaleLinear().domain(y.domain()).range([focusHeight, 0]);
  const focusGroup = svg.append("g")
    .attr("class", "focus-group")
    .attr("transform", `translate(${margin.left},${height + margin.top + focusMargin.top + 20})`);
  
  // Add a background for the focus chart
  focusGroup.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", focusHeight)
    .attr("fill", "rgba(30,30,30,0.5)")
    .attr("rx", 4);
  
  const focusLine = d3.line()
    .x(d => originalX(d.month))
    .y(d => focusY(d.count))
    .curve(d3.curveMonotoneX);

  // Brush setup with fixed functionality
  const brush = d3.brushX()
    .extent([[0, 0], [width, focusHeight]])
    .on("brush", brushing)
    .on("end", brushEnded);

  focusGroup.append("g")
    .attr("class", "focus-axis")
    .attr("transform", `translate(0,${focusHeight})`)
    .call(d3.axisBottom(originalX).tickFormat(d3.timeFormat("%Y")).ticks(8))
    .selectAll("text")
      .style("fill", "#aaa")
      .style("font-size", "11px");

  const brushGroup = focusGroup.append("g")
    .attr("class", "brush")
    .call(brush);
    
  // Add a "Focus Chart" label
  focusGroup.append("text")
    .attr("x", 5)
    .attr("y", -5)
    .style("fill", "#aaa")
    .style("font-size", "11px")
    .text("Time Range Selector");

  // Create a summary table with enhanced design
  const tableDiv = document.createElement("div");
  Object.assign(tableDiv.style, {
    position: "absolute",
    top: "0",
    right: "-250px",
    width: "230px",
    background: "rgba(20,20,20,0.9)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #333",
    fontSize: "14px",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    maxHeight: "600px",
    overflowY: "auto",
    transition: "all 0.3s"
  });
  left.appendChild(tableDiv);

  // IMPROVED: Add stats to the sidebar with optimized rendering
  // Cache for stats to avoid unnecessary re-calculations
  const statsCache = new Map();
  
  function updateStats(filteredTweets) {
    const statsContainer = document.getElementById("stats-container");
    if (!statsContainer) return;
    
    // Create a cache key based on the filtered tweets
    const cacheKey = select.value + '-' + timeSelect.value + '-' + 
                     active.Obama + '-' + active.Trump + '-' + 
                     x.domain()[0].getTime() + '-' + x.domain()[1].getTime();
    
    // Check if we have a cached result
    if (statsCache.has(cacheKey)) {
      statsContainer.innerHTML = statsCache.get(cacheKey);
      return;
    }
    
    // Otherwise calculate stats
    const totalObama = d3.sum(filteredTweets, d => d.president === "Obama" ? d.count : 0);
    const totalTrump = d3.sum(filteredTweets, d => d.president === "Trump" ? d.count : 0);
    const totalMentions = totalObama + totalTrump;
    
    let uniqueCountries;
    if (select.value === "all") {
      uniqueCountries = new Set(filteredTweets.map(d => d.country)).size;
    } else {
      uniqueCountries = 1;
    }
    
    // Calculate percentage displays safely
    const obamaPercent = totalMentions > 0 ? Math.round(totalObama/totalMentions*100) : 0;
    const trumpPercent = totalMentions > 0 ? Math.round(totalTrump/totalMentions*100) : 0;
    
    const statsHTML = `
      <div style="margin-bottom:15px;">
        <div style="color:#aaa;">Total Mentions:</div>
        <div style="font-size:20px;font-weight:bold;color:#fff;">${totalMentions.toLocaleString()}</div>
      </div>
      <div style="margin-bottom:15px;">
        <div style="margin-bottom:5px;color:#aaa;">Distribution:</div>
        <div style="display:flex;align-items:center;margin-bottom:8px;">
          <span style="color:#1976d2;width:60px;">Obama:</span>
          <div style="flex:1;height:8px;background:#222;border-radius:4px;overflow:hidden;margin:0 8px;">
            <div style="width:${obamaPercent}%;height:100%;background:#1976d2;"></div>
          </div>
          <span>${totalObama.toLocaleString()}</span>
        </div
        <span style="color:#ff5722;width:60px;">Trump:</span>
          <div style="flex:1;height:8px;background:#222;border-radius:4px;overflow:hidden;margin:0 8px;">
            <div style="width:${trumpPercent}%;height:100%;background:#ff5722;"></div>
          </div>
          <span>${totalTrump.toLocaleString()}</span>
        </div>
      </div>
      <div style="color:#aaa;">
        <div>Unique Countries: ${uniqueCountries}</div>
        <div>Time Period: ${formatDateRange(x.domain()[0], x.domain()[1])}</div>
      </div>
    `;
    
    // Store in cache and update UI
    statsCache.set(cacheKey, statsHTML);
    statsContainer.innerHTML = statsHTML;
  }
  
  // Helper function to format date range nicely
  function formatDateRange(start, end) {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} to ${endStr}`;
  }

  // Function to update the sidebar with country info when a country is selected
  function updateCountrySidebar(country) {
    // Skip if no specific country is selected
    if (!country || country === "all") {
      setDefaultSidebar();
      return;
    }
    
    // Get country info or use default if not found
    const info = countryInfo[country] || defaultCountryInfo;
    
    // Create HTML for the country information
    const countryHTML = `
      <div style="background:rgba(30,30,30,0.7);border-radius:10px;padding:20px;margin-bottom:20px;border:1px solid #333;">
        <h3 style="margin-top:0;color:#1976d2;border-bottom:1px solid #444;padding-bottom:8px;">${country}</h3>
        <p style="margin-bottom:15px;"><strong>Overview:</strong> ${info.overview}</p>
        
        <div style="margin-bottom:15px;">
          <strong>Key Events:</strong>
          <ul style="margin-top:5px;padding-left:20px;color:#ccc;">
            ${info.keyEvents.map(event => `<li>${event}</li>`).join('')}
          </ul>
        </div>
        
        <div style="margin-bottom:15px;">
          <strong>Diplomatic Relations:</strong>
          <div style="color:#ccc;margin-top:5px;">${info.diplomaticRelations}</div>
        </div>
        
        <div>
          <strong>Trade Volume:</strong>
          <div style="color:#ccc;margin-top:5px;">${info.tradeVolume}</div>
        </div>
      </div>
      
      <div style="background:rgba(30,30,30,0.7);border-radius:10px;padding:20px;border:1px solid #333;">
        <h3 style="margin-top:0;color:#1976d2;border-bottom:1px solid #444;padding-bottom:8px;">Quick Stats</h3>
        <div id="stats-container" style="font-size:13px;"></div>
      </div>
    `;
    
    // Update the sidebar
    right.innerHTML = countryHTML;
  }

  // Brush functions with improved performance
  function brushing(event) {
    if (event.selection) {
      const [x0, x1] = event.selection.map(originalX.invert);
      x.domain([x0, x1]);
      render(select.value);
    }
  }

  function brushEnded(event) {
    if (!event.selection) {
      x.domain(originalX.domain());
      render(select.value);
    }
  }

  // Reset zoom button event handler
  resetButton.addEventListener("click", () => {
    x.domain(originalX.domain());
    brushGroup.call(brush.move, null);
    render(select.value);
  });

  // Process and filter the data before rendering
  function filterData(data, country, timeFilter) {
    let filtered = [...data];

    // Country filter
    if (country !== "all") {
      filtered = filtered.filter(d => d.country === country);
    }

    // Presidential filters
    filtered = filtered.filter(d => {
      if (d.president === "Obama" && !active.Obama) return false;
      if (d.president === "Trump" && !active.Trump) return false;
      return true;
    });

    // Time filter - Changed to handle yearly filters
    if (timeFilter !== "all") {
      if (timeFilter === "obama") {
        filtered = filtered.filter(d => d.president === "Obama");
      } else if (timeFilter === "trump") {
        filtered = filtered.filter(d => d.president === "Trump");
      } else if (timeFilter.startsWith("year-")) {
        const year = parseInt(timeFilter.split("-")[1]);
        filtered = filtered.filter(d => d.month.getFullYear() === year);
      }
    }

    // Filter by current x domain from brush
    filtered = filtered.filter(d => {
      const date = d.month;
      return date >= x.domain()[0] && date <= x.domain()[1];
    });

    return filtered;
  }

  // Main render function with optimizations
  function render(selectedCountry) {
    // Show country info in sidebar when a country is selected
    updateCountrySidebar(selectedCountry);
    
    // Filter data
    const filteredData = filterData(tweets, selectedCountry, timeSelect.value);
    
    // Update stats with filtered data
    updateStats(filteredData);

    // Show y-axis for line charts only when a specific country is selected
    const isCountrySelected = selectedCountry !== "all";
    
    // Handle y-axis visibility with smooth transition
    yAxis.transition().duration(500)
      .style("opacity", isCountrySelected ? 1 : 0);
    
    yAxisLabel.transition().duration(500)
      .style("opacity", isCountrySelected ? 1 : 0);

    // Clear previous elements
    pathGroup.selectAll("*").remove();
    areaGroup.selectAll("*").remove();
    pointsGroup.selectAll("*").remove();
    countryLabelsGroup.selectAll("*").remove();
    
    // Update x-axis with smooth transition
    xAxis.transition().duration(300).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")).ticks(6));
    
    // Update y-axis scale if needed for specific country view
    if (isCountrySelected) {
      const maxY = d3.max(filteredData, d => d.count) || 0;
      y.domain([0, maxY * 1.1]).nice();
      yAxis.transition().duration(300).call(d3.axisLeft(y).ticks(5));
    }

    // GROUP BY COUNTRY
    if (selectedCountry === "all") {
      // Group data by country to get the total mentions for each country
      const countryTotals = d3.rollup(
        filteredData,
        v => d3.sum(v, d => d.count),
        d => d.country
      );
      
      // Convert to array and sort by total mentions
      const sortedCountries = Array.from(countryTotals, ([country, total]) => ({ country, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);  // Show top 15 countries
      
      // Create barcode representation
      const countryScale = d3.scaleBand()
        .domain(sortedCountries.map(d => d.country))
        .range([0, height])
        .padding(0.2);
      
      // Create barcode lines with improved styling
      barcodeGroup.selectAll(".country-line")
        .data(sortedCountries)
        .join("rect")
        .attr("class", "country-line")
        .attr("x", 0)
        .attr("y", d => countryScale(d.country))
        .attr("width", width)
        .attr("height", countryScale.bandwidth())
        .attr("fill", "rgba(80,80,80,0.1)")
        .attr("rx", 3)
        .attr("ry", 3);
      
      // Add country labels with improved styling
      countryLabelsGroup.selectAll(".country-label")
        .data(sortedCountries)
        .join("text")
        .attr("class", "country-label")
        .attr("x", -8)
        .attr("y", d => countryScale(d.country) + countryScale.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("fill", "#ccc")
        .style("font-size", "13px")
        .style("font-weight", d => d.total > d3.median(sortedCountries, c => c.total) ? "600" : "400")
        .text(d => d.country);
      
      // Add total count on the right
      countryLabelsGroup.selectAll(".count-label")
        .data(sortedCountries)
        .join("text")
        .attr("class", "count-label")
        .attr("x", width + 8)
        .attr("y", d => countryScale(d.country) + countryScale.bandwidth() / 2)
        .attr("dominant-baseline", "middle")
        .style("fill", "#aaa")
        .style("font-size", "12px")
        .text(d => d.total.toLocaleString());
      
      // Group data by country and president
      const nestedData = d3.groups(filteredData, d => d.country);
      
      nestedData.forEach(([country, countryData]) => {
        // Skip if not in our top countries
        if (!sortedCountries.some(c => c.country === country)) return;
        
        // Group by president
        const presData = d3.groups(countryData, d => d.president);
        
        presData.forEach(([president, data]) => {
          // Skip if president is toggled off
          if ((president === "Obama" && !active.Obama) || 
              (president === "Trump" && !active.Trump)) return;
          
          // Group by month for time series
          const byMonth = d3.groups(data, d => d.month.getTime())
            .map(([time, group]) => ({
              month: new Date(time),
              count: d3.sum(group, d => d.count),
              president
            }))
            .sort((a, b) => a.month - b.month);
          
          // Draw dots for each mention
          pointsGroup.selectAll(`.dot-${country}-${president}`)
            .data(byMonth.filter(d => d.count > 0))
            .join("circle")
            .attr("class", `dot-${country}-${president}`)
            .attr("cx", d => x(d.month))
            .attr("cy", d => countryScale(country) + countryScale.bandwidth() / 2)
            .attr("r", d => Math.max(3, Math.min(6, Math.sqrt(d.count) * 1.2)))
            .attr("fill", d => color(d.president))
            .attr("stroke", "#222")
            .attr("stroke-width", 1)
            .attr("opacity", 0.8)
            .on("mouseenter", function(event, d) {
              d3.select(this).attr("r", d => Math.max(4, Math.min(8, Math.sqrt(d.count) * 1.5)))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);
              
              tooltip.transition()
                .duration(100)
                .style("opacity", 1)
                .style("transform", "translateY(0)");
                
              tooltip.html(`
                <div style="font-weight:600;margin-bottom:8px;color:#fff;border-bottom:1px solid #444;padding-bottom:5px;">
                  ${country}
                </div>
                <div style="margin-bottom:5px;">
                  <span style="color:${color(d.president)};font-weight:600;">${d.president}</span> mentioned 
                  <span style="font-weight:600;">${d.count}</span> time${d.count !== 1 ? 's' : ''}
                </div>
                <div style="color:#aaa;font-size:12px;">
                  ${d.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
              `)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 25) + "px");
            })
            .on("mousemove", function(event) {
              tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 25) + "px");
            })
            .on("mouseleave", function() {
              d3.select(this).attr("r", d => Math.max(3, Math.min(6, Math.sqrt(d.count) * 1.2)))
                .attr("stroke", "#222")
                .attr("stroke-width", 1);
                
              tooltip.transition()
                .duration(200)
                .style("opacity", 0)
                .style("transform", "translateY(10px)");
            });
        });
      });
      
    } else {
      // SPECIFIC COUNTRY VIEW - Show line chart
      barcodeGroup.selectAll("*").remove(); // Clear barcodes
      
      // Group data by president
      const presData = d3.groups(filteredData, d => d.president);
      
      presData.forEach(([president, data]) => {
        // Skip if president is toggled off
        if ((president === "Obama" && !active.Obama) || 
            (president === "Trump" && !active.Trump)) return;
        
        // Group by month and sort chronologically
        const byMonth = d3.groups(data, d => d.month.getTime())
          .map(([time, group]) => ({
            month: new Date(time),
            count: d3.sum(group, d => d.count),
            president
          }))
          .sort((a, b) => a.month - b.month);
        
        // Draw area chart
        areaGroup.append("path")
          .datum(byMonth)
          .attr("class", `area-${president}`)
          .attr("d", area)
          .attr("fill", fillColor(president))
          .attr("opacity", 0.5);
        
        // Draw line
        pathGroup.append("path")
          .datum(byMonth)
          .attr("class", `line-${president}`)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", color(president))
          .attr("stroke-width", 2.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round");
        
        // Draw points with enhanced interactivity
        pointsGroup.selectAll(`.dot-${president}`)
          .data(byMonth)
          .join("circle")
          .attr("class", `dot-${president}`)
          .attr("cx", d => x(d.month))
          .attr("cy", d => y(d.count))
          .attr("r", d => Math.max(3, Math.min(6, Math.sqrt(d.count))))
          .attr("fill", d => color(d.president))
          .attr("stroke", "#222")
          .attr("stroke-width", 1)
          .on("mouseenter", function(event, d) {
            d3.select(this)
              .attr("r", d => Math.max(4, Math.min(8, Math.sqrt(d.count) * 1.2)))
              .attr("stroke", "#fff")
              .attr("stroke-width", 2);
            
            tooltip.transition()
              .duration(100)
              .style("opacity", 1)
              .style("transform", "translateY(0)");
              
            tooltip.html(`
              <div style="font-weight:600;margin-bottom:8px;color:#fff;border-bottom:1px solid #444;padding-bottom:5px;">
                ${selectedCountry}
              </div>
              <div style="margin-bottom:5px;">
                <span style="color:${color(d.president)};font-weight:600;">${d.president}</span> mentioned 
                <span style="font-weight:600;">${d.count}</span> time${d.count !== 1 ? 's' : ''}
              </div>
              <div style="color:#aaa;font-size:12px;">
                ${d.month.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 25) + "px");
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 25) + "px");
          })
          .on("mouseleave", function() {
            d3.select(this)
              .attr("r", d => Math.max(3, Math.min(6, Math.sqrt(d.count))))
              .attr("stroke", "#222")
              .attr("stroke-width", 1);
              
            tooltip.transition()
              .duration(200)
              .style("opacity", 0)
              .style("transform", "translateY(10px)");
          });
      });
      
      // Add event markers if we have any for this country
      if (events && events.length > 0) {
        const countryEvents = events.filter(e => e.countries.includes(selectedCountry));
        
        eventMarkersGroup.selectAll("*").remove();
        
        if (countryEvents.length > 0) {
          eventMarkersGroup.selectAll(".event-marker")
            .data(countryEvents)
            .join("line")
            .attr("class", "event-marker")
            .attr("x1", d => x(d.date))
            .attr("x2", d => x(d.date))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.4);
          
          // Add event label dots with tooltips
          eventMarkersGroup.selectAll(".event-dot")
            .data(countryEvents)
            .join("circle")
            .attr("class", "event-dot")
            .attr("cx", d => x(d.date))
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", "#fff")
            .attr("stroke", "#222")
            .attr("opacity", 0.8)
            .attr("cursor", "pointer")
            .on("mouseenter", function(event, d) {
              d3.select(this)
                .attr("r", 7)
                .attr("opacity", 1);
              
              tooltip.transition()
                .duration(100)
                .style("opacity", 1)
                .style("transform", "translateY(0)");
                
              tooltip.html(`
                <div style="font-weight:600;margin-bottom:8px;color:#fff;border-bottom:1px solid #444;padding-bottom:5px;">
                  ${d.title}
                </div>
                <div style="margin-bottom:5px;">
                  ${d.description}
                </div>
                <div style="color:#aaa;font-size:12px;">
                  ${d.date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
              `)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 25) + "px");
            })
            .on("mousemove", function(event) {
              tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 25) + "px");
            })
            .on("mouseleave", function() {
              d3.select(this)
                .attr("r", 5)
                .attr("opacity", 0.8);
                
              tooltip.transition()
                .duration(200)
                .style("opacity", 0)
                .style("transform", "translateY(10px)");
            });
        }
      }
    }
    
    // Add mini overview lines to the focus chart every time we filter
    focusGroup.selectAll(".focus-line").remove();
    
    // Group data by president for the focus chart
    const focusByPresident = d3.groups(tweets, d => d.president);
    
    focusByPresident.forEach(([president, data]) => {
      // Skip if president is toggled off
      if ((president === "Obama" && !active.Obama) || 
          (president === "Trump" && !active.Trump)) return;
      
      // Group by month for time series
      const byMonth = d3.rollup(
        data, 
        v => d3.sum(v, d => d.count),
        d => d.month.getTime()
      );
      
      const focusData = Array.from(byMonth, ([time, count]) => ({
        month: new Date(time),
        count
      })).sort((a, b) => a.month - b.month);
      
      // Draw line in focus chart
      focusGroup.append("path")
        .datum(focusData)
        .attr("class", `focus-line focus-line-${president}`)
        .attr("d", focusLine)
        .attr("fill", "none")
        .attr("stroke", color(president))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.7);
    });
  }

  // Event listeners for filters
  select.addEventListener("change", () => {
    render(select.value);
  });
  
  timeSelect.addEventListener("change", () => {
    render(select.value);
  });

  // Initial render
  render("all");

  // Return the container for the visualization
  return container;
}
        