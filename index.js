/* global preloadImagesTmr $fx fxhash fxrand */
//
//  fxhash - An Increasing Series of Dots
//
//  If I had longer, this code would be cleaner
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

const ratio = 1.41
// const startTime = new Date().getTime() // so we can figure out how long since the scene started
let drawn = false
let highRes = false // display high or low res
const features = {}
const nextFrame = null
let resizeTmr = null
let thumbnailTaken = false
const dumpOutputs = false
const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams.entries())

window.$fxhashFeatures = {}

const palette = {
  'Black': '#000000',
  'Green': '#ECF3EB',
  'Blue': '#EEF5F5',
  'Pink': '#F3EAF3',
  'Parchment': '#F5C976',
  'Off White': '#EEEEEE',
  'White': '#FFFFFF'
}

const linePalette = {
  'Black': '#000000',
  'Ink': '#3D1D12',
  'Wash': '#605A5C',
  'Off White': '#EEEEEE'
}

const dotPalette = {
  'Red': '#D72A0C',
  'Bright Red': '#FF0000',
  'Yellow': '#F5C976'
}

//  Work out what all our features are
const makeFeatures = () => {

  let outOfBounds = true
  while (outOfBounds) {
    outOfBounds = false
    features.hLines = Math.floor(fxrand() * 4) + 1
    features.vLines = Math.floor(fxrand() * 3) + 1

    features.missingChance = 0.2
    features.placeCircleChance = 0.2
    features.wholeCircleChance = 0.33
    features.placeDotChance = 0.8

    features.totalLines = 0
    features.hLinesHolder = []
    features.vLinesHolder = []
    while (features.totalLines < 2) {
      features.totalLines = 0
      //  make the h lines
      features.hLinesHolder = []
      for (let i = 1; i <= features.hLines; i++) {
        if (fxrand() > features.missingChance) {
          features.hLinesHolder.push(true)
          features.totalLines++
        } else {
          features.hLinesHolder.push(false)
        }
      }
      //  make the v lines
      features.vLinesHolder = []
      for (let i = 1; i <= features.vLines; i++) {
        if (fxrand() > features.missingChance) {
          features.vLinesHolder.push(true)
          features.totalLines++
        } else {
          features.vLinesHolder.push(false)
        }
      }
    }

    //  Make the circles
    features.circles = []
    features.wholeCircles = 0

    while (features.circles.length < 1) {
      features.wholeCircles = 0
      features.circles = []
      //  Now work out where we are going to put the circles on
      // Put them on the vertical lines first
      for (let vv = 1; vv <= features.vLines; vv++) {
        for (let hh = 1; hh <= features.hLines; hh += 0.5) {
          if (features.vLinesHolder[vv - 1] && fxrand() < features.placeCircleChance) {
            const thisCircle = {
              h: hh,
              v: vv,
              left: true,
              right: true
            }
            //  Draw the right side
            //  If we are not drawing a whole circle, then adjust the start and end
            if (fxrand() > features.wholeCircleChance) {
              //  draw the left or right side
              if (fxrand() < 0.5) {
                thisCircle.left = false
              } else {
                thisCircle.right = false
              }
            } else {
              features.wholeCircles++
            }
            thisCircle.radiusMod = (0.25 * Math.ceil(fxrand() * 4))
            features.circles.push(thisCircle)
          }
        }
      }
      // Now put them on the horizontal ones
      for (let hh = 1; hh <= features.hLines; hh++) {
        for (let vv = 1; vv <= features.vLines; vv += 0.5) {
          if (features.hLinesHolder[hh - 1] && fxrand() < features.placeCircleChance) {
            const thisCircle = {
              h: hh,
              v: vv,
              up: true,
              down: true
            }
            //  If we are not drawing a whole circle, then adjust the start and end
            if (fxrand() > features.wholeCircleChance) {
              //  draw the left or right side
              if (fxrand() < 0.5) {
                thisCircle.up = false
              } else {
                thisCircle.down = false
              }
            } else {
              features.wholeCircles++
            }
            thisCircle.radiusMod = (0.25 * Math.ceil(fxrand() * 4))
            features.circles.push(thisCircle)
          }
        }
      }
    }

    //  Make the circles
    features.dots = []
    //  Now work out where we are going to put the circles on
    // Put them on the vertical lines first
    for (let vv = 1; vv <= features.vLines; vv++) {
      for (let hh = 1; hh <= features.hLines; hh++) {
        if ((!features.vLinesHolder[vv - 1] || !features.hLinesHolder[hh - 1]) && fxrand() < features.placeDotChance) {
          const thisDot = {
            h: hh,
            v: vv
          }
          thisDot.radiusMod = (0.25 * Math.ceil(fxrand() * 4)) * .5
          features.dots.push(thisDot)
        }
      }
    }

    //  Now we build the actual lines
    features.allLines = []
    for (let h = 1; h <= features.hLines; h++) {
      if (features.hLinesHolder[h - 1]) {
        for (l = 1; l <= 5; l++) {
          const line = new Line()
          line.addPoint(0, 1 / (features.hLines + 1) * h)
          line.addPoint(1, 1 / (features.hLines + 1) * h)
          features.allLines.push(line)
        }
      }
    }
    for (let v = 1; v <= features.vLines; v++) {
      if (features.vLinesHolder[v - 1]) {
        for (l = 1; l <= 5; l++) {
          const line = new Line()
          line.addPoint(1 / (features.vLines + 1) * v, 0)
          line.addPoint(1 / (features.vLines + 1) * v, 1)
          features.allLines.push(line)
        }
      }
    }

    features.allCircles = []
    features.circles.forEach((circle) => {
      let circleLines = []
      //  We are doing a horizonal line, which means we need to squish
      const step = 0.007
      if ('left' in circle) {
        const maxRadius = 1 / (features.vLines + 1)
        const thisRadius = maxRadius * circle.radiusMod
        const roundRadius = Math.floor(thisRadius / step) * step
        for (let y = -roundRadius; y < roundRadius; y += step) {
          const x = Math.sqrt((roundRadius * roundRadius) - (y * y))
          let startX = -x
          let endX = x
          if (!circle.left) startX = 0
          if (!circle.right) endX = 0
          const line = new Line()
          line.addPoint(startX, y / ratio)
          line.addPoint(endX, y / ratio)
          circleLines.push(line)
        }
      }
      if ('up' in circle) {
        const maxRadius = 1 / (features.hLines + 1)
        const thisRadius = maxRadius * circle.radiusMod
        const roundRadius = Math.floor(thisRadius / step) * step
        for (let x = -roundRadius; x < roundRadius; x += step) {
          const y = Math.sqrt((roundRadius * roundRadius) - (x * x))
          let startY = -y
          let endY = y
          if (!circle.up) startY = 0
          if (!circle.down) endY = 0
          const line = new Line()
          line.addPoint(x, startY / ratio)
          line.addPoint(x, endY / ratio)
          circleLines.push(line)
        }
      }

      //  Now we need to move the circle
      circleLines = page.translate(circleLines, circle.v * 1 / (features.vLines + 1), circle.h * 1 / (features.hLines + 1))
      features.allCircles = [...features.allCircles, ...circleLines]
    })

    //  Do the dots
    features.allDots = []
    features.dots.forEach((dot) => {
      let dotLines = []
      //  We are doing a horizonal line, which means we need to squish
      const step = 0.007
      const maxRadius = Math.min(1 / (features.vLines + 1), 1 / (features.hLines + 1))
      const thisRadius = maxRadius * dot.radiusMod
      const roundRadius = Math.floor(thisRadius / step) * step

      for (let y = -roundRadius; y < roundRadius; y += step) {
        const x = Math.sqrt((roundRadius * roundRadius) - (y * y))
        let startX = -x
        let endX = x
        const line = new Line()
        line.addPoint(startX, y / ratio)
        line.addPoint(endX, y / ratio)
        dotLines.push(line)
      }

      for (let x = -roundRadius; x < roundRadius; x += step) {
        const y = Math.sqrt((roundRadius * roundRadius) - (x * x))
        let startY = -y
        let endY = y
        const line = new Line()
        line.addPoint(x, startY / ratio)
        line.addPoint(x, endY / ratio)
        dotLines.push(line)
      }

      //  Now we need to move the circle
      dotLines = page.translate(dotLines, dot.v * 1 / (features.vLines + 1), dot.h * 1 / (features.hLines + 1))
      features.allDots = [...features.allDots, ...dotLines]
    })

    //Check to see if any lines are out of bounds
    features.allLines.forEach((line) => {
      line.points.forEach((point) => {
        if (point.x < 0 || point.x > 1) outOfBounds = true
        if (point.y < 0 || point.y > 1) outOfBounds = true
      })
    })
    features.allCircles.forEach((line) => {
      line.points.forEach((point) => {
        if (point.x < 0 || point.x > 1) outOfBounds = true
        if (point.y < 0 || point.y > 1) outOfBounds = true
      })
    })
    features.allDots.forEach((line) => {
      line.points.forEach((point) => {
        if (point.x < 0 || point.x > 1) outOfBounds = true
        if (point.y < 0 || point.y > 1) outOfBounds = true
      })
    })
  }

  //  Scale them away from the edge a bit
  features.allLines = page.decimate(features.allLines)
  features.allLines = page.wobble(features.allLines, 0.3, 0.3)
  features.allLines = page.translate(features.allLines, -0.5, -0.5)
  features.allLines = page.scale(features.allLines, 0.9, 0.9)
  features.allLines = page.translate(features.allLines, 0.5, 0.5)

  features.allCircles = page.decimate(features.allCircles)
  features.allCircles = page.wobble(features.allCircles, 0.1, 0.1)
  features.allCircles = page.translate(features.allCircles, -0.5, -0.5)
  features.allCircles = page.scale(features.allCircles, 0.9, 0.9)
  features.allCircles = page.translate(features.allCircles, 0.5, 0.5)

  features.allDots = page.decimate(features.allDots)
  features.allDots = page.wobble(features.allDots, 0.1, 0.1)
  features.allDots = page.translate(features.allDots, -0.5, -0.5)
  features.allDots = page.scale(features.allDots, 0.9, 0.9)
  features.allDots = page.translate(features.allDots, 0.5, 0.5)

  const backgroundColour = fxrand()
  features.backgroundColour = 'Black'
  if (backgroundColour < 0.95) features.backgroundColour = 'Special'
  if (backgroundColour < 0.90) features.backgroundColour = 'Green'
  if (backgroundColour < 0.81) features.backgroundColour = 'Blue'
  if (backgroundColour < 0.72) features.backgroundColour = 'Pink'
  if (backgroundColour < 0.63) features.backgroundColour = 'Parchment'
  if (backgroundColour < 0.52) features.backgroundColour = 'Off White'
  if (backgroundColour < 0.32) features.backgroundColour = 'White'

  const convertToWash = fxrand()

  const lineColour = fxrand()
  features.lineColour = 'Black'
  if (lineColour < 0.40) features.lineColour = 'Ink'
  if (lineColour < 0.20) features.lineColour = 'Wash'
  if (features.backgroundColour === 'Black') {
    features.lineColour = 'Off White'
    if (convertToWash < 0.25) features.lineColour = 'Wash'
  }
  if (features.backgroundColour === 'Parchment' && features.lineColour === 'Wash') {
    features.lineColour = 'Ink'
  }
  if (features.backgroundColour === 'Special') features.lineColour = 'Black'

  const circleColour = fxrand()
  features.circleColour = features.lineColour
  if (features.backgroundColour === 'Black') {
    features.circleColour = 'Off White'
    if (convertToWash < 0.25) features.circleColour = 'Wash'
  }
  if (features.backgroundColour === 'Parchment' && features.circleColour === 'Wash') {
    features.circleColour = 'Ink'
  }
  if (features.backgroundColour === 'Special') features.circleColour = 'Black'

  const dotColour = fxrand()
  features.dotColour = 'Red'
  if (features.backgroundColour === 'Black') {
    if (features.circleColour === 'Wash') features.dotColour = 'Bright Red'
    if (dotColour < 0.60) features.dotColour = 'Bright Red'
    if (dotColour < 0.20) features.dotColour = 'Yellow'
  }

  if (features.backgroundColour === 'Special') {
    features.backgroundSpecial = fxrand()
  }
  if ((features.backgroundColour === 'Pink' || features.backgroundColour === 'Green' || features.backgroundColour === 'Blue') && fxrand() < 0.33) {
    features.backgroundColour += ' Gradient'
  }
  if (features.backgroundColour === 'Parchment' && fxrand() < 0.25) {
    features.backgroundColour += ' Gradient'
  }

  window.$fxhashFeatures = {
    'Mood': 'Calm',
    'Season': 'Summer',
    'Tension': 'Relaxed',
    'Background': features.backgroundColour,
    'Line colour': features.lineColour,
    'Circle colour': features.circleColour
  }
  if (features.allDots.length > 0) {
    window.$fxhashFeatures['Dot colour'] = features.dotColour
  }

  if (features.totalLines <= 2) window.$fxhashFeatures.Mood = 'Harmony'
  if (features.totalLines == 3) window.$fxhashFeatures.Mood = 'Tranquility'
  if (features.totalLines == 6) window.$fxhashFeatures.Mood = 'Shelter'
  if (features.totalLines >= 7) window.$fxhashFeatures.Mood = 'Sanctuary'

  if (features.circles.length < 4) window.$fxhashFeatures.Season = 'Autumn'
  if (features.circles.length === 1) window.$fxhashFeatures.Season = 'Winter'
  if (features.circles.length > 7) window.$fxhashFeatures.Season = 'Spring'

  if (features.circles.length === 1 && features.wholeCircles === 1) window.$fxhashFeatures.Moon = 'Full'
  if (features.circles.length === features.wholeCircles && features.wholeCircles > 1) window.$fxhashFeatures.Tension = 'Balance'
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()

const init = async () => {
  //  I should add a timer to this, but really how often to people who aren't
  //  the developer resize stuff all the time. Stick it in a digital frame and
  //  have done with it!
  window.addEventListener('resize', async () => {
    //  If we do resize though, work out the new size...
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(async () => {
      await layoutCanvas()
    }, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

const layoutCanvas = async () => {
  //  Kill the next animation frame
  window.cancelAnimationFrame(nextFrame)

  const wWidth = window.innerWidth
  const wHeight = window.innerHeight
  let cWidth = wWidth
  let cHeight = cWidth * ratio
  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }
  // Grab any canvas elements so we can delete them
  const canvases = document.getElementsByTagName('canvas')
  for (let i = 0; i < canvases.length; i++) {
    canvases[i].remove()
  }
  //  Now create a new canvas with the id "target" and attach it to the body
  const newCanvas = document.createElement('canvas')
  newCanvas.id = 'target'
  // Attach it to the body
  document.body.appendChild(newCanvas)

  let targetHeight = 4096
  if (!highRes) targetHeight /= 2
  let targetWidth = targetHeight / ratio
  let dpr = window.devicePixelRatio || 1

  //  If the alba params are forcing the width, then use that
  if (window && window.alba && window.alba.params && window.alba.params.width) {
    targetWidth = window.alba.params.width
    targetHeight = Math.floor(targetWidth * ratio)
  }

  // If *I* am forcing the width, then use that
  if ('forceWidth' in urlParams) {
    targetWidth = parseInt(urlParams.forceWidth)
    targetHeight = Math.floor(targetWidth * ratio)
    dpr = 1
  }

  // Set the size and position of the canvas
  const canvas = document.getElementById('target')
  canvas.height = targetHeight
  canvas.width = targetWidth
  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  //  And draw it!!
  drawCanvas()
}

const drawCanvas = () => {
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  if (features.backgroundColour === 'Special' || features.backgroundColour.includes('Gradient')) {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height)
    if (features.backgroundColour.includes('Gradient')) {
      grd.addColorStop(1, palette[features.backgroundColour.replace(' Gradient', '')])
      grd.addColorStop(0, "white")
    } else {
      if (features.backgroundSpecial > 0.75) {
        grd.addColorStop(1, "black")
        grd.addColorStop(0, "white")
        window.$fxhashFeatures.Background = '80s'
      }
      if (features.backgroundSpecial <= 0.75 && features.backgroundSpecial > 0.25) {
        grd.addColorStop(1, "#E4904E");
        grd.addColorStop(0.5, "#D3C7A5")
        grd.addColorStop(0, "#748D78")
        window.$fxhashFeatures.Background = 'World on Fire'
      }
      if (features.backgroundSpecial <= 0.25) {
        grd.addColorStop(1, "#91DEF7");
        grd.addColorStop(0, "#F690EC")
        window.$fxhashFeatures.Background = 'Summertime'
      }
    }
    ctx.fillStyle = grd
  } else {
    ctx.fillStyle = palette[features.backgroundColour]
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.lineWidth = 2 * canvas.width / 1000

  //  Draw the lines
  ctx.strokeStyle = linePalette[features.lineColour]
  features.allLines.forEach((line) => {
    ctx.beginPath()
    ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height)
    for (let p = 1; p < line.points.length; p++) {
      ctx.lineTo(line.points[p].x * canvas.width, line.points[p].y * canvas.height)
    }
    ctx.stroke()
  })

  //  Draw the circles
  ctx.strokeStyle = linePalette[features.circleColour]
  features.allCircles.forEach((line) => {
    ctx.beginPath()
    ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height)
    for (let p = 1; p < line.points.length; p++) {
      ctx.lineTo(line.points[p].x * canvas.width, line.points[p].y * canvas.height)
    }
    ctx.stroke()
  })

  //  Draw the dots
  ctx.strokeStyle = dotPalette[features.dotColour]
  features.allDots.forEach((line) => {
    ctx.beginPath()
    ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height)
    for (let p = 1; p < line.points.length; p++) {
      ctx.lineTo(line.points[p].x * canvas.width, line.points[p].y * canvas.height)
    }
    ctx.stroke()
  })

  if ('forceDownload' in urlParams) {
    autoDownloadCanvas()
  }
}

const autoDownloadCanvas = async (showHash = false) => {
  const element = document.createElement('a')
  element.setAttribute('download', `concord_${fxhash}`)
  element.style.display = 'none'
  document.body.appendChild(element)
  let imageBlob = null
  imageBlob = await new Promise(resolve => document.getElementById('target').toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob, {
    type: 'image/png'
  }))
  element.click()
  document.body.removeChild(element)
  // If we are dumping outputs then reload the page
  if (dumpOutputs) {
    window.location.reload()
  }
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    console.log('Highres mode is now', highRes)
    await layoutCanvas()
  }
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  If paper1 has loaded and we haven't draw anything yet, then kick it all off
  if (!drawn) {
    clearInterval(preloadImagesTmr)
    init()
  }
}
