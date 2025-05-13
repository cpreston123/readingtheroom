---
toc: false
---
<link rel="icon" href="data/icon.png" />
<!-- Title -->
<div class="hero">
  <h1>Reading The Room</h1>
  <h2>Exploring the intersection of social media and politics.</h2>
</div>

<div class="image-showcase">
  <img src="https://media.newyorker.com/photos/590978342179605b11ad889e/master/pass/Cunningham-ObamaandtheCollapseofOurCommonAmericanLanguage2.jpg
  " class="scroll-img img1" alt="Image 1" />
  <img src="https://news.uchicago.edu/sites/default/files/styles/full_width/public/images/2022-01/capitol-riot-jan-6.jpg?itok=fNfNJ7TK" class="scroll-img img2" alt="Image 2" />
  <img src="https://m.media-amazon.com/images/I/71kXH-+B4gL._AC_UF894,1000_QL80_.jpg" class="scroll-img img3" alt="Image 3" />
  <img src="https://api.time.com/wp-content/uploads/2020/06/best-global-responses-covid-03.jpg" class="scroll-img img4" alt="Image 4" />
  <img src="https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/19859702/1189044734.jpg.jpg?quality=90&strip=all&crop=0%2C0.015827793605567%2C100%2C99.968344412789&w=2400" class="scroll-img img5" alt="Image 5" />
</div>

<div class="halfverticalspace"><div>
<div class="centeredtext">...<div>
<div class="halfverticalspace"><div>

<div class="centeredtext">
  <p>
    Welcome to <em>Reading the Room</em>, an exploration of how U.S. presidents use Twitter to communicate sentiment and signal geopolitical focus. By analyzing thousands of tweets, we can detect patterns in tone, timing, and messaging. 
  </p>
  <p>See our write-up <a href="https://medium.com/@cpp2129/reading-the-room-3d67b0743d53" target="_blank">here</a> and our codebase <a href="https://github.com/cpreston123/readingtheroom" target="_blank">here</a>.
</p>
</div>

<div class="centeredtext">...<div>
<div class="halfverticalspace"><div>
<div class="halfverticalspace"><div>

<div class="centeredtext">
  <h1> Tweet Sentiment Analysis 😊😐🙁 </h1>
</div>

<div class="lefttext">
  <p> Our analysis focuses on a very large dataset of tweets (over 45,000!). Our dataset contains all of Barack Obama's tweets from his 2013-2017 term and all of Donald Trump's tweets from his 2017-2021 term.
  
  We classify each tweet using <a href="https://medium.com/@rslavanyageetha/vader-a-comprehensive-guide-to-sentiment-analysis-in-python-c4f1868b0d2e">NLP</a> based on its overall sentiment. The model (VADER) rates each tweet on a scale of -1 (very negative) to 1 (very positive). </p>

  👉 How to explore:
  - Use the search bar to filter tweets by keyword (e.g., "Covid", "Russia", "jobs").
  - Matching tweets are highlighted on the graph and shown in the sidebar.
  - Below the search bar, the top 10 words from matching tweets appear — click any to start a new search.
  - You can also toggle event markers to view key political moments by cliking "Show Events." Click on an event dot to see more details.
</div>

<div class="halfverticalspace"><div>


<div style="margin-bottom: 1rem;">
  <label for="wordSearch" style="font-weight: bold; margin-right: 0.5rem;">Search tweets by word:</label>
  <input type="text" id="wordSearch" placeholder="Enter a keyword..." 
         style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; width: 250px;" />
</div>

<div id="top-words-wrapper" style="margin-top: 1rem;">
  <div id="top-words-list" style="display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
</div>

<!-- Main Visualization -->
<div class="grid grid-cols-1" style="grid-auto-rows: 650px;">
  <div class="card">${await tweetScatterPlot()}</div>
</div>

