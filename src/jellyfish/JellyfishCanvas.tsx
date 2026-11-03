"use client";
import { useEffect, useRef } from "react";
import { createScene, resizeScene } from "./geometry";
import { render } from "./render";
import { advance, disturb } from "./physics";
import "./jellyfish.css";

export default function JellyfishCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let scene = createScene(1, 1);
    let frame = 0,
      previous = 0,
      accumulator = 0,
      density = 1,
      active = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      density = dpr > 1 ? 0.5 : 0.6;
      if (scene.width <= 1 || scene.height <= 1)
        scene = createScene(width, height);
      else resizeScene(scene, width, height);
      render(ctx, scene);
    };
    const draw = () => render(ctx, scene, density);
    const animate = (now: number) => {
      if (!active) return;
      const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (!reduced.matches) {
        accumulator = advance(scene, accumulator, elapsed);
        draw();
      } else {
        stop();
        return;
      }
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (active || !visible || document.hidden || reduced.matches) return;
      active = true;
      previous = 0;
      frame = requestAnimationFrame(animate);
    };
    const stop = () => {
      active = false;
      cancelAnimationFrame(frame);
    };
    const pointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      scene.pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      if (reduced.matches) {
        for (const jelly of scene.creatures) {
          const proximityRadius = 175 * jelly.scale;
          const d = Math.hypot(
            jelly.x - scene.pointer.x,
            jelly.y - scene.pointer.y,
          );
          jelly.response = Math.max(0, 1 - d / proximityRadius);
        }
        draw();
      }
    };
    const pointerLeave = () => {
      scene.pointer = null;
      if (reduced.matches) {
        scene.creatures.forEach((j) => (j.response = 0));
        draw();
      }
    };
    const pointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const interactiveTarget = (event.target as HTMLElement).closest(
        'a,button,[role="button"]',
      );
      const nearCreature = scene.creatures.some(
        (jelly) => Math.hypot(jelly.x - x, jelly.y - y) < jelly.scale * 200,
      );
      if (interactiveTarget && !nearCreature) return;
      disturb(scene, x, y);
      draw();
    };
    const host = canvas.parentElement;
    const visibilityChange = () => (document.hidden ? stop() : start());
    const motionChange = () => {
      if (reduced.matches) {
        stop();
        draw();
      } else start();
    };
    const observer = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);
    resize();
    visibility.observe(canvas);
    host?.addEventListener("pointermove", pointerMove, { passive: true });
    host?.addEventListener("pointerleave", pointerLeave);
    host?.addEventListener("pointerdown", pointerDown, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    reduced.addEventListener("change", motionChange);
    start();
    return () => {
      stop();
      observer.disconnect();
      visibility.disconnect();
      host?.removeEventListener("pointermove", pointerMove);
      host?.removeEventListener("pointerleave", pointerLeave);
      host?.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("visibilitychange", visibilityChange);
      reduced.removeEventListener("change", motionChange);
    };
  }, []);
  return <canvas ref={ref} className="jellyfish-canvas" aria-hidden="true" />;
}
