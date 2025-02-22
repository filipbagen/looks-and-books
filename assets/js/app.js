export const init = () => {
  highlightDayOfTheWeek();
};

function getToday() {
  return new Date().getDay() ? new Date().getDay() : 7;
}

function getDay() {
  return new Date().getDay() === 0 ? 3 : new Date().getDay() <= 5 ? 1 : 2;
}

function highlightDayOfTheWeek() {
  const target = /** @type {HTMLElement} */ (
    document.querySelector('#OpeningHours :nth-child(' + getToday() + ')')
  );
  const footerTarget = /** @type {HTMLElement} */ (
    document.querySelector('#OpeningHoursFooter :nth-child(' + getDay() + ')')
  );

  target.classList.add('today');
  footerTarget.classList.add('today');
}
