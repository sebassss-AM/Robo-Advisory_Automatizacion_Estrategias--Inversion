"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  action: string
  comments: string | null
  decided_at: string
  profile_id: string
  profile: string
  score: number
  message: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastSeen, setLastSeen] = useState("")
  const [newCount, setNewCount] = useState(0)
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const params = lastSeen ? `?since=${encodeURIComponent(lastSeen)}` : ""
      const res = await fetch(`/api/notificaciones${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("inversia_token")}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.notifications?.length > 0) {
        setNotifications((prev) => {
          const existing = new Set(prev.map((n) => n.id))
          const newOnes = data.notifications.filter((n: Notification) => !existing.has(n.id))
          if (newOnes.length > 0 && prevCountRef.current > 0) {
            const latest = newOnes[0]
            setToast({ message: latest.message, id: latest.id })
            setTimeout(() => setToast(null), 5000)
          }
          return [...newOnes, ...prev].slice(0, 20)
        })
        if (data.notifications.length > 0) {
          setLastSeen(data.notifications[0].decided_at)
        }
        setNewCount((prev) => prev + data.notifications.length)
        prevCountRef.current = data.count
      }
    } catch {
      /* ignore */
    }
  }, [lastSeen])

  useEffect(() => {
    fetchNotifications()
    let timeout: ReturnType<typeof setTimeout>
    const poll = () => {
      timeout = setTimeout(async () => {
        const prev = newCount
        await fetchNotifications()
        if (newCount === prev) {
          poll()
        } else {
          timeout = setTimeout(poll, 60000)
        }
      }, 60000)
    }
    timeout = setTimeout(poll, 60000)
    return () => clearTimeout(timeout)
  }, [fetchNotifications, newCount])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleOpen = () => {
    setOpen(!open)
    setNewCount(0)
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-4 text-sm text-white shadow-2xl shadow-black/20 ring-1 ring-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="max-w-xs">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div ref={dropdownRef} className="relative">
        <button
          onClick={handleOpen}
          className="btn-ghost relative p-2 text-sm"
          aria-label="Notificaciones"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {newCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {newCount > 9 ? "9+" : newCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 animate-scale-in overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10 ring-1 ring-gray-100">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-bold text-gray-900">Notificaciones</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Sin notificaciones
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false)
                      router.push(`/propuesta?profile_id=${n.profile_id}`)
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      n.action === "aprobado" ? "bg-emerald-100 text-emerald-600" :
                      n.action === "rechazado" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {n.action === "aprobado" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        ) : n.action === "rechazado" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        )}
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(n.decided_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
