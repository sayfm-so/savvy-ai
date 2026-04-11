// ─────────────────────────────────────────────────────────────────────────────
// Savvy AI — Retro Pixel Office  v2.0
// Static · GitHub Pages ready · No backend
// ─────────────────────────────────────────────────────────────────────────────

const W = 1280, H = 720, TILE = 16;
const HUD_W = 280;

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:0x050505, floor:0x111118, floorAlt:0x0d0d14,
  wall:0x1a1a2e, wallLight:0x2a2a4e, grid:0x1c1c2c,
  savvy:0x0050ff, claude:0x4fa3ff, google:0xff8c00,
  npc1:0x00cc88, npc2:0xcc44aa, npc3:0xffcc00, npc4:0x44aaff,
  screen:0x00ffcc, screenDim:0x004433,
  hud:0x0a0a14, hudBorder:0x0050ff,
  plant:0x226622, plantDark:0x113311,
  server:0x223344, serverLight:0x00aaff,
  robot:0x334455,
};

// ── Per-actor activity strings ────────────────────────────────────────────────
const ACTIVITIES = {
  SAVVY:   { IDLE:'Standby', WALKING:'Moving', WORKING:'Processing query...', THINKING:'Analyzing code...' },
  CLAUDE:  { IDLE:'Standby', WALKING:'Moving', WORKING:'Writing docs', THINKING:'Reviewing PR...' },
  GOOGLE:  { IDLE:'Standby', WALKING:'Moving', WORKING:'API call running', THINKING:'Checking logs...' },
  'DEV-1': { IDLE:'Standby', WALKING:'Moving', WORKING:'Debugging loop', THINKING:'Reading stack trace' },
  'DEV-2': { IDLE:'Standby', WALKING:'Moving', WORKING:'Writing tests', THINKING:'Refactoring...' },
  'OPS-1': { IDLE:'Standby', WALKING:'Moving', WORKING:'Monitoring infra', THINKING:'Checking alerts' },
  'ROBOT-E':{ IDLE:'Standby', WALKING:'Patrolling', WORKING:'Running sim', THINKING:'Calibrating joints' },
};

// ── State colors ──────────────────────────────────────────────────────────────
const STATE_COLOR = {
  IDLE:'#336655', WALKING:'#88ffcc', WORKING:'#00ffcc', THINKING:'#ffee44',
};

// ── Live feed events ──────────────────────────────────────────────────────────
const EVENTS = [
  'Savvy processed 14 queries','RAG indexed 47 new docs',
  'G1 simulation — joints OK','Obsidian sync complete',
  'MLX model 14B loaded','Phase D plan generated',
  'Tool: grep → 23 matches','Memory: 3 new entries',
  'Heksha arm calibrated','RAG rebuild triggered',
  'Claude handoff initiated','propose_patch approved',
  'savvy_rag.py updated','Robotics: SIM mode ON',
  'Seoul HQ: 99.2% uptime','R&D Lab: experiment 7',
  'ROBOT-E: joint sweep OK','Design: asset export done',
  'Legal: compliance check OK','OPS: deploy pipeline green',
];

