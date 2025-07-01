const leagues = [
  { id: 'yosintv-cricket', file: 'https://yosintv11.pages.dev/cricket.json', title: 'Cricket' },
  { id: 'yosintv-cleague', file: 'https://yosintv11.pages.dev/cleague.json', title: 'League' },
  { id: 'yosintv-nepal', file: 'https://yosintv11.pages.dev/nepal.json', title: '4-Nations Women' },
  { id: 'yosintv-npl', file: 'https://yosintv11.pages.dev/npl.json', title: 'NPL T20' },
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

function extractIdFromLink(link) {
  const match = link.match(/id=(\d+)/);
  return match ? match[1] : null;
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
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    liveTrackerDiv.appendChild(iframe);
  }
}

// Initialize live tracker with URL id
const initialMatchId = getQueryParam('id') || '4249739'; // Fallback ID
renderLiveTracker(initialMatchId);

leagues.forEach(league => {
  fetch(league.file)
    .then(response => response.json())
    .then(data => {
      if (data.matches) {
        const currentTime = new Date().getTime();
        data.matches.sort((a, b) => {
          const startA = new Date(a.start).getTime();
          const endA = startA + parseFloat(a.duration) * 60 * 60 * 1000;
          const startB = new Date(b.start).getTime();
          const endB = startB + parseFloat(b.duration) * 60 * 60 * 1000;
          const isLiveA = currentTime >= startA && currentTime <= endA;
          const isLiveB = currentTime >= startB && currentTime <= endB;
          const isEndedA = currentTime > endA;
          const isEndedB = currentTime > endB;
          if (isLiveA && !isLiveB) return -1;
          if (!isLiveA && isLiveB) return 1;
          if (!isEndedA && isEndedB) return -1;
          if (isEndedA && !isEndedB) return 1;
          return startA - startB;
        });
      }
      renderLeague(data, league.id, league.title);
    })
    .catch(error => console.error(`Error loading ${league.title} events:`, error));
});

function renderLeague(data, containerId, leagueTitle) {
  const container = document.getElementById(containerId);
  const titleElement = document.createElement('div');
  titleElement.classList.add('league-title');
  titleElement.textContent = `${leagueTitle} Matches`;
  container.appendChild(titleElement);

  if (!data.matches || data.matches.length === 0) {
    const noEventsMessage = document.createElement('p');
    noEventsMessage.textContent = `No ${leagueTitle} Matches Today`;
    container.appendChild(noEventsMessage);
    return;
  }

  data.matches.forEach(match => {
    renderEvent(match, container);
  });
}

function renderEvent(event, container) {
  const eventElement = document.createElement('div');
  eventElement.classList.add('event');
  eventElement.setAttribute('data-link', event.link);
  eventElement.setAttribute('data-start', event.start);
  eventElement.setAttribute('data-duration', event.duration);

  const eventName = document.createElement('div');
  eventName.classList.add('event-name');
  eventName.textContent = event.name;

  const countdown = document.createElement('div');
  countdown.classList.add('event-countdown');

  eventElement.appendChild(eventName);
  eventElement.appendChild(countdown);
  container.appendChild(eventElement);
}

function updateStatus() {
  const eventElements = document.querySelectorAll('.event');
  const currentTime = new Date().getTime();

  eventElements.forEach(element => {
    const startTime = new Date(element.getAttribute('data-start')).getTime();
    const durationHours = parseFloat(element.getAttribute('data-duration'));
    const endTime = startTime + durationHours * 60 * 60 * 1000;
    const eventCountdownElement = element.querySelector('.event-countdown');
    const link = element.getAttribute('data-link');
    const matchId = extractIdFromLink(link) || '4249739'; // Fallback ID

    if (currentTime < startTime) {
      const timeDiff = startTime - currentTime;
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      eventCountdownElement.innerHTML = `<span>${days}d</span> <span>${hours}h</span> <span>${minutes}m</span>`;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      eventCountdownElement.innerHTML = '<div class="live-now blink">Live Now</div>';
    } else {
      eventCountdownElement.textContent = 'Match End';
    }

    element.onclick = function () {
      renderLiveTracker(matchId); // Update iframe with match-specific ID
    };
  });
}

setInterval(updateStatus, 1000);
updateStatus();

// Search Functionality
document.getElementById('searchInput').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const eventElements = document.querySelectorAll('.event');

  eventElements.forEach(eventEl => {
    const nameText = eventEl.querySelector('.event-name')?.textContent?.toLowerCase() || '';
    if (nameText.includes(query)) {
      eventEl.style.display = '';
    } else {
      eventEl.style.display = 'none';
    }
  });
});
