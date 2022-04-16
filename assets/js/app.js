const init = () => {
    highlightDayOfTheWeek()
}

function getToday () {
    return new Date().getDay() ? new Date().getDay() : 7
  }

function highlightDayOfTheWeek() {
    const target = /** @type {HTMLElement} */ (document.querySelector('#OpeningHours :nth-child(' + getToday() + ')'))
    target.classList.add('today')
  }