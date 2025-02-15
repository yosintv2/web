// List of leagues and their corresponding JSON files
const leagues = [
    { id: 'yosintv-cricket', file: 'cricket.json', title: 'Cricket' },
    { id: 'yosintv-cleague', file: 'cleague.json', title: 'Champions Trophy ' },
    { id: 'yosintv-nepal', file: 'nepal.json', title: ' 4-Nations Women ' },
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

        element.onclick = function () {
            window.location.href = element.getAttribute('data-link');
        };
    });
}

// Update every second
setInterval(updateStatus, 1000);
updateStatus();