<!-- Data Summary -->
<div class="grid grid-cols-4">
  <div class="card">
    <h2>Obama Tweets</h2>
    <span class="big">${(await getTweetData()).obamaCount.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Trump Tweets</h2>
    <span class="big">${(await getTweetData()).trumpCount.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Key Events - Click to see more details</h2>
    <button id="toggleEvents" class="event-button">Show Events</button>
  </div>
  <div class="card">
    <h2>Average Sentiment</h2>
    <p>Trump: ${(await getTweetData()).trumpAvg.toFixed(2)} &nbsp; &nbsp; &nbsp; Obama: ${(await getTweetData()).obamaAvg.toFixed(2)}</p>
  </div>
  
</div>


<!-- Country mentions -->
<p class="countryplotmargin"></p>

<div class="centeredtext">
  <h1 class="country-heading">What countries do President's mention most? 🌎</h1>
</div>

<div class="lefttext">
  <p>
    Our second visualization highlights how often U.S. presidents mentioned foreign countries in their tweets. This offers a window into each administration's diplomatic priorities and areas of geopolitical focus.
  </p>

  👉 How to explore:
  - Click on a country from the dropdown to see how frequently it was mentioned by a president over time.
  - Use the filters above to narrow results by president or year.
  - The right-hand panel displays background context about U.S. relations with the selected country, as well as quick stats on the number of times the country was mentioned.
</div>


<div class="card" >${tweetTimeline(tweets, events)}</div>

<div class="centeredtext verticalspace" style="font-size: 16px;">
  <p>Thanks for exploring <em>Reading the Room</em>. We hope this project has shed light on how presidential communication has evolved in the age of social media — and what it reveals about leadership, tone, and global focus.</p>
  <p style="margin-top: 1rem;">Created by Chase Preston, Hannah Alborzi, Huda Marta, and Alexander Liu.</p>
</div>

<!-- JavaScript Section -->
```js
import { eventsData } from './data/eventsData.js';
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

async function tweetScatterPlot() {
  const { allTweets } = await getTweetData();
  const { allData } = await getApprovalData();
  let filteredTweets = [...allTweets]; // Default: show all
  let currentKeyword = "";
  const searchInput = document.getElementById("wordSearch");
  let keywordTimeout;
  searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  
  clearTimeout(keywordTimeout);
  
  // This is the key change - handle both empty and non-empty cases with the same timing logic
  keywordTimeout = setTimeout(() => {
    currentKeyword = value;
    redrawPlot();
  }, value === "" ? 0 : 500);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentKeyword = e.target.value.toLowerCase().trim();
      redrawPlot();
    }
  });



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

  // Create sidebar for keyword search results (initially hidden)
  const sidebar = document.createElement("div");
  sidebar.className = "details-panel";  // matches event panel style
  sidebar.style.display = "none";       // initially hidden
  document.getElementById("top-words-list").innerHTML = "";
  sidebar.innerHTML = `
     <button class="close-button" id="closeSidebar">×</button>
    <div class="event-info" style="margin: 20px;">
      <h3 id="keyword-title">Search results</h3>
      <p id="keyword-summary" class="event-date"></p>
      <div id="keyword-results"></div>
    </div>
  `;




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
  container.appendChild(sidebar);
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
    
    const sidebarWidth = sidebar.style.display === "none" ? 0 : 350; // Use actual sidebar width
    const availableWidth = Math.max(1400, plotContainer.clientWidth - 50);
    const marks = [
      Plot.ruleY([0]),
      Plot.dot(allTweets, {
        x: "date",
        y: "compound",
        stroke: "source", // keep stroke consistent
        strokeOpacity: d =>
          currentKeyword
            ? d.text.toLowerCase().includes(currentKeyword) ? 1 : 0.1
            : 1, // <-- fully visible when no keyword
        fill: d => currentKeyword && d.text.toLowerCase().includes(currentKeyword) ? "white" : "none",
        r: d => currentKeyword && d.text.toLowerCase().includes(currentKeyword) ? 6 : 2,
        title: d => d.text
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
          fillOpacity: 0.75,
          r: 10,
          stroke: "white",
          strokeWidth: 2,
          title: d => `${d.label}\n${d.description}`,
          style: "cursor: pointer"
        })
      );
    }
    
    const plot = Plot.plot({
      width: availableWidth,
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

    // Apply pulsing animation to matched tweet dots
    setTimeout(() => {
      const dots = container.querySelectorAll("circle");
      dots.forEach((circle) => {
        const title = circle.getAttribute("title")?.toLowerCase() || "";
        if (currentKeyword && title.includes(currentKeyword)) {
          circle.classList.add("pulsating");
        } else {
          circle.classList.remove("pulsating");
        }
      });
    }, 0);



    // Update sidebar with search results
    sidebar.style.display = currentKeyword ? "block" : "none";
    const keywordResultsContainer = sidebar.querySelector("#keyword-results");
    const keywordSummary = sidebar.querySelector("#keyword-summary");

    if (currentKeyword) {
      detailsPanel.style.display = "none";
      const matches = allTweets.filter(d => d.text.toLowerCase().includes(currentKeyword));
      sidebar.style.display = "block";
      sidebar.style.background = "#1E1E1Eff"
      keywordSummary.textContent = `${matches.length} tweet(s) matched “${currentKeyword}”`;

      keywordResultsContainer.innerHTML = "";
      matches.forEach(tweet => {
          const div = document.createElement("div");
          div.style.marginBottom = "12px";
          div.style.color = "white";
          div.innerHTML = `
            <p style="margin: 0 0 2px; font-size:18px;" ;"><strong>${tweet.source}</strong> - ${tweet.formattedDate}</p>
            <p style="margin: 0; font-size:15px;">${tweet.text}</p>
          `;
          keywordResultsContainer.appendChild(div);
      });

      const wordCounts = {};
      matches.forEach(tweet => {
        tweet.text
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // remove punctuation
          .split(/\s+/)
          .forEach(word => {
          const baseStopWords = new Set([
            // Common stop words and filler terms
            "the", "and", "for", "with", "that", "this", "you", "but", "are", "have", "from", "our", "will",
            "amp", "has", "was", "were", "had", "they", "them", "his", "her", "she", "he", "we", "us", "on",
            "at", "to", "of", "in", "as", "by", "is", "it", "an", "be", "about", "now", "just", "so", "if",
            "then", "there", "also", "more", "out", "off", "up", "down", "over", "again", "still", "even",

            // Additional filler/transition words
            "all", "can", "your", "who", "than", "very", "not", "its", "would", "being", "when", "their", "like", "anyone",

            // Social media handles / noise
            "realdonaldtrump", "cdcgov", "cbsthismorning", "media", "news",

            // Already captured by sentiment or authorship context
            "trump", "obama", "biden", "potus", "joe",

            // Vague terms
            "new", "great", "help", "right", "ever", "between", "since"
          ]);

          const keywordLower = currentKeyword.toLowerCase();
          const pluralKeyword = keywordLower.endsWith("s") ? keywordLower.slice(0, -1) : keywordLower + "s";

          // Create a new Set to include the keyword and its plural form
          const stopWords = new Set([...baseStopWords, keywordLower, pluralKeyword]);



          if (word.length > 2 && !stopWords.has(word)) {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
          });
      });

      const topWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const list = document.getElementById("top-words-list");
        list.innerHTML = "";

        topWords.forEach(([word, count]) => {
          const box = document.createElement("div");
          box.textContent = word;
          box.style.padding = "6px 12px";
          box.style.background = "#2a2a2a";
          box.style.color = "#fff";
          box.style.borderRadius = "20px";
          box.style.display = "flex";
          box.style.alignItems = "center";
          box.style.cursor = "pointer";
          box.style.fontSize = "14px";
          box.style.position = "relative";

          const countCircle = document.createElement("span");
          countCircle.textContent = count;
          countCircle.style.background = "#666";
          countCircle.style.borderRadius = "50%";
          countCircle.style.color = "#fff";
          countCircle.style.fontSize = "12px";
          countCircle.style.width = "20px";
          countCircle.style.height = "20px";
          countCircle.style.display = "flex";
          countCircle.style.alignItems = "center";
          countCircle.style.justifyContent = "center";
          countCircle.style.marginLeft = "8px";

          box.appendChild(countCircle);
          box.addEventListener("click", () => {
            searchInput.value = word;
            currentKeyword = word;
            redrawPlot();
          });

          list.appendChild(box);
      });
    } else {
      sidebar.style.display = "none";
      document.getElementById("top-words-list").innerHTML = "";
    }


    const closeSidebarBtn = sidebar.querySelector("#closeSidebar");
      closeSidebarBtn?.addEventListener("click", () => {
        sidebar.style.display = "none";
        document.getElementById("top-words-list").innerHTML = "";
        currentKeyword = "";
        searchInput.value = "";
        
        // Trigger a full redraw after a small delay to ensure the DOM has updated
        setTimeout(() => {
          redrawPlot();
        }, 10);
    });

    
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
        if (i < allTweets.length) return;

        const eventIndex = i - allTweets.length;
        if (eventIndex >= eventsData.length) return;

        const event = eventsData[eventIndex];

        dot.addEventListener("click", () => {
          // Hide tweet search sidebar only on actual event click
          sidebar.style.display = "none";
          document.getElementById("top-words-list").innerHTML = "";
          // Populate event details
          document.getElementById("event-title").textContent = event.label;
          document.getElementById("event-date").textContent = event.actualDate;
          document.getElementById("event-description").textContent = event.description;
          document.getElementById("event-image").src = event.image;

          // Show event sidebar
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
<style> .hero { display: flex; flex-direction: column; align-items: center; margin: 2rem 0 4rem; font-family: var(--sans-serif);text-align: center; } 

.centeredtext { display: flex; flex-direction: column; align-items: center; text-align: center; } 

.lefttext { display: flex; flex-direction: column; align-items: center; text-align: left;} 

.verticalspace { margin: 4rem 0 4rem 0; }

.halfverticalspace { margin: 2rem 0 2rem 0; }

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

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
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

.pulsating {
  animation: pulse 1.2s ease-in-out infinite;
  transform-origin: center;
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
  margin-top:120px;
}

.image-showcase {
    position: relative;
    height: 700px;
    margin: 4rem 0;
  }

  .scroll-img {
    position: absolute;
    width: 360px;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transform: translateY(40px);
    animation: fadeInUp 0.9s ease-out forwards;
  }

  .img1 {
    top: 40px;
    left: 10%;
    transform: rotate(-5deg) translateY(40px);
    animation-delay: 0.1s;
  }

  .img2 {
    top: 140px;
    left: 35%;
    transform: rotate(3deg) translateY(40px);
    animation-delay: 0.5s;
  }

  .img3 {
    top: 220px;
    left: 60%;
    transform: rotate(-2deg) translateY(40px);
    animation-delay: 0.9s;
  }

  .img4 {
    top: 390px;
    left: 37%;
    transform: rotate(-2deg) translateY(40px);
    animation-delay: 1.3s;
  }

  .img5 {
    top: 510px;
    left: 15%;
    transform: rotate(-2deg) translateY(40px);
    animation-delay: 1.7s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: rotate(0deg) translateY(0);
    }
  }

</style>