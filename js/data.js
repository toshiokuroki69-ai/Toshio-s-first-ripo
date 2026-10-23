// Game content. Question types:
//   mc    : q has "___" as the blank, c = choices, a = index of the correct choice
//   order : ja = Japanese prompt, w = tiles in the correct order, x = distractor tiles,
//           alt = other accepted orders, p = end punctuation (default ".")
//   write : ja = Japanese prompt, ans = model answers, need = groups of key phrases;
//           an answer is correct when it contains one phrase from every group
// e = explanation shown after answering.
window.GP_DATA = {
  areas: [
    {
      id: "village", name: "見習いの村", grammar: "中学基礎（冠詞・前置詞・時制の基本）", lv: 1, optional: true,
      enemy: { name: "ミドリブロブ", sprite: "blob", pal: { a: "#6cc35a", b: "#3e8a35" } },
      boss: { name: "コウモリ番長", sprite: "bat", pal: { a: "#9a6a3a", b: "#6a4422" } },
      lessons: [
        { title: "冠詞", points: [
          ["初めて話題に出る数えられる名詞の単数には <b>a / an</b>。母音の<b>音</b>で始まる語は an。", "I saw <em>an</em> elephant. / <em>an</em> hour / <em>a</em> university", "hour は h を発音しない、university は「ユ」で始まる"],
          ["話し手と聞き手の間で「どれか分かる」ものには <b>the</b>。一度出たもの・唯一のもの。", "I bought a car. <em>The</em> car is red.", "買った車は赤い"],
          ["楽器を演奏する時は the、交通手段の by や食事・スポーツには冠詞なし。", "play <em>the</em> piano / by bus / have lunch / play tennis", ""]
        ]},
        { title: "前置詞", points: [
          ["時の at / on / in：<b>at</b> は時刻、<b>on</b> は日・曜日、<b>in</b> は月・年・季節。", "<em>at</em> 7:00 / <em>on</em> Monday / <em>in</em> 1995", ""],
          ["<b>by</b> は期限（～までに）、<b>until</b> は継続（～までずっと）。", "Finish it <em>by</em> Friday. / Stay <em>until</em> Friday.", "金曜までに終える／金曜までずっといる"],
          ["<b>in</b> + 時間 = 今から～後。", "I'll be back <em>in</em> ten minutes.", "10分後に戻る"]
        ]},
        { title: "時制の基本", points: [
          ["主語が3人称単数（he, she, it など）の現在形は動詞に <b>-s / -es</b>。", "My brother <em>goes</em> to school.", ""],
          ["今まさにしていることは現在進行形 <b>be + ～ing</b>。", "She <em>is watching</em> TV now.", ""],
          ["「～がある」は <b>There is / are</b>。後ろの名詞の数で決まる。", "<em>There is</em> a book on the desk.", ""]
        ]}
      ],
      qs: [
        { t: "mc", q: "I saw ___ elephant at the zoo.", c: ["a", "an", "the", "（なし）"], a: 1, e: "elephant は母音の音で始まり、初めて話題に出るので an。" },
        { t: "mc", q: "___ sun rises in the east.", c: ["A", "An", "The", "（なし）"], a: 2, e: "太陽は1つしかない → the。" },
        { t: "mc", q: "She plays ___ piano every day.", c: ["a", "the", "an", "（なし）"], a: 1, e: "楽器を演奏するときは play the piano。" },
        { t: "mc", q: "He goes to school by ___ bus.", c: ["a", "the", "（なし）", "an"], a: 2, e: "by + 交通手段は無冠詞：by bus, by train, by car。" },
        { t: "mc", q: "It takes ___ hour to get there.", c: ["a", "an", "the", "（なし）"], a: 1, e: "hour の h は発音しないので母音の音で始まる → an hour。" },
        { t: "mc", q: "The meeting is ___ Monday.", c: ["in", "on", "at", "by"], a: 1, e: "曜日・日付には on。" },
        { t: "mc", q: "I was born ___ 1995.", c: ["on", "at", "in", "for"], a: 2, e: "年・月・季節には in。" },
        { t: "mc", q: "Please finish this ___ Friday.", c: ["until", "by", "in", "at"], a: 1, e: "「金曜までに（期限）」は by。until は「金曜までずっと（継続）」。" },
        { t: "mc", q: "She is good ___ cooking.", c: ["in", "at", "for", "with"], a: 1, e: "be good at ～ =「～が得意だ」。" },
        { t: "mc", q: "I'll be back ___ ten minutes.", c: ["after", "in", "on", "since"], a: 1, e: "今から10分後は in ten minutes。" },
        { t: "mc", q: "My brother ___ to school every day.", c: ["go", "goes", "going", "gone"], a: 1, e: "主語 My brother は3人称単数。現在形なので goes。" },
        { t: "mc", q: "I ___ a letter to her last night.", c: ["write", "wrote", "written", "writing"], a: 1, e: "last night は過去 → 過去形 wrote。" },
        { t: "mc", q: "___ there any milk in the fridge?", c: ["Is", "Are", "Do", "Does"], a: 0, e: "milk は数えられない名詞なので単数扱い → Is there ～?" },
        { t: "mc", q: "She is ___ TV now.", c: ["watch", "watches", "watching", "watched"], a: 2, e: "is + ～ing で現在進行形。now がヒント。" },
        { t: "order", ja: "彼は毎朝コーヒーを飲む。", w: ["he", "drinks", "coffee", "every", "morning"], x: ["drink"], e: "主語が he なので drinks。every morning は文末に。" },
        { t: "order", ja: "私は昨日その映画を見た。", w: ["I", "saw", "the", "movie", "yesterday"], x: ["see"], alt: [["yesterday", "I", "saw", "the", "movie"]], e: "yesterday があるので過去形 saw。" },
        { t: "order", ja: "机の上に本が1冊ある。", w: ["there", "is", "a", "book", "on", "the", "desk"], x: ["are"], e: "a book は単数なので There is。" }
      ]
    },
    {
      id: "time", name: "時の森", grammar: "現在完了・過去完了", lv: 1,
      enemy: { name: "トキコウモリ", sprite: "bat", pal: { a: "#8a5cc7", b: "#5b3a8a" } },
      boss: { name: "過去の亡霊", sprite: "ghost", pal: { a: "#e8eef7", b: "#9aa6c0" } },
      lessons: [
        { title: "現在完了", points: [
          ["形は <b>have / has + 過去分詞</b>。過去の出来事が「今」とつながっていることを表す。", "I <em>have lost</em> my key.", "鍵をなくしてしまった（今も無い）"],
          ["用法は3つ：<b>経験</b>（ever, never, ～times）、<b>継続</b>（for, since）、<b>完了</b>（just, already, yet）。", "She <em>has lived</em> here since 2020.", "2020年からずっとここに住んでいる"],
          ["yesterday, ago, last week など<b>過去の一点</b>を示す語とは一緒に使えない。", "I <em>finished</em> it yesterday.", "×I have finished it yesterday."],
          ["have been to = 行ったことがある / have gone to = 行ってしまって今ここにいない。", "He <em>has gone</em> to Paris.", "彼はパリへ行ってしまった"]
        ]},
        { title: "過去完了", points: [
          ["形は <b>had + 過去分詞</b>。過去のある時点より<b>さらに前</b>の出来事を表す。", "The train <em>had left</em> when I arrived.", "着いた時には電車はもう出ていた"],
          ["過去のある時点までの経験・継続にも使う。", "I <em>had never seen</em> snow until I was 20.", "20歳まで雪を見たことがなかった"],
          ["進行形 <b>had been ～ing</b> は、過去の時点まで続いていた動作。", "I <em>had been waiting</em> for an hour.", "1時間待ち続けていた"]
        ]}
      ],
      qs: [
        { t: "mc", q: "I ___ to London three times.", c: ["have been", "went", "have gone", "am going"], a: 0, e: "three times は「経験」。経験は have been to。have gone to は「行ってしまった（今いない）」なので、主語が I だと不自然。" },
        { t: "mc", q: "She ___ here since 2020.", c: ["lives", "has lived", "lived", "is living"], a: 1, e: "since 2020（2020年から今まで）は「継続」。現在完了 has lived を使う。" },
        { t: "mc", q: "I ___ my homework yesterday.", c: ["have finished", "finished", "have finish", "finishing"], a: 1, e: "yesterday は過去の一点。現在完了とは一緒に使えないので過去形 finished。" },
        { t: "mc", q: "___ you ever seen a ghost?", c: ["Did", "Have", "Are", "Do"], a: 1, e: "ever + 過去分詞 seen は経験を尋ねる現在完了の疑問文。Have you ever ～?" },
        { t: "mc", q: "We have known each other ___ ten years.", c: ["since", "for", "during", "from"], a: 1, e: "for は「期間の長さ」（ten years）、since は「起点」（2015, last year）。" },
        { t: "mc", q: "He has just ___ lunch.", c: ["eat", "ate", "eaten", "eating"], a: 2, e: "have / has の後ろは過去分詞。eat - ate - eaten。" },
        { t: "mc", q: "When I arrived at the station, the train ___.", c: ["already left", "had already left", "has already left", "leaves"], a: 1, e: "「着いた（過去）」より前に電車が出ていた → 過去完了 had already left。" },
        { t: "mc", q: "She told me she ___ the movie before.", c: ["sees", "has seen", "had seen", "is seeing"], a: 2, e: "told（過去）の時点より前の経験なので had seen。" },
        { t: "mc", q: "I ___ sushi until I came to Japan.", c: ["have never eaten", "had never eaten", "am never eating", "never eat"], a: 1, e: "came（過去）の時点までの経験 → 過去完了。今を基準にする have never eaten は until I came と合わない。" },
        { t: "mc", q: "By the time he called, I ___ for an hour.", c: ["waited", "had been waiting", "have waited", "am waiting"], a: 1, e: "電話が来た時点まで1時間待ち続けていた → 過去完了進行形 had been waiting。" },
        { t: "mc", q: "I realized that I ___ my wallet at home.", c: ["leave", "had left", "have left", "am leaving"], a: 1, e: "気づいた（過去）より前に財布を置いてきた → had left。" },
        { t: "order", ja: "私は一度も雪を見たことがない。", w: ["I", "have", "never", "seen", "snow"], x: ["saw"], e: "経験の否定は have never + 過去分詞。" },
        { t: "order", ja: "彼女はここに10年間住んでいる。", w: ["she", "has", "lived", "here", "for", "ten", "years"], x: ["since"], e: "期間の長さは for。since は起点に使う。" },
        { t: "order", ja: "私が駅に着いたとき、電車はもう出発していた。", w: ["the", "train", "had", "already", "left", "when", "I", "arrived"], alt: [["when", "I", "arrived", "the", "train", "had", "already", "left"]], e: "着いた（過去）より前の出来事なので had already left。" }
      ]
    },
    {
      id: "modal", name: "助動詞の洞窟", grammar: "助動詞・助動詞 + have 過去分詞", lv: 3,
      enemy: { name: "マストブロブ", sprite: "blob", pal: { a: "#4a8fe0", b: "#2a5ca0" } },
      boss: { name: "ゴーレム・ウィル", sprite: "golem", pal: { a: "#9a8f80", b: "#5f574c" } },
      lessons: [
        { title: "助動詞", points: [
          ["<b>must</b> =「～しなければならない」、<b>don't have to</b> =「～する必要はない」。mustn't は「～してはいけない」。", "You <em>don't have to</em> come.", "来なくてもいい"],
          ["推量の <b>must</b> =「～に違いない」、<b>can't</b> =「～のはずがない」。", "He <em>must</em> be at home.", "家にいるに違いない"],
          ["<b>助動詞 + have + 過去分詞</b> で過去への推量・後悔。should have done =「～すべきだったのに」。", "You <em>should have told</em> me.", "言ってくれればよかったのに"]
        ]}
      ],
      qs: [
        { t: "mc", q: "You ___ wear a seatbelt. It's the law.", c: ["must", "may", "might", "would"], a: 0, e: "法律で決まっている義務 → must。" },
        { t: "mc", q: "You ___ come if you don't want to.", c: ["mustn't", "don't have to", "can't", "shouldn't"], a: 1, e: "「来たくないなら来なくていい」→ 不必要の don't have to。mustn't は禁止。" },
        { t: "mc", q: "He ___ be at home. The lights are on.", c: ["must", "can't", "mustn't", "needn't"], a: 0, e: "電気がついている → 家にいるに違いない（推量の must）。" },
        { t: "mc", q: "She ___ have left already. Her bag is gone.", c: ["must", "can't", "should", "will"], a: 0, e: "バッグがない → もう帰ったに違いない。過去への推量 must have + 過去分詞。" },
        { t: "mc", q: "You ___ have told me earlier!", c: ["should", "must", "can", "will"], a: 0, e: "「もっと早く言うべきだったのに」→ should have + 過去分詞（後悔・非難）。" },
        { t: "order", ja: "あなたはそんなに急ぐ必要はない。", w: ["you", "don't", "have", "to", "hurry", "so", "much"], x: ["must"], e: "不必要は don't have to。" },
        { t: "order", ja: "彼は道に迷ったに違いない。", w: ["he", "must", "have", "lost", "his", "way"], x: ["should"], e: "過去への確信のある推量は must have + 過去分詞。" },
        { t: "order", ja: "（私は）傘を持ってくるべきだった。", w: ["I", "should", "have", "brought", "an", "umbrella"], x: ["must"], e: "しなかったことへの後悔は should have + 過去分詞。" }
      ]
    },
    {
      id: "passive", name: "受け身の沼", grammar: "受動態", lv: 5,
      enemy: { name: "沼のゆうれい", sprite: "ghost", pal: { a: "#7fbf8a", b: "#4a7f55" } },
      boss: { name: "ヌマドラゴン", sprite: "dragon", pal: { a: "#4f9a5a", b: "#2f6038" } },
      lessons: [
        { title: "受動態", points: [
          ["形は <b>be動詞 + 過去分詞</b>。「～される」。時制は be動詞で表す。", "This bridge <em>was built</em> in 1990.", "この橋は1990年に建てられた"],
          ["助動詞の後は <b>be + 過去分詞</b>、進行形は <b>be being + 過去分詞</b>。", "The room <em>is being cleaned</em>.", "部屋はそうじされているところだ"],
          ["by 以外の前置詞をとる表現もある。句動詞は前置詞ごと残す。", "be covered <em>with</em> / He was laughed <em>at</em> by everyone.", ""]
        ]}
      ],
      qs: [
        { t: "mc", q: "This bridge ___ in 1990.", c: ["built", "was built", "has built", "is building"], a: 1, e: "橋は「建てられた」側で、in 1990 は過去 → was built。" },
        { t: "mc", q: "English ___ all over the world.", c: ["speaks", "is spoken", "is speaking", "spoke"], a: 1, e: "英語は「話される」もの → is spoken。" },
        { t: "mc", q: "The room is ___ every day.", c: ["clean", "cleaned", "cleaning", "cleans"], a: 1, e: "be動詞 + 過去分詞で受動態 → is cleaned。" },
        { t: "mc", q: "The mountain is covered ___ snow.", c: ["by", "with", "of", "in"], a: 1, e: "be covered with ～ =「～で覆われている」。" },
        { t: "mc", q: "The letter will ___ tomorrow.", c: ["send", "be sent", "sent", "sending"], a: 1, e: "助動詞 will の後ろは原形 be、そこに過去分詞 → will be sent。" },
        { t: "order", ja: "この本は多くの人に読まれている。", w: ["this", "book", "is", "read", "by", "many", "people"], x: ["reading"], e: "read の過去分詞は read（発音は「レッド」）。" },
        { t: "order", ja: "その部屋は今そうじされているところだ。", w: ["the", "room", "is", "being", "cleaned", "now"], alt: [["the", "room", "is", "now", "being", "cleaned"]], e: "進行形の受動態は be being + 過去分詞。" },
        { t: "order", ja: "彼はみんなに笑われた。", w: ["he", "was", "laughed", "at", "by", "everyone"], e: "laugh at の at を残したまま受動態にする。" }
      ]
    },
    {
      id: "verbal", name: "準動詞の砦", grammar: "不定詞・動名詞・分詞", lv: 7,
      enemy: { name: "トゥーバット", sprite: "bat", pal: { a: "#d0503a", b: "#8a2f22" } },
      boss: { name: "てつのイング", sprite: "golem", pal: { a: "#8fa3b8", b: "#56687a" } },
      lessons: [
        { title: "不定詞と動名詞", points: [
          ["<b>動名詞だけ</b>をとる動詞：enjoy, finish, mind, avoid, give up など。", "I enjoy <em>watching</em> movies.", ""],
          ["<b>不定詞だけ</b>をとる動詞：want, decide, hope, plan, promise など（これからのこと）。", "She decided <em>to study</em> abroad.", ""],
          ["remember / forget + ～ing は「（過去に）したこと」、+ to do は「（これから）すること」。", "Don't forget <em>to lock</em> the door.", "忘れずに鍵をかけて"],
          ["stop ～ing は「～するのをやめる」、stop to do は「～するために立ち止まる」。", "He stopped <em>talking</em>.", "彼は話すのをやめた"]
        ]},
        { title: "分詞", points: [
          ["名詞を後ろから説明する：<b>～ing</b> は「～している」、<b>過去分詞</b>は「～された」。", "the girl <em>standing</em> by the window / a car <em>made</em> in Japan", ""],
          ["<b>have + O + 過去分詞</b> =「O を～してもらう・される」。", "I had my bike <em>repaired</em>.", "自転車を修理してもらった"],
          ["分詞構文：接続詞と主語を省いて分詞で始める。受け身の意味なら過去分詞。", "<em>Seen</em> from the hill, the city looks beautiful.", "丘から見ると、街は美しい"]
        ]}
      ],
      qs: [
        { t: "mc", q: "I enjoy ___ movies.", c: ["to watch", "watching", "watch", "watched"], a: 1, e: "enjoy の後ろは動名詞のみ → watching。" },
        { t: "mc", q: "She decided ___ abroad.", c: ["studying", "to study", "study", "studied"], a: 1, e: "decide の後ろは不定詞 → to study。" },
        { t: "mc", q: "I remember ___ him at the party last year.", c: ["to meet", "meeting", "meet", "met"], a: 1, e: "last year =「過去にしたこと」を覚えている → remember ～ing。" },
        { t: "mc", q: "Don't forget ___ the door when you leave.", c: ["locking", "to lock", "lock", "locked"], a: 1, e: "これからすること（鍵をかける）を忘れない → forget to do。" },
        { t: "mc", q: "He stopped ___ when the teacher came in.", c: ["talking", "to talk", "talk", "talked"], a: 0, e: "先生が来たので話すのを「やめた」→ stop talking。stop to talk だと「話すために立ち止まった」。" },
        { t: "mc", q: "The boy ___ in the park is my brother.", c: ["playing", "played", "plays", "to play"], a: 0, e: "「公園で遊んでいる少年」→ 現在分詞 playing が後ろから名詞を説明。" },
        { t: "mc", q: "I had my bike ___ yesterday.", c: ["repair", "repaired", "repairing", "to repair"], a: 1, e: "自転車は「修理される」側 → have + O + 過去分詞。" },
        { t: "mc", q: "___ from the hill, the city looks beautiful.", c: ["Seeing", "Seen", "To see", "Saw"], a: 1, e: "街は丘から「見られる」側なので過去分詞で始まる分詞構文 Seen。" },
        { t: "order", ja: "私は彼に手伝ってくれるように頼んだ。", w: ["I", "asked", "him", "to", "help", "me"], x: ["helping"], e: "ask + 人 + to do =「人に～するよう頼む」。" },
        { t: "order", ja: "窓のそばに立っている少女は私の妹だ。", w: ["the", "girl", "standing", "by", "the", "window", "is", "my", "sister"], x: ["stood"], e: "standing by the window が後ろから the girl を説明する。" },
        { t: "order", ja: "英語を話すことは簡単ではない。", w: ["speaking", "English", "is", "not", "easy"], x: ["speak"], e: "動名詞 speaking が主語になる。" }
      ]
    },
    {
      id: "relative", name: "関係詞の迷宮", grammar: "関係代名詞・関係副詞・what", lv: 9,
      enemy: { name: "フーイッチ", sprite: "ghost", pal: { a: "#b48ae0", b: "#7a55a8" } },
      boss: { name: "迷宮の賢者ワット", sprite: "wizard", pal: { a: "#3d4fa8", b: "#25306a" } },
      lessons: [
        { title: "関係詞", points: [
          ["人には <b>who</b>、物には <b>which</b>、どちらにも <b>that</b>。", "The woman <em>who</em> lives next door is a doctor.", "隣に住む女性は医者だ"],
          ["所有を表すのは <b>whose</b>。", "I have a friend <em>whose</em> father is an actor.", "父親が俳優の友達がいる"],
          ["場所は <b>where</b>、時は <b>when</b>（関係副詞）。後ろが完全な文になる。", "This is the town <em>where</em> I was born.", "ここは私が生まれた町だ"],
          ["<b>what</b> は「～すること・もの」。先行詞を含むので前に名詞を置かない。", "<em>What</em> he said surprised everyone.", "彼が言ったことは皆を驚かせた"]
        ]}
      ],
      qs: [
        { t: "mc", q: "This is the book ___ I bought yesterday.", c: ["who", "which", "where", "what"], a: 1, e: "先行詞 the book は物で、bought の目的語が欠けている → which（that も可）。" },
        { t: "mc", q: "The woman ___ lives next door is a doctor.", c: ["which", "who", "whom", "whose"], a: 1, e: "先行詞は人、lives の主語が欠けている → 主格の who。" },
        { t: "mc", q: "I have a friend ___ father is an actor.", c: ["who", "whose", "whom", "which"], a: 1, e: "「友達の父親」という所有関係 → whose。" },
        { t: "mc", q: "This is the town ___ I was born.", c: ["which", "where", "that", "when"], a: 1, e: "I was born は欠けのない文。場所を表す先行詞なので関係副詞 where（= in which）。" },
        { t: "mc", q: "___ he said surprised everyone.", c: ["That", "What", "Which", "Who"], a: 1, e: "先行詞がなく「彼が言ったこと」→ what。" },
        { t: "order", ja: "これは私が昨日買った本だ。", w: ["this", "is", "the", "book", "which", "I", "bought", "yesterday"], x: ["who"], e: "物が先行詞で目的語が欠けている → which。" },
        { t: "order", ja: "彼が言ったことは本当だった。", w: ["what", "he", "said", "was", "true"], x: ["that"], e: "「～したこと」は what。" },
        { t: "order", ja: "私が生まれた町はとても小さい。", w: ["the", "town", "where", "I", "was", "born", "is", "very", "small"], x: ["which"], e: "I was born は完全な文なので関係副詞 where。" }
      ]
    },
    {
      id: "compare", name: "比較の塔", grammar: "比較級・最上級・原級比較", lv: 11,
      enemy: { name: "ゴールドブロブ", sprite: "blob", pal: { a: "#e0b83a", b: "#a07f1c" } },
      boss: { name: "モアドラゴン", sprite: "dragon", pal: { a: "#d0443a", b: "#8a2a22" } },
      lessons: [
        { title: "比較", points: [
          ["比較級は <b>-er / more</b>、最上級は <b>the -est / the most</b>。長い語は more / most。", "heavy → <em>heavier</em> → <em>the heaviest</em>", ""],
          ["<b>as + 原級 + as</b> =「同じくらい～」。倍数は twice / three times を前に。", "This book is <em>twice as thick as</em> that one.", "この本はあの本の2倍の厚さだ"],
          ["<b>The + 比較級 ～, the + 比較級 …</b> =「～すればするほど…」。", "<em>The more</em> you practice, <em>the better</em> you get.", "練習するほど上手くなる"]
        ]}
      ],
      qs: [
        { t: "mc", q: "This box is ___ than that one.", c: ["heavy", "heavier", "heaviest", "more heavy"], a: 1, e: "than があるので比較級。heavy は y を i に変えて heavier。" },
        { t: "mc", q: "She is ___ student in the class.", c: ["taller", "the tallest", "tallest", "most tall"], a: 1, e: "in the class（集団の中で一番）→ 最上級 the tallest。名詞の前では the が必要。" },
        { t: "mc", q: "This book is ___ interesting than that one.", c: ["more", "most", "much", "very"], a: 0, e: "interesting は長い語なので more interesting。" },
        { t: "mc", q: "He runs as fast ___ his brother.", c: ["than", "as", "like", "so"], a: 1, e: "as + 原級 + as の形。" },
        { t: "mc", q: "The ___ you practice, the better you get.", c: ["more", "most", "much", "many"], a: 0, e: "The + 比較級, the + 比較級 →「～すればするほど」。" },
        { t: "order", ja: "彼女はクラスで一番背が高い。", w: ["she", "is", "the", "tallest", "in", "the", "class"], x: ["of"], e: "範囲・集団を表す名詞（class）には in。複数のもの（all, the three）には of。" },
        { t: "order", ja: "この本はあの本の2倍の厚さだ。", w: ["this", "book", "is", "twice", "as", "thick", "as", "that", "one"], e: "倍数 + as + 原級 + as。" },
        { t: "order", ja: "早ければ早いほどよい。", w: ["the", "sooner", "the", "better"], e: "The + 比較級, the + 比較級。動詞を省いた決まり文句。" }
      ]
    },
    {
      id: "ifcastle", name: "仮定法の城", grammar: "仮定法過去・仮定法過去完了・I wish", lv: 13,
      enemy: { name: "イフの魔術師", sprite: "wizard", pal: { a: "#2f8a8a", b: "#1c5656" } },
      boss: { name: "仮定竜ウェア", sprite: "dragon", pal: { a: "#4a4a6a", b: "#2a2a40" } },
      lessons: [
        { title: "仮定法", points: [
          ["<b>仮定法過去</b>：今の事実と反対。If + 過去形, would + 動詞の原形。be動詞は主語に関係なく were が基本。", "If I <em>were</em> rich, I <em>would travel</em> the world.", "もしお金持ちなら世界を旅するのに"],
          ["<b>仮定法過去完了</b>：過去の事実と反対。If + had + 過去分詞, would have + 過去分詞。", "If I <em>had studied</em>, I <em>would have passed</em>.", "勉強していたら合格していたのに"],
          ["<b>I wish</b> + 過去形 = 今そうだったらいいのに。", "I wish I <em>could</em> speak French.", "フランス語が話せたらいいのに"],
          ["実際に起こりうる条件は普通の現在形（直説法）。", "If it <em>rains</em> tomorrow, we will stay home.", "明日雨なら家にいる"]
        ]}
      ],
      qs: [
        { t: "mc", q: "If I ___ rich, I would travel the world.", c: ["am", "were", "will be", "have been"], a: 1, e: "今の事実と反対の仮定 → 仮定法過去。be動詞は were を使う（口語では was もある）。" },
        { t: "mc", q: "If I had studied harder, I ___ the exam.", c: ["would pass", "would have passed", "will pass", "passed"], a: 1, e: "If節が had studied（仮定法過去完了）なので、主節は would have + 過去分詞。" },
        { t: "mc", q: "I wish I ___ speak French.", c: ["can", "could", "will", "am able"], a: 1, e: "I wish の後ろは時制を1つ過去にずらす。can → could。" },
        { t: "mc", q: "If it ___ tomorrow, we will cancel the picnic.", c: ["rains", "rained", "would rain", "had rained"], a: 0, e: "実際に起こりうる条件なので普通の条件文。時・条件の副詞節では未来でも現在形 rains。" },
        { t: "mc", q: "___ I you, I would accept the offer.", c: ["Were", "If", "Was", "Had"], a: 0, e: "If I were you の If を省略すると倒置して Were I you になる。" },
        { t: "order", ja: "もし私があなたなら、その申し出を受けるだろう。", w: ["if", "I", "were", "you", "I", "would", "accept", "the", "offer"], x: ["am"], alt: [["I", "would", "accept", "the", "offer", "if", "I", "were", "you"]], e: "今の事実に反する仮定 → If I were you, I would ～。" },
        { t: "order", ja: "英語が話せたらいいのに。", w: ["I", "wish", "I", "could", "speak", "English"], x: ["can"], e: "I wish + 過去形（could）。" },
        { t: "order", ja: "もっと勉強していたら、試験に合格していただろう。", w: ["if", "I", "had", "studied", "harder", "I", "would", "have", "passed", "the", "exam"], alt: [["I", "would", "have", "passed", "the", "exam", "if", "I", "had", "studied", "harder"]], e: "過去の事実に反する仮定 → If + had 過去分詞, would have 過去分詞。" }
      ]
    },
    {
      id: "demon", name: "魔王城", grammar: "英作文（全範囲）", lv: 16, secret: true,
      enemy: { name: "魔王の影", sprite: "ghost", pal: { a: "#5a3a6a", b: "#2e1c38" } },
      boss: { name: "英作の魔王", sprite: "demon", pal: { a: "#7a2a8a", b: "#3a1240" } },
      lessons: [
        { title: "英作文のコツ", points: [
          ["まず<b>主語と動詞</b>を決める。日本語の主語が省略されていたら補う。", "（私は）もっと早く起きるべきだった → <em>I should have</em> got up earlier.", ""],
          ["<b>時制</b>を確認する。「ずっと～している」は現在完了（進行形）。", "<em>I have been studying</em> English for three years.", ""],
          ["今までの城で学んだ<b>型</b>に当てはめる。仮定法・比較・関係詞は型を覚えれば書ける。", "<em>The more</em> you practice, <em>the better</em> you get.", ""]
        ]}
      ],
      qs: [
        { t: "write", ja: "もし私が鳥なら、あなたのところへ飛んでいけるのに。", hint: "仮定法過去", ans: ["If I were a bird, I could fly to you."], need: [["if i were a bird", "if i was a bird"], ["could fly to you"]], e: "今の事実に反する仮定 → If I were ～, I could ～。" },
        { t: "write", ja: "私は3年間ずっと英語を勉強している。", hint: "現在完了（進行形）", ans: ["I have been studying English for three years.", "I have studied English for three years."], need: [["i have been studying english", "i have studied english", "i have been learning english", "i have learned english"], ["for three years", "for 3 years"]], e: "「ずっと～している」→ have been ～ing / have + 過去分詞 + for 期間。" },
        { t: "write", ja: "彼女が言ったことは本当ではなかった。", hint: "関係代名詞 what", ans: ["What she said was not true."], need: [["what she said"], ["was not true"]], e: "「～したこと」は what で表す。" },
        { t: "write", ja: "（私は）もっと早く起きるべきだった。", hint: "should have + 過去分詞", ans: ["I should have got up earlier.", "I should have gotten up earlier."], need: [["i should have got up earlier", "i should have gotten up earlier", "i should have woken up earlier"]], e: "しなかったことへの後悔 → should have + 過去分詞。" },
        { t: "write", ja: "この橋は100年前に建てられた。", hint: "受動態", ans: ["This bridge was built 100 years ago."], need: [["this bridge was built"], ["100 years ago", "a hundred years ago", "one hundred years ago"]], e: "過去の受動態 → was + 過去分詞。" },
        { t: "write", ja: "練習すればするほど、上手になる。", hint: "The + 比較級, the + 比較級", ans: ["The more you practice, the better you get."], need: [["the more you practice", "the more you practise"], ["the better you get", "the better you become", "the better you will get", "the better you will become"]], e: "The + 比較級 ～, the + 比較級 …。" },
        { t: "write", ja: "東京は日本で最も大きな都市だ。", hint: "最上級", ans: ["Tokyo is the largest city in Japan."], need: [["tokyo is the largest city", "tokyo is the biggest city"], ["in japan"]], e: "最上級 the largest + 範囲は in。" },
        { t: "write", ja: "私は彼に部屋をそうじしてもらった。", hint: "使役 have + O + 原形", ans: ["I had him clean the room."], need: [["i had him clean", "i got him to clean"], ["the room", "my room"]], e: "have + 人 + 動詞の原形 =「人に～してもらう」。" },
        { t: "write", ja: "雨が降っていなかったら、私たちは外出していただろう。", hint: "仮定法過去完了", ans: ["If it had not rained, we would have gone out."], need: [["if it had not rained", "if it had not been raining", "had it not rained"], ["we would have gone out"]], e: "過去の事実に反する仮定 → If + had 過去分詞, would have 過去分詞。" },
        { t: "write", ja: "窓のそばに立っている男性は私の父だ。", hint: "現在分詞の後置修飾", ans: ["The man standing by the window is my father."], need: [["the man standing by the window", "the man who is standing by the window", "the man that is standing by the window"], ["is my father"]], e: "standing by the window が後ろから the man を説明する。" }
      ]
    }
  ]
};
