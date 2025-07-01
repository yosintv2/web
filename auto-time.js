const params = new URLSearchParams(window.location.search);
const matchId = params.get('yosintv');
const liveTrackerId = params.get('id');

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

// If matchId present, show single match card + streams
if (matchId) {
  loadMatchCard();
  loadStreamExtras();
} else {
  // Else show all leagues + matches list
  leagues.forEach(league => {
    fetch(league.file)
      .then(response => response.json())
      .then(data => {
        if (data.matches) {
          const now = Date.now();
          data.matches.sort((a, b) => {
            const startA = new Date(a.start).getTime();
            const endA = startA + parseFloat(a.duration) * 60 * 60 * 1000;
            const startB = new Date(b.start).getTime();
            const endB = startB + parseFloat(b.duration) * 60 * 60 * 1000;
            const liveA = now >= startA && now <= endA;
            const liveB = now >= startB && now <= endB;
            if (liveA && !liveB) return -1;
            if (!liveA && liveB) return 1;
            return startA - startB;
          });
        }
        renderLeague(data, league.id, league.title);
      })
      .catch(e => console.error(`Error loading ${league.title}:`, e));
  });

  function renderLeague(data, containerId, leagueTitle) {
    const container = document.getElementById(containerId);
    const title = document.createElement('div');
    title.classList.add('league-title');
    title.textContent = `${leagueTitle} Matches`;
    container.appendChild(title);

    if (!data.matches || data.matches.length === 0) {
      const p = document.createElement('p');
      p.textContent = `No ${leagueTitle} Matches Today`;
      container.appendChild(p);
      return;
    }

    data.matches.forEach(match => {
      renderEvent(match, container);
    });
  }

  function renderEvent(event, container) {
    const ev = document.createElement('div');
    ev.classList.add('event');
    ev.setAttribute('data-id', event.id || event.name.trim().toLowerCase().replace(/\s+/g, ''));
    ev.setAttribute('data-link', event.link);
    ev.setAttribute('data-start', event.start);
    ev.setAttribute('data-duration', event.duration);

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('event-name');
    nameDiv.textContent = event.name;

    const countdownDiv = document.createElement('div');
    countdownDiv.classList.add('event-countdown');

    ev.appendChild(nameDiv);
    ev.appendChild(countdownDiv);
    container.appendChild(ev);
  }

  function updateStatus() {
    const events = document.querySelectorAll('.event');
    const now = Date.now();

    events.forEach(el => {
      const start = new Date(el.getAttribute('data-start')).getTime();
      const durHours = parseFloat(el.getAttribute('data-duration'));
      const end = start + durHours * 60 * 60 * 1000;
      const cd = el.querySelector('.event-countdown');

      if (now < start) {
        const diff = start - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        cd.innerHTML = `<span>${h}h</span> <span>${m}m</span> <span>${s}s</span>`;
      } else if (now >= start && now <= end) {
        cd.innerHTML = '<div class="live-now blink">Live Now</div>';
      } else {
        cd.textContent = 'Match End';
      }

      el.onclick = () => {
        const id = el.getAttribute('data-id');
        if (id) {
          window.location.href = `?yosintv=${id}`;
        } else {
          window.location.href = el.getAttribute('data-link');
        }
      };
    });
  }

  setInterval(updateStatus, 1000);
  updateStatus();
}

function loadMatchCard() {
  let found = false;
  const container = document.createElement('div');
  container.classList.add('yosintv-container');

  leagues.forEach(league => {
    fetch(league.file)
      .then(res => res.json())
      .then(data => {
        if (data.matches) {
          const match = data.matches.find(m => {
            const id = m.id || m.name.trim().toLowerCase().replace(/\s+/g, '');
            return id === matchId;
          });
          if (match && !found) {
            found = true;
            const title = document.createElement('div');
            title.classList.add('league-title');
            title.textContent = match.name;
            container.appendChild(title);

            const card = document.createElement('div');
            card.classList.add('event');

            const kickoff = document.createElement('div');
            kickoff.classList.add('event-name');
            kickoff.textContent = `Kickoff Time: ${new Date(match.start).toLocaleString()}`;

            const countdown = document.createElement('div');
            countdown.classList.add('event-countdown');
            countdown.id = 'countdown-single';

            card.appendChild(kickoff);
            card.appendChild(countdown);
            container.appendChild(card);

            document.body.appendChild(container);

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
  const now = Date.now();
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
  fetch('streamdata.json')
    .then(res => res.json())
    .then(data => {
      const { events, styles } = data;

      const liveContainer = document.getElementById('live-container');
      if (!liveContainer) {
        console.error('Missing #live-container');
        return;
      }
      liveContainer.innerHTML = '';

      const liveTrackerDiv = document.getElementById('live-tracker');
      if (!liveTrackerDiv) {
        console.error('Missing #live-tracker');
        return;
      }
      liveTrackerDiv.innerHTML = '';

      // Telegram join
      if (events[0]) {
        const t = document.createElement('a');
        t.href = events[0].link;
        t.target = '_blank';
        t.style = styles.livee;
        t.onmouseover = () => (t.style.cssText += styles.liveeHover);
        const txt = document.createElement('div');
        txt.style = styles.liveeName;
        txt.innerText = events[0].name;
        t.appendChild(txt);
        liveContainer.appendChild(t);
      }

      // Stream links
      if (events[1]) {
        events[1].links.forEach((raw, i) => {
          const link = raw.trim().replace(/_____/g, matchId || '');
          const a = document.createElement('a');
          a.href = link;
          a.target = '_blank';
          a.style = styles.livee;
          a.onmouseover = () => (a.style.cssText += styles.liveeHover);
          const label = document.createElement('div');
          label.style = styles.liveeName;
          label.innerText = `Stream Link ${i + 1}`;
          a.appendChild(label);
          liveContainer.appendChild(a);
        });
      }

      // iframe for live tracker if id param present
      if (liveTrackerId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://widgets-livetracker.nami.com/en/football?profile=g9rzlugz3uxie81&trend=0&id=${liveTrackerId}`;
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        iframe.style.marginTop = '20px';
        iframe.loading = 'lazy';
        liveTrackerDiv.appendChild(iframe);
      }
    })
    .catch(e => console.error('Failed to load streamdata.json', e));
}
