// ========== League Match Rendering ==========

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
      window.location.href = element.getAttribute('data-link');
    };
  });
}

setInterval(updateStatus, 1000);
updateStatus();

// ========== Search ==========
document.getElementById('searchInput')?.addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const eventElements = document.querySelectorAll('.event');

  eventElements.forEach(eventEl => {
    const nameText = eventEl.querySelector('.event-name')?.textContent?.toLowerCase() || '';
    eventEl.style.display = nameText.includes(query) ? '' : 'none';
  });
});

// ========== Live Links ==========

const liveLinksData = [
  {
    name: "Join YoSinTV Telegram Live Links",
    link: "https://t.me/yosintvlive"
  },
  {
    links: [
      "https://yosintv2.github.io/ads/foot.html?url=https://example.com/stream1",
      "https://yosintv2.github.io/ads/foot.html?url=https://example.com/stream2"
    ]
  }
];

function renderLiveLinks() {
  const liveContainer = document.getElementById('live-container');
  if (!liveContainer) return;

  liveLinksData.forEach(group => {
    if (group.name && group.link) {
      const a = document.createElement('a');
      a.href = group.link;
      a.target = '_blank';
      a.textContent = group.name;
      a.style.cssText = 'display:block; background:red; color:white; padding:6px; margin:5px 0; font-weight:bold; text-align:center;';
      liveContainer.appendChild(a);
    }

    if (group.links) {
      group.links.forEach((url, i) => {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.textContent = `Stream Link ${i + 1}`;
        a.style.cssText = 'display:block; background:red; color:white; padding:6px; margin:5px 0; font-weight:bold; text-align:center;';
        liveContainer.appendChild(a);
      });
    }
  });
}

// ========== Live Tracker ==========

function embedLiveTracker() {
  const liveTrackerDiv = document.getElementById('live-tracker');
  if (!liveTrackerDiv) return;

  const urlParams = new URLSearchParams(window.location.search);
  const liveTrackerId = urlParams.get('id');

  if (liveTrackerId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://widgets-livetracker.nami.com/en/football?profile=g9rzlugz3uxie81&trend=0&id=${liveTrackerId}`;
    iframe.loading = 'lazy';
    iframe.style.border = 'none';
    iframe.width = '100%';
    iframe.height = '500';
    liveTrackerDiv.appendChild(iframe);
  }
}

// ========== Init ==========
renderLiveLinks();
embedLiveTracker();
