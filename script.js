const leagues = [
  { id: 'yosintv-fight', file: 'https://yosintv11.pages.dev/fight.json', title: 'UFC/MMA/Boxing' },
  { id: 'yosintv-cricket', file: 'https://yosintv11.pages.dev/cricket.json', title: 'Top Cricket' },
  { id: 'yosintv-cleague', file: 'https://yosintv11.pages.dev/cleague.json', title: 'Cricket League' },
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
  const container = document.getElementById(league.id);
  if (!container) {
    console.error(`Container with ID ${league.id} not found in DOM`);
    return;
  }
  fetch(league.file)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      if (!data.matches || !Array.isArray(data.matches)) {
        throw new Error(`Invalid JSON structure for ${league.title}: 'matches' missing or not an array`);
      }
      const now = Date.now();
      data.matches.sort((a, b) => {
        const getStatus = match => {
          const repeat = Number(match.repeat) || 1;
          if (isNaN(repeat) || repeat < 1) return 2;
          const startTime = new Date(match.start).getTime();
          if (isNaN(startTime)) return 2;
          const duration = parseFloat(match.duration) * 3600000;
          if (isNaN(duration)) return 2;
          for (let i = 0; i < repeat; i++) {
            const s = startTime + i * 86400000;
            const e = s + duration;
            if (now >= s && now <= e) return 0; // Live
            if (now < s) return 1; // Upcoming
          }
          return 2; // Ended
        };
        const priA = getStatus(a);
        const priB = getStatus(b);
        if (priA !== priB) return priA - priB;
        const nextTime = m => {
          const repeat = Number(m.repeat) || 1;
          const startTime = new Date(m.start).getTime();
          if (isNaN(startTime) || repeat < 1) return Infinity;
          for (let i = 0; i < repeat; i++) {
            const s = startTime + i * 86400000;
            if (now <= s) return s;
          }
          return startTime;
        };
        return nextTime(a) - nextTime(b);
      });
      renderLeague(data, league.id, league.title);
    })
    .catch(error => {
      console.error(`Error loading ${league.title} events:`, error);
      container.innerHTML = `<p class="error">Failed to load ${league.title} matches: ${error.message}</p>`;
    });
});

function renderLeague(data, containerId, leagueTitle) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found during rendering`);
    return;
  }
  container.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'league-title';
  title.textContent = `${leagueTitle} Matches`;
  container.appendChild(title);
  if (!data.matches || data.matches.length === 0) {
    const noMatch = document.createElement('p');
    noMatch.textContent = `No ${leagueTitle} Matches Today`;
    container.appendChild(noMatch);
    return;
  }
  data.matches.forEach(match => renderEvent(match, container));
}

function renderEvent(match, container) {
  if (!match.name || !match.start || !match.duration || !match.link) {
    console.warn('Skipping match with missing required fields:', match);
    return;
  }
  const el = document.createElement('div');
  el.className = 'event';
  el.setAttribute('data-link', match.link);
  el.setAttribute('data-start', match.start);
  el.setAttribute('data-duration', match.duration);
  el.setAttribute('data-repeat', Number(match.repeat) || 1);
  const name = document.createElement('div');
  name.className = 'event-name';
  name.textContent = match.name.replace(/[<>]/g, ''); // Basic sanitization
  const countdown = document.createElement('div');
  countdown.className = 'event-countdown';
  el.appendChild(name);
  el.appendChild(countdown);
  container.appendChild(el);
}

function updateStatus() {
  const now = Date.now();
  document.querySelectorAll('.event').forEach(el => {
    const start = new Date(el.getAttribute('data-start')).getTime();
    const duration = parseFloat(el.getAttribute('data-duration')) * 3600000;
    const repeat = parseInt(el.getAttribute('data-repeat')) || 1;
    const countdown = el.querySelector('.event-countdown');
    if (isNaN(start) || isNaN(duration) || isNaN(repeat) || !countdown) {
      console.warn('Invalid data for element:', el);
      el.style.display = 'none';
      return;
    }
    let isLive = false;
    let isUpcoming = false;
    let latestEndTime = 0;
    for (let i = 0; i < repeat; i++) {
      const s = start + i * 86400000;
      const e = s + duration;
      if (now >= s && now <= e) {
        isLive = true;
        el.style.display = '';
        countdown.innerHTML = `<div class="live-now blink">Live Now</div>`;
        break;
      }
      if (now < s) {
        isUpcoming = true;
        el.style.display = '';
        const diff = s - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        countdown.innerHTML = `<span>${d}d</span> <span>${h}h</span> <span>${m}m</span>`;
        break;
      }
      latestEndTime = Math.max(latestEndTime, e);
    }
    if (!isLive && !isUpcoming) {
      const hideTime = latestEndTime + 7200000; // 2 hours after end
      if (now > hideTime) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
        countdown.textContent = 'Match End';
      }
    }
    el.onclick = () => {
      const link = el.getAttribute('data-link');
      if (link && /^https?:\/\//.test(link)) {
        window.location.href = link;
      } else {
        console.warn('Invalid or missing link:', link);
      }
    };
  });
}

setInterval(updateStatus, 1000);
updateStatus();
