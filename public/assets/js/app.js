const init = () => {
  highlightDayOfTheWeek()
  // window.setTimeout(function () { autoScrollSlideshow() }, 4000)
}

function getToday() {
  return new Date().getDay() ? new Date().getDay() : 7
}

function getDay() {
  return new Date().getDay() === 0 ? 3 : new Date().getDay() <= 5 ? 1 : 2
}


function highlightDayOfTheWeek() {
  const target = /** @type {HTMLElement} */ (document.querySelector('#OpeningHours :nth-child(' + getToday() + ')'))
  const footerTarget = /** @type {HTMLElement} */ (document.querySelector('#OpeningHoursFooter :nth-child(' + getDay() + ')'))

  target.classList.add('today')
  footerTarget.classList.add('today')

  // console.log(target)
  // console.log(footerTarget)
}

function slideshow(goTo) {
  const container = document.querySelector('#imageContainer')
  const oldDot = document.querySelector('.slideshow #dots .active')
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

function autoScrollSlideshow() {
  const loop = function () {
    slideshow()
    window.setTimeout(function () { loop() }, 4000)
  }
  loop()
}
