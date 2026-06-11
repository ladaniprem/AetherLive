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
// !! = Converts any value to a boolean.
/* 
!!true       // true
!!false      // false
!!undefined  // false
!!null       // false
*/
  return !!isMobile
}
/* 
explain the logic 
Width < 768px → Mobile
Width ≥ 768px → Tablet/Desktop

Examples:

Screen Width	Result
320px	Mobile
500px	Mobile
767px	Mobile
768px	Desktop
1024px	Desktop

Why undefined?

When React first renders, it doesn't yet know the screen size because the effect hasn't run.

Initial flow:

Render
↓
isMobile = undefined
↓
useEffect runs
↓
Calculate actual value
↓
Update state

Cleanup
return () =>
  mql.removeEventListener("change", onChange)

When component unmounts:

removeEventListener(...)

is called.

This prevents:

Memory leaks
Duplicate listeners
*/