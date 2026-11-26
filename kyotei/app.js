// 逃がし率ナビ: boat-race (kyotei) predictor that weights the lane-2 racer's "nigashi" rate
// (how often the lane-1 boat wins when this racer starts from lane 2).
(() => {
  "use strict";

  // ---- national-average baselines (used when a field is left blank) ----
  const AVG = { wr: 5.5, st: 0.16, motor: 33, nige: 55, nigashi: 55 };
  const BASE_WIN = { 2: 14, 3: 12, 4: 10, 5: 6, 6: 3 };          // course 1着率 %
  const BASE_PLACE = { 1: 85, 2: 60, 3: 55, 4: 50, 5: 40, 6: 25 }; // course 3連対率 %, used for 2-3着 strength

  const COMMON = [
    ["wr", "全国勝率", "6.50"],
    ["st", "平均ST", "0.15"],
    ["motor", "モーター2連率%", "35"],
  ];
  const EXTRA = {
    1: [["nige", "1コース1着率%", "55", true]],
    2: [["nigashi", "逃がし率%", "55", true], ["sashi", "2コース差し率%", "9"], ["makuri", "2コースまくり率%", "4"]],
  };
  for (let c = 3; c <= 6; c++) EXTRA[c] = [["cwin", `${c}コース1着率%`, String(BASE_WIN[c])]];

  const SAMPLE = {
    venue: "住之江", raceNo: 12,
    boats: [
      { name: "山田 一郎", wr: 7.42, st: 0.14, motor: 41, nige: 68 },
      { name: "佐藤 二郎", wr: 6.10, st: 0.16, motor: 33, nigashi: 71, sashi: 7, makuri: 3 },
      { name: "鈴木 三郎", wr: 6.35, st: 0.15, motor: 38, cwin: 13 },
      { name: "高橋 四郎", wr: 5.80, st: 0.14, motor: 30, cwin: 11 },
      { name: "田中 五郎", wr: 5.20, st: 0.17, motor: 29, cwin: 5 },
      { name: "伊藤 六郎", wr: 4.60, st: 0.18, motor: 26, cwin: 2 },
    ],
  };

  const STORE_DRAFT = "kyotei-draft-v1";
  const STORE_HIST = "kyotei-history-v1";
  const STORE_PREF = "kyotei-pref-v1";

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
  const pct = (p, d = 1) => (p * 100).toFixed(d) + "%";
  const numBox = n => `<span class="num sm n${n}">${n}</span>`;
  const comboHtml = arr => `<span class="combo">${arr.map(numBox).join('<span class="dash">-</span>')}</span>`;

  let pref = Object.assign({ weight: 60, points: 8 }, load(STORE_PREF, {}));

  // ---------------- input form ----------------
  function buildBoats() {
    const wrap = $("#boats");
    wrap.innerHTML = [1, 2, 3, 4, 5, 6].map(c => {
      const fields = [...(EXTRA[c] || []), ...COMMON].map(([k, lab, ph, key]) => `
        <label class="${key ? "key" : ""}">${lab}
          <input type="number" inputmode="decimal" step="any" data-c="${c}" data-k="${k}" placeholder="${ph}">
        </label>`).join("");
      return `<div class="card boat${c === 2 ? " focus" : ""}">
        <div class="boat-head"><span class="num n${c}">${c}</span>
          <input type="text" data-c="${c}" data-k="name" placeholder="選手名（任意）"></div>
        <div class="fields">${fields}</div></div>`;
    }).join("");
  }

  function readForm() {
    const boats = [1, 2, 3, 4, 5, 6].map(() => ({}));
    document.querySelectorAll("#boats input").forEach(inp => {
      const b = boats[+inp.dataset.c - 1], k = inp.dataset.k;
      if (k === "name") { b.name = inp.value.trim(); return; }
      const v = parseFloat(inp.value);
      if (Number.isFinite(v)) b[k] = v;
    });
    return { venue: $("#venue").value.trim(), raceNo: parseInt($("#raceNo").value, 10) || null, boats };
  }

  function fillForm(d) {
    $("#venue").value = d?.venue ?? "";
    $("#raceNo").value = d?.raceNo ?? "";
    document.querySelectorAll("#boats input").forEach(inp => {
      const v = d?.boats?.[+inp.dataset.c - 1]?.[inp.dataset.k];
      inp.value = v ?? "";
    });
  }

  // ---------------- model ----------------
  const val = (b, k) => (Number.isFinite(b[k]) ? b[k] : AVG[k]);
  // Today's condition: start timing and motor.
  const todayFactor = b => Math.exp(-10 * (val(b, "st") - AVG.st)) * (1 + (val(b, "motor") - AVG.motor) / 120);
  // Overall skill from national win rate.
  const skillFactor = b => Math.exp(0.28 * (val(b, "wr") - AVG.wr));
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

  function predict(race, weight) {
    const B = race.boats, b1 = B[0], b2 = B[1], b3 = B[2];
    const w = weight / 100;
    const notes = [];

    // 1) lane-1 win probability: blend 2号艇の逃がし率 and 1号艇のイン逃げ率
    const nige = Number.isFinite(b1.nige) ? b1.nige : clamp(AVG.nige + (val(b1, "wr") - AVG.wr) * 8, 25, 80);
    const nigashi = Number.isFinite(b2.nigashi) ? b2.nigashi : AVG.nigashi;
    const base = w * nigashi + (1 - w) * nige;

    const adjST = (mean([2, 3, 4].map(i => val(B[i - 1], "st"))) - val(b1, "st")) * 100 * 1.2;
    const adjMotor = (val(b1, "motor") - mean(B.slice(1).map(b => val(b, "motor")))) * 0.12;
    const adjWr = (val(b1, "wr") - mean(B.slice(1, 4).map(b => val(b, "wr")))) * 2;
    // 3号艇 starts faster than the 2号艇 "wall" → まくり risk for lane 1
    const wallGap = val(b2, "st") - val(b3, "st");
    const adjWall = wallGap > 0 ? -wallGap * 100 * 0.8 : 0;
    const p1 = clamp(base + adjST + adjMotor + adjWr + adjWall, 5, 92) / 100;

    // 2) split the non-escape share among lanes 2-6
    const attack = [0];
    for (let c = 2; c <= 6; c++) {
      const b = B[c - 1];
      let baseWin, hasCourse;
      if (c === 2) {
        hasCourse = Number.isFinite(b.sashi) || Number.isFinite(b.makuri);
        if (hasCourse) baseWin = (b.sashi || 0) + (b.makuri || 0);
        else if (Number.isFinite(b.nigashi)) { baseWin = (100 - b.nigashi) * 0.31; hasCourse = true; }
        else baseWin = BASE_WIN[2];
      } else {
        hasCourse = Number.isFinite(b.cwin);
        baseWin = hasCourse ? b.cwin : BASE_WIN[c];
      }
      // course-specific data already contains the racer's skill; otherwise use win rate
      attack.push(Math.max(0.3, baseWin) * todayFactor(b) * (hasCourse ? Math.sqrt(skillFactor(b)) : skillFactor(b)));
    }
    if (wallGap > 0) attack[2] *= 1 + wallGap * 100 * 0.08;
    const atkSum = attack.reduce((s, x) => s + x, 0);
    const win = [p1, ...attack.slice(1).map(a => (1 - p1) * a / atkSum)];

    // 3) strengths for 2nd/3rd place
    const place = B.map((b, i) => BASE_PLACE[i + 1] * todayFactor(b) * skillFactor(b));
    const S = place.reduce((s, x) => s + x, 0);

    const tri = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      if (j === i) continue;
      const pij = win[i] * place[j] / (S - place[i]);
      for (let k = 0; k < 6; k++) {
        if (k === i || k === j) continue;
        tri.push({ c: [i + 1, j + 1, k + 1], p: pij * place[k] / (S - place[i] - place[j]) });
      }
    }
    tri.sort((a, b) => b.p - a.p);

    const exa = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      if (j !== i) exa.push({ c: [i + 1, j + 1], p: win[i] * place[j] / (S - place[i]) });
    }
    exa.sort((a, b) => b.p - a.p);

    // 4) commentary
    if (nigashi >= 65) notes.push({ t: "good", s: `2号艇は逃がし率${nigashi}%と高く、1号艇を逃がしやすい` });
    else if (nigashi < 50) notes.push({ t: "bad", s: `2号艇は逃がし率${nigashi}%と低く、1号艇をつぶしにくるタイプ` });
    if (!Number.isFinite(b2.nigashi)) notes.push({ t: "warn", s: "2号艇の逃がし率が未入力（平均55%で計算）" });
    if (adjST >= 2) notes.push({ t: "good", s: "1号艇のSTが周りより速い" });
    if (adjST <= -2) notes.push({ t: "bad", s: "1号艇のSTが周りより遅く、出遅れに注意" });
    if (wallGap >= 0.02) notes.push({ t: "bad", s: "3号艇のSTが2号艇より速く、壁が薄い → 3号艇のまくり注意" });
    if (adjMotor >= 1) notes.push({ t: "good", s: "1号艇のモーターが上位" });
    if (adjMotor <= -1) notes.push({ t: "warn", s: "1号艇のモーターが見劣り" });
    const topAtk = win.slice(1).indexOf(Math.max(...win.slice(1))) + 2;
    if (p1 < 0.5) {
      let how = "";
      if (topAtk === 2) how = (b2.sashi || 0) >= (b2.makuri || 0) ? "差し" : "まくり";
      else if (topAtk === 4) how = "カドまくり";
      else how = "まくり・まくり差し";
      notes.push({ t: "warn", s: `1号艇が負けるなら${topAtk}号艇の${how}が本線` });
    }

    let verdict;
    if (p1 >= 0.65) verdict = { t: "good", s: "イン逃げ濃厚" };
    else if (p1 >= 0.5) verdict = { t: "good", s: "イン逃げ本命" };
    else if (p1 >= 0.38) verdict = { t: "warn", s: "イン不安・波乱含み" };
    else verdict = { t: "bad", s: "荒れ模様" };

    return { p1, nige, nigashi, win, tri, exa, notes, verdict, weight };
  }

  // ---------------- render prediction ----------------
  let last = null;

  function render() {
    const race = readForm();
    save(STORE_DRAFT, race);
    const r = predict(race, pref.weight);
    last = { race, r };

    const nigashiNote = r.nigashi >= 65 ? "高い：イン信頼度UP" : r.nigashi < 50 ? "低い：イン不信" : "標準的";
    const bars = r.win.map((p, i) => `
      <div class="bar-row">${`<span class="num n${i + 1}">${i + 1}</span>`}
        <div class="bar"><span style="width:${(p * 100).toFixed(1)}%"></span></div>
        <span class="pct">${pct(p)}</span></div>`).join("");

    const n = pref.points;
    const picks = r.tri.slice(0, n);
    const cum = picks.reduce((s, x) => s + x.p, 0);
    const rows = picks.map((x, i) => `<tr><td>${comboHtml(x.c)}</td><td>${pct(x.p)}</td><td>${(1 / x.p).toFixed(1)}倍</td></tr>`).join("");
    const pointBtns = [4, 6, 8, 10, 15, 20].map(k => `<button class="chip${k === n ? " is-on" : ""}" data-points="${k}">${k}点</button>`).join("");
    const exaRows = r.exa.slice(0, 5).map(x => `<tr><td>${comboHtml(x.c)}</td><td>${pct(x.p)}</td><td>${(1 / x.p).toFixed(1)}倍</td></tr>`).join("");

    $("#result").innerHTML = `
      <div class="card">
        <h2>予想結果</h2>
        <div class="summary">
          <div class="stat"><div class="lab">1号艇の1着確率</div><div class="val">${pct(r.p1, 0)}</div>
            <div class="sub">イン逃げ率 ${r.nige.toFixed(0)}% / 逃がし率 ${r.nigashi.toFixed(0)}%</div></div>
          <div class="stat"><div class="lab">本命 3連単</div><div class="val" style="font-size:20px">${comboHtml(r.tri[0].c)}</div>
            <div class="sub">${pct(r.tri[0].p)}</div></div>
        </div>
        <span class="tag ${r.verdict.t}">${r.verdict.s}</span>
      </div>

      <div class="card">
        <h2>2号艇の逃がし率チェック</h2>
        <div class="weight-head"><span>${esc(race.boats[1].name || "2号艇")}</span><strong>${r.nigashi.toFixed(0)}%</strong></div>
        <div class="gauge"><span class="fill" style="width:${clamp(r.nigashi, 0, 100)}%"></span><span class="avg" style="left:${AVG.nigashi}%"></span></div>
        <div class="gauge-scale"><span>0%</span><span>全国平均 ${AVG.nigashi}%</span><span>100%</span></div>
        <p class="hint">${nigashiNote}（重視度 ${pref.weight}% で計算）</p>
      </div>

      <div class="card">
        <h2>1着確率</h2>
        <div class="bars">${bars}</div>
        ${r.notes.length ? `<h3>展開メモ</h3><ul class="comment">${r.notes.map(x => `<li class="${x.t}">${esc(x.s)}</li>`).join("")}</ul>` : ""}
      </div>

      <div class="card">
        <h2>おすすめ買い目（3連単）</h2>
        <div class="points">${pointBtns}</div>
        <table class="picks"><thead><tr><th>買い目</th><th>確率</th><th>必要オッズ</th></tr></thead>
          <tbody>${rows}<tr class="total-row"><td>${n}点 合計</td><td>${pct(cum)}</td><td>${(n / cum).toFixed(1)}倍</td></tr></tbody></table>
        <p class="hint">必要オッズ：これより高いオッズなら期待値プラスの目安。合計行は${n}点を均等買いしたときの平均で必要なオッズ。</p>
      </div>

      <div class="card">
        <h2>2連単 上位</h2>
        <table class="picks"><thead><tr><th>買い目</th><th>確率</th><th>必要オッズ</th></tr></thead><tbody>${exaRows}</tbody></table>
      </div>

      <button id="btnSave" class="primary">この予想を履歴に保存</button>`;
  }

  // ---------------- history ----------------
  const parseResult = s => {
    const m = String(s).replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 0xfee0)).match(/[1-6]/g);
    return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
  };
  const band = n => (n >= 65 ? "高（65%〜）" : n >= 50 ? "中（50〜65%）" : "低（〜50%）");

  function renderHistory() {
    const hist = load(STORE_HIST, []);
    const done = hist.filter(h => h.result);
    const hits = done.filter(h => h.buys.includes(h.result.join("-")));
    const escaped = done.filter(h => h.result[0] === 1);
    const avgPredP1 = done.length ? mean(done.map(h => h.p1)) : 0;

    const bands = ["高（65%〜）", "中（50〜65%）", "低（〜50%）"].map(name => {
      const g = done.filter(h => band(h.nigashi) === name);
      const esc1 = g.filter(h => h.result[0] === 1).length;
      return `<tr><td>${name}</td><td>${g.length}</td><td>${g.length ? pct(esc1 / g.length, 0) : "—"}</td><td>${g.length ? pct(mean(g.map(h => h.p1)), 0) : "—"}</td></tr>`;
    }).join("");

    $("#stats").innerHTML = `
      <div class="card">
        <h2>成績</h2>
        <div class="summary">
          <div class="stat"><div class="lab">3連単 的中率</div><div class="val">${done.length ? pct(hits.length / done.length, 0) : "—"}</div>
            <div class="sub">${hits.length} / ${done.length} レース</div></div>
          <div class="stat"><div class="lab">1号艇が逃げた割合</div><div class="val">${done.length ? pct(escaped.length / done.length, 0) : "—"}</div>
            <div class="sub">予想の平均 ${done.length ? pct(avgPredP1, 0) : "—"}</div></div>
        </div>
        <h3>2号艇の逃がし率別：1号艇が本当に逃げたか</h3>
        <table class="band"><thead><tr><th>逃がし率</th><th>件数</th><th>実際</th><th>予想</th></tr></thead><tbody>${bands}</tbody></table>
        <p class="hint">「実際」が「予想」より高ければ重視度を上げる、低ければ下げる目安になります。</p>
      </div>`;

    $("#historyList").innerHTML = hist.length ? hist.map(h => {
      const res = h.result ? h.result.join("-") : "";
      const status = h.result ? (h.buys.includes(res) ? `<span class="hit">的中</span>` : `<span class="miss">不的中</span>`) : "";
      return `<div class="card hist-item" data-id="${h.id}">
        <div class="hist-top"><strong>${esc(h.label)}</strong><span class="when">${esc(h.date)}</span></div>
        <div>1号艇 ${pct(h.p1, 0)}・逃がし率 ${h.nigashi.toFixed(0)}%・重視度 ${h.weight}% ${status}</div>
        <div class="hist-buys">買い目(${h.buys.length}点)：${esc(h.buys.join(", "))}</div>
        <div class="hist-res"><input type="text" inputmode="numeric" placeholder="結果 例 1-2-3" value="${esc(res)}" data-res="${h.id}">
          <button class="ghost" data-setres="${h.id}">記録</button><button class="del" data-del="${h.id}" aria-label="削除">削除</button></div>
      </div>`;
    }).join("") : `<div class="empty">まだ保存した予想はありません</div>`;
  }

  function saveCurrent() {
    if (!last) return;
    const { race, r } = last;
    const hist = load(STORE_HIST, []);
    const now = new Date();
    hist.unshift({
      id: now.getTime().toString(36),
      date: `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      label: [race.venue, race.raceNo ? race.raceNo + "R" : ""].filter(Boolean).join(" ") || "レース",
      p1: r.p1, nigashi: r.nigashi, weight: r.weight,
      buys: r.tri.slice(0, pref.points).map(x => x.c.join("-")),
      result: null,
    });
    save(STORE_HIST, hist.slice(0, 300));
    const btn = $("#btnSave");
    btn.textContent = "保存しました（履歴タブで結果を入力）";
    btn.disabled = true;
  }

  // ---------------- events ----------------
  function switchTab(name) {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("is-on", t.dataset.tab === name));
    document.querySelectorAll(".pane").forEach(p => p.classList.toggle("is-on", p.id === "tab-" + name));
    if (name === "history") renderHistory();
    window.scrollTo(0, 0);
  }

  function init() {
    buildBoats();
    fillForm(load(STORE_DRAFT, null));
    $("#weight").value = pref.weight;
    $("#weightVal").textContent = pref.weight + "%";

    $("#tab-predict").addEventListener("input", e => {
      if (e.target.id === "weight") {
        pref.weight = +e.target.value;
        $("#weightVal").textContent = pref.weight + "%";
        save(STORE_PREF, pref);
      }
      if (e.target.closest("#boats, .race-meta, .weight-card")) render();
    });
    $("#tab-predict").addEventListener("click", e => {
      const pt = e.target.closest("[data-points]");
      if (pt) { pref.points = +pt.dataset.points; save(STORE_PREF, pref); render(); }
      if (e.target.id === "btnSave") saveCurrent();
      if (e.target.id === "btnSample") { fillForm(SAMPLE); render(); }
      if (e.target.id === "btnClear") { fillForm(null); render(); }
    });
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));

    $("#historyList").addEventListener("click", e => {
      const hist = load(STORE_HIST, []);
      const setId = e.target.dataset.setres, delId = e.target.dataset.del;
      if (setId) {
        const h = hist.find(x => x.id === setId);
        const res = parseResult($(`[data-res="${setId}"]`).value);
        if (!res) { alert("結果は「1-2-3」のように3艇入力してください"); return; }
        h.result = res;
      } else if (delId) {
        if (!confirm("この予想を削除しますか？")) return;
        hist.splice(hist.findIndex(x => x.id === delId), 1);
      } else return;
      save(STORE_HIST, hist);
      renderHistory();
    });

    render();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  init();
})();
