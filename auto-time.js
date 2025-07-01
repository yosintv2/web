// List of leagues and their corresponding JSON files
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

// Fetch and render data for each league
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

// Render a league's matches
function renderLeague(data, containerId, leagueTitle) {
    const container = document.getElementById(containerId);
    
    // Add league title
    const titleElement = document.createElement('div');
    titleElement.classList.add('league-title');
    titleElement.textContent = `${leagueTitle} Matches`;
    container.appendChild(titleElement);

    // Check if matches are available
    if (!data.matches || data.matches.length === 0) {
        const noEventsMessage = document.createElement('p');
        noEventsMessage.textContent = `No ${leagueTitle} Matches Today`;
        container.appendChild(noEventsMessage);
        return;
    }

    // Loop through matches and render them in sorted order
    data.matches.forEach(match => {
        renderEvent(match, container);
    });
}

// Render individual event
function renderEvent(event, container) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');
    eventElement.setAttribute('data-link', event.link.trim());
    eventElement.setAttribute('data-start', event.start);
    eventElement.setAttribute('data-duration', event.duration);
    
    // Assuming event has an 'id' property for the match ID, fallback to sanitized name
    const matchId = event.id || event.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');

    eventElement.setAttribute('data-id', matchId);

    const eventName = document.createElement('div');
    eventName.classList.add('event-name');
    eventName.textContent = event.name.trim();

    const countdown = document.createElement('div');
    countdown.classList.add('event-countdown');

    eventElement.appendChild(eventName);
    eventElement.appendChild(countdown);
    container.appendChild(eventElement);

    // On click open highlights page with matchId and liveTrackerId if present
    eventElement.onclick = function () {
        const liveTrackerId = getUrlParameter('id') || ''; // preserve id param if present
        let url = `${window.location.origin}${window.location.pathname}?yosintv=${matchId}`;
        if (liveTrackerId) {
            url += `&id=${liveTrackerId}`;
        }
        window.location.href = url;
    };
}

// Update event statuses (Live, Countdown, Ended)
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
    });
}

// Load live links and iframe from events JSON
function loadStreamExtras() {
    const liveContainer = document.getElementById('live-container');
    const liveTrackerDiv = document.getElementById('live-tracker');

    liveContainer.innerHTML = '';
    liveTrackerDiv.innerHTML = '';

    // Hardcoded data - replace with fetch if needed
    const data = {
        events: [
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
        ],
        styles: {
            livee: "display: block; background: red; color: white; padding: 5px; margin: 5px 0; text-align: center; font-weight: bold;",
            liveeHover: "background: darkred;",
            liveeName: "font-weight: bold; color: white;"
        }
    };

    // Telegram link
    if (data.events[0]) {
        const t = document.createElement('a');
        t.href = data.events[0].link;
        t.target = '_blank';
        t.style = data.styles.livee;
        t.onmouseover = () => t.style.background = 'darkred';
        t.onmouseout = () => t.style.background = 'red';
        t.textContent = data.events[0].name;
        liveContainer.appendChild(t);
    }

    // Stream links
    if (data.events[1]) {
        data.events[1].links.forEach((url, i) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.style = data.styles.livee;
            a.onmouseover = () => a.style.background = 'darkred';
            a.onmouseout = () => a.style.background = 'red';
            a.textContent = `Stream Link ${i + 1}`;
            liveContainer.appendChild(a);
        });
    }

    // Insert iframe for live tracker if id param present
    const liveTrackerId = getUrlParameter('id');
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
}

// Utility: get query param from URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initial calls
loadStreamExtras();
setInterval(updateStatus, 1000);
updateStatus();
