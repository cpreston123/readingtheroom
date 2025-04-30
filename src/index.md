---
toc: false
---
<!-- Title -->
<div class="hero">
  <h1>Reading The Room</h1>
  <h2>Exploring the intersection of social media and politics.</h2>
</div>

<!-- Tweet Sentiment Analysis -->
<h1> Tweet Sentiment Analysis 😊😐🙁 </h1>
<p> Each tweet is classified using <a href="https://medium.com/@rslavanyageetha/vader-a-comprehensive-guide-to-sentiment-analysis-in-python-c4f1868b0d2e">NLP</a> based on its overall sentiment. The model (VADER) rates each tweet on a scale of -1 (very negative) to 1 (very positive). </p>

<!-- Main Visualization -->
<div class="grid grid-cols-1" style="grid-auto-rows: 650px;">
  <div class="card">${await tweetScatterPlot()}</div>
</div>

<!-- Data Summary -->
<div class="grid grid-cols-4">
  <div class="card">
    <h2>Obama Tweets</h2>
    <span class="big">${(await getTweetData()).obamaCount.toLocaleString("en-US")}</span>
    <p>Average sentiment: ${(await getTweetData()).obamaAvg.toFixed(2)}</p>
  </div>
  <div class="card">
    <h2>Trump Tweets</h2>
    <span class="big">${(await getTweetData()).trumpCount.toLocaleString("en-US")}</span>
    <p>Average sentiment: ${(await getTweetData()).trumpAvg.toFixed(2)}</p>
  </div>
  <div class="card">
    <h2>Key Events</h2>
    <button id="toggleEvents" class="event-button">Show Events</button>
    <p>Click on an event to see more details</p>
  </div>
  <div class="card">
    <!-- other -->
    ? data / toggle stock market data / something
  </div>
  
</div>


<!-- Country mentions -->
<p class="countryplotmargin"></p>

<h1 class="country-heading">What countries do President's mention most? 🌎</h1>
<p>This analysis examines how frequently U.S. presidents reference foreign nations in their tweets, revealing geopolitical priorities and diplomatic focus areas.</p>
<div class="card" >${tweetTimeline(tweets, events)}</div>




<!-- JavaScript Section -->
```js
import {tweetTimeline} from "./components/tweettimeline.js";

const tweets = await FileAttachment("data/tweet_mentions_by_month.csv").csv({typed: true});
const events = await FileAttachment("data/events_political.csv").csv({typed: true});


async function loadTweets() {
  const tweets = await FileAttachment("data/final_combined_tweets.csv").csv({typed: true});
  tweets.forEach(d => {
    d.date = new Date(d.date);
    d.tweetUrl = `https://x.com/retrieve/status/${d.id}`;
    d.formattedDate = d.date.toISOString().split('T')[0];
  });
  return tweets;
}

async function loadApprovalData() {
  const obamaData = await FileAttachment("data/obama_approval_cleaned.csv").csv({typed: true});
  const trumpData = await FileAttachment("data/trump_approval_cleaned.csv").csv({typed: true});

  obamaData.forEach(d => {
    d.date = new Date(d.Date);
    d.approve = d.Approve;
    d.president = "Obama";
  });

  trumpData.forEach(d => {
    d.date = new Date(d.Date);
    d.approve = d["% Approve"];
    d.president = "Trump";
  });

  return [...obamaData, ...trumpData];
}

// CACHES
let tweetDataCache, approvalDataCache;

async function getTweetData() {
  if (!tweetDataCache) {
    const tweets = await loadTweets();
    const obamaTweets = tweets.filter(d => d.source.toLowerCase() === "obama");
    const trumpTweets = tweets.filter(d => d.source.toLowerCase() === "trump");

    tweetDataCache = {
      allTweets: tweets,
      obamaCount: obamaTweets.length,
      trumpCount: trumpTweets.length,
      obamaAvg: d3.mean(obamaTweets, d => d.compound) || 0,
      trumpAvg: d3.mean(trumpTweets, d => d.compound) || 0
    };
  }
  return tweetDataCache;
}

