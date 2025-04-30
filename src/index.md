---
toc: false
---

<!-- Title -->
<div class="hero">
  <h1>Reading The Room</h1>
  <h2>Exploring the intersection of social media and politics.</h2>
</div>

<!-- Tweet Sentiment Analysis -->
<h2>Tweet Sentiment Analysis</h2>
<p>Each tweet is classified using <a href="https://medium.com/@rslavanyageetha/vader-a-comprehensive-guide-to-sentiment-analysis-in-python-c4f1868b0d2e">NLP</a> based on its overall sentiment. The model (VADER) rates each tweet on a scale of -1 (very negative) to 1 (very positive).</p>

<!-- Main Visualization -->
<div class="grid grid-cols-1" style="grid-auto-rows: 630px;">
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
    <!-- show/hide events -->
    show/hide events button
  </div>
  <div class="card">
    <!-- other -->
    ? data / toggle stock market data / something
  </div>
</div>

<!-- JavaScript Section -->
```js
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

  // Combine both datasets
  const monthlyDataFilled = [...obamaMonthlyDataFilled, ...trumpMonthlyDataFilled];

  const obamaApprovalMonthlyFilled = fillMissingMonths(
    obamaApprovalMonthlyData,
    d3.min(obamaApprovalMonthlyData, d => d.month),
    d3.max(obamaApprovalMonthlyData, d => d.month),
    "Obama"
  );

  const trumpApprovalMonthlyFilled = fillMissingMonths(
    trumpApprovalMonthlyData,
    d3.min(trumpApprovalMonthlyData, d => d.month),
    d3.max(trumpApprovalMonthlyData, d => d.month),
    "Trump"
  );

  const normalizeApproval = data => data.map(d => ({
    ...d,
    norm: (d.avg - 30) / 30 - 1
  }));

const obamaApprovalNorm = normalizeApproval(obamaApprovalMonthlyFilled);
const trumpApprovalNorm = normalizeApproval(trumpApprovalMonthlyFilled);

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

  // Get the width of the parent container
  const containerWidth = document.body.clientWidth;

  // Create the scatter plot
  const plot = Plot.plot({
    width: containerWidth - 50,
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
    marks: [
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
      // Plot.line(obamaApprovalNorm, {
      //   x: "month",
      //   y: "norm",
      //   stroke: "rgb(170, 255, 0)",
      //   strokeWidth: 4,
      //   curve: "natural",
      // }),
      // Plot.line(trumpApprovalNorm, {
      //   x: "month",
      //   y: "norm",
      //   stroke: "rgb(170, 255, 0)",
      //   strokeWidth: 4,
      //   curve: "natural",
      // }),
      Plot.axisY({ anchor: "left", label: "Sentiment Score", ticks: 5 }),
    ],
  });

  // Append the plot to a container
  const container = document.createElement("div");
  container.appendChild(plot);
  document.body.appendChild(container);

  // Add hover interaction to dots
  const dots = container.querySelectorAll("circle");
  dots.forEach((dot, i) => {
    dot.addEventListener("mouseover", (event) => {
      const tweet = allTweets[i];
      
      // Enlarge the dot
      dot.setAttribute("r", "10"); 
      dot.setAttribute("fill", "white"); 

      // Show tooltip
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

  return plot;
}
```

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 2rem 0 4rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 0rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>