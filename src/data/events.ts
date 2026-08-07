export type EventDetail = {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  summary: string;
  description: string;
  participation: string;
  notes: string[];
};

export const EVENTS: EventDetail[] = [
  {
    slug: "ueno-taiwan-festival",
    title: "上野台湾祭 2024春",
    date: "2024年3月30日（土）〜4月1日（月）",
    time: "10:00〜18:00",
    location: "上野公園",
    image: "/events/ueno-taiwan-festival.png",
    summary: "台湾の食・文化・工芸にふれられる屋外イベントです。",
    description: "屋台グルメ、雑貨、ステージ企画を楽しみながら、気軽に台湾文化にふれられる催しです。家族や友人との週末のお出かけにも向いています。",
    participation: "入場方法、混雑状況、出店内容は主催者の最新案内をご確認ください。",
    notes: ["屋外開催のため、天候による変更にご注意ください。", "会場内の支払い方法は出店ごとに異なる場合があります。"]
  },
  {
    slug: "shibuya-language-exchange",
    title: "金曜夜の言語交換パーティー",
    date: "毎週金曜日",
    time: "19:00〜21:00",
    location: "渋谷 カフェアリス",
    image: "/events/shibuya-language-exchange.png",
    summary: "日本語とさまざまな言語で会話を楽しむ、少人数の交流会です。",
    description: "初参加でも会話に入りやすいよう、テーブルごとにテーマを決めて進めるカジュアルな交流会です。日本語を練習したい人も、外国語を使いたい人も参加できます。",
    participation: "参加費、定員、使用言語は開催回ごとに異なるため、申込み前にご確認ください。",
    notes: ["開始時間の少し前に到着すると受付がスムーズです。", "相手の言語レベルや文化的な違いを尊重して交流しましょう。"]
  },
  {
    slug: "thai-community-festival",
    title: "タイ・フェスティバル 2024",
    date: "2024年5月19日（日）",
    time: "11:00〜18:00",
    location: "赤坂見附 TRY横丁",
    image: "/events/thai-community-festival.png",
    summary: "タイ料理、音楽、ダンスを通してコミュニティと交流する文化イベントです。",
    description: "本格的なフードブースや伝統舞踊のステージなど、タイの文化を身近に感じられる一日です。地域の人や海外出身の参加者が集まり、初めてでも雰囲気を楽しめます。",
    participation: "ステージ予定や出店情報は変更される場合があります。主催者発表をご確認ください。",
    notes: ["混雑する時間帯は入場・購入待ちが発生する場合があります。", "撮影の可否は出演者・会場の案内に従ってください。"]
  },
  {
    slug: "shinjuku-startup-breakfast",
    title: "外国人起業家の朝食会",
    date: "毎月第一日曜日",
    time: "07:30〜09:00",
    location: "新宿 ビジネスラウンジ",
    image: "/events/shinjuku-startup-breakfast.png",
    summary: "東京で事業を始めた人、これから始めたい人のための朝のネットワーキングです。",
    description: "起業、フリーランス、プロジェクト運営などの経験を共有しながら、協業相手や相談先を見つけるための小規模な交流会です。名刺や自己紹介の準備があると会話が始めやすくなります。",
    participation: "参加対象、参加費、朝食の有無は主催者の申込ページでご確認ください。",
    notes: ["短い自己紹介を準備しておくと交流しやすくなります。", "営業目的のみの参加が制限される場合があります。"]
  },
  {
    slug: "multicultural-autumn-festival",
    title: "多文化フェスティバル 2024秋",
    date: "2024年10月12日（土）〜10月14日（月）",
    time: "10:00〜19:00",
    location: "新宿バルト広場",
    image: "/events/multicultural-autumn-festival.png",
    summary: "各国の料理、音楽、工芸に出会える多文化交流イベントです。",
    description: "さまざまな国や地域のコミュニティが集まり、食、音楽、ダンス、クラフトを紹介します。文化を知るきっかけとして、ひとりでもグループでも楽しめる内容です。",
    participation: "当日のプログラム、出店、入場ルールは主催者の最新情報を確認してください。",
    notes: ["会場混雑時は入場制限が行われる場合があります。", "ごみの分別や会場ルールにご協力ください。"]
  },
  {
    slug: "roppongi-language-cafe",
    title: "日本語・英語 カフェテーブル",
    date: "毎週水曜日",
    time: "18:00〜20:00",
    location: "六本木 Caféラングエッジ",
    image: "/events/roppongi-language-cafe.png",
    summary: "カフェで気軽に会話しながら、日本語と英語を練習する交流テーブルです。",
    description: "会話のテーマカードを使い、初級者でも話しやすいペースで進めます。少人数のため、参加者同士でじっくり話したい人におすすめです。",
    participation: "事前予約の要否、ドリンク代、言語レベルの目安は開催案内をご確認ください。",
    notes: ["聞き役だけでも大丈夫です。無理のない範囲で参加してください。", "会話内容や参加者の個人情報を外部に共有しないようにしましょう。"]
  }
];
