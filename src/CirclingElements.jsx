import { Children } from "react";
import "./circling-elements.css";

// Based on the Circling Elements pattern from Fancy Components.
export default function CirclingElements({
  children,
  radius = 100,
  duration = 24,
  easing = "linear",
  direction = "normal",
  pauseOnHover = false,
  className = "",
}) {
  const items = Children.toArray(children);

  return (
    <div
      className={`circling-elements ${pauseOnHover ? "pause-on-hover" : ""} ${className}`.trim()}
      role="list"
    >
      {items.map((child, index) => (
        <div
          className="circling-element"
          role="listitem"
          key={child.key ?? index}
          style={{
            "--circling-offset": `${(index * 360) / items.length}deg`,
            "--circling-radius": typeof radius === "number" ? `${radius}px` : radius,
            animationDuration: `${duration}s`,
            animationTimingFunction: easing,
            animationDirection: direction,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
