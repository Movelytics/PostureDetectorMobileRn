import { View } from 'react-native'
import Svg, { Circle, Line } from 'react-native-svg'

//threshold accuracy model
const MIN_KEYPOINT_SCORE = 0.3

export const drawSqueleton = (poses) => {
  const circles = drawCircles(poses)
  const lines = drawLines(poses)

  return (
    <Svg
      style={{
        position: 'absolute',
        zIndex: 30,
        transform: [{ scaleX: -1 }]
      }}>
      {circles}
      {lines}
    </Svg>
  )
}

export const drawCircles = (poses) => {
  const circles = poses.keypoints
    .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
    .map((k) => {
      const x = k.x
      const y = k.y

      return (
        <Circle
          key={`skeletonkp_${k.name}`}
          cx={x}
          cy={y}
          r='8'
          strokeWidth='4'
          fill='#cff532'
          stroke='#FFC300'
        />
      )
    })

  return circles
}

function drawLine(pointA, pointB) {
  if (pointA.score < MIN_KEYPOINT_SCORE || pointB.score < MIN_KEYPOINT_SCORE)
    return

  const x1 = pointA.x
  const y1 = pointA.y

  const x2 = pointB.x
  const y2 = pointB.y

  return (
    <Line
      key={`skeletonkp_line_${pointA.name}_${pointB.name}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke='#cff532'
      strokeWidth={4}
    />
  )
}

export const drawLines = (
  poses,
  showFacePoints = true
) => {
  let lines = []
  if (poses.keypoints) {
    // key points by name
    const points = new Map()
    poses.keypoints.map((point) => points.set(point.name, point))

    // draw pose lines: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection#keypoint-diagram
    lines.push(
      drawLine(
        points.get('left_shoulder'),
        points.get('right_shoulder')
      )
    )
    lines.push(
      drawLine(
        points.get('left_hip'),
        points.get('right_hip')
      )
    )

    // left arm
    lines.push(
      drawLine(
        points.get('left_shoulder'),
        points.get('left_elbow')
      )
    )
    lines.push(
      drawLine(
        points.get('left_elbow'),
        points.get('left_wrist')
      )
    )

    // left side
    lines.push(
      drawLine(
        points.get('left_shoulder'),
        points.get('left_hip')
      )
    )

    // left leg
    lines.push(
      drawLine(
        points.get('left_hip'),
        points.get('left_knee')
      )
    )
    lines.push(
      drawLine(
        points.get('left_knee'),
        points.get('left_ankle')
      )
    )

    // right arm
    lines.push(
      drawLine(
        points.get('right_shoulder'),
        points.get('right_elbow')
      )
    )
    lines.push(
      drawLine(
        points.get('right_elbow'),
        points.get('right_wrist')
      )
    )

    // right side
    lines.push(
      drawLine(
        points.get('right_shoulder'),
        points.get('right_hip')
      )
    )

    // right leg
    lines.push(
      drawLine(
        points.get('right_hip'),
        points.get('right_knee')
      )
    )
    lines.push(
      drawLine(
        points.get('right_knee'),
        points.get('right_ankle')
      )
    )

    if (showFacePoints) {
      lines.push(drawLine(points.get('right_ear'), points.get('right_eye')))
      lines.push(drawLine(points.get('right_eye'), points.get('nose')))
      lines.push(drawLine(points.get('nose'), points.get('left_eye')))
      lines.push(drawLine(points.get('left_eye'), points.get('left_ear')))
    }
  }
  return lines
}

export const renderPose = (poses) => {
  console.log('poses', poses)
  if (poses && poses.keypoints?.length > 0) {
    return drawSqueleton(poses)
  } else {
    return <View />
  }
}
