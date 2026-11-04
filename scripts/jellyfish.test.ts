import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createScene,
  bellGlyphs,
  bellScale,
  BELL_BASE_Y,
  resizeScene,
  bellSurfacePoint,
} from "../src/jellyfish/geometry.ts";
import { step, disturb } from "../src/jellyfish/physics.ts";
import { project, render } from "../src/jellyfish/render.ts";
import {
  bellMesh,
  bellLip,
  projectBell,
} from "../src/jellyfish/bellSurface.ts";

function canvasMock() {
  const calls: { char: string; glow: string; alpha: number }[] = [];
  const resources = { canvases: 0, paths: 0 };
  const gradient = () => ({ addColorStop() {} });
  const finite = (...values: number[]) => {
    assert.ok(
      values.every(Number.isFinite),
      "all drawing coordinates are finite",
    );
    resources.paths++;
  };
  const initial = {
    globalAlpha: 0.73,
    globalCompositeOperation: "multiply",
    filter: "opacity(80%)",
    shadowBlur: 3,
    shadowColor: "#123456",
    fillStyle: "#abcdef",
    strokeStyle: "#fedcba",
    lineWidth: 4,
    lineCap: "butt",
    lineJoin: "miter",
    textAlign: "left",
    textBaseline: "top",
  };
  const stack: Record<string, unknown>[] = [];
  const ctx = {
    ...initial,
    canvas: {
      ownerDocument: {
        createElement: () => {
          resources.canvases++;
          return {
            dataset: {},
            width: 0,
            height: 0,
            getContext: () => ({
              beginPath() {},
              moveTo: finite,
              arc: finite,
              fill() {},
              fillRect: finite,
              strokeRect: finite,
              createRadialGradient: gradient,
              createLinearGradient: gradient,
            }),
          };
        },
      },
    },
    save() {
      stack.push(
        Object.fromEntries(
          Object.keys(initial).map((key) => [
            key,
            this[key as keyof typeof this],
          ]),
        ),
      );
    },
    restore() {
      assert.ok(stack.length, "balanced restore");
      Object.assign(this, stack.pop());
    },
    clearRect() {
      calls.length = 0;
    },
    beginPath() {},
    closePath() {},
    clip() {},
    fill() {},
    stroke() {},
    moveTo: finite,
    lineTo: finite,
    quadraticCurveTo: finite,
    bezierCurveTo: finite,
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    drawImage(tile: HTMLCanvasElement, ...coordinates: number[]) {
      finite(...coordinates);
      if (tile.dataset.glyph)
        calls.push({
          char: tile.dataset.glyph,
          glow: tile.dataset.glow,
          alpha: this.globalAlpha,
        });
    },
  };
  return {
    ctx: ctx as unknown as CanvasRenderingContext2D,
    calls,
    resources,
    assertRestored() {
      assert.equal(stack.length, 0, "all clip and drawing scopes restored");
      for (const [key, value] of Object.entries(initial))
        assert.equal(ctx[key as keyof typeof ctx], value, key);
    },
  };
}

function assertRootsInsideSkirt(scene: ReturnType<typeof createScene>) {
  const skirt = bellGlyphs.filter((point) => point.y === BELL_BASE_Y);
  const left = Math.min(...skirt.map((point) => point.x));
  const right = Math.max(...skirt.map((point) => point.x));
  for (const jelly of scene.creatures) {
    const scale = bellScale(jelly);
    for (const tentacle of jelly.tentacles) {
      const root = tentacle.nodes[0];
      const x = (root.x - jelly.x) / scale.x;
      const y = (root.y - jelly.y) / scale.y;
      assert.ok(x > left + 4 && x < right - 4, "root fits inside the skirt");
      assert.ok(
        y > BELL_BASE_Y - 18.5 && y < BELL_BASE_Y,
        "root overlaps the lower bell",
      );
    }
  }
}

