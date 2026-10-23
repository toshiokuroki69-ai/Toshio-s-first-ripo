// 16x16 pixel sprites. k outline, a body, b shade, w white, y yellow, r red, s skin.
window.GP_SPRITES = {
  blob: [
    "................",
    "................",
    "......kkkk......",
    "....kkaaaakk....",
    "...kaaaaaaaak...",
    "..kaaaaaaaaaak..",
    "..kaawwaaawwak..",
    ".kaaawkaaawkaak.",
    ".kaaawkaaawkaak.",
    ".kaaaaaaaaaaaak.",
    ".kbaaakkkkaaabk.",
    ".kbbaaaaaaaabbk.",
    "..kbbbbbbbbbbk..",
    "...kkkkkkkkkk...",
    "................",
    "................"
  ],
  bat: [
    "................",
    "................",
    "................",
    "kk.....kk.....kk",
    "kak...kaak...kak",
    "kaak.kaaaak.kaak",
    "kaaakayaayakaaak",
    "kaaaakaaaakaaaak",
    "kaaaaakwwkaaaaak",
    "kbaaaaakkaaaaabk",
    ".kbaak.kk.kaabk.",
    "..kbk..kk..kbk..",
    "...k...kk...k...",
    "................",
    "................",
    "................"
  ],
  ghost: [
    "................",
    "......kkkk......",
    "....kkaaaakk....",
    "...kaaaaaaaak...",
    "..kaaaaaaaaaak..",
    "..kaakkaakkaak..",
    ".kaaakkaakkaaak.",
    ".kaaaaaaaaaaaak.",
    ".kaaaaakkaaaaak.",
    ".kaaaaakkaaaaak.",
    ".kaaaaaaaaaaaak.",
    ".kbaaaaaaaaaabk.",
    ".kbbaabbaabbabk.",
    ".kbkbbkkbbkkbbk.",
    ".k.k..k..k..k.k.",
    "................"
  ],
  golem: [
    "....kkkkkkkk....",
    "...kaaaaaaaak...",
    "...kayyaayyak...",
    "...kaaaaaaaak...",
    "...kabkkkkbak...",
    ".kkkaaaaaaaakkk.",
    "kaakkaaaaaakkaak",
    "kaakaaabbaaakaak",
    "kaakaabbbbaakaak",
    "kbbkaaaaaaaakbbk",
    ".kk.kaaaaaak.kk.",
    "....kaakkaak....",
    "....kaak.kaak...",
    "...kbbak.kabbk..",
    "...kkkkk.kkkkk..",
    "................"
  ],
  wizard: [
    ".......kk.......",
    "......kaak......",
    ".....kaaaak.....",
    "....kaaaaaak....",
    "...kkkkkkkkkk...",
    ".....kssssk.....",
    ".....kykkyk.....",
    ".....kwwwwk.....",
    "....kaawwaak..y.",
    "...kaaawwaaak.k.",
    "..kaaaaaaaaaakk.",
    "..kaaaaaaaaaak.k",
    ".kaaaaaaaaaaaakk",
    ".kbbbbbbbbbbbbk.",
    ".kkkkkkkkkkkkkk.",
    "................"
  ],
  dragon: [
    "..........kk....",
    ".........kaak...",
    "........kaaaak..",
    "........kaykak..",
    "........kaaaaakk",
    "..k.....kaawwwk.",
    ".kak...kaaakkk..",
    "kaaak.kaaak.....",
    "kaaaakaaaak.....",
    ".kaaaaaaabk.....",
    "..kaaaaabbk.....",
    "...kaaabbbk.....",
    "...kaak.kaak....",
    "..kbbk..kbbk....",
    "..kkk...kkk.....",
    "................"
  ],
  demon: [
    "k..............k",
    "kk....kkkk....kk",
    ".kk.kaaaaaak.kk.",
    "..kkaaaaaaaakk..",
    "..kaarraarraak..",
    "..kaaaaaaaaaak..",
    "..kaawkwwkwaak..",
    "...kaaaaaaaak...",
    ".kkkkaaaaaakkkk.",
    "kaaaakbbbbkaaaak",
    "kaaakbbrrbbkaaak",
    "kaakkbbbbbbkkaak",
    ".kk.kbbbbbbk.kk.",
    "....kbbkkbbk....",
    "....kkk..kkk....",
    "................"
  ],
  hero: [
    "......kkkk......",
    ".....kyyyyk.....",
    ".....kssssk.....",
    ".....kskskk.....",
    "......kssk......",
    "....kkbbbbkk....",
    "...kbbbbbbbbk...",
    "..kskbbbbbbksk..",
    "..kskbbyybbkskw.",
    "...kkbbbbbbkkw..",
    "....kbbbbbbk.w..",
    "....kbbkkbbk....",
    "....kbbkkbbk....",
    "...kkkk..kkkk...",
    "................",
    "................"
  ]
};

window.GP_BASE_PAL = { k: "#0b0b14", a: "#888888", b: "#555555", w: "#ffffff", y: "#ffe04a", r: "#e8384f", s: "#f2c29b" };

// Draw a sprite onto a 16x16 canvas; CSS scales it up with pixelated rendering.
window.drawSprite = function (canvas, name, pal, silhouette) {
  const rows = window.GP_SPRITES[name];
  const colors = Object.assign({}, window.GP_BASE_PAL, pal || {});
  canvas.width = 16; canvas.height = 16;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 16, 16);
  rows.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      ctx.fillStyle = silhouette ? (ch === "k" ? "#2a2a3a" : "#14141f") : colors[ch];
      ctx.fillRect(x, y, 1, 1);
    }
  });
};
