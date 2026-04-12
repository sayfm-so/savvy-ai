// ─────────────────────────────────────────────────────────────────────────────
// Savvy AI — مكتب ريترو  v3.0
// Static · GitHub Pages · No backend
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

// ── نشاط الوكلاء — عربي ───────────────────────────────────────────────────────
const ACTIVITIES = {
  SAVVY:    { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيعالج الطلبات...', THINKING:'بيحلل الكود...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  CLAUDE:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيكتب الـ docs', THINKING:'بيراجع الـ PR...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  GOOGLE:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'الـ API شغال', THINKING:'بيتفحص اللوجز...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  'DEV-1':  { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيحل الـ bug', THINKING:'بيقرا الـ stack trace', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  'DEV-2':  { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيكتب الـ tests', THINKING:'بيعمل refactor...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  'OPS-1':  { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيراقب الـ infra', THINKING:'بيتفحص التنبيهات', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
  'ROBOT-E':{ IDLE:'واقف', WALKING:'بيتجول', WORKING:'بيشغل الـ sim', THINKING:'بيضبط المفاصل', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' },
};

// ── أسماء الحالات بالعربي ─────────────────────────────────────────────────────
const STATE_LABEL = {
  IDLE:'واقف', WALKING:'بيتحرك', WORKING:'شغال', THINKING:'بيفكر',
  MEETING:'في اجتماع', DEPLOYING:'بيـ deploy', REVIEWING:'بيراجع',
};

// ── ألوان الحالات ─────────────────────────────────────────────────────────────
const STATE_COLOR = {
  IDLE:'#336655', WALKING:'#88ffcc', WORKING:'#00ffcc', THINKING:'#ffee44',
  MEETING:'#ff88cc', DEPLOYING:'#ff6600', REVIEWING:'#aaccff',
};

// ── آخر الأخبار — عربي ───────────────────────────────────────────────────────
const EVENTS = [
  'سافي عالج 14 طلب',
  'الـ RAG أضاف 47 ملف جديد',
  'محاكاة G1 — المفاصل تمام',
  'مزامنة Obsidian خلصت',
  'موديل MLX 14B اتحمل',
  'اتولد خطة المرحلة D',
  'grep لقى 23 نتيجة',
  'الذاكرة: 3 إدخالات جديدة',
  'معايرة ذراع Heksha خلصت',
  'إعادة بناء الـ RAG اشتغلت',
  'تسليم Claude اتعمل',
  'propose_patch اتقبل',
  'savvy_rag.py اتحدث',
  'الروبوتات: وضع المحاكاة شغال',
  'سيول HQ: 99.2% uptime',
  'مختبر البحث: تجربة 7',
  'ROBOT-E: مسح المفاصل تمام',
  'التصميم: تصدير الأصول خلص',
  'القانوني: مراجعة الامتثال تمام',
  'العمليات: خط الـ deploy أخضر',
];

// ── كلام الوكلاء — عامية مصرية شعبية ────────────────────────────────────────
const CONVOS = {
  'SAVVY':   [
    'يا كلود يا عم، الـ RAG بقى تحفة النهارده!',
    'رامي هيتجنن لما يشوف الأرقام دي',
    'خلاص، بعت الريبورت. الكلام ده كلام!',
    'يلا نكمل، في شغل كتير يا جدعان',
  ],
  'CLAUDE':  [
    'والنبي؟ أنا قلتلك الـ chunking هيعمل حاجة',
    'بكتبلك الريبورت دلوقتي، خلي بالك',
    'الـ PR جاهز، بس فيه 3 comments لسه',
    'كله تمام يا سيدي، ماشي زي الفل',
  ],
  'GOOGLE':  [
    'يا عم، الـ endpoints كلها تمام، 42 ميلي',
    'فيه لود هييجي الساعة 3، بصّ شويه',
    'خلاص عملت scale up، ماتتقلقش',
    'كل الـ APIs شغالة من غير أي مشكلة',
  ],
  'DEV-1':   [
    'لقيت البق يا جدعان، غلطة سخيفة في 47',
    'الـ array الفاضية اللي بتعملك المشكلة؟',
    'خلصت الـ debug، شغال دلوقتي تمام',
    'يا عم الكود ده عامل إيه بالظبط؟',
  ],
  'DEV-2':   [
    'يا ابن النظام... 11 test شغالين من 12',
    'بالظبط يا عم، بصلحه دلوقتي',
    'الـ refactor خلص، بكتب الـ tests دلوقتي',
    'يلا نمسك الـ edge cases دي كلها',
  ],
  'OPS-1':   [
    'ماشي يسطا، الـ CPU على 34% مش هيعدي',
    'الـ deploy pipeline أخضر، نزل براحتك',
    'فيه alert جه بس مش حاجة كبيرة خالص',
    'الـ servers كلها تمام يا جدعان',
  ],
  'ROBOT-E': [
    'المفاصل كلها تمام يا جماعة',
    '24 محور شغال زي الفل',
    'الـ simulation خلصت، كله ماشي',
    'جاهز للأوامر يا باشا',
  ],
};

// ── ألوان اسم الوكيل ──────────────────────────────────────────────────────────
const AGENT_COLOR = {
  'SAVVY':'#0088ff','CLAUDE':'#4fa3ff','GOOGLE':'#ff8c00',
  'DEV-1':'#00cc88','DEV-2':'#cc44aa','OPS-1':'#ffcc00','ROBOT-E':'#44aaff',
};

// ═════════════════════════════════════════════════════════════════════════════
// شاشة الإقلاع
// ═════════════════════════════════════════════════════════════════════════════
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const g = this.add.graphics();
    g.fillStyle(C.bg,1); g.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=2){ g.fillStyle(0,0.15); g.fillRect(0,y,W,1); }

    const lines = [
      '> سافي AI  v3.0',
      '> بيشتغل الذكاء المحلي...',
      '> فهرس الـ RAG: تمام',
      '> بيئة MLX: جاهزة',
      '> الوكلاء: متصلين',
      '> محاكاة المكتب: بتتحمل',
    ];
    let delay = 0;
    lines.forEach((line,i) => {
      const t = this.add.text(W/2, H/2-90+i*34, line, {
        fontFamily:'Arial', fontSize:'26px', color:'#00ffcc',
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
// المشهد الرئيسي
// ═════════════════════════════════════════════════════════════════════════════
class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  create() {
    this.actors     = [];
    this.eventIndex = 0;
    this.convoStep  = 0;
    this.windowLights = [];
    this.ambientDots  = [];

    this._buildTextures();
    this._buildOffice();
    this._buildDecorations();
    this._buildDesks();
    this._buildActors();
    this._buildBubbles();
    this._buildHUD();
    this._buildScanlines();

    this.time.addEvent({ delay:4000,  callback:this._tickFeed,         callbackScope:this, loop:true });
    this.time.addEvent({ delay:800,   callback:this._tickScreens,      callbackScope:this, loop:true });
    this.time.addEvent({ delay:100,   callback:this._tickActors,       callbackScope:this, loop:true });
    this.time.addEvent({ delay:700,   callback:this._tickAmbientDots,  callbackScope:this, loop:true });
    this.time.addEvent({ delay:9000,  callback:this._tickLobbyWalker,  callbackScope:this, loop:true });
    this.time.addEvent({ delay:5000,  callback:this._tickConversation, callbackScope:this, loop:true });
    this.time.addEvent({ delay:7000,  callback:this._tickWindowLights, callbackScope:this, loop:true });

    this.cameras.main.fadeIn(500,0,0,0);
  }

  // ── Textures ──────────────────────────────────────────────────────────────
  _buildTextures() {
    ['floor_a','floor_b'].forEach((key,i) => {
      const g = this.make.graphics({x:0,y:0,add:false});
      g.fillStyle(i===0?C.floor:C.floorAlt,1); g.fillRect(0,0,TILE,TILE);
      g.fillStyle(C.grid,1); g.fillRect(0,0,TILE,1); g.fillRect(0,0,1,TILE);
      g.generateTexture(key,TILE,TILE); g.destroy();
    });

    // Upgraded desk — dual monitors, keyboard, mouse (56×34)
    const dt = this.make.graphics({x:0,y:0,add:false});
    // Surface
    dt.fillStyle(0x1a1a2e,1); dt.fillRect(0,0,56,34);
    dt.fillStyle(0x2a2a4e,1); dt.fillRect(1,1,54,3);
    // Desk legs
    dt.fillStyle(0x111122,1); dt.fillRect(2,32,6,2); dt.fillRect(48,32,6,2);
    // Monitor 1 (main, left)
    dt.fillStyle(0x0d0d1a,1); dt.fillRect(3,3,20,16);
    dt.fillStyle(0x001a0d,1); dt.fillRect(4,4,18,14);
    dt.fillStyle(C.screen,0.6); dt.fillRect(5,5,16,12);
    dt.fillStyle(0x0d0d1a,1); dt.fillRect(11,19,4,3); // stand
    // Code lines on screen 1
    dt.fillStyle(C.screen,0.8); dt.fillRect(6,7,10,2);
    dt.fillStyle(C.screen,0.6); dt.fillRect(6,10,7,2);
    dt.fillStyle(C.screen,0.7); dt.fillRect(6,13,12,2);
    // Monitor 2 (secondary, right)
    dt.fillStyle(0x0d0d1a,1); dt.fillRect(28,3,16,13);
    dt.fillStyle(0x1a0d00,1); dt.fillRect(29,4,14,11);
    dt.fillStyle(0xff8c00,0.35); dt.fillRect(30,5,12,9);
    dt.fillStyle(0xff8c00,0.6); dt.fillRect(31,7,8,2); dt.fillRect(31,10,5,2);
    dt.fillStyle(0x0d0d1a,1); dt.fillRect(34,16,3,2); // stand
    // Keyboard
    dt.fillStyle(0x13132a,1); dt.fillRect(3,22,26,6);
    dt.fillStyle(0x1a1a3a,0.6);
    for(let ki=0;ki<3;ki++) for(let kj=0;kj<7;kj++) dt.fillRect(4+kj*3.5,23+ki*1.8,3,1.5);
    // Mouse
    dt.fillStyle(0x13132a,1); dt.fillEllipse(34,26,6,8);
    dt.generateTexture('desk',56,34); dt.destroy();

    // Characters (same as before)
    const chars = [
      { key:'savvy_char',  body:C.savvy,   head:0xd4a470, hair:0x111133 },
      { key:'claude_char', body:C.claude,  head:0xf0c080, hair:0x222266 },
      { key:'google_char', body:C.google,  head:0xe8b880, hair:0x331100 },
      { key:'npc1_char',   body:C.npc1,    head:0xd8c0a0, hair:0x224422 },
      { key:'npc2_char',   body:C.npc2,    head:0xecc0b8, hair:0x441133 },
      { key:'npc3_char',   body:C.npc3,    head:0xd4b888, hair:0x443300 },
      { key:'npc4_char',   body:C.npc4,    head:0xc8d8e8, hair:0x003366 },
    ];
    chars.forEach(c => this._makeChar(c));
  }

  _makeChar({ key, body, head, hair }) {
    const g = this.make.graphics({x:0,y:0,add:false});
    g.fillStyle(0x000000,0.3); g.fillEllipse(7,20,12,4);
    g.fillStyle(body,0.6);  g.fillRect(3,14,4,6); g.fillRect(8,14,4,6);
    g.fillStyle(0x111111,1); g.fillRect(2,19,5,2); g.fillRect(7,19,5,2);
    g.fillStyle(body,1);    g.fillRect(2,7,11,8);
    g.fillStyle(0xffffff,0.12); g.fillRect(2,7,11,2);
    g.fillStyle(body,0.8);  g.fillRect(0,8,2,5); g.fillRect(13,8,2,5);
    g.fillStyle(head,1);    g.fillRect(0,13,2,2); g.fillRect(13,13,2,2);
    g.fillStyle(head,1);    g.fillRect(5,5,5,3); g.fillRect(3,1,9,6);
    g.fillStyle(hair,1);    g.fillRect(3,1,9,2); g.fillRect(3,1,2,4); g.fillRect(10,1,2,4);
    g.fillStyle(0x000000,1); g.fillRect(5,4,2,2); g.fillRect(9,4,2,2);
    g.fillStyle(0xffffff,1); g.fillRect(6,4,1,1); g.fillRect(10,4,1,1);
    g.generateTexture(key,15,22); g.destroy();
  }

  // ── الأوضة ────────────────────────────────────────────────────────────────
  _buildOffice() {
    this.rooms = [
      { id:'rd',      x:HUD_W+10,  y:10,  w:300, h:195, color:0x0d1a2e, label:'مختبر البحث',      labelColor:'#4fa3ff', assignTo:'claude' },
      { id:'ai',      x:HUD_W+320, y:10,  w:240, h:195, color:0x1a0d2e, label:'قلب الـ AI',        labelColor:'#aa66ff', assignTo:'savvy'  },
      { id:'infra',   x:HUD_W+570, y:10,  w:220, h:195, color:0x0d2e1a, label:'البنية التحتية',   labelColor:'#00cc88', assignTo:'ops1'   },
      { id:'ops',     x:HUD_W+800, y:10,  w:190, h:195, color:0x2e1a0d, label:'غرفة العمليات',    labelColor:'#ff8c00', assignTo:'google' },
      { id:'design',  x:HUD_W+10,  y:215, w:490, h:215, color:0x1a1a0d, label:'استوديو التصميم',  labelColor:'#ffee44', assignTo:'npc2'   },
      { id:'legal',   x:HUD_W+510, y:215, w:280, h:215, color:0x2e0d0d, label:'القسم القانوني',   labelColor:'#ff4466', assignTo:'npc1'   },
      { id:'robotics',x:HUD_W+800, y:215, w:190, h:215, color:0x0d2e2e, label:'مختبر الروبوتات',  labelColor:'#00ffcc', assignTo:'robote' },
      { id:'lobby',   x:HUD_W+10,  y:440, w:980, h:160, color:0x111118, label:'الاستقبال — سيول HQ', labelColor:'#4fa3ff', assignTo:null  },
    ];

    const g = this.add.graphics();
    this.rooms.forEach(r => {
      g.fillStyle(r.color,1); g.fillRect(r.x,r.y,r.w,r.h);
      for(let tx=r.x;tx<r.x+r.w;tx+=TILE)
        for(let ty=r.y;ty<r.y+r.h;ty+=TILE){
          const alt=((tx/TILE)+(ty/TILE))%2===0;
          g.fillStyle(alt?0xffffff:0x000000,0.018); g.fillRect(tx,ty,TILE,TILE);
        }
      g.lineStyle(2,0x0050ff,0.45); g.strokeRect(r.x,r.y,r.w,r.h);
      [[0,0],[r.w-4,0],[0,r.h-4],[r.w-4,r.h-4]].forEach(([dx,dy])=>{
        g.fillStyle(0x0050ff,0.85); g.fillRect(r.x+dx,r.y+dy,4,4);
      });
      g.fillStyle(0xffffff,0.025); g.fillRect(r.x,r.y,r.w,2);
      this.add.text(r.x+8, r.y+8, r.label, {
        fontFamily:'Arial', fontSize:'20px', color:r.labelColor,
      }).setAlpha(0.9);
    });

    g.lineStyle(1,C.grid,0.1);
    for(let x=HUD_W;x<W;x+=TILE) g.lineBetween(x,0,x,H);
    for(let y=0;y<H;y+=TILE)     g.lineBetween(HUD_W,y,W,y);
  }

  // ── الديكور ───────────────────────────────────────────────────────────────
  _buildDecorations() {
    const g = this.add.graphics();

    // مختبر البحث — سبورة + رف كتب + شباك
    this._drawWhiteboard(g, HUD_W+270, 28, 28, 62, 0x4fa3ff);
    this._drawWhiteboard(g, HUD_W+242, 28, 24, 62, 0x223355);
    this._drawBookshelf(g, HUD_W+14,  22, 42, 58);
    this._drawWindow(HUD_W+55, 18, 65, 44);

    // قلب الـ AI — سيرفرز + شباك
    this._drawServer(g, HUD_W+510, 24);
    this._drawServer(g, HUD_W+532, 24);
    this._drawWindow(HUD_W+330, 14, 58, 38);

    // البنية التحتية — سيرفرز
    this._drawServer(g, HUD_W+580, 24);
    this._drawServer(g, HUD_W+602, 24);
    this._drawServer(g, HUD_W+624, 24);
    this._drawServer(g, HUD_W+646, 24);

    // غرفة العمليات — رف + سبورة + شباك
    this._drawBookshelf(g, HUD_W+890, 18, 36, 56);
    this._drawWhiteboard(g, HUD_W+808, 18, 20, 56, 0xff8c00);
    this._drawWindow(HUD_W+812, 12, 72, 42);

    // استوديو التصميم — نباتات + ماكينة قهوة + طابعة + سبورة + شباك
    this._drawPlant(g, HUD_W+18,  390);
    this._drawPlant(g, HUD_W+468, 390);
    this._drawPlant(g, HUD_W+255, 220);
    this._drawCoffeeMachine(g, HUD_W+300, 318);
    this._drawPrinter(g, HUD_W+410, 328);
    this._drawWhiteboard(g, HUD_W+320, 220, 28, 60, 0xffee44);
    this._drawWhiteboard(g, HUD_W+352, 220, 22, 60, 0xcc8800);
    this._drawWindow(HUD_W+65, 190, 72, 46);

    // القسم القانوني — رفوف + طابعة + نبتة
    this._drawBookshelf(g, HUD_W+516, 222, 42, 60);
    this._drawBookshelf(g, HUD_W+562, 222, 36, 60);
    this._drawPrinter(g, HUD_W+660, 328);
    this._drawPlant(g, HUD_W+680, 220);

    // مختبر الروبوتات — سيرفرز + روبوت + شباك
    this._drawServer(g, HUD_W+806, 226);
    this._drawServer(g, HUD_W+828, 226);
    this._drawRobotIcon(g, HUD_W+855, 278);
    this._drawWindow(HUD_W+810, 220, 62, 46);

    // الاستقبال — استقبال + كنب + ماكينة قهوة + نباتات + شوابيك
    this._drawReceptionDesk(g, HUD_W+436, 468);
    this._drawSofa(g, HUD_W+30,  468, 55);
    this._drawSofa(g, HUD_W+896, 468, 55);
    this._drawPlant(g, HUD_W+32,  492);
    this._drawPlant(g, HUD_W+956, 492);
    this._drawCoffeeMachine(g, HUD_W+18, 494);
    this._drawWindow(HUD_W+105, 444, 82, 52);
    this._drawWindow(HUD_W+660, 444, 82, 52);

    // نقاط محيطية
    this.ambientDots = [];
    [
      { x:HUD_W+808, y:230 }, { x:HUD_W+820, y:250 }, { x:HUD_W+834, y:238 },
      { x:HUD_W+360, y:188 }, { x:HUD_W+374, y:178 }, { x:HUD_W+390, y:190 },
    ].forEach(d => {
      const dot = this.add.graphics().setDepth(5);
      dot.fillStyle(0x00ffcc,1); dot.fillRect(d.x,d.y,3,3);
      this.ambientDots.push({ gfx:dot, x:d.x, y:d.y, lit:true });
    });
  }

  _drawWhiteboard(g, x, y, w, h, color) {
    g.fillStyle(0x0e1c2e,1); g.fillRect(x,y,w,h);
    g.lineStyle(1,color,0.55); g.strokeRect(x,y,w,h);
    g.fillStyle(0x060f1a,1); g.fillRect(x,y,w,3);
    g.fillStyle(color,0.6); g.fillRect(x+3,y+4,4,4);
    g.lineStyle(1,color,0.18);
    for(let ly=y+10;ly<y+h-4;ly+=7) g.lineBetween(x+3,ly,x+w-3,ly);
  }

  _drawBookshelf(g, x, y, w, h) {
    g.fillStyle(0x1a1220,1); g.fillRect(x,y,w,h);
    g.lineStyle(1,0x2a1a30,1); g.strokeRect(x,y,w,h);
    const bookColors = [0x0050ff,0xff4466,0x00cc88,0xffee44,0x4fa3ff,0xcc44aa,0xff8c00,0x44aaff];
    [0,1,2].forEach(row => {
      const sy = y + 4 + row*17;
      g.fillStyle(0x111118,1); g.fillRect(x+1,sy+12,w-2,1.5);
      let bx = x+2;
      for(let bi=0;bi<5+row;bi++){
        const bw = 3 + (bi%3);
        if(bx+bw > x+w-2) break;
        g.fillStyle(bookColors[(row*5+bi)%bookColors.length],0.85);
        g.fillRect(bx,sy,bw,12);
        g.fillStyle(0x000000,0.2); g.fillRect(bx,sy,1,12);
        bx += bw+1;
      }
    });
  }

  _drawCoffeeMachine(g, x, y) {
    g.fillStyle(0x1a1a2e,1); g.fillRect(x,y,22,32);
    g.lineStyle(1,0x2a2a4e,1); g.strokeRect(x,y,22,32);
    g.fillStyle(0x001420,1); g.fillRect(x+3,y+3,11,8);
    g.fillStyle(C.screen,0.5); g.fillRect(x+4,y+5,9,4);
    // Buttons
    [0x0050ff,0x00cc88,0xffee44].forEach((bc,bi) => {
      g.fillStyle(bc,0.8); g.fillCircle(x+17,y+5+bi*4,2);
    });
    g.fillStyle(0x111122,1); g.fillRect(x+8,y+14,6,9);
    g.fillStyle(0x0d0d1a,1); g.fillRect(x+4,y+24,14,7);
    g.fillStyle(0x3d2000,1); g.fillRect(x+8,y+25,6,5);
    g.fillStyle(0x5a3300,1); g.fillRect(x+8,y+25,6,2);
  }

  _drawPrinter(g, x, y) {
    g.fillStyle(0x1e1e30,1); g.fillRect(x,y,34,22);
    g.lineStyle(1,0x2a2a44,1); g.strokeRect(x,y,34,22);
    g.fillStyle(0x111120,1); g.fillRect(x+4,y+5,26,5);
    g.fillStyle(0x00ff44,0.85); g.fillCircle(x+30,y+4,2);
    g.fillStyle(0xe8e8e8,1); g.fillRect(x+6,y+14,22,1.5);
    g.fillStyle(0xcccccc,1); g.fillRect(x+6,y+17,16,1.5);
  }

  _drawSofa(g, x, y, w) {
    g.fillStyle(0x1a1230,1); g.fillRect(x,y,w,22);
    g.lineStyle(1,0x2a1a40,1); g.strokeRect(x,y,w,22);
    g.fillStyle(0x1e1635,1); g.fillRect(x,y,w,7);
    const hw = Math.floor((w-6)/2);
    g.fillStyle(0x221640,1); g.fillRect(x+2,y+8,hw,12);
    g.fillStyle(0x221640,1); g.fillRect(x+4+hw,y+8,hw,12);
    g.lineStyle(1,0x2a1a4a,1);
    g.strokeRect(x+2,y+8,hw,12); g.strokeRect(x+4+hw,y+8,hw,12);
    g.fillStyle(0x1e1635,1);
    g.fillRect(x,y+7,3,15); g.fillRect(x+w-3,y+7,3,15);
  }

  _drawReceptionDesk(g, x, y) {
    g.fillStyle(0x1a1a3a,1); g.fillRect(x,y,130,46);
    g.lineStyle(1.5,0x0050ff,0.65); g.strokeRect(x,y,130,46);
    g.fillStyle(0x22224a,1); g.fillRect(x,y,130,9);
    // Monitor
    g.fillStyle(0x0d0d1a,1); g.fillRect(x+10,y+12,26,18);
    g.lineStyle(1,0x222244,1); g.strokeRect(x+10,y+12,26,18);
    g.fillStyle(C.screen,0.12); g.fillRect(x+11,y+13,24,16);
    g.fillStyle(C.screen,0.5);
    g.fillRect(x+13,y+16,12,2); g.fillRect(x+13,y+19,17,2); g.fillRect(x+13,y+22,9,2);
    // Sign
    this.add.text(x+52,y+28,'الاستقبال',{fontFamily:'Arial',fontSize:'14px',color:'#4fa3ff'}).setOrigin(0,0.5);
    // Flower
    g.fillStyle(0xcc4466,1); g.fillCircle(x+115,y+14,4);
    g.fillStyle(0x226622,1); g.fillRect(x+114,y+17,2,8);
  }

  _drawWindow(x, y, w, h) {
    const g = this.add.graphics().setDepth(2);
    // Frame
    g.fillStyle(0x080818,1); g.fillRect(x,y,w,h);
    g.lineStyle(1.5,0x1a2a4a,1); g.strokeRect(x,y,w,h);
    // Sky gradient
    g.fillGradientStyle(0x000514,0x000514,0x001028,0x001028,1);
    g.fillRect(x+1,y+1,w-2,Math.floor(h*0.55));
    // Buildings
    const numB = Math.floor(w/10);
    for(let bi=0;bi<numB;bi++){
      const bh = 10 + ((bi*7+x+bi)%22);
      const bx = x+1+bi*(w-2)/numB;
      const bw = Math.floor((w-2)/numB)-1;
      g.fillStyle(0x050518,1); g.fillRect(bx,y+h-bh,bw,bh);
      // Windows on building
      for(let wy=y+h-bh+3;wy<y+h-3;wy+=5)
        for(let wx=bx+2;wx<bx+bw-2;wx+=5){
          const lit = ((wx+wy+bi)%7 < 3);
          if(lit){ g.fillStyle(0xffee88,0.45); g.fillRect(wx,wy,2,2); }
          this.windowLights.push({gfx:g,x:wx,y:wy,lit});
        }
    }
    // Cross dividers
    g.lineStyle(1,0x1a2a4a,0.5);
    g.lineBetween(x+Math.floor(w/2),y,x+Math.floor(w/2),y+h);
    g.lineBetween(x,y+Math.floor(h/2),x+w,y+Math.floor(h/2));
  }

  _drawServer(g, x, y) {
    g.fillStyle(C.server,1); g.fillRect(x,y,20,90);
    g.lineStyle(1,0x2a3a4a,1); g.strokeRect(x,y,20,90);
    g.fillStyle(0x00aaff,1); g.fillRect(x,y,20,2);
    for(let i=0;i<5;i++){
      g.fillStyle(0x111e2a,1); g.fillRect(x+2,y+6+i*16,16,11);
      g.lineStyle(1,0x1a2a3a,1); g.strokeRect(x+2,y+6+i*16,16,11);
      g.fillStyle(i%2===0?0x00ff44:C.serverLight,0.9);
      g.fillRect(x+15,y+8+i*16,2,2);
      g.fillStyle(C.serverLight,0.15);
      g.fillRect(x+3,y+10+i*16,10,1.5); g.fillRect(x+3,y+13+i*16,7,1.5);
    }
  }

  _drawPlant(g, x, y) {
    g.fillStyle(0x7a4422,1); g.fillRect(x+4,y+14,13,9);
    g.lineStyle(1,0x553311,1); g.strokeRect(x+4,y+14,13,9);
    g.fillStyle(0x331100,1); g.fillRect(x+5,y+14,11,3);
    g.fillStyle(C.plant,1);
    g.fillTriangle(x+10,y,x+2,y+16,x+18,y+16);
    g.fillStyle(C.plantDark,1); g.fillCircle(x+10,y+8,7);
    g.fillStyle(C.plant,0.7); g.fillCircle(x+10,y+7,4);
  }

  _drawRobotIcon(g, x, y) {
    g.fillStyle(C.robot,1); g.fillRect(x+6,y,14,11);
    g.lineStyle(1,0x44aaff,0.65); g.strokeRect(x+6,y,14,11);
    g.fillStyle(0x00ffcc,0.9); g.fillRect(x+8,y+3,3,3); g.fillRect(x+14,y+3,3,3);
    g.fillStyle(0x00ffcc,0.15); g.fillRect(x+7,y+2,5,5); g.fillRect(x+13,y+2,5,5);
    g.fillStyle(C.robot,1); g.fillRect(x+4,y+12,18,15);
    g.lineStyle(1,0x44aaff,0.4); g.strokeRect(x+4,y+12,18,15);
    g.fillStyle(0x001133,1); g.fillRect(x+7,y+15,10,8);
    g.fillStyle(0x00ffcc,0.5); g.fillRect(x+9,y+20,6,2);
    g.fillStyle(C.robot,1);
    g.fillRect(x,y+13,4,11); g.fillRect(x+22,y+13,4,11);
    g.fillRect(x+6,y+27,6,10); g.fillRect(x+14,y+27,6,10);
    g.fillStyle(0x1a2a3a,1); g.fillRect(x+4,y+36,9,4); g.fillRect(x+13,y+36,9,4);
    this.add.text(x+13,y+41,'G1',{fontFamily:'Courier New',fontSize:'13px',color:'#00ffcc'}).setOrigin(0.5,0);
  }

  // ── المكاتب ───────────────────────────────────────────────────────────────
  _buildDesks() {
    this.desks = [];
    const pos = [
      // مختبر البحث
      {x:HUD_W+22,y:58},{x:HUD_W+82,y:58},{x:HUD_W+142,y:58},
      {x:HUD_W+22,y:122},{x:HUD_W+82,y:122},{x:HUD_W+142,y:122},
      // قلب الـ AI
      {x:HUD_W+334,y:58},{x:HUD_W+394,y:58},{x:HUD_W+454,y:58},
      {x:HUD_W+334,y:122},{x:HUD_W+394,y:122},
      // البنية التحتية
      {x:HUD_W+582,y:58},{x:HUD_W+642,y:58},
      {x:HUD_W+582,y:122},{x:HUD_W+642,y:122},
      // غرفة العمليات
      {x:HUD_W+812,y:58},{x:HUD_W+860,y:58},
      {x:HUD_W+812,y:122},{x:HUD_W+860,y:122},
      // استوديو التصميم
      {x:HUD_W+22,y:258},{x:HUD_W+82,y:258},{x:HUD_W+142,y:258},{x:HUD_W+202,y:258},
      {x:HUD_W+22,y:322},{x:HUD_W+82,y:322},{x:HUD_W+142,y:322},
      // القسم القانوني
      {x:HUD_W+522,y:258},{x:HUD_W+582,y:258},{x:HUD_W+642,y:258},
      {x:HUD_W+522,y:322},{x:HUD_W+582,y:322},
      // مختبر الروبوتات
      {x:HUD_W+812,y:258},{x:HUD_W+860,y:258},
      {x:HUD_W+812,y:322},
    ];
    pos.forEach(p => {
      this.add.image(p.x,p.y,'desk').setOrigin(0).setDepth(4);
      const screen = this.add.graphics().setDepth(5);
      screen.fillStyle(C.screen,0.6); screen.fillRect(p.x+5,p.y+5,16,12);
      this.desks.push({ screen, x:p.x, y:p.y, on:true, lineWidths:[8,5,10] });
    });
  }

  // ── الوكلاء ───────────────────────────────────────────────────────────────
  _buildActors() {
    const defs = [
      { key:'savvy_char',  name:'SAVVY',   x:HUD_W+405, y:120, homeRoom:'ai',       isSavvy:true },
      { key:'claude_char', name:'CLAUDE',  x:HUD_W+105, y:100, homeRoom:'rd'        },
      { key:'google_char', name:'GOOGLE',  x:HUD_W+858, y:100, homeRoom:'ops'       },
      { key:'npc1_char',   name:'DEV-1',   x:HUD_W+105, y:298, homeRoom:'design'    },
      { key:'npc2_char',   name:'DEV-2',   x:HUD_W+582, y:298, homeRoom:'legal'     },
      { key:'npc3_char',   name:'OPS-1',   x:HUD_W+632, y:100, homeRoom:'infra'     },
      { key:'npc4_char',   name:'ROBOT-E', x:HUD_W+848, y:308, homeRoom:'robotics'  },
    ];

    defs.forEach(d => {
      const sprite = this.add.image(d.x,d.y,d.key).setOrigin(0.5,1).setScale(2).setDepth(10);
      const label  = this.add.text(d.x, d.y-sprite.displayHeight-4, d.name, {
        fontFamily:'Courier New', fontSize:'15px',
        color: AGENT_COLOR[d.name] || '#aaffcc',
        backgroundColor:'#050505cc', padding:{x:3,y:2},
      }).setOrigin(0.5,1).setDepth(11);

      let glow = null;
      if(d.isSavvy){
        glow = this.add.graphics().setDepth(9);
        this._drawGlow(glow,d.x,d.y,18,C.savvy,0.22);
      }
      const homeRoom = this.rooms.find(r=>r.id===d.homeRoom)||this.rooms[0];
      const actor = {
        sprite, label, glow,
        name:d.name, isSavvy:!!d.isSavvy,
        state:'IDLE', stateTimer:0,
        tween:null,
        homeRoom,
        dialogIdx:0,
        bobOffset: Math.random()*Math.PI*2,
        // bubble objects built in _buildBubbles
        bubbleGfx:null, bubbleName:null, bubbleDialog:null, bubbleBadge:null,
      };
      this.actors.push(actor);
      this._scheduleNextState(actor);
    });
  }

  // ── فقاعات الكلام ─────────────────────────────────────────────────────────
  _buildBubbles() {
    this.actors.forEach(a => {
      a.bubbleGfx    = this.add.graphics().setDepth(18);
      a.bubbleName   = this.add.text(0,0,a.name,{
        fontFamily:'Courier New', fontSize:'13px',
        color: AGENT_COLOR[a.name]||'#aaffcc',
      }).setDepth(19).setOrigin(0,0);
      a.bubbleDialog = this.add.text(0,0,'',{
        fontFamily:'Arial', fontSize:'15px', color:'#cceeff',
        wordWrap:{ width:180 },
      }).setDepth(19).setOrigin(0,0);
      a.bubbleBadge  = this.add.text(0,0,'',{
        fontFamily:'Arial', fontSize:'12px', color:'#00ffcc',
      }).setDepth(19).setOrigin(0,0);
    });
  }

  _updateBubble(a) {
    const sx = a.sprite.x;
    const sy = a.sprite.y - a.sprite.displayHeight;

    // Slow float
    const bob = Math.sin(this.time.now/2000 + a.bobOffset) * 3;

    const lines  = CONVOS[a.name] || [];
    const dialog = lines[a.dialogIdx % Math.max(lines.length,1)] || '';
    const stateLabel = STATE_LABEL[a.state] || a.state;
    const stateColor = STATE_COLOR[a.state] || '#336655';

    a.bubbleDialog.setText(dialog);
    a.bubbleBadge.setText(' ' + stateLabel);
    a.bubbleBadge.setColor(stateColor);

    const pad    = 10;
    const innerW = Math.max(a.bubbleName.width, a.bubbleDialog.width, a.bubbleBadge.width) + pad*2;
    const textH  = a.bubbleName.height + 3 + a.bubbleDialog.height;
    const badgeH = 16;
    const totalH = pad + textH + 4 + badgeH + pad/2;

    // Clamp so bubble stays inside game area
    let bx = sx - innerW/2;
    bx = Math.max(HUD_W+4, Math.min(W-innerW-4, bx));
    const by = sy - totalH - 14 + bob;

    const sc = Phaser.Display.Color.HexStringToColor(stateColor).color;

    a.bubbleGfx.clear();
    // bg
    a.bubbleGfx.fillStyle(0x0d1a2e, 0.94);
    a.bubbleGfx.fillRoundedRect(bx, by, innerW, totalH, 6);
    // border
    a.bubbleGfx.lineStyle(1, sc, 0.3);
    a.bubbleGfx.strokeRoundedRect(bx, by, innerW, totalH, 6);
    // badge strip
    a.bubbleGfx.fillStyle(0x020508, 0.88);
    a.bubbleGfx.fillRoundedRect(bx+1, by+totalH-badgeH-1, innerW-2, badgeH, {bl:5,br:5,tl:0,tr:0});
    // badge dot
    a.bubbleGfx.fillStyle(sc, 1);
    a.bubbleGfx.fillCircle(bx+10, by+totalH-badgeH/2-1, 3);
    // tail
    a.bubbleGfx.fillStyle(0x0d1a2e, 0.94);
    a.bubbleGfx.fillTriangle(
      sx-5, by+totalH,
      sx+5, by+totalH,
      sx,   by+totalH+9
    );

    // Position texts
    a.bubbleName.setPosition(bx+pad, by+pad/2);
    a.bubbleDialog.setPosition(bx+pad, by+pad/2+a.bubbleName.height+3);
    a.bubbleBadge.setPosition(bx+14, by+totalH-badgeH+2);
  }

  _drawGlow(g, x, y, r, color, alpha) {
    g.clear();
    for(let i=r;i>0;i-=3){
      g.fillStyle(color, alpha*(i/r)*0.4);
      g.fillCircle(x,y-6,i);
    }
  }

  // ── HUD بالعربي ───────────────────────────────────────────────────────────
  _buildHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(C.hud,0.96); g.fillRect(0,0,HUD_W,H);
    g.lineStyle(1,C.hudBorder,0.5); g.strokeRect(0,0,HUD_W,H);
    g.lineStyle(1,C.hudBorder,0.25); g.lineBetween(0,46,HUD_W,46);

    // Logo
    const lx=20, ly=23, lg=this.add.graphics().setDepth(51);
    lg.lineStyle(2,0x0088ff,1);
    lg.strokeRect(lx-9,ly-9,18,18); lg.strokeRect(lx-4,ly-4,8,8);
    for(let i=-5;i<=5;i+=10){
      lg.lineBetween(lx+i,ly-13,lx+i,ly-9);
      lg.lineBetween(lx+i,ly+9, lx+i,ly+13);
      lg.lineBetween(lx-13,ly+i,lx-9,ly+i);
      lg.lineBetween(lx+9, ly+i,lx+13,ly+i);
    }
    this.add.text(lx+16,ly,'SAVVY AI',{
      fontFamily:'Courier New',fontSize:'22px',color:'#0088ff',fontWeight:'bold',
    }).setOrigin(0,0.5).setDepth(51);

    // حالة الوكلاء
    this.add.text(10,55,'حالة الوكلاء',{
      fontFamily:'Arial',fontSize:'15px',color:'#336655',
    }).setDepth(51);

    const agentDefs = [
      {name:'SAVVY',  color:'#0088ff'},{name:'CLAUDE',color:'#4fa3ff'},
      {name:'GOOGLE', color:'#ff8c00'},{name:'DEV-1', color:'#00cc88'},
      {name:'DEV-2',  color:'#cc44aa'},{name:'OPS-1', color:'#ffcc00'},
      {name:'ROBOT-E',color:'#44aaff'},
    ];
    this.statusTexts = [];
    agentDefs.forEach((a,i) => {
      this.add.text(10,76+i*28,`■ ${a.name}`,{
        fontFamily:'Courier New',fontSize:'15px',color:a.color,
      }).setDepth(51);
      const st = this.add.text(160,76+i*28,'واقف',{
        fontFamily:'Arial',fontSize:'14px',color:'#336655',
      }).setDepth(51);
      this.statusTexts.push(st);
    });

    g.lineBetween(0,278,HUD_W,278);
    this.add.text(10,285,'آخر الأخبار',{
      fontFamily:'Arial',fontSize:'15px',color:'#336655',
    }).setDepth(51);

    this.feedTexts = [];
    for(let i=0;i<12;i++){
      const ft = this.add.text(10,306+i*32,'',{
        fontFamily:'Arial',fontSize:'14px',color:'#226644',
        wordWrap:{width:HUD_W-18},
      }).setDepth(51);
      this.feedTexts.push(ft);
    }

    const sb = this.add.graphics().setDepth(50);
    sb.fillStyle(0x000008,0.96); sb.fillRect(HUD_W,H-30,W-HUD_W,30);
    sb.lineStyle(1,C.hudBorder,0.3); sb.lineBetween(HUD_W,H-30,W,H-30);
    this.statusBar = this.add.text(HUD_W+14,H-15,
      'سيول HQ — الذكاء المحلي شغال',{
        fontFamily:'Arial',fontSize:'18px',color:'#0050ff',
      }).setOrigin(0,0.5).setDepth(51);
    this.clockText = this.add.text(W-12,H-15,'',{
      fontFamily:'Courier New',fontSize:'18px',color:'#336655',
    }).setOrigin(1,0.5).setDepth(51);
  }

  // ── خطوط المسح ───────────────────────────────────────────────────────────
  _buildScanlines() {
    const g = this.add.graphics().setDepth(100);
    for(let y=0;y<H;y+=3){ g.fillStyle(0,0.05); g.fillRect(HUD_W,y,W-HUD_W,1); }
  }

  // ── التيك ─────────────────────────────────────────────────────────────────
  _tickFeed() {
    const msg = EVENTS[this.eventIndex++ % EVENTS.length];
    for(let i=this.feedTexts.length-1;i>0;i--){
      this.feedTexts[i].setText(this.feedTexts[i-1].text);
      this.feedTexts[i].setColor(i<3?'#00cc88':i<7?'#226644':'#113322');
    }
    this.feedTexts[0].setText('> '+msg);
    this.feedTexts[0].setColor('#00ffcc');
  }

  _tickScreens() {
    this.desks.forEach(d => {
      // Slow flicker — only 3% chance of toggling per tick
      if(Math.random()<0.03) d.on=!d.on;
      d.screen.clear();
      if(d.on){
        d.screen.fillStyle(C.screenDim,0.45); d.screen.fillRect(d.x+5,d.y+5,16,12);
        // Slow line width change — drift by ±1 every tick
        d.lineWidths = d.lineWidths.map(w => {
          const nw = w + (Math.random()<0.4 ? (Math.random()<0.5?1:-1) : 0);
          return Math.max(2,Math.min(14,nw));
        });
        d.lineWidths.forEach((lw,row) => {
          d.screen.fillStyle(C.screen, 0.65+Math.random()*0.2);
          d.screen.fillRect(d.x+6, d.y+6+row*4, lw, 2);
        });
      } else {
        d.screen.fillStyle(C.screenDim,0.25); d.screen.fillRect(d.x+5,d.y+5,16,12);
      }
    });
  }

  _tickActors() {
    this.actors.forEach((a,i) => {
      a.stateTimer -= 100;
      if(a.stateTimer<=0) this._scheduleNextState(a);

      // Walk bob
      if(a.state==='WALKING'){
        const bobCycle = Math.floor(a.stateTimer/250)%2;
        const bob = bobCycle===0?2:-2;
        if(a._lastBob!==bob){ a.sprite.y+=(bob-(a._lastBob||0)); a._lastBob=bob; }
      } else if(a._lastBob){ a.sprite.y-=a._lastBob; a._lastBob=0; }

      a.label.setPosition(a.sprite.x, a.sprite.y-a.sprite.displayHeight-4);

      // Update chat bubble
      this._updateBubble(a);

      // HUD status
      if(this.statusTexts[i]){
        this.statusTexts[i].setText(STATE_LABEL[a.state]||a.state);
        this.statusTexts[i].setColor(STATE_COLOR[a.state]||'#336655');
      }

      if(a.glow) this._drawGlow(a.glow,a.sprite.x,a.sprite.y,18,C.savvy,0.22);
    });

    const now = new Date();
    this.clockText.setText(now.toLocaleTimeString('en-US',{hour12:false}));
  }

  // ── تبديل الكلام كل 5 ثواني ──────────────────────────────────────────────
  _tickConversation() {
    this.convoStep++;
    this.actors.forEach(a => {
      const lines = CONVOS[a.name];
      if(lines) a.dialogIdx = this.convoStep % lines.length;
    });
  }

  // ── وميض شبابيك المدينة ───────────────────────────────────────────────────
  _tickWindowLights() {
    // Redraw a random subset of window lights
    this.windowLights.forEach(wl => {
      if(Math.random()<0.3){
        wl.lit = !wl.lit;
        wl.gfx.fillStyle(wl.lit?0xffee88:0x050518, wl.lit?0.45:1);
        wl.gfx.fillRect(wl.x,wl.y,2,2);
      }
    });
  }

  _tickAmbientDots() {
    this.ambientDots.forEach(d => {
      if(Math.random()<0.5){
        d.lit=!d.lit;
        d.gfx.clear();
        d.gfx.fillStyle(d.lit?0x00ffcc:0x004433,1);
        d.gfx.fillRect(d.x,d.y,3,3);
      }
    });
  }

  _tickLobbyWalker() {
    const candidates = this.actors.filter(a=>a.state!=='WALKING');
    if(!candidates.length) return;
    const a = candidates[Math.floor(Math.random()*candidates.length)];
    const lobbyRoom = this.rooms.find(r=>r.id==='lobby');
    if(!lobbyRoom) return;
    const tx = lobbyRoom.x+40+Math.random()*(lobbyRoom.w-80);
    const ty = 480+Math.random()*80;
    const prevState = a.state;
    a.state='WALKING'; a.stateTimer=3500;
    if(a.tween) a.tween.stop();
    a.tween = this.tweens.add({
      targets:a.sprite, x:tx, y:ty,
      duration:2800, ease:'Sine.easeInOut',
      onComplete:()=>{
        const r = a.homeRoom;
        const hx = r.x+25+Math.random()*(r.w-50);
        const hy = r.y+25+Math.random()*(r.h-50);
        a.tween = this.tweens.add({
          targets:a.sprite, x:hx, y:hy,
          duration:3000, ease:'Sine.easeInOut',
          onComplete:()=>{ a.state=prevState; a.stateTimer=2000; },
        });
      },
    });
  }

  _scheduleNextState(a) {
    const pool = a.isSavvy
      ? ['IDLE','WALKING','WALKING','WORKING','WORKING','THINKING','MEETING','DEPLOYING']
      : ['IDLE','IDLE','WALKING','WORKING','WORKING','THINKING','MEETING','DEPLOYING'];
    a.state = pool[Math.floor(Math.random()*pool.length)];

    if(a.state==='WALKING'){
      const r = Math.random()<0.7 ? a.homeRoom : this.rooms[Math.floor(Math.random()*this.rooms.length)];
      const tx = r.x+25+Math.random()*(r.w-50);
      const ty = r.y+25+Math.random()*(r.h-50);
      a.stateTimer = 3000+Math.random()*3000;
      if(a.tween) a.tween.stop();
      a.tween = this.tweens.add({
        targets:a.sprite, x:tx, y:ty,
        duration:a.stateTimer*0.85, ease:'Sine.easeInOut',
      });
    } else if(a.state==='WORKING')    { a.stateTimer=6000+Math.random()*9000;
    } else if(a.state==='THINKING')   { a.stateTimer=2500+Math.random()*3000;
    } else if(a.state==='MEETING')    { a.stateTimer=7000+Math.random()*8000;
    } else if(a.state==='DEPLOYING')  { a.stateTimer=5000+Math.random()*5000;
    } else if(a.state==='REVIEWING')  { a.stateTimer=3500+Math.random()*4000;
    } else                             { a.stateTimer=2000+Math.random()*2000; }
  }

  update(time) {
    const pulse = Math.sin(time/2200)*0.5+0.5;
    const blue  = Math.floor(70+pulse*90).toString(16).padStart(2,'0');
    this.statusBar.setColor(`#00${blue}ff`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
new Phaser.Game({
  type:Phaser.AUTO, width:W, height:H,
  backgroundColor:'#050505',
  parent:'game-container',
  scene:[BootScene,WorldScene],
  scale:{ mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH },
  render:{ pixelArt:true, antialias:false },
});
