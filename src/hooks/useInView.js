import { useEffect, useRef, useState } from 'react'

// becomes true (and stays true) once the element is near the screen, so rows load as you scroll
export function useInView(margin = '300px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || seen) return undefined
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect() }
    }, { rootMargin: margin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [seen, margin])

  return [ref, seen]
}
