import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createScene,
  bellGlyphs,
  bellScale,
  BELL_BASE_Y,
  resizeScene,
} from "../src/jellyfish/geometry.ts";
import { step, disturb } from "../src/jellyfish/physics.ts";
import { project, render } from "../src/jellyfish/render.ts";

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
  const calls: { char: string; glow: string; alpha: number }[] = [];
  const ctx = {
    canvas: {
      ownerDocument: {
        createElement: () => ({
          dataset: {},
          getContext: () => ({
            beginPath() {},
            moveTo() {},
            arc() {},
            fill() {},
            fillRect() {},
            strokeRect() {},
            createRadialGradient: () => ({ addColorStop() {} }),
          }),
        }),
      },
    },
    globalAlpha: 1,
    shadowBlur: 0,
    save() {},
    restore() {},
    clearRect() {
      calls.length = 0;
    },
    drawImage(tile: HTMLCanvasElement) {
      if (!tile.dataset.glyph) return;
      calls.push({
        char: tile.dataset.glyph,
        glow: tile.dataset.glow,
        alpha: this.globalAlpha,
      });
    },
  } as unknown as CanvasRenderingContext2D;
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
