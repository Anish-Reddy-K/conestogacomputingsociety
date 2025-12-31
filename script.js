document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('events-container');
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();
    // Limits: 6 months back, 1 year forward
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 6);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    let allEvents = [];

    // Fetch events
    fetch('data/events.json')
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            
            // Sort events by date
            allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Initial Render
            renderEventsList(allEvents);
            renderCalendar(currentDate);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            if(eventsContainer) {
                eventsContainer.innerHTML = '<p class="retro-text error">Error loading events. Please check back later.</p>';
            }
        });

    // Event Listeners for Month Navigation
    if(prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() - 1);
            if (newDate >= minDate) {
                currentDate = newDate;
                renderCalendar(currentDate);
            }
        });

        nextMonthBtn.addEventListener('click', () => {
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() + 1);
            if (newDate <= maxDate) {
                currentDate = newDate;
                renderCalendar(currentDate);
            }
        });
    }

    function renderEventsList(events) {
        if (!eventsContainer) return;
        eventsContainer.innerHTML = '';

        if (events.length === 0) {
            eventsContainer.innerHTML = '<p class="retro-text">No upcoming events found.</p>';
            return;
        }

        events.forEach(event => {
            const eventDate = new Date(event.date + 'T00:00:00'); 
            const dateString = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            const eventCard = document.createElement('div');
            eventCard.id = `event-${event.id}`;
            eventCard.className = `event-card ${event.highlight ? 'highlight-event' : ''}`;
            
            eventCard.innerHTML = `
                <div class="event-header">
                    <span class="event-date">${dateString}</span>
                    <span class="event-time">${event.time}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-location">@ ${event.location}</p>
                <p class="event-description">${event.description}</p>
                <div class="event-footer">
                    ${event.tags ? `<div class="event-tags">${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '<div></div>'}
                    <a href="${event.rsvp_link}" target="_blank" class="retro-button-link">
                        <button class="retro-button small-btn">Register / RSVP</button>
                    </a>
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });
    }

    function renderCalendar(date) {
        if (!calendarGrid || !currentMonthElement) return;

        const year = date.getFullYear();
        const month = date.getMonth();

        // Update Header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Update buttons state
        const prevTest = new Date(date);
        prevTest.setMonth(month - 1);
        prevMonthBtn.disabled = prevTest < minDate;
        if(prevMonthBtn.disabled) prevMonthBtn.classList.add('disabled'); else prevMonthBtn.classList.remove('disabled');

        const nextTest = new Date(date);
        nextTest.setMonth(month + 1);
        nextMonthBtn.disabled = nextTest > maxDate;
        if(nextMonthBtn.disabled) nextMonthBtn.classList.add('disabled'); else nextMonthBtn.classList.remove('disabled');


        // Clear Grid
        calendarGrid.innerHTML = '';

        // Days Header
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of month and days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = i;

            // Check if there's an event on this day
            const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            // Find all events for this day
            const eventsOnDay = allEvents.filter(e => e.date === currentDayStr);
            const hasEvent = eventsOnDay.length > 0;

            if (hasEvent) {
                dayCell.classList.add('has-event');
                dayCell.title = eventsOnDay.map(e => e.title).join(', ');
                
                dayCell.addEventListener('click', () => {
                    // Scroll to the first event of the day
                    const targetId = `event-${eventsOnDay[0].id}`;
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add temporary flash effect
                        targetElement.classList.add('flash-highlight');
                        setTimeout(() => targetElement.classList.remove('flash-highlight'), 1000);
                    }
                });
            }
            
            // Check if today
            const today = new Date();
            if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === i) {
                dayCell.classList.add('today');
            }

            calendarGrid.appendChild(dayCell);
        }
    }
});
