"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const demoSteps = [
  { delay: 1000, side: "bot", text: "Hi there! 👋 I'm your AI support agent. How can I help you today?" },
  { delay: 2500, side: "user", text: "I need help resetting my password." },
  { delay: 2000, side: "bot", text: "No problem! I can help with that. Just click \"Forgot Password\" on the login page and I'll send a reset link to your email. Want me to walk you through it?" },
  { delay: 2500, side: "user", text: "Yes, please!" },
  { delay: 2000, side: "bot", text: "Perfect! I've sent a password reset email to the address on your account. Check your inbox (and spam folder) for a link. It expires in 30 minutes for security. Let me know if you need anything else! 🔐" },
]

function BotAvatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
      AI
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-[10px] font-bold text-white">
      U
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="size-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
      <span className="size-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "150ms" }} />
      <span className="size-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

export function LiveDemo() {
  const [bubbles, setBubbles] = useState<Array<{ side: "user" | "bot"; text: string }>>([])
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState("")
  const [liveMode, setLiveMode] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [bubbles, typing])

  const addBubble = useCallback((side: "user" | "bot", text: string) => {
    setBubbles((prev) => [...prev, { side, text }])
  }, [])

  useEffect(() => {
    if (liveMode) return
    if (step >= demoSteps.length) return

    const s = demoSteps[step]
    const t = setTimeout(() => {
      setTyping(s.side === "bot")
      const t2 = setTimeout(() => {
        setTyping(false)
        addBubble(s.side as "user" | "bot", s.text)
        setStep((p) => p + 1)
      }, s.side === "bot" ? 1200 : 600)
      return () => clearTimeout(t2)
    }, s.delay)

    return () => clearTimeout(t)
  }, [step, liveMode, addBubble])

  const handleSend = () => {
    if (!input.trim()) return
    setLiveMode(true)
    addBubble("user", input)
    setInput("")
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addBubble("bot", "Great question! I'd love to help with that. Could you share a bit more detail so I can give you the best answer?")
    }, 1500 + Math.random() * 1000)
  }

  return (
    <section className="relative overflow-hidden py-6 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
            See it in action
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base lg:text-lg">
            Try our AI support agent live — type a message and see how it responds.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500" />
                <div className="size-2.5 rounded-full bg-yellow-500" />
                <div className="size-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-xs font-medium text-muted-foreground">
                AetherLive Support
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <div ref={chatRef} className="h-[400px] overflow-y-auto p-4">
              {bubbles.length === 0 && !typing && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground/40">Starting demo...</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {bubbles.map((b, i) => (
                  <div key={i} className={`flex items-end gap-2 ${b.side === "user" ? "flex-row-reverse" : ""}`}>
                    {b.side === "bot" ? <BotAvatar /> : <UserAvatar />}
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      b.side === "bot"
                        ? "rounded-bl-sm bg-muted text-foreground"
                        : "rounded-br-sm bg-blue-500 text-white"
                    }`}>
                      {b.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-end gap-2">
                    <BotAvatar />
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="min-w-0 flex-1 rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-0 transition-all placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSend() }
                  }}
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-3.5 text-sm font-medium text-white transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
                This is a simulated demo. Responses are pre-defined for illustration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