test("exactly four deterministic, distinct creatures with 7–10 connected tentacles", () => {
  const scene = createScene(1440, 760);
  assertRootsInsideSkirt(scene);
  assert.equal(scene.creatures.length, 4);
  assert.equal(new Set(scene.creatures.map((j) => j.color)).size, 4);
  assert.equal(new Set(scene.creatures.map((j) => j.scale)).size, 4);
  assert.deepEqual(scene, createScene(1440, 760));
  assert.deepEqual(
    scene.creatures.map((j) => j.tentacles.length),
    [7, 8, 9, 10],
  );
  assert.ok(
    scene.creatures.every((j) =>
      j.tentacles.every((t) => t.nodes.length === 14),
    ),
  );
  assert.ok(bellGlyphs.length > 200);
  assert.ok(
    bellGlyphs.every((p) => ["dot", "tile", "square"].includes(p.char)),
  );
});
test("fixed steps produce smooth movement and spring-following tentacles", () => {
  const a = createScene(1440, 700),
    b = createScene(1440, 700);
  const start = a.creatures.map((j) => ({ x: j.x, y: j.y }));
  for (let i = 0; i < 240; i++) {
    step(a);
    step(b);
    assertRootsInsideSkirt(a);
  }
  assert.deepEqual(a, b);
  assert.ok(
    a.creatures.every(
      (j, i) => Math.hypot(j.x - start[i].x, j.y - start[i].y) < 150,
    ),
  );
  assert.ok(
    a.creatures.every((j) =>
      j.tentacles.some((tentacle) => {
        const nodes = tentacle.nodes;
        const root = nodes[0],
          tip = nodes.at(-1)!;
        return nodes.some(
          (node, i) =>
            Math.abs(
              node.x - (root.x + ((tip.x - root.x) * i) / (nodes.length - 1)),
            ) > 1,
        );
      }),
    ),
  );
});

test("glyph identities and glow stay stable while depth ordering changes", () => {
  const scene = createScene(1440, 760);
  scene.creatures = [scene.creatures[0]];
  const { calls, ctx } = canvasMock();
  render(ctx, scene);
  const initial = [...calls];
  const jelly = scene.creatures[0];
  for (let frame = 0; frame < 180; frame++) {
    scene.pointer = { x: jelly.x, y: jelly.y };
    if (frame === 30) disturb(scene, jelly.x, jelly.y);
    step(scene);
    assertRootsInsideSkirt(scene);
    render(ctx, scene);
    assert.deepEqual(
      calls.map(({ char, glow }) => `${char}:${glow}`).sort(),
      initial.map(({ char, glow }) => `${char}:${glow}`).sort(),
    );
    assert.ok(
      calls.some(({ alpha }) => alpha === 0),
      "tentacle roots are hidden in the bell",
    );
    assert.ok(
      calls.some(({ char, alpha }) => char === "dot" && alpha > 0.5),
      "tentacles remain visible below the bell",
    );
  }
});
test("3D attachments and perspective expose front and back tentacles", () => {
  const scene = createScene(1440, 760);
  for (const jelly of scene.creatures) {
    const roots = jelly.tentacles.map((t) => t.nodes[0]);
    assert.ok(roots.some((root) => root.z < 0));
    assert.ok(roots.some((root) => root.z > 0));
    const front = project(
      jelly,
      { x: 0, y: 16 * jelly.scale, z: 43 * jelly.scale },
      0,
    );
    const rear = project(
      jelly,
      { x: 0, y: 16 * jelly.scale, z: -43 * jelly.scale },
      0,
    );
    assert.ok(front.y > rear.y, "underside projects to an ellipse");
    assert.ok(
      front.perspective > rear.perspective,
      "front strands appear larger",
    );
    assert.ok(
      front.depth > rear.depth,
      "rear strands sort behind front strands",
    );
  }
  for (let i = 0; i < 240; i++) step(scene);
  resizeScene(scene, 390, 844);
  for (const jelly of scene.creatures) {
    for (const tentacle of jelly.tentacles) {
      for (const node of tentacle.nodes)
        assert.ok(Number.isFinite(node.z) && Number.isFinite(node.vz));
    }
  }
});

