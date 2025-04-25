
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatch = () => {
      setMatches(media.matches)
    }
    
    // Initial check
    updateMatch()
    
    // Add listener
    if (media.addEventListener) {
      media.addEventListener("change", updateMatch)
    } else {
      // Fallback for older browsers
      media.addListener(updateMatch)
    }
    
    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateMatch)
      } else {
        // Fallback for older browsers
        media.removeListener(updateMatch)
      }
    }
  }, [query])

  return matches
}
