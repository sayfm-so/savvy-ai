# Savvy AI — Office Enhancement & Full Arabic Design
**Date:** 2026-04-12

## Summary
Enhance the Phaser.js retro office game with: (1) rich room decorations, (2) chat bubbles above every agent's head, (3) ALL game content translated to Egyptian street Arabic (عامية مصرية شعبية) — rooms, HUD, states, boot screen, live feed, everything, (4) agents talking to each other in Egyptian Arabic, (5) fix Google bot bug.

---

## 1. Full Arabic Content Translation

### Boot Screen Lines
```
> سافي AI  v2.0
> بيشتغل الذكاء المحلي...
> فهرس الـ RAG: تمام
> بيئة MLX: جاهزة
> الوكلاء: متصلين
> محاكاة المكتب: بتتحمل
```

### Room Labels
| English | Arabic |
|---------|--------|
| R&D LAB | مختبر البحث |
| AI CORE | قلب الـ AI |
| INFRA | البنية التحتية |
| OPS COMMAND | غرفة العمليات |
| DESIGN STUDIO | استوديو التصميم |
| LEGAL WING | القسم القانوني |
| ROBOTICS LAB | مختبر الروبوتات |
| LOBBY — SEOUL HQ | الاستقبال — سيول |

### HUD Labels
| English | Arabic |
|---------|--------|
| AGENT STATUS | حالة الوكلاء |
| LIVE FEED | آخر الأخبار |
| SAVVY AI | سافي AI |
| > SEOUL HQ — LOCAL INTELLIGENCE ONLINE | سيول HQ — الذكاء المحلي شغال |

### State Names (STATE_COLOR keys stay same, display text changes)
| State | Arabic Display |
|-------|---------------|
| IDLE | واقف |
| WALKING | بيتحرك |
| WORKING | شغال |
| THINKING | بيفكر |
| MEETING | في اجتماع |
| DEPLOYING | بيـ deploy |
| REVIEWING | بيراجع |

### ACTIVITIES per agent (all Arabic)
```js
SAVVY:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيعالج الطلبات...', THINKING:'بيحلل الكود...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
CLAUDE:  { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيكتب الـ docs', THINKING:'بيراجع الـ PR...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
GOOGLE:  { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'الـ API شغال', THINKING:'بيتفحص اللوجز...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
DEV-1:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيحل الـ bug', THINKING:'بيقرا الـ stack trace', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
DEV-2:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيكتب الـ tests', THINKING:'بيعمل refactor...', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
OPS-1:   { IDLE:'واقف', WALKING:'بيتحرك', WORKING:'بيراقب الـ infra', THINKING:'بيتفحص التنبيهات', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
ROBOT-E: { IDLE:'واقف', WALKING:'بيتجول', WORKING:'بيشغل الـ sim', THINKING:'بيضبط المفاصل', MEETING:'في اجتماع...', DEPLOYING:'بيـ deploy...', REVIEWING:'بيراجع الكود' }
```

### Live Feed Events (all Arabic)
```js
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
```

### Reception Desk Label
`[الاستقبال]` instead of `[RECEPTION]`

### G1 Robot label under silhouette
`G1` stays as-is (it's a product name)

### Status bar scrolling text options (in Arabic)
```js
'> سيول HQ — الذكاء المحلي شغال',
'> سافي AI — كل الأنظمة تمام',
'> الوكلاء: 7 متصلين',
```

---

## 2. Rich Office Environment

Replace simple room fills with detailed decorations per room:

| Room | New Details |
|------|-------------|
| R&D Lab | Bookshelf, 2 whiteboards w/ code lines, city window |
| AI Core | 2 server racks, city window |
| Infra | 4 server racks |
| OPS Command | Bookshelf, whiteboard, city window |
| Design Studio | 2 plants, coffee machine, printer, whiteboards, city window |
| Legal Wing | 2 bookshelves, printer, plant |
| Robotics Lab | 2 server racks, G1 robot silhouette, city window |
| Lobby | Reception desk, 2 sofas, 2 large plants, coffee machine, 2 city windows |

**Desk upgrades:** Each desk gets dual monitors (slow scrolling code lines, ~2s refresh), keyboard, mouse, random prop (coffee / notebook / mini plant).

**New draw helpers:** `_drawBookshelf`, `_drawCoffeeMachine`, `_drawPrinter`, `_drawSofa`, `_drawReceptionDesk`, `_drawWindow`.

---

## 3. Dialog Bubble System

Replace status box + emoji bubble with:

**Chat Bubble** (above head):
- Rounded rect with downward tail
- Agent name (colored) + Arabic dialog line
- Slow sine-wave float (~4s period, 3px amplitude)
- Rotates every 5s

**Activity Badge** (inside bubble, bottom strip):
- Colored dot + Arabic state name
- `_updateBubble(actor)` called each tick

---

## 4. Egyptian Arabic Agent Dialog

### Conversation pairs (rotate every 5s):

**سافي ↔ كلود:**
1. سافي: `"يا كلود يا عم، الـ RAG بقى تحفة النهارده!"`
2. كلود: `"والنبي؟ أنا قلتلك الـ chunking هيعمل حاجة"`
3. سافي: `"رامي هيتجنن لما يشوف الأرقام دي"`
4. كلود: `"بكتبلك الريبورت دلوقتي، خلي بالك"`

**جوجل ↔ OPS-1:**
1. جوجل: `"يا عم، الـ endpoints كلها تمام، 42 ميلي"`
2. OPS-1: `"ماشي يسطا، الـ CPU على 34% مش هيعدي"`
3. جوجل: `"فيه لود هييجي الساعة 3، بصّ شويه"`
4. OPS-1: `"خلاص عملت scale up، ماتتقلقش"`

**DEV-1 ↔ DEV-2:**
1. DEV-1: `"لقيت البق يا جدعان، غلطة سخيفة في 47"`
2. DEV-2: `"يا ابن النظام... 11 test شغالين من 12"`
3. DEV-1: `"الـ array الفاضية اللي بتعملك المشكلة؟"`
4. DEV-2: `"بالظبط يا عم، بصلحه دلوقتي"`

**ROBOT-E (solo, rotates):**
- `"المفاصل كلها تمام يا جماعة"`
- `"24 محور شغال زي الفل"`
- `"الـ simulation خلصت، كله ماشي"`
- `"جاهز للأوامر يا باشا"`

---

## 5. Google Bot Fix

Remove any negative/stuck state. Ensure ACTIVITIES.GOOGLE uses `'الـ API شغال'` not any error string. Verify `_scheduleNextState` cycles normally.

---

## 6. Animation Speeds

| Element | Period |
|---------|--------|
| Bubble float | ~4s |
| Desk screen lines | ~2s |
| Server LED | ~1.2s |
| City window lights | ~8s |
| Walk bob | ~0.8s |
| Coffee steam | ~3s |
| Robot chest bar | ~2.5s |

---

## 7. Font Rules

- **Arabic text** (dialog, room labels, HUD, states, feed): `fontFamily:'Arial'`
- **Non-Arabic / code style** (SAVVY AI logo, G1, v2.0): `fontFamily:'Courier New'`

---

## Out of Scope
- No 3D changes
- No new rooms
- No click interactions