test("independent wandering explores both axes across the hero over time", () => {
  const scene = createScene(1440, 760);
  const bounds = scene.creatures.map((jelly) => ({
    minX: jelly.x,
    maxX: jelly.x,
    minY: jelly.y,
    maxY: jelly.y,
  }));
  for (let i = 0; i < 45 * 120; i++) {
    step(scene);
    scene.creatures.forEach((jelly, index) => {
      const bound = bounds[index];
      bound.minX = Math.min(bound.minX, jelly.x);
      bound.maxX = Math.max(bound.maxX, jelly.x);
      bound.minY = Math.min(bound.minY, jelly.y);
      bound.maxY = Math.max(bound.maxY, jelly.y);
    });
  }
  assert.ok(
    bounds.every(({ maxX, minX }) => maxX - minX > 160),
    JSON.stringify(bounds),
  );
  const fullVerticalRange =
    Math.max(...bounds.map(({ maxY }) => maxY)) -
    Math.min(...bounds.map(({ minY }) => minY));
  assert.ok(
    bounds.every(
      ({ maxX, minX, maxY, minY }) =>
        Math.hypot(maxX - minX, maxY - minY) > 200,
    ),
    JSON.stringify(bounds),
  );
  assert.ok(fullVerticalRange > scene.height * 0.5, JSON.stringify(bounds));
});
test("jellyfish of different sizes turn away before their bells overlap", () => {
  const scene = createScene(1440, 760);
  const minimumGap = 95;
  let closest = Infinity;
  for (let i = 0; i < 60 * 120; i++) {
    step(scene);
    for (let a = 0; a < scene.creatures.length; a++) {
      for (let b = a + 1; b < scene.creatures.length; b++) {
        closest = Math.min(
          closest,
          Math.hypot(
            scene.creatures[a].x - scene.creatures[b].x,
            scene.creatures[a].y - scene.creatures[b].y,
          ) /
            (scene.creatures[a].scale + scene.creatures[b].scale),
        );
      }
    }
  }
  assert.ok(
    closest > minimumGap,
    `closest approach relative to size was ${closest}`,
  );
});
test("a click disturbs nearby jellies without creating a ripple", () => {
  const scene = createScene(1440, 700),
    before = scene.creatures.map((j) => [j.vx, j.vy]);
  disturb(scene, scene.creatures[0].x, scene.creatures[0].y);
  assert.equal("ripples" in scene, false);
  assert.equal(scene.creatures[0].impulse, 1);
  assert.ok(
    scene.creatures[2].vx !== before[2][0] ||
      scene.creatures[2].vy !== before[2][1],
  );
});
test("proximity wakes tentacles before the body eases into its response", () => {
  const scene = createScene(1440, 700);
  const jelly = scene.creatures[0];
  scene.pointer = { x: jelly.x, y: jelly.y };
  step(scene);
  assert.ok(jelly.response > jelly.bodyResponse);
});
test("responsive resizing preserves relative position rather than resetting movement", () => {
  const scene = createScene(1440, 700);
  step(scene);
  const before = scene.creatures.map((j) => ({
    x: j.x / 1440,
    y: j.y / 700,
    relativeSize: j.scale / scene.creatures[0].scale,
    lengths: j.tentacles.map((t) => t.length / j.scale),
  }));
  resizeScene(scene, 390, 844);
  assertRootsInsideSkirt(scene);
  scene.creatures.forEach((j, i) => {
    assert.ok(Math.abs(j.x / 390 - before[i].x) < 0.002);
    assert.ok(Math.abs(j.y / 844 - before[i].y) < 0.002);
    assert.ok(
      Math.abs(j.scale / scene.creatures[0].scale - before[i].relativeSize) <
        1e-10,
    );
    j.tentacles.forEach((t, index) => {
      assert.ok(
        Math.abs(t.length / j.scale - before[i].lengths[index]) < 1e-10,
      );
    });
  });
});

