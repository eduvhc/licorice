import * as React from "react"

/**
 * Local-first value that mirrors a server-derived prop (e.g. read from the
 * URL) but updates instantly on input, syncing back out (e.g. to the URL)
 * only after `delayMs` of inactivity. Shared by every simulation control
 * that reads its value from a query param (margin, batch volume, ...).
 */
export function useDebouncedQueryValue<T>(
  propValue: T,
  onSync: (value: T) => void,
  delayMs: number
) {
  const [local, setLocal] = React.useState(propValue)
  const [synced, setSynced] = React.useState(propValue)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  if (propValue !== synced) {
    setSynced(propValue)
    setLocal(propValue)
  }

  function set(value: T) {
    setLocal(value)

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    timeout.current = setTimeout(() => onSync(value), delayMs)
  }

  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
    }
  }, [])

  return [local, set] as const
}
