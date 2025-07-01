const leagues = [
  { id: 'yosintv-cricket', file: 'https://yosintv11.pages.dev/cricket.json', title: 'Cricket' },
  { id: 'yosintv-cleague', file: 'https://yosintv11.pages.dev/cleague.json', title: 'League' },
  { id: 'yosintv-nepal', file: 'https://yosintv11.pages.dev/nepal.json', title: '4-Nations Women' },
  { id: 'yosintv-n waypoints://yosintv11.pages.dev/npl.json', title: 'NPL T20' },
  { id: 'yosintv-ucl', file: 'https://yosintv11.pages.dev/ucl.json', title: 'Champions League' },
  { id: 'yosintv-football', file: 'https://yosintv11.pages.dev/football.json', title: 'Top Football' },
  { id: 'yosintv-laliga', file: 'https://yosintv11.pages.dev/more.json', title: 'More Football' },
  { id: 'yosintv-epl', file: 'https://yosintv11.pages.dev/epl.json', title: 'EPL' },
  { id: 'yosintv-seriea', file: 'https://yosintv11.pages.dev/seriea.json', title: 'Serie A' },
  { id: 'yosintv-ligue1', file: 'https://yosintv11.pages.dev/ligue1.json', title: 'Ligue 1' },
  { id: 'yosintv-bundesliga', file: 'https://yosintv11.pages.dev/bundesliga.json', title: 'Bundesliga' }
];

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function renderLiveTracker(matchId) {
  const liveTrackerDiv = document.getElementById('live-tracker');
  if (!liveTrackerDiv) {
    console.error('Live tracker div not found');
    return;
  }
  liveTrackerDiv.innerHTML = ''; // Clear previous content
  if (matchId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://widgets-livetracker.nami.com/en/football?profile=g9rzlugz3uxie81&trend=0&id=${matchId}`;
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    liveTrackerDiv.appendChild(iframe);
  }
}

// Initialize live tracker with URL id
const initialMatchId = getQueryParam('id') || '4249739'; // Fallback ID
renderLiveTracker(initialMatchId);

function renderLiveMatches(matches) {
  const container = document.getElementById('live-container');
  if (!container) {
    console.error('Live container div not found');
    return;
  }
  container.innerHTML = ''; // Clear previous content

  const titleElement = document.createElement('div');
  titleElement.classList.add('league-title');
  titleElement.textContent = 'Live Matches';
  container.appendChild(titleElement);

  if (!matches || matches.length === 0) {
    const noEventsMessage = document.createElement('p');
    noEventsMessage.textContent = 'No Live Matches';
    container.appendChild(noEventsMessage);
    return;
  }

  matches.forEach(match => {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');
    eventElement.setAttribute('data-start', match.start);
    eventElement.setAttribute('data-duration', match.duration);

    const eventName = document.createElement('div');
    eventName.classList.add('event-name');
    eventName.textContent = match.name;

    const countdown = document.createElement('div');
    countdown.classList.add('event-countdown');
    countdown.innerHTML = '<div class="live-now blink">Live Now</div>';

    eventElement.appendChild(eventName);
    eventElement.appendChild(countdown);
    container.appendChild(eventElement);
  });
}

function updateLiveMatches() {
  const liveMatches = [];
  const currentTime = new Date().getTime();

  const fetchPromises = leagues.map(league =>
    fetch(league.file)
      .then(response => response.json())
      .then(data => {
        if (data.matches) {
          data.matches.forEach(match => {
            const startTime = new Date(match.start).getTime();
            const endTime = startTime + parseFloat(match.duration) * 60 * 60 * 1000;
            if (currentTime >= startTime && currentTime <= endTime) {
              liveMatches.push(match);
            }
          });
        }
      })
      .catch(error => console.error(`Error loading ${league.title} events:`, error))
  );

  Promise.all(fetchPromises).then(() => {
    // Sort live matches by start time
    liveMatches.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    renderLiveMatches(liveMatches);
  });
}

// Initial render and periodic update
updateLiveMatches();
setInterval(updateLiveMatches, 60000); // Update every minute