async function getApprovalData() {
  if (!approvalDataCache) {
    const data = await loadApprovalData();
    const obamaData = data.filter(d => d.president === "Obama");
    const trumpData = data.filter(d => d.president === "Trump");

    approvalDataCache = {
      allData: data,
      obamaAvg: d3.mean(obamaData, d => d.approve),
      trumpAvg: d3.mean(trumpData, d => d.approve),
      obamaMinDate: d3.min(obamaData, d => d.date),
      obamaMaxDate: d3.max(obamaData, d => d.date),
      trumpMinDate: d3.min(trumpData, d => d.date),
      trumpMaxDate: d3.max(trumpData, d => d.date)
    };
  }
  return approvalDataCache;
}

const eventsData = [
  { 
    date: "2013-9-07", actualDate: "September 7, 2013", y: 0.08, label: "Sarin gas attack near Damascus kills over 1,400 people.", description: "In September 2013, the Assad regime was accused of using sarin gas against civilians in Ghouta, a rebel-held suburb of Damascus. The attack drew widespread international condemnation as a violation of human rights and international law.", type: "negative", image: "https://s.abcnews.com/images/International/AP_syria_shelling_tk_130826_16x9_992.jpg?w=384"
  },
  { 
    date: "2017-01-02", actualDate: "January 20, 2017", y: 0.1, label: "Donald Trump becomes 45th president of the United States.", description: "Donald Trump being sworn in at the Capitol Building, marking a major political shift as he became the first U.S. president without prior military or political experience.", type: "neutral", image: "https://d3i6fh83elv35t.cloudfront.net/static/2025/01/2025-01-20T171551Z_523879963_RC2SDCATM4KG_RTRMADP_3_USA-TRUMP-INAUGURATION-1024x645.jpg" 
  },
  { 
    date: "2018-10-01", actualDate: "September 17, 2018", y: 0.32, label: "U.S. economic growth and Idlib demilitarized zone", description: " In September 2018, the U.S. economy saw strong performance, with unemployment hitting a near 50-year low of 3.7% and consumer confidence reaching its highest level since 2000. Meanwhile, an agreement between Russia and Turkey established a demilitarized zone in Idlib, Syria, preventing a major humanitarian crisis in the region.", type: "positive", image: "https://iadsb.tmgrup.com.tr/b4da94/0/0/0/0/800/534?u=https://idsb.tmgrup.com.tr/2018/09/17/erdogan-putin-agree-on-demilitarized-zone-in-syrias-idlib-1537203299858.jpg"
  }
].map(d => ({
  ...d,
  date: new Date(d.date),
}));


