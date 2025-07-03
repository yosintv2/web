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
    const startBase = new Date(element.getAttribute('data-start')).getTime();
    const durationHours = parseFloat(element.getAttribute('data-duration'));
    const repeat = parseInt(element.getAttribute('data-repeat')) || 1;
    const countdownEl = element.querySelector('.event-countdown');

    let isLive = false;
    let isUpcoming = false;
    let matchedDayIndex = -1;

    for (let i = 0; i < repeat; i++) {
      const dayStart = startBase + i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + durationHours * 60 * 60 * 1000;

      if (currentTime >= dayStart && currentTime <= dayEnd) {
        isLive = true;
        matchedDayIndex = i;
        break;
      } else if (currentTime < dayStart) {
        isUpcoming = true;
        matchedDayIndex = i;
        break;
      }
    }

    if (isLive) {
      countdownEl.innerHTML = '<div class="live-now blink">Live Now</div>';
    } else if (isUpcoming && matchedDayIndex !== -1) {
      const nextDayStart = startBase + matchedDayIndex * 24 * 60 * 60 * 1000;
      const timeDiff = nextDayStart - currentTime;

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `<span>${days}d</span> <span>${hours}h</span> <span>${minutes}m</span>`;
    } else {
      countdownEl.textContent = 'Match End';
    }

    element.onclick = function () {
      window.location.href = element.getAttribute('data-link');
    };
  });
}

setInterval(updateStatus, 1000);
updateStatus();

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const eventElements = document.querySelectorAll('.event');
    eventElements.forEach(eventEl => {
      const nameText = eventEl.querySelector('.event-name')?.textContent?.toLowerCase() || '';
      eventEl.style.display = nameText.includes(query) ? '' : 'none';
    });
  });
}
