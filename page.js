/* global fxrand Line Blob */

const PAPER = { // eslint-disable-line no-unused-vars
  A1: [59.4, 84.1],
  A2: [42.0, 59.4],
  A3: [29.7, 42.0],
  A4: [21.0, 29.7],
  A5: [14.8, 21.0],
  A6: [10.5, 14.8]
}

const page = { // eslint-disable-line no-unused-vars
  dpi: 300,
  translate: (lines, x, y) => {
    lines.forEach((line) => {
      line.points.forEach((point) => {
        point.x += x
        point.y += y
      })
    })
    return lines
  },
  scale: (lines, x, y) => {
    lines.forEach((line) => {
      line.points.forEach((point) => {
        point.x *= x
        point.y *= y
      })
    })
    return lines
  },
  wobble: (lines, x, y) => {
    lines.forEach((line) => {
      line.points.forEach((point) => {
        point.x += (fxrand() - 0.5) * 0.01 * x
        point.y += (fxrand() - 0.5) * 0.01 * y
      })
    })
    return lines
  },
  decimate: (lines) => {
    const newLines = []
    lines.forEach((line) => {
      const newLine = new Line(line.getZindex())
      const points = line.getPoints()
      for (let pi = 0; pi < points.length - 1; pi++) {
        const p1 = points[pi]
        const p2 = points[pi + 1]
        let xDiff = p2.x - p1.x
        let yDiff = p2.y - p1.y
        let zDiff = p2.z - p1.z
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff)
        const times = parseInt(distance / 0.01)
        const percent = 100 / times / 100
        if (times > 0) {
          for (var d = 0; d < times; d++) {
            newLine.addPoint(p1.x + (xDiff * percent * d), p1.y + (yDiff * percent * d), p1.z + (zDiff * percent * d))
          }
        } else {
          newLine.addPoint(p1.x, p1.y, p1.z)
        }
      }
      //  Add the last point
      newLine.addPoint(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z)
      newLines.push(newLine)
    })
    return newLines
  },

  wrapSVG: (lines, size, filename) => {
    let output = `<?xml version="1.0" standalone="no" ?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" 
        "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg version="1.1" id="lines" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0" y="0"
        viewBox="0 0 ${size[0]} ${size[1]}"
        width="${size[0]}cm"
        height="${size[1]}cm" 
        xml:space="preserve">`

    output += `
        <g>
        <path d="`
    lines.forEach((line) => {
      const points = line.getPoints()
      output += `M ${points[0].x * size[0]} ${points[0].y * size[1]} `
      for (let p = 1; p < points.length; p++) {
        output += `L ${points[p].x * size[0]} ${points[p].y * size[1]} `
      }
    })
    output += `"  fill="none" stroke="black" stroke-width="0.05"/>
      </g>`
    output += '</svg>'

    var element = document.createElement('a')
    element.setAttribute('download', `${filename}.svg`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.setAttribute('href', window.URL.createObjectURL(new Blob([output], {
      type: 'text/plain;charset=utf-8'
    })))
    element.click()
    document.body.removeChild(element)
  }
}
