import { useState } from 'react'
import mascot from '../assets/jyan-mascot.png'

type JyanMascotProps = {
  onClick: () => void
}

function JyanMascot({ onClick }: JyanMascotProps) {
  const [position, setPosition] = useState({
    x: 50,
    y: 50,
  })

  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const startX = event.clientX
    const startY = event.clientY

    const startPosition = {
      x: position.x,
      y: position.y,
    }

    let moved = false

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const distanceX = Math.abs(moveEvent.clientX - startX)
      const distanceY = Math.abs(moveEvent.clientY - startY)

      if (distanceX > 5 || distanceY > 5) {
        moved = true
        setIsDragging(true)
      }

      setPosition({
        x: startPosition.x + (moveEvent.clientX - startX),
        y: startPosition.y + (moveEvent.clientY - startY),
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      setIsDragging(false)

      if (!moved) {
        onClick()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="jyan-mascot"
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <img src={mascot} alt="JYAN mascot" />
    </div>
  )
}

export default JyanMascot