async function tweetScatterPlot() {
  const { allTweets } = await getTweetData();
  const { allData } = await getApprovalData();

  const obamaMonthlyData = d3.rollups(
    allTweets.filter(d => d.source.toLowerCase() === "obama"),
    v => d3.mean(v, d => d.compound),
    d => d3.utcMonth.floor(d.date)
  ).map(([month, avg]) => ({ month, avg, source: "Obama" }));

  const trumpMonthlyData = d3.rollups(
    allTweets.filter(d => d.source.toLowerCase() === "trump"),
    v => d3.mean(v, d => d.compound),
    d => d3.utcMonth.floor(d.date)
  ).map(([month, avg]) => ({ month, avg, source: "Trump" }));
  
  const obamaApprovalMonthlyData = d3.rollups(
    allData.filter(d =>
      d.president.toLowerCase() === "obama" &&
      d.date >= new Date("2013-01-21") &&
      d.date <= new Date("2017-01-16")
    ),
    v => d3.mean(v, d => d.approve),
    d => d3.utcMonth.floor(d.date)
  ).map(([month, avg]) => ({ month, avg, source: "Obama" }));

  const trumpApprovalMonthlyData = d3.rollups(
    allData.filter(d =>
      d.president.toLowerCase() === "trump" &&
      d.date >= new Date("2017-01-20") &&
      d.date <= new Date("2021-01-04")
    ),
    v => d3.mean(v, d => d.approve),
    d => d3.utcMonth.floor(d.date)
  ).map(([month, avg]) => ({ month, avg, source: "Trump" }));

  function fillMissingMonths(data, startDate, endDate, source) {
    const months = d3.utcMonths(startDate, endDate);
    const monthMap = new Map(data.map(d => [d.month.toISOString(), d.avg]));
    
    return months.map(month => ({
      month,
      avg: monthMap.get(month.toISOString()) || null,
      source
    }));
  }

  // Define the date range based on all tweets
  const startDate = d3.utcMonth.floor(d3.min(allTweets, d => d.date));
  const endDate = d3.utcMonth.ceil(d3.max(allTweets, d => d.date));

  // Fill missing months for each source
  const obamaMonthlyDataFilled = fillMissingMonths(obamaMonthlyData, startDate, endDate, "Obama");
  const trumpMonthlyDataFilled = fillMissingMonths(trumpMonthlyData, startDate, endDate, "Trump");

  // Create main container
  const container = document.createElement("div");
  container.className = "visualization-container";
  
  // Create plot container
  const plotContainer = document.createElement("div");
  plotContainer.className = "plot-area";

  // Create details panel
  const detailsPanel = document.createElement("div");
  detailsPanel.className = "details-panel";
  detailsPanel.style.display = "none";
  detailsPanel.innerHTML = `
    <div class="details-panel">
        <button class="close-button">×</button>
        <div class="event-info">
          <h3 id="event-title">Event Title</h3>
          <p id="event-date" class="event-date">Event Date</p>
          <div>
            <img id="event-image" class="event-image" src="" alt="Event image">
          </div>
          <p id="event-description" class="event-description">Event description will appear here.</p>
        </div>
    </div>
  `;

  container.appendChild(plotContainer);
  container.appendChild(detailsPanel);

  // Create a tooltip element
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.background = "white";
  tooltip.style.border = "1px solid #ccc";
  tooltip.style.borderRadius = "8px";
  tooltip.style.padding = "7px";
  tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
  tooltip.style.fontSize = "14px";
  tooltip.style.color = "#333";
  tooltip.style.display = "none";
  tooltip.style.zIndex = "1000";
  tooltip.style.pointerEvents = "none";
  tooltip.style.maxWidth = "300px";
  document.body.appendChild(tooltip);

  // State for whether events are shown
  let showEvents = false;
  
  // Get the toggle button from the DOM
  const toggleButton = document.getElementById("toggleEvents");
  
  function redrawPlot() {
    // Clear previous plot
    while (plotContainer.firstChild) {
      plotContainer.removeChild(plotContainer.firstChild);
    }
    
    const marks = [
      Plot.ruleY([0]),
      Plot.dot(allTweets, {
        x: "date",
        y: "compound",
        stroke: "source",
        r: 1.5,
      }),
      Plot.line(obamaMonthlyDataFilled, {
        x: "month",
        y: "avg",
        stroke: "white",
        strokeWidth: 4,
        curve: "natural",
      }),
      Plot.line(trumpMonthlyDataFilled, {
        x: "month",
        y: "avg",
        stroke: "white",
        strokeWidth: 4,
        curve: "natural",
      }),
      Plot.axisY({ anchor: "left", label: "Sentiment Score", ticks: 5 }),
    ];
    
    if (showEvents) {
      marks.push(
        Plot.dot(eventsData, {
          x: "date",
          y: d => d.y,
          fill: d => {
            switch(d.type) {
              case "positive": return "green";
              case "negative": return "red";
              default: return "gray";
            }
          },
          r: 10,
          stroke: "white",
          strokeWidth: 2,
          title: d => `${d.label}\n${d.description}`,
          style: "cursor: pointer"
        })
      );
    }
    
    const plot = Plot.plot({
      width: Math.max(1400, plotContainer.clientWidth - 50),
      height: 580,
      marginBottom: 50,
      marginTop: 30,
      y: { grid: true, label: "Sentiment Score", domain: [-1, 1] },
      x: { label: "Date" },
      color: { 
        legend: true,
        domain: ["Obama", "Trump", "Average Sentiment"],
        range: ["rgb(25, 82, 186)", "rgb(237, 164, 27)", "rgb(255, 255, 255)"]
      },
      marks
    });
    
    plotContainer.appendChild(plot);
    
    // Reattach hover events for tweets
    const tweetDots = container.querySelectorAll("circle");
    tweetDots.forEach((dot, i) => {
      if (i >= allTweets.length) return; // Skip event dots
      
      dot.addEventListener("mouseover", (event) => {
        const tweet = allTweets[i];
        dot.setAttribute("r", "10");
        dot.setAttribute("fill", "white");
        
        tooltip.innerHTML = `
          <div style="background: linear-gradient(30deg, var(--theme-foreground-focus), red); padding: 8px; color: white; font-weight: bold; border-radius: 8px 8px 0 0;">
            ${tweet.source}
          </div>
          <div style="padding: 10px;">
            <p><strong>Date:</strong> ${tweet.formattedDate}</p>
            <p><strong>Sentiment:</strong> ${tweet.compound.toFixed(2)}</p>
            <p>${tweet.text}</p>
          </div>
        `;
        tooltip.style.display = "block";
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
      });

      dot.addEventListener("mousemove", (event) => {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
      });

      dot.addEventListener("mouseout", () => {
        dot.setAttribute("r", "1.5");
        tooltip.style.display = "none";
        dot.setAttribute("fill", "none");
      });
    });
    
    // Add click handlers for event dots
    if (showEvents) {
      const eventDots = container.querySelectorAll("circle");
      eventDots.forEach((dot, i) => {
        if (i < allTweets.length) return; // Skip tweet dots
        
        const eventIndex = i - allTweets.length;
        if (eventIndex >= eventsData.length) return;
        
        const event = eventsData[eventIndex];
        
        dot.addEventListener("click", () => {
          // Update details panel with event information
          document.getElementById("event-title").textContent = event.label;
          document.getElementById("event-date").textContent = event.actualDate;
          document.getElementById("event-description").textContent = event.description;
          document.getElementById("event-image").src = event.image;
          
          // Show the details panel
          detailsPanel.style.display = "block";
        });
      });
    }
    
    // Add close button handler
    const closeButton = detailsPanel.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      detailsPanel.style.display = "none";
    });
  }
  
  // Toggle button click handler
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      showEvents = !showEvents;
      toggleButton.textContent = showEvents ? "Hide Events" : "Show Events";
      redrawPlot();
    });
  }
  
  // Initial draw
  redrawPlot();
  
  return container;
}
```
<style> .hero { display: flex; flex-direction: column; align-items: center; font-family: var(--sans-serif); margin: 2rem 0 4rem; text-align: center; } 

h1 {
  white-space: nowrap; /* Prevent wrapping */
  overflow: visible; /* Allow overflow if needed */
  text-overflow: clip; /* Don't show ellipsis */
  max-width: 100%; /* Ensure it can expand */
}

h2 {
  white-space: nowrap; /* Prevent wrapping */
  overflow: visible; /* Allow overflow if needed */
  text-overflow: clip; /* Don't show ellipsis */
  max-width: 100%; /* Ensure it can expand */
}

.hero h1 { margin: 0rem 0; padding: 1rem 0; max-width: none; font-size: 14vw; font-weight: 900; line-height: 1; background: linear-gradient(30deg, var(--theme-foreground-focus), red); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; } 

.hero h2 { margin: 0; max-width: 34em; font-size: 20px; font-style: initial; font-weight: 500; line-height: 1.5; color: var(--theme-foreground-muted); } 

@media (min-width: 640px) { .hero h1 { font-size: 90px; } } .event-button { padding: 8px 16px; border-radius: 4px; border: none; background-color: var(--theme-foreground-focus); color: white; cursor: pointer; width: 100%; margin-top: 10px; } .event-button:hover { opacity: 0.9; } .visualization-container { display: flex; width: 100%; height: 100%; position: relative; } .plot-area { flex: 1; padding-right: 20px; } .details-panel { width: 300px; background: white; border-left: 1px solid #eee; padding: 20px; box-shadow: -5px 0 15px rgba(0,0,0,0.05); overflow-y: auto; height: 100%; } .details-content { position: relative; height: 100%; } .close-button { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer; color: #666; } .close-button:hover { color: #333; } .event-details { margin-top: 20px; } .event-date { color: #666; font-style: italic; margin-bottom: 15px; } .event-image { width: 100%; margin-top: 15px; border-radius: 4px; } 

/* Updated CSS for details panel */
.details-panel {
  width: 350px;
  background:rgb(226, 226, 226);
  border-left: 1px solid #eee;
  padding: 0;
  overflow-y: auto;
  height: 100%;
  border-radius: 10px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background:rgb(255, 255, 255);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background:rgb(212, 212, 212);
  color: #333;
}

#event-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  
}

.event-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.event-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.event-info {
  margin: 20px;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-image:hover {
  transform: scale(1.03);
}

.event-description{
  color: black;
}

.countryplotmargin{
  margin-top:70px;
}

</style>