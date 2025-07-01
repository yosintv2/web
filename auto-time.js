// match_viewer.js
const params = new URLSearchParams(window.location.search);
const matchId = params.get('yosintv');

const leagues = [
  { id: 'yosintv-cricket', file: 'cricket.json', title: 'Cricket' },
  { id: 'yosintv-cleague', file: 'cleague.json', title: 'Leagues' },
  { id: 'yosintv-npl', file: 'npl.json', title: 'NPL T20' },
  { id: 'yosintv-ucl', file: 'ucl.json', title: 'Champions League' },
  { id: 'yosintv-football', file: 'football.json', title: 'Football' },
  { id: 'yosintv-epl', file: 'epl.json', title: 'EPL' },
  { id: 'yosintv-laliga', file: 'laliga.json', title: 'La Liga' },
  { id: 'yosintv-seriea', file: 'seriea.json', title: 'Serie A' },
  { id: 'yosintv-ligue1', file: 'ligue1.json', title: 'Ligue 1' },
  { id: 'yosintv-bundesliga', file: 'bundesliga.json', title: 'Bundesliga' }
];

if (matchId) {
  loadMatchCard();
  loadStreamExtras();
} else {
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
            if (isLiveA && !isLiveB) return -1;
            if (!isLiveA && isLiveB) return 1;
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
    eventElement.setAttribute('data-id', event.id);
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
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        eventCountdownElement.innerHTML = `<span>${hours}h</span> <span>${minutes}m</span> <span>${seconds}s</span>`;
      } else if (currentTime >= startTime && currentTime <= endTime) {
        eventCountdownElement.innerHTML = '<div class="live-now blink">Live Now</div>';
      } else {
        eventCountdownElement.textContent = 'Match End';
      }

      element.onclick = function () {
        const id = element.getAttribute('data-id');
        if (id) {
          window.location.href = `?yosintv=${id}`;
        } else {
          window.location.href = element.getAttribute('data-link');
        }
      };
    });
  }

  setInterval(updateStatus, 1000);
  updateStatus();
}

function loadMatchCard() {
  let foundMatch = null;
  const matchContainer = document.createElement('div');
  matchContainer.classList.add('yosintv-container');

  leagues.forEach(league => {
    fetch(league.file)
      .then(response => response.json())
      .then(data => {
        if (data.matches) {
          const match = data.matches.find(m => m.id === matchId);
          if (match && !foundMatch) {
            foundMatch = match;
            const title = document.createElement('div');
            title.classList.add('league-title');
            title.textContent = match.name;
            matchContainer.appendChild(title);

            const card = document.createElement('div');
            card.classList.add('event');
            const name = document.createElement('div');
            name.classList.add('event-name');
            name.textContent = `Kickoff Time: ${new Date(match.start).toLocaleString()}`;
            const countdown = document.createElement('div');
            countdown.classList.add('event-countdown');
            countdown.id = 'countdown-single';

            card.appendChild(name);
            card.appendChild(countdown);
            matchContainer.appendChild(card);
            document.body.appendChild(matchContainer);

            setInterval(() => updateSingleCountdown(match), 1000);
            updateSingleCountdown(match);
          }
        }
      });
  });
}

function updateSingleCountdown(match) {
  const el = document.getElementById('countdown-single');
  if (!el) return;
  const start = new Date(match.start).getTime();
  const now = new Date().getTime();
  const end = start + parseFloat(match.duration) * 60 * 60 * 1000;

  if (now < start) {
    const diff = start - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    el.innerHTML = `Starts in <span>${h}h</span> <span>${m}m</span> <span>${s}s</span>`;
  } else if (now >= start && now <= end) {
    el.innerHTML = '<div class="live-now blink">Live Now</div>';
  } else {
    el.textContent = 'Match Ended';
  }
}

function loadStreamExtras() {
  const liveTrackerId = params.get('id');

  fetch('streamdata.json')
    .then(res => res.json())
    .then(data => {
      const { events, styles } = data;
      const box = document.createElement('div');
      box.classList.add('yosintv-container');

      if (events[0]) {
        const t = document.createElement('a');
        t.href = events[0].link;
        t.target = '_blank';
        t.style = styles.livee;
        t.onmouseover = () => t.style.cssText += styles.liveeHover;
        const txt = document.createElement('div');
        txt.style = styles.liveeName;
        txt.innerText = events[0].name;
        t.appendChild(txt);
        box.appendChild(t);
      }

      if (events[1]) {
        events[1].links.forEach((raw, i) => {
          const link = raw.trim().replace(/_____/g, matchId);
          const a = document.createElement('a');
          a.href = link;
          a.target = '_blank';
          a.style = styles.livee;
          a.onmouseover = () => a.style.cssText += styles.liveeHover;
          const label = document.createElement('div');
          label.style = styles.liveeName;
          label.innerText = `Stream Link ${i + 1}`;
          a.appendChild(label);
          box.appendChild(a);
        });
      }

      if (liveTrackerId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://widgets-livetracker.nami.com/en/football?profile=g9rzlugz3uxie81&trend=0&id=${liveTrackerId}`;
        iframe.style = "width:100%;height:500px;border:none;margin-top:20px;";
        iframe.loading = "lazy";
        box.appendChild(iframe);
      }

      document.body.appendChild(box);
    })
    .catch(e => console.error('Failed to load streamdata.json', e));
}
