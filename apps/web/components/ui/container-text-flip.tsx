"use client"

import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function ContainerTextFlip({
  words,
  className,
}: {
  words: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{words[index]}</span>
      <span
        key={index}
        className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-300 text-blue-500"
      >
        {words[index]}
      </span>
    </span>
  )
}
