// ─────────────────────────────────────────────────────────────────────────────
// Savvy AI World — Retro Pixel Office
// Static build — no backend — GitHub Pages ready
// ─────────────────────────────────────────────────────────────────────────────

const W = 1280;
const H = 720;
const TILE = 16;

// ── Retro palette ─────────────────────────────────────────────────────────────
const C = {
  bg:        0x050505,
  floor:     0x111118,
  floorAlt:  0x0d0d14,
  wall:      0x1a1a2e,
  wallLight: 0x2a2a4e,
  grid:      0x1c1c2c,
  savvy:     0x0050ff,
  savvyTrim: 0xffffff,
  claude:    0x4fa3ff,
  google:    0xff8c00,
  npc1:      0x00cc88,
  npc2:      0xcc44aa,
  npc3:      0xffcc00,
  npc4:      0x44aaff,
  screen:    0x00ffcc,
  screenDim: 0x004433,
  text:      0x88ffcc,
  textDim:   0x336655,
  accent:    0x0050ff,
  red:       0xff3344,
  yellow:    0xffee44,
  hud:       0x0a0a14,
  hudBorder: 0x0050ff,
};

// ── Fake activity events ───────────────────────────────────────────────────────
const EVENTS = [
  "Savvy processed 14 queries",
  "RAG indexed 47 new docs",
  "G1 simulation — joints OK",
  "Obsidian sync complete",
  "MLX model loaded 7B",
  "Phase D plan generated",
  "Tool: grep → 23 matches",
  "Memory: 3 new entries",
  "Heksha arm calibrated",
  "RAG rebuild triggered",
  "Claude handoff initiated",
  "propose_patch approved",
  "savvy_rag.py updated",
  "Qwen 7B temperature 0.7",
  "Robotics safety: SIM mode",
  "Desk Claude: idle 2m",
  "Desk Google: working",
  "Seoul HQ status: ONLINE",
  "R&D Lab: experiment 7",
  "Infra: 99.2% uptime",
];