// ═════════════════════════════════════════════════════════════════════════════
// BootScene
// ═════════════════════════════════════════════════════════════════════════════
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const g = this.add.graphics();
    g.fillStyle(C.bg,1); g.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=2){ g.fillStyle(0,0.15); g.fillRect(0,y,W,1); }

    const lines = [
      '> SAVVY AI  v2.0',
      '> BOOTING LOCAL INTELLIGENCE...',
      '> RAG INDEX: OK',
      '> MLX RUNTIME: READY',
      '> AGENTS: ONLINE',
      '> OFFICE SIMULATION: LOADING',
    ];
    let delay = 0;
    lines.forEach((line,i) => {
      const t = this.add.text(W/2, H/2-90+i*34, line, {
        fontFamily:'Courier New', fontSize:'22px', color:'#00ffcc',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets:t, alpha:1, delay, duration:80 });
      delay += 280;
    });
    this.time.delayedCall(delay+400, ()=>{
      this.cameras.main.fadeOut(400,0,0,0);
      this.time.delayedCall(420, ()=> this.scene.start('World'));
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// WorldScene
// ═════════════════════════════════════════════════════════════════════════════
class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  create() {
    this.actors = [];
    this.eventIndex = 0;

    this._buildTextures();
    this._buildOffice();
    this._buildDecorations();
    this._buildDesks();
    this._buildActors();
    this._buildHUD();
    this._buildScanlines();

    this.time.addEvent({ delay:4000, callback:this._tickFeed,    callbackScope:this, loop:true });
    this.time.addEvent({ delay:700,  callback:this._tickScreens, callbackScope:this, loop:true });
    this.time.addEvent({ delay:100,  callback:this._tickActors,  callbackScope:this, loop:true });

    this.cameras.main.fadeIn(500,0,0,0);
  }

  // ── Textures ───────────────────────────────────────────────────────────────
  _buildTextures() {
    // Floor tiles
    ['floor_a','floor_b'].forEach((key,i) => {
      const g = this.make.graphics({x:0,y:0,add:false});
      g.fillStyle(i===0?C.floor:C.floorAlt,1); g.fillRect(0,0,TILE,TILE);
      g.fillStyle(C.grid,1); g.fillRect(0,0,TILE,1); g.fillRect(0,0,1,TILE);
      g.generateTexture(key,TILE,TILE); g.destroy();
    });

    // Desk (bigger, more detailed)
    const dt = this.make.graphics({x:0,y:0,add:false});
    dt.fillStyle(0x1a1a2e,1); dt.fillRect(0,0,40,24);
    dt.fillStyle(0x2a2a4e,1); dt.fillRect(2,2,36,5);    // top bar
    dt.fillStyle(0x0d0d1a,1); dt.fillRect(4,8,32,13);   // screen bezel
    dt.fillStyle(C.screenDim,1); dt.fillRect(6,10,28,9); // screen
    dt.fillStyle(0x333355,1); dt.fillRect(18,22,4,2);   // stand
    dt.generateTexture('desk',40,24); dt.destroy();

    // Characters — more detailed 14×20 sprites
    const chars = [
      { key:'savvy_char',  body:C.savvy,   head:0xd4a470, hair:0x111133, detail:0x88aaff },
      { key:'claude_char', body:C.claude,  head:0xf0c080, hair:0x222266, detail:0x002244 },
      { key:'google_char', body:C.google,  head:0xe8b880, hair:0x331100, detail:0x441100 },
      { key:'npc1_char',   body:C.npc1,    head:0xd8c0a0, hair:0x224422, detail:0x003322 },
      { key:'npc2_char',   body:C.npc2,    head:0xecc0b8, hair:0x441133, detail:0x330022 },
      { key:'npc3_char',   body:C.npc3,    head:0xd4b888, hair:0x443300, detail:0x332200 },
      { key:'npc4_char',   body:C.npc4,    head:0xc8d8e8, hair:0x003366, detail:0x001133 },
    ];
    chars.forEach(c => this._makeChar(c));
  }

  _makeChar({ key, body, head, hair, detail }) {
    const g = this.make.graphics({x:0,y:0,add:false});
    // Shadow
    g.fillStyle(0x000000,0.3); g.fillEllipse(7,20,12,4);
    // Legs
    g.fillStyle(body,0.6);
    g.fillRect(3,14,4,6); g.fillRect(8,14,4,6);
    // Shoes
    g.fillStyle(0x111111,1);
    g.fillRect(2,19,5,2); g.fillRect(7,19,5,2);
    // Body
    g.fillStyle(body,1);
    g.fillRect(2,7,11,8);
    // Collar highlight
    g.fillStyle(0xffffff,0.15); g.fillRect(2,7,11,2);
    // Pocket detail
    g.fillStyle(detail,0.8); g.fillRect(3,9,3,3);
    // Arms
    g.fillStyle(body,0.8);
    g.fillRect(0,8,2,5); g.fillRect(13,8,2,5);
    // Hands
    g.fillStyle(head,1);
    g.fillRect(0,13,2,2); g.fillRect(13,13,2,2);
    // Neck
    g.fillStyle(head,1); g.fillRect(5,5,5,3);
    // Head
    g.fillStyle(head,1); g.fillRect(3,1,9,6);
    // Hair
    g.fillStyle(hair,1);
    g.fillRect(3,1,9,2); g.fillRect(3,1,2,4); g.fillRect(10,1,2,4);
    // Eyes
    g.fillStyle(0x000000,1);
    g.fillRect(5,4,2,2); g.fillRect(9,4,2,2);
    // Eye shine
    g.fillStyle(0xffffff,1);
    g.fillRect(6,4,1,1); g.fillRect(10,4,1,1);
    g.generateTexture(key,15,22); g.destroy();
  }

  // ── Office rooms ───────────────────────────────────────────────────────────
  _buildOffice() {
    this.rooms = [
      { id:'rd',      x:HUD_W+10, y:10,  w:300, h:195, color:0x0d1a2e, label:'R&D LAB',         labelColor:'#4fa3ff', assignTo:'claude' },
      { id:'ai',      x:HUD_W+320,y:10,  w:240, h:195, color:0x1a0d2e, label:'AI CORE',          labelColor:'#aa66ff', assignTo:'savvy'  },
      { id:'infra',   x:HUD_W+570,y:10,  w:220, h:195, color:0x0d2e1a, label:'INFRA',            labelColor:'#00cc88', assignTo:'ops1'   },
      { id:'ops',     x:HUD_W+800,y:10,  w:190, h:195, color:0x2e1a0d, label:'OPS COMMAND',      labelColor:'#ff8c00', assignTo:'google' },
      { id:'design',  x:HUD_W+10, y:215, w:490, h:215, color:0x1a1a0d, label:'DESIGN STUDIO',    labelColor:'#ffee44', assignTo:'npc2'   },
      { id:'legal',   x:HUD_W+510,y:215, w:280, h:215, color:0x2e0d0d, label:'LEGAL WING',       labelColor:'#ff4466', assignTo:'npc1'   },
      { id:'robotics',x:HUD_W+800,y:215, w:190, h:215, color:0x0d2e2e, label:'ROBOTICS LAB',     labelColor:'#00ffcc', assignTo:'robote' },
      { id:'lobby',   x:HUD_W+10, y:440, w:980, h:160, color:0x111118, label:'LOBBY — SEOUL HQ', labelColor:'#4fa3ff', assignTo:null     },
    ];

    const g = this.add.graphics();
    this.rooms.forEach(r => {
      g.fillStyle(r.color,1); g.fillRect(r.x,r.y,r.w,r.h);
      // Checkerboard
      for(let tx=r.x;tx<r.x+r.w;tx+=TILE)
        for(let ty=r.y;ty<r.y+r.h;ty+=TILE){
          const alt=((tx/TILE)+(ty/TILE))%2===0;
          g.fillStyle(alt?0xffffff:0x000000,0.02);
          g.fillRect(tx,ty,TILE,TILE);
        }
      // Border
      g.lineStyle(2,0x0050ff,0.5); g.strokeRect(r.x,r.y,r.w,r.h);
      // Corner pixels
      [[0,0],[r.w-4,0],[0,r.h-4],[r.w-4,r.h-4]].forEach(([dx,dy])=>{
        g.fillStyle(0x0050ff,0.9); g.fillRect(r.x+dx,r.y+dy,4,4);
      });
      // Top stripe
      g.fillStyle(0xffffff,0.03); g.fillRect(r.x,r.y,r.w,2);
      this.add.text(r.x+8,r.y+7,r.label,{
        fontFamily:'Courier New', fontSize:'13px', color:r.labelColor,
      }).setAlpha(0.9);
    });

    // World grid
    g.lineStyle(1,C.grid,0.1);
    for(let x=HUD_W;x<W;x+=TILE) g.lineBetween(x,0,x,H);
    for(let y=0;y<H;y+=TILE)     g.lineBetween(HUD_W,y,W,y);
  }

  // ── Room decorations ───────────────────────────────────────────────────────
  _buildDecorations() {
    const g = this.add.graphics();

    // R&D Lab — whiteboards
    this._drawBoard(g, HUD_W+270, 30, 30, 60, '#4fa3ff');
    this._drawBoard(g, HUD_W+240, 30, 25, 60, '#223355');

    // AI Core — server rack + blinking lights
    this._drawServer(g, HUD_W+510, 25);
    this._drawServer(g, HUD_W+530, 25);

    // Infra — server towers
    this._drawServer(g, HUD_W+730, 25);
    this._drawServer(g, HUD_W+750, 25);
    this._drawServer(g, HUD_W+770, 25);

    // Design Studio — plants
    this._drawPlant(g, HUD_W+20,  390);
    this._drawPlant(g, HUD_W+480, 390);
    this._drawPlant(g, HUD_W+250, 220);

    // Robotics Lab — robot silhouette
    this._drawRobotIcon(g, HUD_W+855, 280);

    // Lobby — reception desk
    g.fillStyle(0x1a1a3a,1); g.fillRect(HUD_W+440,470,120,40);
    g.lineStyle(1,0x0050ff,0.6); g.strokeRect(HUD_W+440,470,120,40);
    g.fillStyle(C.screen,0.5); g.fillRect(HUD_W+460,478,30,16);
    this.add.text(HUD_W+470,487,'[RECEPTION]',{
      fontFamily:'Courier New', fontSize:'8px', color:'#4fa3ff',
    }).setOrigin(0.5);

    // Potted plants in lobby
    this._drawPlant(g, HUD_W+30,  490);
    this._drawPlant(g, HUD_W+960, 490);
  }

  _drawBoard(g, x, y, w, h, color) {
    g.fillStyle(0x112233,1); g.fillRect(x,y,w,h);
    g.lineStyle(1,Phaser.Display.Color.HexStringToColor(color).color,0.6);
    g.strokeRect(x,y,w,h);
    // Lines on board
    g.lineStyle(1,Phaser.Display.Color.HexStringToColor(color).color,0.2);
    for(let ly=y+8;ly<y+h-4;ly+=8) g.lineBetween(x+4,ly,x+w-4,ly);
  }

  _drawServer(g, x, y) {
    g.fillStyle(C.server,1);    g.fillRect(x,y,18,80);
    g.lineStyle(1,0x334466,1);  g.strokeRect(x,y,18,80);
    // Drive bays
    for(let i=0;i<5;i++){
      g.fillStyle(0x1a2a3a,1); g.fillRect(x+2,y+4+i*15,14,10);
      // Status LED
      g.fillStyle(i%3===0?0x00ff44:C.serverLight,0.9);
      g.fillRect(x+14,y+6+i*15,2,2);
    }
  }

  _drawPlant(g, x, y) {
    // Pot
    g.fillStyle(0x663311,1); g.fillRect(x+4,y+14,12,8);
    g.lineStyle(1,0x442200,0.8); g.strokeRect(x+4,y+14,12,8);
    // Soil
    g.fillStyle(0x331100,1); g.fillRect(x+5,y+14,10,3);
    // Leaves
    g.fillStyle(C.plant,1);
    g.fillTriangle(x+10,y,x+2,y+16,x+18,y+16);
    g.fillStyle(C.plantDark,1);
    g.fillTriangle(x+10,y+4,x+4,y+16,x+16,y+16);
    g.fillStyle(C.plant,0.7);
    g.fillCircle(x+10,y+8,6);
  }

  _drawRobotIcon(g, x, y) {
    g.fillStyle(C.robot,1);
    // Head
    g.fillRect(x+6,y,12,10);
    g.lineStyle(1,0x44aaff,0.6); g.strokeRect(x+6,y,12,10);
    // Eyes
    g.fillStyle(0x00ffcc,0.9); g.fillRect(x+8,y+3,3,3); g.fillRect(x+14,y+3,3,3);
    // Body
    g.fillStyle(C.robot,1); g.fillRect(x+4,y+11,16,14);
    g.lineStyle(1,0x44aaff,0.4); g.strokeRect(x+4,y+11,16,14);
    // Arms
    g.fillStyle(C.robot,1);
    g.fillRect(x,y+12,4,10); g.fillRect(x+20,y+12,4,10);
    // Legs
    g.fillRect(x+6,y+25,5,10); g.fillRect(x+13,y+25,5,10);
    // Chest panel
    g.fillStyle(0x001133,1); g.fillRect(x+7,y+14,10,7);
    g.fillStyle(0x00ffcc,0.5); g.fillRect(x+9,y+16,6,3);
    this.add.text(x+12,y+36,'G1',{
      fontFamily:'Courier New', fontSize:'9px', color:'#00ffcc',
    }).setOrigin(0.5,0);
  }

  // ── Desks ──────────────────────────────────────────────────────────────────
  _buildDesks() {
    this.desks = [];
    const pos = [
      // R&D
      {x:HUD_W+30,y:60},{x:HUD_W+80,y:60},{x:HUD_W+130,y:60},
      {x:HUD_W+30,y:120},{x:HUD_W+80,y:120},{x:HUD_W+130,y:120},
      // AI Core
      {x:HUD_W+340,y:60},{x:HUD_W+390,y:60},{x:HUD_W+440,y:60},
      {x:HUD_W+340,y:120},{x:HUD_W+390,y:120},
      // Infra
      {x:HUD_W+590,y:60},{x:HUD_W+640,y:60},
      {x:HUD_W+590,y:120},{x:HUD_W+640,y:120},
      // OPS
      {x:HUD_W+815,y:60},{x:HUD_W+860,y:60},
      {x:HUD_W+815,y:120},{x:HUD_W+860,y:120},
      // Design
      {x:HUD_W+30,y:260},{x:HUD_W+80,y:260},{x:HUD_W+130,y:260},{x:HUD_W+180,y:260},
      {x:HUD_W+30,y:330},{x:HUD_W+80,y:330},{x:HUD_W+130,y:330},
      // Legal
      {x:HUD_W+530,y:260},{x:HUD_W+580,y:260},{x:HUD_W+630,y:260},
      {x:HUD_W+530,y:330},{x:HUD_W+580,y:330},
      // Robotics
      {x:HUD_W+820,y:260},{x:HUD_W+860,y:260},
      {x:HUD_W+820,y:330},
    ];

    pos.forEach(p => {
      this.add.image(p.x,p.y,'desk').setOrigin(0);
      const screen = this.add.graphics();
      screen.fillStyle(C.screen,0.65);
      screen.fillRect(p.x+6,p.y+10,28,9);
      this.desks.push({ screen, x:p.x, y:p.y, on:true });
    });
  }

  // ── Actors ─────────────────────────────────────────────────────────────────
  _buildActors() {
    const defs = [
      { key:'savvy_char',  name:'SAVVY',    x:HUD_W+400, y:120, homeRoom:'ai',       isSavvy:true },
      { key:'claude_char', name:'CLAUDE',   x:HUD_W+100, y:100, homeRoom:'rd'        },
      { key:'google_char', name:'GOOGLE',   x:HUD_W+860, y:100, homeRoom:'ops'       },
      { key:'npc1_char',   name:'DEV-1',    x:HUD_W+100, y:300, homeRoom:'design'    },
      { key:'npc2_char',   name:'DEV-2',    x:HUD_W+580, y:300, homeRoom:'legal'     },
      { key:'npc3_char',   name:'OPS-1',    x:HUD_W+630, y:100, homeRoom:'infra'     },
      { key:'npc4_char',   name:'ROBOT-E',  x:HUD_W+850, y:310, homeRoom:'robotics'  },
    ];

    defs.forEach(d => {
      const sprite = this.add.image(d.x, d.y, d.key)
        .setOrigin(0.5,1).setScale(2).setDepth(10);

      // Name label
      const label = this.add.text(d.x, d.y - sprite.displayHeight - 4, d.name, {
        fontFamily:'Courier New', fontSize:'12px',
        color: d.isSavvy ? '#0088ff' : '#aaffcc',
        backgroundColor:'#050505cc',
        padding:{ x:3, y:2 },
      }).setOrigin(0.5,1).setDepth(11);

      // ── Status box ────────────────────────────────────────────────────────
      const boxBg = this.add.graphics().setDepth(12);
      const boxText = this.add.text(d.x, d.y, '', {
        fontFamily:'Courier New', fontSize:'10px',
        color:'#00ffcc',
        padding:{ x:4, y:2 },
      }).setOrigin(0.5,1).setDepth(13);

      // Savvy glow
      let glow = null;
      if (d.isSavvy) {
        glow = this.add.graphics().setDepth(9);
        this._drawGlow(glow, d.x, d.y, 18, C.savvy, 0.22);
      }

      const homeRoom = this.rooms.find(r => r.id === d.homeRoom) || this.rooms[0];

      const actor = {
        sprite, label, glow, boxBg, boxText,
        name:d.name, isSavvy:!!d.isSavvy,
        state:'IDLE', stateTimer:0,
        tween:null, bubble:null, bubbleTimer:0,
        homeRoom,
      };
      this.actors.push(actor);
      this._scheduleNextState(actor);
    });
  }

  _updateStatusBox(a) {
    const activity = (ACTIVITIES[a.name]||{})[a.state] || a.state;
    const color = STATE_COLOR[a.state] || '#336655';
    const sx = a.sprite.x, sy = a.sprite.y - a.sprite.displayHeight - 20;

    boxText: {
      a.boxText.setText(activity);
      a.boxText.setColor(color);
      a.boxText.setPosition(sx, sy);
    }

    // Draw box bg
    const bw = a.boxText.width + 8, bh = a.boxText.height + 4;
    a.boxBg.clear();
    a.boxBg.fillStyle(0x050510,0.88);
    a.boxBg.fillRect(sx - bw/2, sy - bh, bw, bh);
    a.boxBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 0.7);
    a.boxBg.strokeRect(sx - bw/2, sy - bh, bw, bh);
    // Small dot indicator
    a.boxBg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    a.boxBg.fillRect(sx - bw/2 + 3, sy - bh/2 - 1, 3, 3);
  }

  _drawGlow(g, x, y, r, color, alpha) {
    g.clear();
    for(let i=r;i>0;i-=3){
      g.fillStyle(color, alpha*(i/r)*0.4);
      g.fillCircle(x, y-6, i);
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  _buildHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(C.hud,0.95); g.fillRect(0,0,HUD_W,H);
    g.lineStyle(1,C.hudBorder,0.5); g.strokeRect(0,0,HUD_W,H);
    g.lineStyle(1,C.hudBorder,0.25); g.lineBetween(0,46,HUD_W,46);

    // CPU logo
    const lx=20, ly=23, lg=this.add.graphics().setDepth(51);
    lg.lineStyle(2,0x0088ff,1);
    lg.strokeRect(lx-9,ly-9,18,18); lg.strokeRect(lx-4,ly-4,8,8);
    for(let i=-5;i<=5;i+=10){
      lg.lineBetween(lx+i,ly-13,lx+i,ly-9);
      lg.lineBetween(lx+i,ly+9,lx+i,ly+13);
      lg.lineBetween(lx-13,ly+i,lx-9,ly+i);
      lg.lineBetween(lx+9,ly+i,lx+13,ly+i);
    }
    this.add.text(lx+16,ly,'SAVVY AI',{
      fontFamily:'Courier New',fontSize:'18px',color:'#0088ff',fontWeight:'bold',
    }).setOrigin(0,0.5).setDepth(51);

    // Agent status
    this.add.text(10,55,'AGENT STATUS',{
      fontFamily:'Courier New',fontSize:'12px',color:'#336655',
    }).setDepth(51);

    const agentDefs = [
      {name:'SAVVY',  color:'#0088ff'},
      {name:'CLAUDE', color:'#4fa3ff'},
      {name:'GOOGLE', color:'#ff8c00'},
      {name:'DEV-1',  color:'#00cc88'},
      {name:'DEV-2',  color:'#cc44aa'},
      {name:'OPS-1',  color:'#ffcc00'},
      {name:'ROBOT-E',color:'#44aaff'},
    ];
    this.statusTexts = [];
    agentDefs.forEach((a,i) => {
      this.add.text(10,76+i*28,`■ ${a.name}`,{
        fontFamily:'Courier New',fontSize:'12px',color:a.color,
      }).setDepth(51);
      const st = this.add.text(165,76+i*28,'IDLE',{
        fontFamily:'Courier New',fontSize:'11px',color:'#336655',
      }).setDepth(51);
      this.statusTexts.push(st);
    });

    // Divider
    g.lineBetween(0,278,HUD_W,278);
    this.add.text(10,285,'LIVE FEED',{
      fontFamily:'Courier New',fontSize:'12px',color:'#336655',
    }).setDepth(51);

    // Feed
    this.feedTexts = [];
    for(let i=0;i<12;i++){
      const ft = this.add.text(10,306+i*32,'',{
        fontFamily:'Courier New',fontSize:'12px',color:'#226644',
        wordWrap:{width:HUD_W-18},
      }).setDepth(51);
      this.feedTexts.push(ft);
    }

    // Status bar
    const sb = this.add.graphics().setDepth(50);
    sb.fillStyle(0x000008,0.96); sb.fillRect(HUD_W,H-30,W-HUD_W,30);
    sb.lineStyle(1,C.hudBorder,0.3); sb.lineBetween(HUD_W,H-30,W,H-30);
    this.statusBar = this.add.text(HUD_W+14,H-15,
      '> SEOUL HQ — LOCAL INTELLIGENCE ONLINE',{
        fontFamily:'Courier New',fontSize:'13px',color:'#0050ff',
      }).setOrigin(0,0.5).setDepth(51);
    this.clockText = this.add.text(W-12,H-15,'',{
      fontFamily:'Courier New',fontSize:'13px',color:'#336655',
    }).setOrigin(1,0.5).setDepth(51);
  }

  // ── Scanlines ─────────────────────────────────────────────────────────────
  _buildScanlines() {
    const g = this.add.graphics().setDepth(100);
    for(let y=0;y<H;y+=3){
      g.fillStyle(0,0.055); g.fillRect(HUD_W,y,W-HUD_W,1);
    }
  }

  // ── Ticks ─────────────────────────────────────────────────────────────────
  _tickFeed() {
    const msg = EVENTS[this.eventIndex++ % EVENTS.length];
    for(let i=this.feedTexts.length-1;i>0;i--){
      this.feedTexts[i].setText(this.feedTexts[i-1].text);
      this.feedTexts[i].setColor(i<3?'#00cc88':i<7?'#226644':'#113322');
    }
    this.feedTexts[0].setText(`> ${msg}`);
    this.feedTexts[0].setColor('#00ffcc');
  }

  _tickScreens() {
    this.desks.forEach(d => {
      if(Math.random()<0.07){
        d.on=!d.on;
        d.screen.clear();
        d.screen.fillStyle(d.on?C.screen:C.screenDim, d.on?0.5+Math.random()*0.4:0.3);
        d.screen.fillRect(d.x+6,d.y+10,28,9);
      }
    });
  }

  _tickActors() {
    this.actors.forEach((a,i) => {
      a.stateTimer -= 100;
      if(a.stateTimer<=0) this._scheduleNextState(a);

      // Move label
      a.label.setPosition(a.sprite.x, a.sprite.y - a.sprite.displayHeight - 4);

      // Update status box above character
      this._updateStatusBox(a);

      // HUD status
      if(this.statusTexts[i]){
        this.statusTexts[i].setText(a.state);
        this.statusTexts[i].setColor(STATE_COLOR[a.state]||'#336655');
      }

      // Glow
      if(a.glow) this._drawGlow(a.glow, a.sprite.x, a.sprite.y, 18, C.savvy, 0.22);

      // Thinking bubble
      if(a.bubble){
        a.bubbleTimer -= 100;
        a.bubble.setPosition(a.sprite.x+10, a.sprite.y - a.sprite.displayHeight - 52);
        if(a.bubbleTimer<=0){ a.bubble.destroy(); a.bubble=null; }
      }
    });

    const now = new Date();
    this.clockText.setText(now.toLocaleTimeString('en-US',{hour12:false}));
  }

  _scheduleNextState(a) {
    const pool = a.isSavvy
      ? ['IDLE','WALKING','WALKING','WORKING','WORKING','THINKING']
      : ['IDLE','IDLE','WALKING','WORKING','WORKING','THINKING'];
    a.state = pool[Math.floor(Math.random()*pool.length)];

    if(a.state==='WALKING'){
      // 70% chance stay in home room, 30% roam
      const r = Math.random()<0.7 ? a.homeRoom
        : this.rooms[Math.floor(Math.random()*this.rooms.length)];
      const tx = r.x+25+Math.random()*(r.w-50);
      const ty = r.y+25+Math.random()*(r.h-50);
      a.stateTimer = 2500+Math.random()*3000;
      if(a.tween) a.tween.stop();
      a.tween = this.tweens.add({
        targets:a.sprite, x:tx, y:ty,
        duration:a.stateTimer*0.85, ease:'Sine.easeInOut',
      });

    } else if(a.state==='WORKING') {
      a.stateTimer = 5000+Math.random()*9000;

    } else if(a.state==='THINKING') {
      a.stateTimer = 2000+Math.random()*2500;
      if(a.bubble) a.bubble.destroy();
      const thoughts = ['🤔','...','???','!','⚡'];
      a.bubble = this.add.text(
        a.sprite.x+10, a.sprite.y - a.sprite.displayHeight - 52,
        thoughts[Math.floor(Math.random()*thoughts.length)],{
          fontFamily:'Courier New', fontSize:'16px', color:'#ffee44',
          backgroundColor:'#1a1a00cc', padding:{x:5,y:3},
        }
      ).setOrigin(0,1).setDepth(20);
      a.bubbleTimer = a.stateTimer;

    } else {
      a.stateTimer = 1500+Math.random()*2000;
    }
  }

  // ── 60fps update ──────────────────────────────────────────────────────────
  update(time) {
    const pulse = Math.sin(time/2200)*0.5+0.5;
    const blue = Math.floor(70+pulse*90).toString(16).padStart(2,'0');
    this.statusBar.setColor(`#00${blue}ff`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
new Phaser.Game({
  type:Phaser.AUTO, width:W, height:H,
  backgroundColor:'#050505',
  parent:'game-container',
  scene:[BootScene, WorldScene],
  scale:{ mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH },
  render:{ pixelArt:true, antialias:false },
});