test("rendering cannot change deterministic motion, interactions, or resize state", () => {
  const drawn = createScene(1440, 855),
    control = createScene(1440, 855);
  const { ctx, assertRestored } = canvasMock();
  for (let frame = 0; frame < 240; frame++) {
    for (const scene of [drawn, control]) {
      scene.pointer = { x: scene.creatures[0].x + 20, y: scene.creatures[0].y };
      if (frame === 30) disturb(scene, scene.pointer.x, scene.pointer.y);
      if (frame === 80) resizeScene(scene, 599, 900);
      if (frame === 120) resizeScene(scene, 600, 900);
      if (frame === 160) resizeScene(scene, 1000, 900);
      step(scene);
    }
    render(ctx, drawn, frame % 2 ? 0.5 : 0.6);
    assertRestored();
    assert.deepEqual(drawn, control, `render is read-only at frame ${frame}`);
  }
});

test("shared bell surface is closed, finite, and encloses attachments through deformation", () => {
  for (const p of [...bellMesh, ...bellLip, ...bellGlyphs]) {
    assert.ok([p.x, p.y, p.z].every(Number.isFinite));
    assert.ok(p.y >= -43 && p.y <= BELL_BASE_Y + 1e-12);
    assert.ok(Math.hypot(p.x, p.z) <= 59 + 1e-12);
  }
  for (let row = 0; row <= 24; row++) {
    const a = bellSurfacePoint(((row / 24) * Math.PI) / 2, 0);
    const b = bellSurfacePoint(((row / 24) * Math.PI) / 2, Math.PI * 2);
    assert.ok(
      Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1e-10,
      "longitude seam is closed",
    );
  }
  for (const width of [375, 599, 600, 999, 1000, 1440]) {
    const scene = createScene(width, 900);
    for (let frame = 0; frame < 36; frame++) {
      if (frame % 12 === 0)
        disturb(scene, scene.creatures[0].x, scene.creatures[0].y);
      for (let i = 0; i < 10; i++) step(scene);
      for (const jelly of scene.creatures) {
        const bell = projectBell(jelly, (p, target) =>
          Object.assign(target ?? {}, project(jelly, p, scene.time)),
        );
        for (const p of [
          ...bell.outline,
          ...bell.rim,
          ...bell.recess,
          ...bell.canals.flat(),
          ...bell.highlights.flat(),
        ])
          assert.ok([p.x, p.y, p.depth, p.perspective].every(Number.isFinite));
        for (const tentacle of jelly.tentacles) {
          const root = tentacle.nodes[0];
          const p = project(
            jelly,
            { x: root.x - jelly.x, y: root.y - jelly.y, z: root.z },
            scene.time,
          );
          let inside = false;
          for (let i = 0; i < bell.outline.length; i++) {
            const a = bell.outline[i],
              b = bell.outline[(i + 1) % bell.outline.length];
            // The flared/curling silhouette is intentionally non-convex.
            // Ray containment preserves the attachment assertion for that shape.
            if (
              a.y > p.y !== b.y > p.y &&
              p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
            )
              inside = !inside;
            assert.ok(
              Math.hypot(b.x - a.x, b.y - a.y) <
                25 * Math.max(bellScale(jelly).x, bellScale(jelly).y),
              "contour has no gaps",
            );
          }
          assert.ok(inside, "projected root remains inside the membrane");
        }
      }
    }
  }
});

test("visual resources stay bounded after warmup across pulse, click, DPR density, and resize", () => {
  const scene = createScene(1440, 900);
  const { ctx, resources, assertRestored } = canvasMock();
  render(ctx, scene);
  const warmed = resources.canvases;
  assert.ok(
    warmed > 0 && warmed <= 32,
    "at most six glyph sprites, one halo, and one material per palette",
  );
  for (let frame = 0; frame < 120; frame++) {
    if (frame % 20 === 0) {
      resizeScene(scene, [375, 599, 600, 999, 1000, 1440][frame / 20], 900);
      disturb(scene, scene.creatures[0].x, scene.creatures[0].y);
    }
    step(scene);
    render(ctx, scene, frame % 2 ? 0.5 : 0.6);
    assert.equal(
      resources.canvases,
      warmed,
      "no time, scale, or position cache keys",
    );
    assertRestored();
  }
  assert.ok(resources.paths > 0);
});
