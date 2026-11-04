import { useEffect, useRef } from "react";
import "./halftone-wordmark.css";

// Adapted from Kedhareswer Naidu's MIT-licensed Halftone Wordmark Footer.
// https://21st.dev/@kedhareswer/components/halftone-wordmark-footer
export default function HalftoneWordmark({ wordmark = "Scribe" }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ink = [67, 73, 85], blue = [66, 139, 255];
    const gap = 6;
    let width = 1, height = 1, dpr = 1;
    let dots = new Float32Array(0), grain = null;
    let pointerX = -100000, pointerY = -100000;
    let ring = { x: 0, y: 0, time: -1 };
    let frame = 0, visible = true, disposed = false;

    const layout = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const print = mask.getContext("2d", { willReadFrequently: true });
      if (!print) return;
      const family = getComputedStyle(root).fontFamily;
      print.font = `800 100px ${family}`;
      const size = width * 1.02 / print.measureText(wordmark || " ").width * 100;
      print.font = `800 ${size}px ${family}`;
      const metrics = print.measureText(wordmark);
      const ascent = metrics.actualBoundingBoxAscent || size * 0.72;
      print.fillStyle = "#000";
      print.textBaseline = "alphabetic";
      print.fillText(wordmark, (width - metrics.width) / 2, height + ascent * 0.2);
      const pixels = print.getImageData(0, 0, width, height).data;
      const points = [];
      for (let row = 0; row < Math.ceil(height / gap); row++) {
        for (let col = 0; col < Math.ceil(width / gap); col++) {
          let coverage = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(width - 1, Math.floor(col * gap + (sx + 0.5) * gap / 3));
              const y = Math.min(height - 1, Math.floor(row * gap + (sy + 0.5) * gap / 3));
              coverage += pixels[(y * width + x) * 4 + 3];
            }
          }
          coverage /= 9 * 255;
          if (coverage < 0.06) continue;
          const x = col * gap + gap / 2, y = row * gap + gap / 2;
          points.push(x, y, 0, 0, x, y, Math.sqrt(coverage) * gap * 0.56);
        }
      }
      dots = new Float32Array(points);
      const texture = document.createElement("canvas");
      texture.width = texture.height = 256;
      const textureCtx = texture.getContext("2d");
      if (textureCtx) {
        const noise = textureCtx.createImageData(256, 256);
        for (let i = 0; i < noise.data.length; i += 4) {
          const value = Math.random() * 255;
          noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value;
          noise.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        textureCtx.putImageData(noise, 0, 0);
        grain = ctx.createPattern(texture, "repeat");
      }
    };

    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const age = ring.time < 0 ? Infinity : now - ring.time;
      const radius = motion.matches ? 0 : 80;
      let moving = false;
      for (let i = 0; i < dots.length; i += 7) {
        let x = dots[i], y = dots[i + 1], vx = dots[i + 2], vy = dots[i + 3];
        const homeX = dots[i + 4], homeY = dots[i + 5];
        if (!motion.matches) {
          if (age < 900) {
            const dx = homeX - ring.x, dy = homeY - ring.y;
            const distance = Math.hypot(dx, dy) + 0.001;
            const strength = 1 - Math.min(1, Math.abs(distance - age * 0.9) / 26);
            const impulse = strength * 3.2 * (1 - age / 900);
            vx += dx / distance * impulse;
            vy += dy / distance * impulse;
          }
          const dx = x - pointerX, dy = y - pointerY;
          if (radius > 0 && dx * dx + dy * dy < radius * radius) {
            const distance = Math.hypot(dx, dy) + 0.001;
            const force = (1 - distance / radius) * 2.6;
            vx += dx / distance * force;
            vy += dy / distance * force;
          }
          vx = (vx + (homeX - x) * 0.05) * 0.84;
          vy = (vy + (homeY - y) * 0.05) * 0.84;
          x += vx;
          y += vy;
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - homeX) + Math.abs(y - homeY) > 0.05) {
            moving = true;
          } else {
            x = homeX; y = homeY; vx = 0; vy = 0;
          }
        } else {
          x = homeX; y = homeY; vx = 0; vy = 0;
        }
        dots[i] = x; dots[i + 1] = y; dots[i + 2] = vx; dots[i + 3] = vy;
        const highlight = Math.min(1, Math.hypot(x - homeX, y - homeY) / 28);
        ctx.fillStyle = highlight > 0.02
          ? `rgb(${ink.map((value, index) => Math.round(value + (blue[index] - value) * highlight)).join(",")})`
          : "#434955";
        ctx.beginPath();
        ctx.arc(x, y, dots[i + 6], 0, Math.PI * 2);
        ctx.fill();
      }
      if (grain) {
        ctx.globalAlpha = 0.045;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
      return !motion.matches && (moving || age < 900 || pointerX > -10000);
    };
    const loop = (now) => {
      frame = 0;
      if (!visible || document.hidden || disposed) return;
      if (draw(now)) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!frame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(loop);
    };
    const local = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top];
    };
    const move = (event) => { [pointerX, pointerY] = local(event); wake(); };
    const leave = () => { pointerX = pointerY = -100000; wake(); };
    const down = (event) => {
      if (motion.matches) return;
      const [x, y] = local(event);
      ring = { x, y, time: performance.now() };
      wake();
    };
    const resize = new ResizeObserver(() => { layout(); draw(performance.now()); wake(); });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    layout();
    draw(performance.now());
    resize.observe(root);
    intersection.observe(root);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    root.addEventListener("pointerdown", down);
    document.addEventListener("visibilitychange", wake);
    motion.addEventListener("change", wake);
    document.fonts.ready.then(() => {
      if (!disposed) { layout(); draw(performance.now()); wake(); }
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointercancel", leave);
      root.removeEventListener("pointerdown", down);
      document.removeEventListener("visibilitychange", wake);
      motion.removeEventListener("change", wake);
    };
  }, [wordmark]);

  return (
    <div ref={rootRef} className="halftone-wordmark" role="img" aria-label={wordmark}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
