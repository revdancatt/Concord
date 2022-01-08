const page = {
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
  }
}