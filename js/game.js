(() => {
  const AREAS = window.GP_DATA.areas;
  const MAIN = AREAS.filter(a => !a.optional && !a.secret);
  const SAVE_KEY = "grammar-quest-v1";
  const app = document.getElementById("app");

  // ---------- Save ----------
  const fresh = name => ({
    name, lv: 1, exp: 0, hp: 30, gold: 30,
    items: { herb: 3, glass: 1 }, beaten: {}, wrong: [],
    stats: { answered: 0, correct: 0, wins: 0 },
    opts: { sound: true, basic: true }
  });
  function readSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && s.name) { const f = fresh(s.name); return Object.assign(f, s, { items: Object.assign(f.items, s.items), opts: Object.assign(f.opts, s.opts), stats: Object.assign(f.stats, s.stats) }); }
    } catch (e) {}
    return null;
  }
  let G = readSave();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {} }

  // ---------- Rules ----------
  const maxHp = lv => 30 + (lv - 1) * 6;
  const power = lv => 6 + lv * 3;
  const needExp = lv => Math.round(12 * Math.pow(lv, 1.6));
  const tier = a => AREAS.indexOf(a);
  const foeStats = (a, boss) => {
    const k = tier(a);
    return boss
      ? { hp: 60 + 25 * k, atk: 6 + 3 * k, exp: 20 + 12 * k, gold: 20 + 10 * k }
      : { hp: 25 + 15 * k, atk: 4 + 2 * k, exp: 5 + 4 * k, gold: 4 + 3 * k };
  };
  const ITEMS = {
    herb: { name: "やくそう", price: 10, desc: "HPを30かいふく" },
    glass: { name: "見やぶりのメガネ", price: 20, desc: "問題のヒントを見る" }
  };
  function unlocked(a) {
    if (a.optional) return true;
    if (a.secret) return MAIN.every(m => G.beaten[m.id]);
    const i = MAIN.indexOf(a);
    return i === 0 || !!G.beaten[MAIN[i - 1].id];
  }

  // ---------- Helpers ----------
  const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const qid = (a, i) => a.id + ":" + i;
  function findQ(id) {
    const [aid, i] = id.split(":");
    const area = AREAS.find(a => a.id === aid);
    return area && area.qs[+i] ? { id, area, q: area.qs[+i] } : null;
  }
  function hpBar(hp, max) {
    const r = hp / max;
    return `<div class="bar ${r <= 0.25 ? "crit" : r <= 0.5 ? "warn" : ""}"><i style="width:${Math.max(0, r) * 100}%"></i></div>`;
  }
  function sprite(name, pal, silhouette) {
    const c = document.createElement("canvas");
    c.className = "sprite";
    window.drawSprite(c, name, pal, silhouette);
    return c;
  }
  function mountSprites(root) {
    root.querySelectorAll("canvas[data-sprite]").forEach(c => {
      c.className = "sprite " + c.className;
      window.drawSprite(c, c.dataset.sprite, c.dataset.pal ? JSON.parse(c.dataset.pal) : null, c.dataset.sil === "1");
    });
  }
  const spriteTag = (name, pal, sil, cls) => `<canvas data-sprite="${name}" data-pal='${esc(JSON.stringify(pal || {}))}' data-sil="${sil ? 1 : 0}" class="${cls || ""}"></canvas>`;
  function render(html) {
    app.innerHTML = html;
    mountSprites(app);
    window.scrollTo(0, 0);
  }

  // ---------- Sound ----------
  let ac = null;
  const SFX = {
    cursor: [[880, 0.03]], ok: [[660, 0.06], [990, 0.09]], hit: [[180, 0.05], [90, 0.09]],
    ng: [[220, 0.1], [140, 0.18]], win: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.22]],
    lvup: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.1], [1319, 0.3]], lose: [[392, 0.2], [330, 0.2], [262, 0.4]],
    heal: [[784, 0.06], [988, 0.06], [1175, 0.12]]
  };
  function sfx(name) {
    if (!G || !G.opts.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      let t = ac.currentTime;
      SFX[name].forEach(([f, d]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "square"; o.frequency.value = f;
        g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
        t += d;
      });
    } catch (e) {}
  }
  const canSpeak = "speechSynthesis" in window;
  function speak(text) {
    if (!canSpeak) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.9;
      const v = speechSynthesis.getVoices().find(v => v.lang === "en-US");
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- Message window ----------
  let typing = null;
  function type(el, text) {
    return new Promise(done => {
      if (typing) typing();
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { el.textContent = text; done(); return; }
      let i = 0;
      const id = setInterval(() => { i++; el.textContent = text.slice(0, i); if (i >= text.length) finish(); }, 24);
      function finish() { clearInterval(id); el.textContent = text; typing = null; done(); }
      typing = finish;
    });
  }

  // ---------- Title ----------
  function title(confirmReset) {
    const heroPal = { b: "#3a6ad0" };
    render(`<div class="title">
        <h1 class="logo">GRAMMAR QUEST<small>英文法の冒険</small></h1>
        ${spriteTag("hero", heroPal)}
      </div>
      <div class="win">
        ${confirmReset ? `<p>いまの冒険の書（${esc(G.name)} Lv${G.lv}）を消して、最初からはじめますか？</p>
          <div class="cmds"><button class="cmd" data-go="newgame">はい、消してはじめる</button><button class="cmd" data-go="title">いいえ</button></div>`
        : `<div class="cmds">
          ${G ? `<button class="cmd" data-go="map">冒険をつづける<small>${esc(G.name)} Lv${G.lv}</small></button>` : ""}
          <button class="cmd" data-go="${G ? "reset" : "newgame"}">はじめから</button>
          <button class="cmd" data-go="restore">ふっかつのじゅもん</button>
        </div>`}
      </div>
      <p class="footer">文法を学んで魔物をたおし、魔王城をめざせ</p>`);
  }
  function newGame() {
    render(`<div class="win">
        <h2>なまえを きめてください</h2>
        <form id="nameForm" class="row" style="flex-direction:column;align-items:stretch">
          <input class="name" id="heroName" maxlength="8" placeholder="ゆうしゃ" autocomplete="off">
          <button class="btn primary" type="submit">けってい</button>
        </form>
      </div>`);
    const f = document.getElementById("nameForm");
    f.addEventListener("submit", e => {
      e.preventDefault();
      G = fresh(document.getElementById("heroName").value.trim() || "ゆうしゃ");
      save(); sfx("win"); map();
    });
  }
  function restore(msg) {
    render(`<div class="win">
        <h2>ふっかつのじゅもん</h2>
        <p class="dim">別の端末で表示したじゅもんを貼りつけると、冒険の続きから遊べます。</p>
        <textarea class="answer" id="spell" placeholder="じゅもんを貼りつける"></textarea>
        ${msg ? `<p style="color:var(--ng)">${esc(msg)}</p>` : ""}
        <div class="row" style="margin-top:8px"><button class="btn primary" data-go="doRestore">ふっかつ</button><button class="btn" data-go="title">もどる</button></div>
      </div>`);
  }
  function doRestore() {
    const code = document.getElementById("spell").value.trim();
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (!s || !s.name) throw new Error();
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    } catch (e) { return restore("じゅもんが ちがいます。最初から最後まで貼りつけたか確認してください。"); }
    G = readSave() || G;
    if (!G) return restore("この端末では保存できないため、ふっかつできませんでした。");
    sfx("win"); map();
  }

  // ---------- HUD / Map ----------
  function hud() {
    const mhp = maxHp(G.lv);
    return `<div class="win hud">
      <span class="nm">${esc(G.name)}</span><span>Lv ${G.lv}</span>
      <div class="stats-line"><span>HP ${G.hp}/${mhp}</span><span class="gold">${G.gold} G</span></div>
      <span class="dim">つぎ ${needExp(G.lv) - G.exp}</span>
      <div style="grid-column:1/-1">${hpBar(G.hp, mhp)}</div>
    </div>`;
  }
  function tabs(cur) {
    const t = (id, label) => `<button class="btn" data-go="${id}" ${cur === id ? 'aria-current="page"' : ""}>${label}</button>`;
    return `<nav class="tabs">${t("map", "マップ")}${t("town", "町")}${t("status", "つよさ")}</nav>`;
  }
  function map() {
    const list = AREAS.filter(a => (a.optional ? G.opts.basic : true));
    const frontier = MAIN.find(a => unlocked(a) && !G.beaten[a.id]) || AREAS.find(a => a.secret);
    const nodes = list.map(a => {
      const open = unlocked(a);
      if (a.secret && !open) {
        return `<div class="win node locked">${spriteTag(a.boss.sprite, a.boss.pal, true)}<div><div class="nm">？？？</div><div class="dim">すべてのボスをたおすと…</div></div><span></span></div>`;
      }
      const tag = G.beaten[a.id] ? '<span class="tag clear">CLEAR</span>' : a.optional ? '<span class="tag">基礎・任意</span>' : open ? `<span class="tag">推奨Lv${a.lv}</span>` : '<span class="tag">未開放</span>';
      const here = a === frontier && open ? spriteTag("hero", { b: "#3a6ad0" }, false, "here") : "";
      return `<button class="win node ${open ? "" : "locked"}" ${open ? `data-area="${a.id}"` : "disabled"}>
        ${here}${spriteTag(a.boss.sprite, a.boss.pal, !open)}
        <div><div class="nm">${a.name}</div><div class="dim">${a.grammar}</div></div>${tag}
      </button>`;
    }).join("");
    render(`${hud()}<div class="map">${nodes}</div>${tabs("map")}`);
  }

  function area(id) {
    const a = AREAS.find(x => x.id === id);
    const n = a.qs.length;
    const types = [...new Set(a.qs.map(q => ({ mc: "4択", order: "並べ替え", write: "英作文" }[q.t])))].join("・");
    render(`${hud()}
      <div class="win">
        <h3>${a.grammar}</h3>
        <h2>${a.name}</h2>
        <p class="dim" style="margin:0">${n}問（${types}）· 推奨Lv${a.lv}${G.beaten[a.id] ? " · ボス撃破ずみ" : ""}</p>
      </div>
      <div class="win cmds">
        <button class="cmd" data-go="lesson" data-id="${a.id}">ちしきの書を読む<small>この地の文法をおさらい</small></button>
        <button class="cmd" data-go="fight" data-id="${a.id}">まものと たたかう<small>${a.enemy.name}</small></button>
        <button class="cmd" data-go="boss" data-id="${a.id}">ボスに いどむ<small>${a.boss.name}${G.beaten[a.id] ? "（再戦）" : ""}</small></button>
        <button class="cmd" data-go="map">マップにもどる</button>
      </div>`);
  }

  function lesson(id) {
    const a = AREAS.find(x => x.id === id);
    const body = a.lessons.map(l => `<div class="win"><h2>${l.title}</h2><ul class="points">${l.points.map(p => `<li>${p[0]}<span class="ex">${p[1]}</span>${p[2] ? `<span class="ja">${esc(p[2])}</span>` : ""}</li>`).join("")}</ul></div>`).join("");
    render(`<div class="win"><h3>ちしきの書</h3><h2>${a.name}</h2></div>${body}
      <div class="win cmds"><button class="cmd" data-go="fight" data-id="${a.id}">まものと たたかう</button><button class="cmd" data-area="${a.id}">もどる</button></div>`);
  }

  // ---------- Town ----------
  function town(note) {
    const inn = 5 + G.lv * 2;
    render(`${hud()}
      <div class="win"><h3>はじまりの町</h3><h2>${note ? esc(note) : "なにをしますか？"}</h2></div>
      <div class="win cmds">
        <button class="cmd" data-go="inn">宿屋にとまる<small>${inn} G · HPがぜんかいする</small></button>
        <button class="cmd" data-go="shop">どうぐ屋<small>やくそう・見やぶりのメガネ</small></button>
        <button class="cmd" data-go="dojo" ${G.wrong.length ? "" : "disabled"}>修行場（にがて復習）<small>${G.wrong.length ? `まちがえた問題 ${G.wrong.length}問` : "まちがえた問題がここに集まります"}</small></button>
        <button class="cmd" data-go="spell">ふっかつのじゅもん<small>冒険の書を別の端末に引きつぐ</small></button>
        <button class="cmd" data-go="settings">せってい</button>
      </div>${tabs("town")}`);
  }
  function inn() {
    const cost = 5 + G.lv * 2;
    if (G.hp >= maxHp(G.lv)) return town("HPは まんたんです");
    if (G.gold >= cost) { G.gold -= cost; G.hp = maxHp(G.lv); save(); sfx("heal"); return town("ゆうべは おたのしみでしたね。HPが ぜんかいした！"); }
    G.hp = maxHp(G.lv); save(); sfx("heal");
    town("お金が たりない？ こんかいは つけにしておくよ。HPが ぜんかいした！");
  }
  function shop(note) {
    const rows = Object.entries(ITEMS).map(([k, it]) => `<button class="cmd" data-go="buy" data-id="${k}" ${G.gold < it.price ? "disabled" : ""}>${it.name}　${it.price} G<small>${it.desc} · もちもの ${G.items[k] || 0}</small></button>`).join("");
    render(`${hud()}<div class="win"><h3>どうぐ屋</h3><h2>${note ? esc(note) : "いらっしゃい！"}</h2></div>
      <div class="win cmds">${rows}<button class="cmd" data-go="town">町にもどる</button></div>`);
  }
  function buy(k) {
    const it = ITEMS[k];
    if (G.gold < it.price) return shop("お金が たりないよ");
    G.gold -= it.price; G.items[k] = (G.items[k] || 0) + 1; save(); sfx("cursor");
    shop(`${it.name}を かった！`);
  }
  function spell(copied) {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(G))));
    render(`${hud()}<div class="win">
        <h2>ふっかつのじゅもん</h2>
        <p class="dim">ブラウザのデータが消えたときや、別の端末で続けるときに使います。メモアプリなどに保存してください。</p>
        <div class="code" id="code">${code}</div>
        <div class="row" style="margin-top:8px"><button class="btn primary" data-go="copy">${copied ? "コピーしました" : "コピーする"}</button><button class="btn" data-go="town">もどる</button></div>
      </div>`);
  }
  function settings() {
    const tog = (k, label, sub) => `<button class="cmd" data-go="toggle" data-id="${k}">${label}：${G.opts[k] ? "ON" : "OFF"}<small>${sub}</small></button>`;
    render(`${hud()}<div class="win"><h2>せってい</h2></div>
      <div class="win cmds">
        ${tog("sound", "効果音", "戦闘やレベルアップの音")}
        ${tog("basic", "見習いの村（中学基礎）", "マップに中学レベルの復習エリアを表示する")}
        <button class="cmd" data-go="title">タイトルへ</button>
        <button class="cmd" data-go="town">町にもどる</button>
      </div>`);
  }
  function status() {
    const acc = G.stats.answered ? Math.round(G.stats.correct / G.stats.answered * 100) : 0;
    const beaten = MAIN.filter(a => G.beaten[a.id]).length;
    render(`${hud()}<div class="win">
        <h2>${esc(G.name)}</h2>
        <div class="stats-line" style="flex-direction:column;gap:2px">
          <span>レベル　${G.lv}</span>
          <span>さいだいHP　${maxHp(G.lv)}</span>
          <span>こうげき力　${power(G.lv)}</span>
          <span>けいけんち　${G.exp} / ${needExp(G.lv)}</span>
          <span class="gold">ゴールド　${G.gold}</span>
        </div>
        <div class="bar exp" style="margin-top:6px"><i style="width:${G.exp / needExp(G.lv) * 100}%"></i></div>
      </div>
      <div class="win">
        <h3>ぼうけんの きろく</h3>
        <div class="stats-line" style="flex-direction:column;gap:2px">
          <span>といた問題　${G.stats.answered}</span>
          <span>正答率　${acc}%</span>
          <span>たおした まもの　${G.stats.wins}</span>
          <span>たおした ボス　${beaten} / ${MAIN.length}</span>
          <span>にがて問題　${G.wrong.length}</span>
        </div>
      </div>
      <div class="win"><h3>もちもの</h3>${Object.entries(ITEMS).map(([k, it]) => `<div>${it.name}　×${G.items[k] || 0}</div>`).join("")}</div>
      ${tabs("status")}`);
  }

  // ---------- Battle ----------
  let B = null;
  function startBattle(kind, areaId, ids) {
    let foe, pool, a = AREAS.find(x => x.id === areaId);
    if (kind === "dojo") {
      pool = (ids || shuffle(G.wrong).slice(0, 10)).map(findQ).filter(Boolean);
      foe = { name: "修行のカカシ", sprite: "golem", pal: { a: "#c8a85a", b: "#8a7036" }, hp: pool.length, maxHp: pool.length, atk: 0, exp: 0, gold: 0 };
    } else {
      const base = kind === "boss" ? a.boss : a.enemy;
      const st = foeStats(a, kind === "boss");
      pool = a.qs.map((q, i) => ({ id: qid(a, i), area: a, q }));
      foe = Object.assign({}, base, st, { maxHp: st.hp });
    }
    B = { kind, area: a, foe, pool, deck: shuffle(pool), cur: null, done: false, misses: [] };
    render(`<div class="battle" id="battle">
        <div class="win hud" id="bhud"></div>
        <div class="arena ${kind === "boss" ? "boss" : ""}" id="arena">
          <div class="foe-info"><span>${esc(foe.name)}</span><span id="foeBar"></span></div>
          ${spriteTag(foe.sprite, foe.pal, false, "")}
        </div>
        <div class="win msg" id="msg"></div>
        <div class="win" id="cmd"></div>
      </div>`);
    B.canvas = app.querySelector("#arena canvas");
    drawBattleHud();
    const opening = kind === "boss" ? `${foe.name}が たちはだかった！` : kind === "dojo" ? `${foe.name}が あらわれた！\nにがてな問題で しゅぎょうしよう。` : `${foe.name}が あらわれた！`;
    say(opening).then(nextTurn);
  }
  function drawBattleHud() {
    const mhp = maxHp(G.lv);
    document.getElementById("bhud").innerHTML = `<span class="nm">${esc(G.name)}</span><span>Lv ${G.lv}</span>
      <span>HP ${Math.max(0, G.hp)}/${mhp}</span><span></span><div style="grid-column:1/-1">${hpBar(G.hp, mhp)}</div>`;
    document.getElementById("foeBar").innerHTML = B.kind === "dojo" ? `のこり ${B.foe.hp}` : hpBar(B.foe.hp, B.foe.maxHp);
  }
  const say = text => type(document.getElementById("msg"), text);
  const cmdEl = () => document.getElementById("cmd");

  function nextTurn() {
    if (B.kind === "dojo" && !B.deck.length) return victory();
    if (!B.deck.length) B.deck = shuffle(B.pool);
    setQuestion(B.deck.pop(), false);
  }
  function setQuestion(item, retry) {
    B.cur = { item, retry, order: shuffle(item.q.c ? item.q.c.map((_, i) => i) : []), hidden: [], placed: [], tiles: item.q.t === "order" ? shuffle([...item.q.w, ...(item.q.x || [])]) : [], hint: false };
    showQuestion();
  }
  function retry() {
    B.done = false;
    setQuestion(B.cur.item, true);
    say("もう一度 ちょうせん！\n解説を思い出して 自分の力で答えよう。").then(() => setTimeout(showQuestion, 500));
  }

  function promptText(q) {
    if (q.t === "mc") { const [x, y] = q.q.split("___"); return `<div class="question">${esc(x)}<span class="blank">&nbsp;</span>${esc(y || "")}</div>`; }
    return `<div class="question">${esc(q.ja)}</div><div class="dim">${q.t === "order" ? "語を正しい順に並べよ" : "英語で書け" + (q.hint ? `（ヒント：${esc(q.hint)}）` : "")}</div>`;
  }
  function tools() {
    return `<div class="tools"><button class="btn" data-go="bItems">どうぐ</button><button class="btn" data-go="bRun">にげる</button></div>`;
  }
  function showQuestion() {
    const { item, order, hidden } = B.cur, q = item.q;
    if (typing) typing();
    const msg = document.getElementById("msg");
    msg.innerHTML = promptText(q);
    let body = "";
    if (q.t === "mc") {
      const keys = ["A", "B", "C", "D"];
      body = `<div class="cmds">${order.map((k, pos) => `<button class="cmd ${hidden.includes(k) ? "hidden-choice" : ""}" data-go="pick" data-id="${k}">${keys[pos]}. ${esc(q.c[k])}</button>`).join("")}</div>`;
    } else if (q.t === "order") {
      body = `<div class="tiles slot" id="slot"></div><div class="tiles" id="pool"></div>
        <div class="row" style="margin-top:10px"><button class="btn" data-go="undo">ひとつもどす</button><button class="btn primary" data-go="submitOrder">けってい</button></div>`;
    } else {
      body = `<textarea class="answer" id="writeBox" autocapitalize="sentences" autocomplete="off" spellcheck="false" placeholder="ここに英文を入力">${esc(B.cur.draft || "")}</textarea>
        ${B.cur.hint ? `<p class="dim" style="margin:6px 0 0">書き出し：${esc(q.ans[0].split(" ").slice(0, 3).join(" "))} …</p>` : ""}
        <div class="row" style="margin-top:8px"><button class="btn primary" data-go="submitWrite">こうげき（けってい）</button></div>`;
    }
    cmdEl().innerHTML = body + tools();
    if (q.t === "order") drawTiles();
  }
  function drawTiles() {
    const { tiles, placed } = B.cur;
    document.getElementById("slot").innerHTML = placed.map((ti, pos) => `<button class="tile" data-go="unplace" data-id="${pos}">${esc(tiles[ti])}</button>`).join("");
    document.getElementById("pool").innerHTML = tiles.map((w, i) => `<button class="tile ${placed.includes(i) ? "used" : ""}" data-go="place" data-id="${i}">${esc(w)}</button>`).join("");
  }

  function norm(s) {
    return (" " + s.toLowerCase().replace(/[’‘`]/g, "'") + " ")
      .replace(/won't/g, "will not").replace(/can't/g, "cannot").replace(/n't/g, " not")
      .replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'d\b/g, " would")
      .replace(/\bcan not\b/g, "cannot").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function modelAnswer(q) {
    if (q.t === "mc") { const [x, y] = q.q.split("___"); return { html: `${esc(x)}<span class="blank filled">${esc(q.c[q.a])}</span>${esc(y || "")}`, text: q.q.replace("___", q.c[q.a].replace("（なし）", "")).replace(/\s+/g, " ").trim() }; }
    if (q.t === "order") { const t = cap(q.w.join(" ")) + (q.p || "."); return { html: esc(t), text: t }; }
    return { html: esc(q.ans[0]), text: q.ans[0] };
  }

  function answer(correct, yours) {
    if (B.done) return;
    B.done = true;
    const { item, retry } = B.cur;
    if (retry) return answerRetry(correct, yours);
    G.stats.answered++;
    if (correct) { G.stats.correct++; G.wrong = G.wrong.filter(x => x !== item.id); }
    else {
      if (!G.wrong.includes(item.id)) G.wrong.push(item.id);
      B.misses.push({ item, yours });
    }

    let line;
    if (correct) {
      const crit = Math.random() < 0.12;
      const dmg = B.kind === "dojo" ? 1 : Math.round(power(G.lv) * (crit ? 2 : 1) * (0.85 + Math.random() * 0.3));
      B.foe.hp = Math.max(0, B.foe.hp - dmg);
      sfx("ok"); setTimeout(() => sfx("hit"), 150);
      B.canvas.classList.remove("hit"); void B.canvas.offsetWidth; B.canvas.classList.add("hit");
      popDamage(B.kind === "dojo" ? "HIT" : dmg, crit);
      line = `せいかい！ ${G.name}の こうげき！${crit ? "\nかいしんの いちげき！" : ""}\n${B.foe.name}に ${B.kind === "dojo" ? "1かい" : dmg + "の"} ダメージ！`;
    } else {
      sfx("ng");
      if (B.kind === "dojo") { B.foe.hp = Math.max(0, B.foe.hp - 1); line = `ざんねん…\nこの問題は また修行しよう。`; }
      else {
        const dmg = Math.max(1, Math.round(B.foe.atk * (0.8 + Math.random() * 0.4)));
        G.hp = Math.max(0, G.hp - dmg);
        const el = document.getElementById("battle"); el.classList.remove("hurt"); void el.offsetWidth; el.classList.add("hurt");
        line = `ざんねん！ ${B.foe.name}の こうげき！\n${G.name}は ${dmg}の ダメージを うけた！`;
      }
    }
    save();
    drawBattleHud();
    say(line);
    showFeedback(correct, yours);
  }
  // A retry after seeing the explanation: no penalty, half damage, and the question stays in the review list.
  function answerRetry(correct, yours) {
    let line;
    if (correct) {
      sfx("ok");
      if (B.kind !== "dojo") {
        const dmg = Math.max(1, Math.round(power(G.lv) * 0.5));
        B.foe.hp = Math.max(0, B.foe.hp - dmg);
        B.canvas.classList.remove("hit"); void B.canvas.offsetWidth; B.canvas.classList.add("hit");
        popDamage(dmg, false);
        line = `リベンジ せいこう！\n${B.foe.name}に ${dmg}の ダメージ！\n（この問題は 修行場に のこります）`;
      } else line = "リベンジ せいこう！\n（つぎの修行で もう一度 たしかめよう）";
    } else {
      sfx("ng");
      line = "まだ おしい…\n解説と正解を もう一度 たしかめよう。";
    }
    drawBattleHud();
    say(line);
    showFeedback(correct, yours);
  }
  function lessonDetails(area) {
    return `<details class="lesson-peek"><summary>ちしきの書をひらく（${esc(area.name)}）</summary>
      ${area.lessons.map(l => `<ul class="points">${l.points.map(p => `<li>${p[0]}<span class="ex">${p[1]}</span>${p[2] ? `<span class="ja">${esc(p[2])}</span>` : ""}</li>`).join("")}</ul>`).join("")}
    </details>`;
  }
  function showFeedback(correct, yours) {
    const { item } = B.cur;
    const m = modelAnswer(item.q);
    cmdEl().innerHTML = `<div class="feedback">
        <div class="verdict ${correct ? "ok" : "ng"}">${correct ? "○ せいかい" : "× ふせいかい"}</div>
        ${!correct && yours ? `<div class="yours">あなたの答え：${esc(yours)}</div>` : ""}
        <div>${correct ? "" : "せいかい："}<span class="ans">${m.html}</span></div>
        <div class="explain"><span class="dim">かいせつ</span>${esc(item.q.e)}</div>
        ${item.q.t === "write" && item.q.ans.length > 1 ? `<div class="dim">ほかの正解例：${item.q.ans.slice(1).map(esc).join(" / ")}</div>` : ""}
        ${correct ? "" : lessonDetails(item.area)}
        <div class="row split">${canSpeak ? `<button class="btn" data-go="speak">▶ 英文を聞く</button>` : "<span></span>"}
          <span class="row">${correct ? "" : `<button class="btn" data-go="retry">もう一度ちょうせん</button>`}<button class="btn primary" data-go="after">つぎへ</button></span></div>
      </div>`;
    B.lastText = m.text;
  }
  // End-of-battle review of every question missed in this battle.
  function reviewHtml() {
    const seen = new Set();
    const list = B.misses.filter(x => !seen.has(x.item.id) && seen.add(x.item.id));
    if (!list.length) return "";
    return `<div class="review"><h3>ふりかえり：まちがえた問題 ${list.length}問</h3>
      ${list.map(({ item, yours }) => `<div class="review-item">
        <div class="ans">${modelAnswer(item.q).html}</div>
        ${item.q.t !== "mc" ? `<div class="ja">${esc(item.q.ja)}</div>` : ""}
        ${yours ? `<div class="yours">あなたの答え：${esc(yours)}</div>` : ""}
        <div>${esc(item.q.e)}</div>
      </div>`).join("")}
      <button class="btn primary" data-go="redo" style="width:100%;margin-top:6px">この${list.length}問に再挑戦する</button>
    </div>`;
  }
  function popDamage(n, crit) {
    const d = document.createElement("div");
    d.className = "dmg" + (crit ? " crit" : "");
    d.textContent = n;
    document.getElementById("arena").appendChild(d);
    setTimeout(() => d.remove(), 900);
  }
  function after() {
    B.done = false;
    if (B.foe.hp <= 0) return victory();
    if (G.hp <= 0) return defeat();
    nextTurn();
  }

  async function victory() {
    B.canvas.classList.add("dead");
    sfx("win");
    const f = B.foe, lines = [];
    if (B.kind === "dojo") {
      const fixed = B.pool.filter(it => !G.wrong.includes(it.id)).length;
      const exp = fixed * 3;
      lines.push(`しゅぎょう しゅうりょう！\n${fixed}問を こくふくした。${exp ? `\n${exp}の けいけんちを かくとく！` : ""}`);
      gainExp(exp, lines);
    } else {
      G.stats.wins++;
      G.gold += f.gold;
      lines.push(`${f.name}を たおした！\n${f.exp}の けいけんちと ${f.gold}ゴールドを てにいれた！`);
      gainExp(f.exp, lines);
      if (B.kind === "boss" && !G.beaten[B.area.id]) {
        G.beaten[B.area.id] = true;
        const i = MAIN.indexOf(B.area);
        if (B.area.secret) lines.push("英作の魔王を たおした！\n世界に 文法の光が もどった…\nおめでとう！ ゲームクリア！");
        else if (i >= 0 && MAIN[i + 1]) lines.push(`${MAIN[i + 1].name}への 道が ひらけた！`);
        if (!B.area.secret && MAIN.every(m => G.beaten[m.id])) lines.push("どこかで 魔王城の とびらが ひらいた…");
      }
    }
    save();
    drawBattleHud();
    cmdEl().innerHTML = "";
    for (const l of lines) { await say(l); await wait(700); }
    cmdEl().innerHTML = reviewHtml() + `<div class="cmds"><button class="cmd" data-go="${B.area ? "areaBack" : "town"}">${B.area ? "つづける" : "町にもどる"}</button><button class="cmd" data-go="map">マップへ</button></div>`;
  }
  function gainExp(n, lines) {
    G.exp += n;
    while (G.exp >= needExp(G.lv)) {
      G.exp -= needExp(G.lv); G.lv++;
      G.hp = Math.min(maxHp(G.lv), G.hp + 6);
      lines.push(`${G.name}の レベルが ${G.lv}に あがった！\nさいだいHPと こうげき力が あがった！`);
      setTimeout(() => sfx("lvup"), 400);
    }
  }
  async function defeat() {
    sfx("lose");
    const lost = Math.floor(G.gold / 2);
    G.gold -= lost; G.hp = maxHp(G.lv); save();
    cmdEl().innerHTML = "";
    await say(`${G.name}は ちからつきた…`);
    await wait(700);
    await say(`教会で 目をさました。\nもちきんの半分（${lost}G）を うしなった。\nちしきの書で ふくしゅうしてから 再挑戦しよう。`);
    cmdEl().innerHTML = reviewHtml() + `<div class="cmds"><button class="cmd" data-go="lesson" data-id="${B.area.id}">ちしきの書を読む</button><button class="cmd" data-go="map">マップへ</button></div>`;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function battleItems() {
    const q = B.cur.item.q;
    const rows = Object.entries(ITEMS).map(([k, it]) => `<button class="cmd" data-go="use" data-id="${k}" ${(G.items[k] || 0) < 1 || (k === "glass" && B.cur.hint) ? "disabled" : ""}>${it.name} ×${G.items[k] || 0}<small>${it.desc}</small></button>`).join("");
    if (q.t === "write") B.cur.draft = (document.getElementById("writeBox") || {}).value || B.cur.draft;
    cmdEl().innerHTML = `<div class="cmds">${rows}<button class="cmd" data-go="bBack">もどる</button></div>`;
  }
  function useItem(k) {
    G.items[k]--;
    const q = B.cur.item.q;
    if (k === "herb") {
      const before = G.hp; G.hp = Math.min(maxHp(G.lv), G.hp + 30);
      sfx("heal"); drawBattleHud(); save();
      say(`${G.name}は やくそうを つかった！\nHPが ${G.hp - before} かいふくした！`).then(() => setTimeout(showQuestion, 600));
      return;
    }
    B.cur.hint = true;
    if (q.t === "mc") B.cur.hidden = shuffle(q.c.map((_, i) => i).filter(i => i !== q.a)).slice(0, 2);
    if (q.t === "order") { const first = B.cur.tiles.findIndex(w => w.toLowerCase() === q.w[0].toLowerCase()); B.cur.placed = [first]; }
    save(); sfx("cursor");
    showQuestion();
  }
  function run() {
    if (B.kind === "boss") return say("ボスからは にげられない！\n（町へは 戦いのあとで もどれます）").then(() => setTimeout(showQuestion, 900));
    say(`${G.name}は にげだした！`).then(() => setTimeout(() => (B.area ? area(B.area.id) : town()), 600));
  }

  // ---------- Events ----------
  app.addEventListener("click", e => {
    if (e.target.closest("#msg") && typing) { typing(); return; }
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.area) { sfx("cursor"); return area(b.dataset.area); }
    const go = b.dataset.go, id = b.dataset.id;
    if (!go) return;
    if (!["pick", "submitOrder", "submitWrite"].includes(go)) sfx("cursor");
    switch (go) {
      case "title": return title();
      case "reset": return title(true);
      case "newgame": return newGame();
      case "restore": return restore();
      case "doRestore": return doRestore();
      case "map": return map();
      case "town": return town();
      case "status": return status();
      case "lesson": return lesson(id);
      case "fight": return startBattle("normal", id);
      case "boss": return startBattle("boss", id);
      case "dojo": return startBattle("dojo");
      case "areaBack": return area(B.area.id);
      case "inn": return inn();
      case "shop": return shop();
      case "buy": return buy(id);
      case "spell": return spell();
      case "copy": {
        const code = document.getElementById("code").textContent;
        const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById("code")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
        try { navigator.clipboard.writeText(code).then(() => spell(true), sel); } catch (err) { sel(); }
        return;
      }
      case "settings": return settings();
      case "toggle": G.opts[id] = !G.opts[id]; save(); return settings();
      case "pick": { const k = +id; const q = B.cur.item.q; return answer(k === q.a, q.c[k]); }
      case "place": if (!B.cur.placed.includes(+id)) B.cur.placed.push(+id); return drawTiles();
      case "unplace": B.cur.placed.splice(+id, 1); return drawTiles();
      case "undo": B.cur.placed.pop(); return drawTiles();
      case "submitOrder": {
        const q = B.cur.item.q;
        if (!B.cur.placed.length) return;
        const got = B.cur.placed.map(i => B.cur.tiles[i].toLowerCase()).join(" ");
        const ok = [q.w, ...(q.alt || [])].some(w => w.map(x => x.toLowerCase()).join(" ") === got);
        return answer(ok, cap(B.cur.placed.map(i => B.cur.tiles[i]).join(" ")));
      }
      case "submitWrite": {
        const q = B.cur.item.q, text = document.getElementById("writeBox").value.trim();
        if (!text) return;
        const n = " " + norm(text) + " ";
        const ok = q.ans.some(a => norm(a) === norm(text)) || q.need.every(group => group.some(p => n.includes(" " + norm(p) + " ")));
        return answer(ok, text);
      }
      case "speak": return speak(B.lastText);
      case "after": return after();
      case "retry": return retry();
      case "redo": return startBattle("dojo", null, [...new Set(B.misses.map(x => x.item.id))]);
      case "bItems": return battleItems();
      case "bBack": return showQuestion();
      case "use": return useItem(id);
      case "bRun": return run();
    }
  });

  if ("serviceWorker" in navigator && location.protocol === "https:" && !/claude/.test(location.hostname)) {
    try { navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {}
  }

  title();
})();
