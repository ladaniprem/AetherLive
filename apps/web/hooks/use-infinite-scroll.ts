import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted",
  loadMore: (numItems: number) => void;
  loadSize?: number;
  observerEnabled?: boolean;
};

export const useInfiniteScroll = ({
  status,
  loadMore,
  loadSize = 10,
  observerEnabled = true,
}: UseInfiniteScrollProps) => {
  const topElementRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(loadSize);
    }
  }, [status, loadMore, loadSize]);

  useEffect(() => {
    const topElement = topElementRef.current;
    if (!(topElement && observerEnabled)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topElement);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, observerEnabled]);

  return {
    topElementRef,
    handleLoadMore,
    canLoadMore: status === "CanLoadMore",
    isLoadingMore: status === "LoadingMore",
    isLoadingFirstPage: status === "LoadingFirstPage",
    isExhausted: status === "Exhausted",
  };
};
/* 
note :- 
Scroll → Element Visible → Observer Detects → loadMore() → New Data
Important Things to Remember

1. useRef:-
const topElementRef = useRef(null);
Stores the DOM element that will be observed.

2. IntersectionObserver:-
new IntersectionObserver(...)
Watches when an element enters the viewport without using scroll events.

Why better than onscroll?
More performant
Browser optimized
Less calculations

3. entry.isIntersecting
if (entry.isIntersecting)
Means:
Observed element is visible on screen
This is the main trigger for loading more data.

4. Status Check
if (status === "CanLoadMore")
Prevents:
LoadingMore → duplicate API calls
Exhausted → unnecessary API calls

5. threshold: 0.1
{ threshold: 0.1 }
Means:
10% of element visible
→ callback fires

6. Cleanup
observer.disconnect();
Always disconnect observer on unmount to avoid memory leaks.

Easy Memory Trick
Ref  → What to watch
Observer → Watches it
Intersecting → Is it visible?
CanLoadMore → Safe to fetch?
loadMore() → Fetch next data
disconnect() → Cleanup
*/