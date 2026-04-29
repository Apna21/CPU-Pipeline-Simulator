import { useEffect, useRef, useState } from "react";

interface UseInViewAnimationOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export const useInViewAnimation = <T extends HTMLElement>(
  { root = null, rootMargin = "0px 0px -10% 0px", threshold = 0.15 }: UseInViewAnimationOptions = {}
) => {
  const elementRef = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return { elementRef, isVisible };
};
