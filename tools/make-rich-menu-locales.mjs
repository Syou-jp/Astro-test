import sharp from 'sharp';

const variants = {
  ko: ['게시', '홈', '문의', '설정'],
  vi: ['Đăng bài', 'Trang chủ', 'Liên hệ', 'Cài đặt'],
  ne: ['पोस्ट', 'गृहपृष्ठ', 'सम्पर्क', 'सेटिङहरू'],
  tl: ['Mag-post', 'Home', 'Makipag-ugnayan', 'Mga Setting'],
  id: ['Posting', 'Beranda', 'Kontak', 'Pengaturan'],
  pt: ['Publicar', 'Início', 'Contato', 'Configurações'],
  th: ['โพสต์', 'หน้าหลัก', 'ติดต่อ', 'ตั้งค่า'],
};

const rectangles = [
  { x: 75, y: 570, w: 1140, h: 220 },
  { x: 1285, y: 570, w: 1140, h: 220 },
  { x: 75, y: 1400, w: 1140, h: 210 },
  { x: 1285, y: 1400, w: 1140, h: 210 },
];

for (const [code, labels] of Object.entries(variants)) {
  const overlays = labels.map((label, index) => {
    const rect = rectangles[index];
    const fontSize = label.length > 13 ? 66 : label.length > 9 ? 82 : 104;
    return `<rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="#043367"/><text x="${rect.x + rect.w / 2}" y="${rect.y + rect.h / 2 + fontSize / 3}" text-anchor="middle" fill="white" font-family="Arial, Noto Sans, sans-serif" font-weight="700" font-size="${fontSize}">${label}</text>`;
  }).join('');
  const svg = `<svg width="2500" height="1686" xmlns="http://www.w3.org/2000/svg">${overlays}</svg>`;
  await sharp('public/images/line/rich-menu-en.jpg')
    .resize(2500, 1686)
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 88 })
    .toFile(`public/images/line/rich-menu-${code}.jpg`);
}
