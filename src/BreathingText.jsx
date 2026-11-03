import { Fragment } from "react";
import "./breathing-text.css";

// CSS adaptation of Fancy Components' variable-font Breathing Text effect.
export default function BreathingText({
  children,
  as: Tag = "span",
  fromFontVariationSettings = '"wght" 350',
  toFontVariationSettings = '"wght" 650',
  duration = 1.8,
  staggerDuration = 0.035,
  className = "",
}) {
  const text = String(children);
  let letterIndex = 0;

  return (
    <Tag
      className={`breathing-text ${className}`.trim()}
      style={{
        "--breathing-from": fromFontVariationSettings,
        "--breathing-to": toFontVariationSettings,
        "--breathing-duration": `${duration}s`,
      }}
    >
      <span aria-hidden="true">
        {text.split(/(\s+)/).map((word, wordIndex) => {
          if (/^\s+$/.test(word)) {
            letterIndex += word.length;
            return <Fragment key={wordIndex}>{word}</Fragment>;
          }

          return (
            <span className="breathing-word" key={wordIndex}>
              {Array.from(word).map((letter, index) => {
                const offset = Math.abs(letterIndex++ - Math.floor(text.length / 2));
                return (
                  <span className="breathing-letter" key={index}>
                    <span style={{ animationDelay: `${offset * staggerDuration}s` }}>
                      {letter}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
      <span className="breathing-text-label">{text}</span>
    </Tag>
  );
}