// ─────────────────────────────────────────────────────────────────────────────
// BootScene
// ─────────────────────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    const g = this.add.graphics();

    // Black fill
    g.fillStyle(C.bg, 1);
    g.fillRect(0, 0, W, H);

    // Scanlines
    for (let y = 0; y < H; y += 2) {
      g.fillStyle(0x000000, 0.15);
      g.fillRect(0, y, W, 1);
    }

    // Boot text
    const lines = [
      "> SAVVY AI WORLD v1.0",
      "> BOOTING LOCAL INTELLIGENCE...",
      "> RAG INDEX: OK",
      "> MLX RUNTIME: READY",
      "> OFFICE SIMULATION: LOADING",
    ];

    let delay = 0;
    lines.forEach((line, i) => {
      const t = this.add.text(W / 2, H / 2 - 60 + i * 24, line, {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#00ffcc',
        alpha: 0,
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: t,
        alpha: 1,
        delay: delay,
        duration: 100,
      });
      delay += 300;
    });

    this.time.delayedCall(delay + 500, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('World'));
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WorldScene
// ─────────────────────────────────────────────────────────────────────────────
class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  // ── Init ─────────────────────────────────────────────────────────────────
  create() {
    this.actors = [];
    this.feedLines = [];
    this.eventIndex = 0;
    this.time_of_day = 0; // 0..1 cycling

    this._buildTextures();
    this._buildOffice();
    this._buildDesks();
    this._buildActors();
    this._buildHUD();
    this._buildScanlines();

    // Simulation ticks
    this.time.addEvent({ delay: 4000, callback: this._tickFeed, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 800,  callback: this._tickScreens, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 100,  callback: this._tickActors, callbackScope: this, loop: true });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ── Procedural textures ────────────────────────────────────────────────────
  _buildTextures() {
    // Floor tile A
    const fa = this.make.graphics({ x: 0, y: 0, add: false });
    fa.fillStyle(C.floor, 1);   fa.fillRect(0, 0, TILE, TILE);
    fa.fillStyle(C.grid, 1);    fa.fillRect(0, 0, TILE, 1); fa.fillRect(0, 0, 1, TILE);
    fa.generateTexture('floor_a', TILE, TILE); fa.destroy();

    // Floor tile B (alt)
    const fb = this.make.graphics({ x: 0, y: 0, add: false });
    fb.fillStyle(C.floorAlt, 1); fb.fillRect(0, 0, TILE, TILE);
    fb.fillStyle(C.grid, 1);     fb.fillRect(0, 0, TILE, 1); fb.fillRect(0, 0, 1, TILE);
    fb.generateTexture('floor_b', TILE, TILE); fb.destroy();

    // Wall tile
    const wt = this.make.graphics({ x: 0, y: 0, add: false });
    wt.fillStyle(C.wall, 1);      wt.fillRect(0, 0, TILE, TILE);
    wt.fillStyle(C.wallLight, 1); wt.fillRect(0, 0, TILE, 2);
    wt.generateTexture('wall', TILE, TILE); wt.destroy();

    // Desk
    const dt = this.make.graphics({ x: 0, y: 0, add: false });
    dt.fillStyle(0x1a1a2e, 1); dt.fillRect(0, 0, 32, 20);
    dt.fillStyle(0x2a2a4e, 1); dt.fillRect(2, 2, 28, 4);
    dt.fillStyle(C.screenDim, 1); dt.fillRect(6, 7, 20, 10);
    dt.generateTexture('desk', 32, 20); dt.destroy();

    this._buildCharTexture('savvy_char',  C.savvy,  C.savvyTrim);
    this._buildCharTexture('claude_char', C.claude, 0x001133);
    this._buildCharTexture('google_char', C.google, 0x1a0a00);
    this._buildCharTexture('npc1_char',   C.npc1,   0x001a11);
    this._buildCharTexture('npc2_char',   C.npc2,   0x1a0011);
    this._buildCharTexture('npc3_char',   C.npc3,   0x1a1400);
    this._buildCharTexture('npc4_char',   C.npc4,   0x001a2e);
  }

  _buildCharTexture(key, bodyColor, shadowColor) {
    const cw = 12, ch = 18;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Shadow
    g.fillStyle(shadowColor, 0.5); g.fillEllipse(6, 17, 10, 4);
    // Legs
    g.fillStyle(bodyColor, 0.7);
    g.fillRect(3, 12, 3, 5);
    g.fillRect(7, 12, 3, 5);
    // Body
    g.fillStyle(bodyColor, 1);
    g.fillRect(2, 6, 8, 7);
    // Head
    g.fillStyle(0xf5d5b8, 1);
    g.fillRect(3, 1, 6, 6);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(4, 3, 1, 1);
    g.fillRect(7, 3, 1, 1);
    // Pixel highlight on body
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(2, 6, 8, 1);
    g.generateTexture(key, cw, ch);
    g.destroy();
  }

  // ── Office layout ─────────────────────────────────────────────────────────
  _buildOffice() {
    const rooms = [
      { x: 40,  y: 40,  w: 300, h: 200, color: 0x0d1a2e, label: 'R&D LAB',        labelColor: '#4fa3ff' },
      { x: 370, y: 40,  w: 240, h: 200, color: 0x1a0d2e, label: 'AI CORE',         labelColor: '#aa66ff' },
      { x: 640, y: 40,  w: 220, h: 200, color: 0x0d2e1a, label: 'INFRA',           labelColor: '#00cc88' },
      { x: 880, y: 40,  w: 360, h: 200, color: 0x2e1a0d, label: 'OPS COMMAND',     labelColor: '#ff8c00' },
      { x: 40,  y: 270, w: 500, h: 220, color: 0x1a1a0d, label: 'DESIGN STUDIO',   labelColor: '#ffee44' },
      { x: 560, y: 270, w: 300, h: 220, color: 0x2e0d0d, label: 'LEGAL WING',      labelColor: '#ff4466' },
      { x: 880, y: 270, w: 360, h: 220, color: 0x0d2e2e, label: 'ROBOTICS LAB',    labelColor: '#00ffcc' },
      { x: 200, y: 520, w: 880, h: 160, color: 0x111118, label: 'LOBBY — SEOUL HQ', labelColor: '#4fa3ff' },
    ];

    this.rooms = rooms;
    const g = this.add.graphics();

    rooms.forEach(r => {
      // Floor fill
      g.fillStyle(r.color, 1);
      g.fillRect(r.x, r.y, r.w, r.h);

      // Checkerboard floor pattern
      for (let tx = r.x; tx < r.x + r.w; tx += TILE) {
        for (let ty = r.y; ty < r.y + r.h; ty += TILE) {
          const alt = ((tx / TILE) + (ty / TILE)) % 2 === 0;
          g.fillStyle(alt ? 0xffffff : 0x000000, 0.02);
          g.fillRect(tx, ty, TILE, TILE);
        }
      }

      // Room border
      g.lineStyle(2, 0x0050ff, 0.4);
      g.strokeRect(r.x, r.y, r.w, r.h);

      // Corner accents (pixel style)
      g.fillStyle(0x0050ff, 0.8);
      g.fillRect(r.x, r.y, 4, 4);
      g.fillRect(r.x + r.w - 4, r.y, 4, 4);
      g.fillRect(r.x, r.y + r.h - 4, 4, 4);
      g.fillRect(r.x + r.w - 4, r.y + r.h - 4, 4, 4);

      // Label
      this.add.text(r.x + 10, r.y + 8, r.label, {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: r.labelColor,
      }).setAlpha(0.85);
    });

    // Grid overlay (global)
    g.lineStyle(1, C.grid, 0.12);
    for (let x = 0; x < W; x += TILE) { g.lineBetween(x, 0, x, H); }
    for (let y = 0; y < H; y += TILE) { g.lineBetween(0, y, W, y); }
  }

  // ── Desks + screens ────────────────────────────────────────────────────────
  _buildDesks() {
    this.desks = [];
    const positions = [
      { x: 80,  y: 80  }, { x: 140, y: 80  }, { x: 200, y: 80  },
      { x: 80,  y: 140 }, { x: 140, y: 140 },
      { x: 410, y: 70  }, { x: 470, y: 70  }, { x: 530, y: 70  },
      { x: 410, y: 130 }, { x: 470, y: 130 },
      { x: 670, y: 70  }, { x: 730, y: 70  },
      { x: 920, y: 70  }, { x: 980, y: 70  }, { x: 1040, y: 70  }, { x: 1100, y: 70 },
      { x: 920, y: 130 }, { x: 980, y: 130 },
      { x: 80,  y: 310 }, { x: 140, y: 310 }, { x: 200, y: 310 }, { x: 260, y: 310 },
      { x: 80,  y: 380 }, { x: 140, y: 380 }, { x: 200, y: 380 },
      { x: 600, y: 310 }, { x: 660, y: 310 }, { x: 720, y: 310 },
      { x: 920, y: 310 }, { x: 980, y: 310 }, { x: 1040, y: 310 },
      { x: 920, y: 380 }, { x: 980, y: 380 },
    ];

    positions.forEach(p => {
      const img = this.add.image(p.x, p.y, 'desk').setOrigin(0);
      // Screen glow (blinking)
      const screen = this.add.graphics();
      screen.fillStyle(C.screen, 0.7);
      screen.fillRect(p.x + 6, p.y + 7, 20, 10);
      this.desks.push({ img, screen, x: p.x, y: p.y, on: true });
    });
  }

  // ── Actors ─────────────────────────────────────────────────────────────────
  _buildActors() {
    const defs = [
      { key: 'savvy_char',  name: 'SAVVY',    x: 450, y: 350, speed: 60, isSavvy: true },
      { key: 'claude_char', name: 'CLAUDE',   x: 200, y: 130, speed: 45 },
      { key: 'google_char', name: 'GOOGLE',   x: 500, y: 130, speed: 45 },
      { key: 'npc1_char',   name: 'DEV-1',    x: 100, y: 340, speed: 35 },
      { key: 'npc2_char',   name: 'DEV-2',    x: 720, y: 300, speed: 38 },
      { key: 'npc3_char',   name: 'OPS-1',    x: 950, y: 100, speed: 40 },
      { key: 'npc4_char',   name: 'ROBOT-E',  x: 960, y: 340, speed: 30 },
    ];

    defs.forEach(d => {
      const sprite = this.add.image(d.x, d.y, d.key).setOrigin(0.5, 1);
      const label  = this.add.text(d.x, d.y - sprite.height - 2, d.name, {
        fontFamily: 'Courier New', fontSize: '9px',
        color: d.isSavvy ? '#0088ff' : '#aaffcc',
        backgroundColor: '#050505cc',
        padding: { x: 2, y: 1 },
      }).setOrigin(0.5, 1);

      // Savvy gets a glow ring
      let glow = null;
      if (d.isSavvy) {
        glow = this.add.graphics();
        this._drawGlow(glow, d.x, d.y, 14, C.savvy, 0.25);
      }

      const actor = {
        sprite, label, glow,
        name: d.name,
        isSavvy: !!d.isSavvy,
        speed: d.speed,
        state: 'IDLE',
        stateTimer: 0,
        target: { x: d.x, y: d.y },
        home: { x: d.x, y: d.y },
        tween: null,
        bubble: null,
        bubbleTimer: 0,
      };

      this.actors.push(actor);
      this._scheduleNextState(actor);
    });
  }

  _drawGlow(g, x, y, r, color, alpha) {
    g.clear();
    for (let i = r; i > 0; i -= 2) {
      g.fillStyle(color, alpha * (i / r) * 0.5);
      g.fillCircle(x, y - 4, i);
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  _buildHUD() {
    // Left panel
    const panel = this.add.graphics();
    panel.fillStyle(C.hud, 0.92);
    panel.fillRect(0, 0, 220, H);
    panel.lineStyle(1, C.hudBorder, 0.5);
    panel.strokeRect(0, 0, 220, H);
    panel.lineStyle(1, C.hudBorder, 0.3);
    panel.lineBetween(0, 30, 220, 30);

    // Title
    this.add.text(10, 8, '> SAVVY AI WORLD', {
      fontFamily: 'Courier New', fontSize: '12px', color: '#0088ff',
    });

    this.add.text(10, 38, 'AGENT STATUS', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#336655',
    });

    // Agent status rows
    const agents = [
      { name: 'SAVVY',    color: '#0088ff' },
      { name: 'CLAUDE',   color: '#4fa3ff' },
      { name: 'GOOGLE',   color: '#ff8c00' },
      { name: 'DEV-1',    color: '#00cc88' },
      { name: 'DEV-2',    color: '#cc44aa' },
      { name: 'OPS-1',    color: '#ffcc00' },
      { name: 'ROBOT-E',  color: '#44aaff' },
    ];

    this.statusTexts = [];
    agents.forEach((a, i) => {
      this.add.text(10, 60 + i * 22, `■ ${a.name}`, {
        fontFamily: 'Courier New', fontSize: '11px', color: a.color,
      });
      const st = this.add.text(130, 60 + i * 22, 'IDLE', {
        fontFamily: 'Courier New', fontSize: '10px', color: '#336655',
      });
      this.statusTexts.push(st);
    });

    // Divider
    const dg = this.add.graphics();
    dg.lineStyle(1, C.hudBorder, 0.3);
    dg.lineBetween(0, 220, 220, 220);

    this.add.text(10, 228, 'LIVE FEED', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#336655',
    });

    // Feed lines
    this.feedTexts = [];
    for (let i = 0; i < 14; i++) {
      const ft = this.add.text(10, 248 + i * 26, '', {
        fontFamily: 'Courier New',
        fontSize: '10px',
        color: '#226644',
        wordWrap: { width: 200 },
      });
      this.feedTexts.push(ft);
    }

    // Bottom status bar
    const sb = this.add.graphics();
    sb.fillStyle(0x000008, 0.95);
    sb.fillRect(220, H - 24, W - 220, 24);
    sb.lineStyle(1, C.hudBorder, 0.3);
    sb.lineBetween(220, H - 24, W, H - 24);

    this.statusBar = this.add.text(230, H - 16, '> SEOUL HQ — LOCAL INTELLIGENCE ONLINE', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#0050ff',
    }).setOrigin(0, 0.5);

    // Clock
    this.clockText = this.add.text(W - 10, H - 16, '', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#336655',
    }).setOrigin(1, 0.5);
  }

  // ── Scanlines ─────────────────────────────────────────────────────────────
  _buildScanlines() {
    const g = this.add.graphics().setDepth(100);
    for (let y = 0; y < H; y += 3) {
      g.fillStyle(0x000000, 0.06);
      g.fillRect(220, y, W - 220, 1);
    }
  }

  // ── Simulation ticks ───────────────────────────────────────────────────────
  _tickFeed() {
    const msg = EVENTS[this.eventIndex % EVENTS.length];
    this.eventIndex++;

    // Shift lines up
    for (let i = this.feedTexts.length - 1; i > 0; i--) {
      this.feedTexts[i].setText(this.feedTexts[i - 1].text);
      this.feedTexts[i].setColor(
        i < 3 ? '#00cc88' : i < 7 ? '#226644' : '#113322'
      );
    }
    this.feedTexts[0].setText(`> ${msg}`);
    this.feedTexts[0].setColor('#00ffcc');
  }

  _tickScreens() {
    this.desks.forEach(d => {
      if (Math.random() < 0.08) {
        d.on = !d.on;
        d.screen.clear();
        if (d.on) {
          d.screen.fillStyle(C.screen, 0.6 + Math.random() * 0.3);
          d.screen.fillRect(d.x + 6, d.y + 7, 20, 10);
        } else {
          d.screen.fillStyle(C.screenDim, 0.4);
          d.screen.fillRect(d.x + 6, d.y + 7, 20, 10);
        }
      }
    });
  }

  _tickActors() {
    this.actors.forEach((a, i) => {
      a.stateTimer -= 100;
      if (a.stateTimer <= 0) {
        this._scheduleNextState(a);
      }

      // Update label position
      a.label.setPosition(a.sprite.x, a.sprite.y - a.sprite.height - 2);

      // Update status text
      if (this.statusTexts[i]) {
        const colors = {
          IDLE: '#336655', WALKING: '#88ffcc',
          WORKING: '#00ffcc', THINKING: '#ffee44',
        };
        this.statusTexts[i].setText(a.state);
        this.statusTexts[i].setColor(colors[a.state] || '#336655');
      }

      // Savvy glow follows
      if (a.glow) {
        this._drawGlow(a.glow, a.sprite.x, a.sprite.y, 14, C.savvy, 0.25);
      }

      // Thinking bubble
      if (a.bubble) {
        a.bubbleTimer -= 100;
        a.bubble.setPosition(a.sprite.x + 8, a.sprite.y - a.sprite.height - 14);
        if (a.bubbleTimer <= 0) {
          a.bubble.destroy();
          a.bubble = null;
        }
      }
    });

    // Clock
    const now = new Date();
    this.clockText.setText(now.toLocaleTimeString('en-US', { hour12: false }));
  }

  _scheduleNextState(a) {
    const states = a.isSavvy
      ? ['IDLE', 'IDLE', 'WALKING', 'WORKING', 'THINKING', 'WALKING']
      : ['IDLE', 'WALKING', 'WORKING', 'WALKING', 'IDLE'];

    const next = states[Math.floor(Math.random() * states.length)];
    a.state = next;

    if (next === 'WALKING') {
      // Pick a random room center to walk to
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const tx = room.x + 30 + Math.random() * (room.w - 60);
      const ty = room.y + 30 + Math.random() * (room.h - 60);
      a.stateTimer = 3000 + Math.random() * 3000;

      if (a.tween) a.tween.stop();
      a.tween = this.tweens.add({
        targets: a.sprite,
        x: tx, y: ty,
        duration: a.stateTimer * 0.9,
        ease: 'Linear',
      });

    } else if (next === 'WORKING') {
      a.stateTimer = 5000 + Math.random() * 8000;

    } else if (next === 'THINKING') {
      a.stateTimer = 2000 + Math.random() * 2000;
      if (a.bubble) a.bubble.destroy();
      a.bubble = this.add.text(
        a.sprite.x + 8, a.sprite.y - a.sprite.height - 14,
        '...', {
          fontFamily: 'Courier New', fontSize: '10px',
          color: '#ffee44',
          backgroundColor: '#1a1a00cc',
          padding: { x: 3, y: 2 },
        }
      ).setOrigin(0, 1);
      a.bubbleTimer = a.stateTimer;

    } else {
      a.stateTimer = 1500 + Math.random() * 2500;
    }
  }

  // ── Phaser update (60fps) ──────────────────────────────────────────────────
  update(time) {
    // Subtle time-of-day pulse on status bar
    const pulse = Math.sin(time / 2000) * 0.5 + 0.5;
    const blue = Math.floor(80 + pulse * 80).toString(16).padStart(2, '0');
    this.statusBar.setColor(`#00${blue}ff`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Game config
// ─────────────────────────────────────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#050505',
  parent: 'game-container',
  scene: [BootScene, WorldScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
});
