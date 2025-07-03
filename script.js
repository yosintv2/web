// List of leagues and their corresponding JSON files
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
          const currentTime = new Date().getTime();

          function getLiveStatus(match) {
            const repeat = match.repeat || 1;
            const baseStart = new Date(match.start).getTime();
            const duration = parseFloat(match.duration) * 60 * 60 * 1000;

            for (let i = 0; i < repeat; i++) {
              const startTime = baseStart + i * 24 * 60 * 60 * 1000;
              const endTime = startTime + duration;

              if (currentTime >= startTime && currentTime <= endTime) {
                return { isLive: true, time: startTime };
              }
            }
            return { isLive: false, time: baseStart };
          }

          const aStatus = getLiveStatus(a);
          const bStatus = getLiveStatus(b);

          if (aStatus.isLive && !bStatus.isLive) return -1;
          if (!aStatus.isLive && bStatus.isLive) return 1;
          return aStatus.time - bStatus.time;
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
  eventElement.setAttribute('data-repeat', event.repeat || 1);

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
    const baseStart = new Date(element.getAttribute('data-start')).getTime();
    const duration = parseFloat(element.getAttribute('data-duration')) * 60 * 60 * 1000;
    const repeat = parseInt(element.getAttribute('data-repeat')) || 1;
    const countdownEl = element.querySelector('.event-countdown');

    let found = false;
    for (let i = 0; i < repeat; i++) {
      const start = baseStart + i * 24 * 60 * 60 * 1000;
      const end = start + duration;

      if (currentTime < start) {
        const timeDiff = start - currentTime;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        countdownEl.innerHTML = `<span>${days}d</span> <span>${hours}h</span> <span>${minutes}m</span>`;
        found = true;
        break;
      } else if (currentTime >= start && currentTime <= end) {
        countdownEl.innerHTML = '<div class="live-now blink">Live Now</div>';
        found = true;
        break;
      }
    }

    if (!found) {
      countdownEl.textContent = 'Match End';
    }

    element.onclick = function () {
      window.location.href = element.getAttribute('data-link');
    };
  });
}

setInterval(updateStatus, 1000);
updateStatus();
