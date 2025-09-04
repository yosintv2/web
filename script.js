  <script>
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

    const allMatches = [];

    // Load matches from all leagues
    Promise.all(
      leagues.map(league =>
        fetch(league.file)
          .then(res => res.json())
          .then(data => {
            if (data.matches && Array.isArray(data.matches)) {
              data.matches.forEach(match => {
                allMatches.push({ ...match, leagueId: league.id, leagueTitle: league.title });
              });
            }
          })
          .catch(err => console.error(`Failed loading ${league.title}`, err))
      )
    ).then(() => {
      renderMatches(allMatches);
      updateStatus();
      setInterval(updateStatus, 1000);
    });

    function renderMatches(matches) {
      leagues.forEach(league => {
        const container = document.getElementById(league.id);
        container.innerHTML = '';
      });

      const grouped = {};
      matches.forEach(match => {
        if (!grouped[match.leagueId]) grouped[match.leagueId] = [];
        grouped[match.leagueId].push(match);
      });

      Object.keys(grouped).forEach(leagueId => {
        const container = document.getElementById(leagueId);
        if (!container) return;

        const leagueTitle = leagues.find(l => l.id === leagueId)?.title || '';
        const title = document.createElement('div');
        title.className = 'league-title';
        title.textContent = leagueTitle;
        container.appendChild(title);

        grouped[leagueId].forEach(match => {
          const el = document.createElement('div');
          el.className = 'event';
          el.setAttribute('data-start', match.start);
          el.setAttribute('data-duration', match.duration);
          el.setAttribute('data-repeat', match.repeat || 1);
          el.setAttribute('data-link', match.link);

          const name = document.createElement('div');
          name.className = 'event-name';
          name.textContent = match.name;

          const countdown = document.createElement('div');
          countdown.className = 'event-countdown';

          el.appendChild(name);
          el.appendChild(countdown);
          container.appendChild(el);

          el.onclick = () => {
            window.location.href = match.link;
          };
        });
      });
    }

    function updateStatus() {
      const now = Date.now();
      document.querySelectorAll('.event').forEach(el => {
        const start = new Date(el.getAttribute('data-start')).getTime();
        const duration = parseFloat(el.getAttribute('data-duration')) * 3600000;
        const repeat = parseInt(el.getAttribute('data-repeat')) || 1;
        const countdown = el.querySelector('.event-countdown');

        let shown = false;
        for (let i = 0; i < repeat; i++) {
          const s = start + i * 86400000;
          const e = s + duration;

          if (now >= s && now <= e) {
            countdown.innerHTML = `<span class="live-now blink">Live Now</span>`;
            shown = true;
            break;
          }

          if (now < s && !shown) {
            const diff = s - now;
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            countdown.innerHTML = `<span>${d}d</span> <span>${h}h</span> <span>${m}m</span>`;
            shown = true;
            break;
          }
        }

        if (!shown) {
          countdown.textContent = 'Match End';
        }
      });
    }

    // Search input with ads display logic
    document.getElementById('matchSearch').addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      const adsContainer = document.getElementById('adsContainer');

      if (query === '') {
        renderMatches(allMatches);
        adsContainer.style.display = 'none'; // Hide ads when no search
        return;
      }

      const filtered = allMatches.filter(match =>
        match.name.toLowerCase().includes(query)
      );

      renderMatches(filtered);

      // Show ads only if there are results
      if (filtered.length > 0) {
        adsContainer.style.display = 'block';
      } else {
        adsContainer.style.display = 'none';
      }
    });
