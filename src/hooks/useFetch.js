import { useCallback, useEffect, useState } from 'react'

// runs an async function and reports loading / error / data, a stale answer is ignored
export function useFetch(task, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    setState((previous) => ({ data: previous.data, error: null, loading: true }))
    task().then(
      (data) => current && setState({ data, error: null, loading: false }),
      (error) => current && setState({ data: null, error, loading: false }),
    )
    return () => { current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((count) => count + 1), [])
  return { ...state, retry }
}
