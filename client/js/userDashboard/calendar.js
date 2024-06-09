function createCalendar(sessions) {
  const container = document.getElementById("calendari");

  const data = convertSessionsDates(sessions);

  const year = 2024;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  function createCalendar(data) {
    let html = `<div class="calendar">`;

    for (let month = 0; month < 12; month++) {
      html += `<div class="month">${getMonthName(month)}</div>`;
      html += `<div class="days">`;

      const daysInMonth = getDaysInMonth(year, month);

      // Agregar casillas vacías para ajustar el primer día de la semana
      for (let i = 1; i < startDate.getDay(); i++) {
        html += `<div class="day empty"></div>`;
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const dateString = `${pad(i)}-${pad(month + 1)}-${year}`;
        let dayClass = "day normal";
        const contributedData = data.find((item) => item.date === dateString);

        if (contributedData) {
          dayClass = `day sessionCalendar level-${contributedData.level}`;
        }

        html += `<div class="${dayClass}" title="${dateString}"></div>`;
      }

      html += `</div>`;
    }

    html += `</div>`;

    container.innerHTML = html;
  }

  createCalendar(data);

  // Crear leyenda
  const legendHTML = `
      <div class="legend">
        <div class="legend-item">
          <div class="box sessionCalendar level-1"></div>
          <div class="text">Emocions positives (Verd)</div>
        </div>
        <div class="legend-item">
          <div class="box sessionCalendar level-2"></div>
          <div class="text">Emocions negatives (Vermell)</div>
        </div>
        <div class="legend-item">
          <div class="box sessionCalendar level-3"></div>
          <div class="text">Pendent d'analitzar (Groc)</div>
        </div>
      </div>
    `;

  container.insertAdjacentHTML("afterend", legendHTML);

  function getMonthName(monthIndex) {
    const monthNames = [
      "Gener",
      "Febrer",
      "Març",
      "Abril",
      "Maig",
      "Juny",
      "Juliol",
      "Agost",
      "Setembre",
      "Octubre",
      "Novembre",
      "Decembre",
    ];
    return monthNames[monthIndex];
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function pad(number) {
    return number < 10 ? '0' + number : number;
  }
}

function convertSessionsDates(sessions, defaultLevel = 1) {
  return sessions.map(session => {
      const dateString = session.date;
      const year = "20" + dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const day = dateString.slice(4, 6);
      const formattedDate = `${day}-${month}-${year}`;
      defaultLevel = session.IdEstado === 1 ? 3 :
                             session.IdEstado === 2 ? 3 :
                             session.IdEstado === 3 ? 3 : 1; 
      return {
          date: formattedDate,
          level: defaultLevel
      };
  });
}