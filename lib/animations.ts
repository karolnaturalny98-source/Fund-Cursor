"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
}

export function useStaggerAnimation(
  itemCount: number,
  delay = 100
) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    const timers = Array.from({ length: itemCount }, (_, index) =>
      setTimeout(() => {
        setVisibleItems((prev) => {
          const newItems = [...prev];
          newItems[index] = true;
          return newItems;
        });
      }, index * delay)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [itemCount, delay]);

  return visibleItems;
}

export function useFadeIn(options: UseScrollAnimationOptions = {}) {
  const { ref, isVisible } = useScrollAnimation(options);

  return {
    ref,
    className: `transition-opacity duration-700 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`,
  };
}

export function useSlideIn(
  direction: "up" | "down" | "left" | "right" = "up",
  options: UseScrollAnimationOptions = {}
) {
  const { ref, isVisible } = useScrollAnimation(options);

  const translateMap = {
    up: "translateY(20px)",
    down: "translateY(-20px)",
    left: "translateX(20px)",
    right: "translateX(-20px)",
  };

  return {
    ref,
    className: `transition-all duration-700 ${
      isVisible
        ? "opacity-100 translate-x-0 translate-y-0"
        : `opacity-0 ${translateMap[direction]}`
    }`,
  };
}

