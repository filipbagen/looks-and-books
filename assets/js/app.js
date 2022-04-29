const init = () => {
    highlightDayOfTheWeek()
    window.setTimeout(function () { autoScrollSlideshow() }, 1000)
}

function getToday () {
    return new Date().getDay() ? new Date().getDay() : 7
  }

function highlightDayOfTheWeek() {
    const target = /** @type {HTMLElement} */ (document.querySelector('#openingHours :nth-child(' + getToday() + ')'))
    target.classList.add('today')
}

function slideshow (goTo) {
  const container = document.querySelector('#imageContainer')
  const oldDot = document.querySelector('#page3 #dots .active')
  const childs = document.querySelectorAll('#dots a')
  if (goTo === undefined && childs[0]) {
    const current = document.querySelector('#dots .active')
    for (let i = 0; i < childs.length; i++) {
      if (childs[i] === current) {
        goTo = i + 2
        if (goTo > childs.length) {
          goTo = 1
        }
      }
    }
  }
  const dot = document.querySelector('#slideshow' + goTo)
  if (oldDot) {
    oldDot.classList.remove('active')
  }
  if (dot) {
    dot.classList.add('active')
  }
  if (container) {
    container.style.transform = 'translateX(' + -100 / childs.length * (goTo - 1) + '%)'
  }
}

function autoScrollSlideshow () {
  const loop = function () {
    slideshow()
    window.setTimeout(function () { loop() }, 2000)
  }
  loop()
}
