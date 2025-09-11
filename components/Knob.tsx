'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface KnobProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label: string
  className?: string
}

export default function Knob({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  label,
  className 
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef<number>(0)
  const startValueRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      // Calculate vertical movement (negative because up is decrease in Y)
      const deltaY = startYRef.current - e.clientY
      const range = max - min
      // Adjust sensitivity: 200px for full range
      const deltaValue = (deltaY / 200) * range
      
      // Calculate new value
      let newValue = startValueRef.current + deltaValue
      newValue = Math.max(min, Math.min(max, newValue))
      
      onChange(Math.round(newValue))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, onChange, min, max])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
  }

  // Calculate rotation based on value
  const rotation = ((value - min) / (max - min)) * 270 - 135

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div 
          className="plugin-knob cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `rotate(${rotation}deg)`
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
      <div className="mt-2 text-xs text-center">
        <div className="text-muted-foreground">{label}</div>
        <div className="font-mono">{value}%</div>
      </div>
    </div>
  )
}