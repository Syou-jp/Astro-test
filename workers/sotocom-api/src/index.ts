export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  AI: Ai;
  ALLOWED_ORIGIN: string;
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_LOGIN_CHANNEL_ID: string;
  DEEPL_API_KEY?: string;
}

type LineEvent = {
  type?: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type?: string; text?: string };
  postback?: { data?: string };
};

type LineIdentity = { sub: string; name?: string; picture?: string };

const LIFF_URL = 'https://liff.line.me/2011054732-exitzB6m';
const PUBLIC_SITE = 'https://astro-test-01m.pages.dev';
const API_BASE = 'https://sotocom-api.syouboc.workers.dev';
const submissionTypes = [
  ['listings', '入居募集'],
  ['used-market', '中古市場'],
  ['jobs', '求人募集'],
  ['events', 'イベント'],
  ['help', '助け合い'],
] as const;
const allLanguages = [
  ['ja', '日本語'], ['en', 'English'], ['zh-CN', '中文（简体）'], ['zh-TW', '中文（繁體）'], ['ko', '한국어'], ['id', 'Orang indonesia'], ['es', 'Español'], ['th', 'ภาษาไทย'], ['mn', 'Монгол'], ['tl', 'Tagalog'], ['pt', 'Português'], ['vi', 'Tiếng việt'], ['my', 'မြန်မာ'], ['ne', 'नेपाली'], ['km', 'ខ្មែរ'], ['fr', 'Le français'], ['de', 'Deutsch'], ['ru', 'русский'], ['ar', 'لعربية'], ['it', 'Italiano'], ['af', 'Afrikaans'], ['am', 'አማርኛ'], ['az', 'Azərbaycan'], ['be', 'Беларус'], ['bg', 'български'], ['bn', 'বাঙালি'], ['bs', 'Bosanski'], ['ca', 'Català'], ['ceb', 'Cebuano'], ['co', 'Corsu'], ['cs', 'Česky'], ['cy', 'Cymraeg'], ['da', 'dansk'], ['el', 'Ελληνικά'], ['eo', 'Esperanto'], ['et', 'Eestlane'], ['eu', 'Euskal'], ['fa', 'فارسی'], ['fi', 'suomalainen'], ['fy', 'Frysk'], ['ga', 'Gaeilge'], ['gd', 'Gàidhlig na h-Alba'], ['gl', 'Galego'], ['gu', 'ગુજરાતી'], ['ha', 'Hausa'], ['haw', 'ʻŌlelo Hawaiʻi'], ['hi', 'हिन्दी'], ['hmn', 'Hmong'], ['hr', 'hrvatski'], ['ht', 'Ayisyen'], ['hu', 'magyar'], ['hy', 'Հայերեն'], ['ig', 'Ndi Igbo'], ['is', 'Íslensku'], ['iw', 'עברית'], ['jw', 'Basa jawa'], ['ka', 'ქართული'], ['kk', 'Қазақ'], ['kn', 'ಕನ್ನಡ'], ['ku', 'Kurdî'], ['ky', 'Kirghiz'], ['la', 'Latine'], ['lb', 'Lëtzebuergesch'], ['lo', 'ລາວ'], ['lt', 'Lietuvis'], ['lv', 'Latvietis'], ['mg', 'Malagasy'], ['mi', 'Maori'], ['mk', 'Македонски'], ['ml', 'മലയാളം'], ['mr', 'मराठी'], ['ms', 'Melayu'], ['mt', 'Malti'], ['nl', 'Nederlands'], ['no', 'norsk'], ['ny', 'Chewa'], ['or', 'ଓଡିଆ'], ['pa', 'ਪੰਜਾਬੀ'], ['pl', 'Polski'], ['ps', 'پښتو'], ['ro', 'românesc'], ['rw', 'Kinyarwanda'], ['sd', 'سنڌي'], ['si', 'සිංහල'], ['sk', 'slovenský'], ['sl', 'Slovensko'], ['sm', 'Samoa'], ['sn', 'Shona'], ['so', 'Soomaali'], ['sq', 'Shqiptar'], ['sr', 'Српски'], ['st', 'Sotho'], ['su', 'Urang Sunda'], ['sv', 'Svenska'], ['sw', 'Kiswahili'], ['ta', 'தமிழ் மொழி'], ['te', 'తెలుగు'], ['tg', 'Точик'], ['tk', 'Türkmenler'], ['tr', 'Türk'], ['tt', 'Татар'], ['ug', 'ئۇيغۇر'], ['uk', 'Українська'], ['ur', 'اردو'], ['uz', "O'zbek"], ['xh', 'IsiXhosa'], ['yi', 'יידיש'], ['yo', 'Yoruba'], ['zu', 'IsiZulu'],
] as const;
const supportedLanguageCodes = new Set(['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'vi', 'ne', 'tl', 'id', 'pt', 'th']);
const languages = allLanguages.filter(([code]) => supportedLanguageCodes.has(code));
const nationalities = [
  ['TW', '台湾'], ['JP', '日本'], ['CN', '中国'], ['HK', '香港'], ['MO', 'マカオ'],
  ['KR', '韓国'], ['VN', 'ベトナム'], ['TH', 'タイ'], ['PH', 'フィリピン'], ['ID', 'インドネシア'],
  ['NP', 'ネパール'], ['MM', 'ミャンマー'], ['OTHER', 'その他'],
] as const;

const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  },
});

function resolveAllowedOrigin(requestOrigin: string, configuredOrigin: string) {
  if (requestOrigin === configuredOrigin) return requestOrigin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) return requestOrigin;
  return configuredOrigin;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function verifySignature(request: Request, body: string, secret: string) {
  const signature = request.headers.get('x-line-signature');
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  let encoded = '';
  for (const byte of digest) encoded += String.fromCharCode(byte);
  return timingSafeEqual(signature, btoa(encoded));
}

async function lineApi(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${token}`);
  return fetch(`https://api.line.me${path}`, { ...init, headers });
}

async function replyLine(replyToken: string, messages: unknown[], token: string) {
  return lineApi('/v2/bot/message/reply', token, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ replyToken, messages }),
  });
}

async function pushLine(userId: string, messages: unknown[], token: string) {
  return lineApi('/v2/bot/message/push', token, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ to: userId, messages }),
  });
}

const aiLanguageAliases: Record<string, string> = {
  ja: 'japanese', en: 'english', 'zh-TW': 'chinese', 'zh-CN': 'chinese', ko: 'korean',
  vi: 'vietnamese', th: 'thai', id: 'indonesian', tl: 'tagalog', pt: 'portuguese', es: 'spanish',
  fr: 'french', de: 'german', it: 'italian', ru: 'russian', ar: 'arabic', tr: 'turkish',
  hi: 'hindi', bn: 'bengali', ur: 'urdu', fa: 'persian', iw: 'hebrew', jw: 'javanese',
};

const deeplLanguageCodes: Record<string, string> = {
  'zh-TW': 'ZH-HANT',
  'zh-CN': 'ZH-HANS',
  en: 'EN',
  pt: 'PT-PT',
  iw: 'HE',
  jw: 'JV',
};

function deeplTargetLanguage(language: string) {
  return deeplLanguageCodes[language] || language.split('-')[0].toUpperCase();
}

async function translateWithDeepL(text: string, targetLanguage: string, env: Env) {
  const apiKey = env.DEEPL_API_KEY?.trim();
  if (!apiKey) return null;

  // Older API Free keys end in :fx and use DeepL's dedicated free endpoint.
  const apiBaseUrl = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  try {
    const response = await fetch(`${apiBaseUrl}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text], target_lang: deeplTargetLanguage(targetLanguage) }),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ error: 'deepl_translation_failed', status: response.status, targetLanguage }));
      return null;
    }
    const result = await response.json<{ translations?: Array<{ text?: string }> }>();
    return result.translations?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error(JSON.stringify({ error: 'deepl_request_failed', targetLanguage, message: error instanceof Error ? error.message : String(error) }));
    return null;
  }
}

async function translateWithWorkersAi(text: string, sourceLanguage: string, targetLanguage: string, env: Env) {
  const source = aiLanguageAliases[sourceLanguage] || sourceLanguage.split('-')[0];
  const target = aiLanguageAliases[targetLanguage] || targetLanguage.split('-')[0];
  try {
    const result = await env.AI.run('@cf/meta/m2m100-1.2b', { text, source_lang: source, target_lang: target }) as { translated_text?: string; translation?: string; result?: { translated_text?: string; translation?: string } };
    const translated = String(result.translated_text || result.translation || result.result?.translated_text || result.result?.translation || '').trim();
    if (!translated || translated.startsWith('ERROR:')) {
      console.error(JSON.stringify({ error: 'workers_ai_translation_empty_response', sourceLanguage, targetLanguage }));
      return null;
    }
    return translated;
  } catch (error) {
    console.error(JSON.stringify({ error: 'workers_ai_translation_failed', sourceLanguage, targetLanguage, message: error instanceof Error ? error.message : String(error) }));
    return null;
  }
}

async function translateText(text: string, sourceLanguage: string, targetLanguage: string, env: Env) {
  if (!text || sourceLanguage === targetLanguage) return text;
  const source = aiLanguageAliases[sourceLanguage] || sourceLanguage.split('-')[0];
  const target = aiLanguageAliases[targetLanguage] || targetLanguage.split('-')[0];
  const cacheKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${source}\n${target}\n${text}`))
    .then((buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join(''));
  const cached = await env.DB.prepare('SELECT translated_text FROM translations WHERE cache_key = ?').bind(cacheKey).first<{ translated_text: string }>();
  if (cached?.translated_text) return cached.translated_text;
  const translated = await translateWithDeepL(text, targetLanguage, env)
    || await translateWithWorkersAi(text, sourceLanguage, targetLanguage, env);
  if (translated) {
    await env.DB.prepare(`INSERT INTO translations (cache_key, source_language, target_language, source_text, translated_text, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(cache_key) DO UPDATE SET translated_text = excluded.translated_text, updated_at = datetime('now')`)
      .bind(cacheKey, sourceLanguage, targetLanguage, text, translated).run();
    return translated;
  }
  return `[翻譯暫時無法使用；原文]\n${text}`;
}

const directInquiryLanguages = new Set(['ja', 'zh-CN', 'zh-TW', 'en']);

async function localize(text: string, language: string, env: Env) {
  if (!language || language === 'ja') return text;
  return translateText(text, 'ja', language, env);
}

async function localizedTextMessage(text: string, language: string, env: Env, quickReply?: unknown) {
  return { type: 'text', text: await localize(text, language, env), ...(quickReply ? { quickReply } : {}) };
}

async function localizeLineMessage(message: any, language: string, env: Env) {
  if (!language || language === 'ja') return message;
  const localized = structuredClone(message);
  if (typeof localized.text === 'string') localized.text = await localize(localized.text, language, env);
  const items = localized.quickReply?.items;
  if (Array.isArray(items)) {
    await Promise.all(items.map(async (item: any) => {
      if (typeof item.action?.label === 'string') item.action.label = (await localize(item.action.label, language, env)).slice(0, 20);
      if (typeof item.action?.displayText === 'string') item.action.displayText = (await localize(item.action.displayText, language, env)).slice(0, 300);
    }));
  }
  return localized;
}

async function linkRichMenu(userId: string, language: string, env: Env) {
  const menu = await env.DB.prepare('SELECT rich_menu_id FROM rich_menus WHERE language = ? OR language = ? ORDER BY language = ? DESC LIMIT 1')
    .bind(language, 'ja', language).first<{ rich_menu_id: string }>();
  if (!menu?.rich_menu_id) return false;
  const response = await lineApi(`/v2/bot/user/${encodeURIComponent(userId)}/richmenu/${encodeURIComponent(menu.rich_menu_id)}`, env.LINE_CHANNEL_ACCESS_TOKEN, { method: 'POST' });
  return response.ok;
}

type RichMenuLanguage = 'ja' | 'zh-TW' | 'zh-CN' | 'en' | 'ko' | 'vi' | 'ne' | 'tl' | 'id' | 'pt' | 'th';

const richMenuCopy: Record<RichMenuLanguage, { chatBar: string; post: string; contact: string; settings: string }> = {
  ja: { chatBar: '\u30e1\u30cb\u30e5\u30fc', post: '\u6295\u7a3f\u3059\u308b', contact: '\u554f\u3044\u5408\u308f\u305b', settings: '\u8a2d\u5b9a' },
  'zh-TW': { chatBar: '\u9078\u55ae', post: '\u6295\u7a3f', contact: '\u806f\u7d61\u6211\u5011', settings: '\u8a2d\u5b9a' },
  'zh-CN': { chatBar: '\u83dc\u5355', post: '\u6295\u7a3f', contact: '\u8054\u7cfb\u6211\u4eec', settings: '\u8bbe\u7f6e' },
  en: { chatBar: 'Menu', post: 'Post', contact: 'Contact', settings: 'Settings' },
  ko: { chatBar: '메뉴', post: '게시', contact: '문의', settings: '설정' },
  vi: { chatBar: 'Menu', post: 'Đăng bài', contact: 'Liên hệ', settings: 'Cài đặt' },
  ne: { chatBar: 'मेनु', post: 'पोस्ट', contact: 'सम्पर्क', settings: 'सेटिङहरू' },
  tl: { chatBar: 'Menu', post: 'Mag-post', contact: 'Makipag-ugnayan', settings: 'Mga Setting' },
  id: { chatBar: 'Menu', post: 'Posting', contact: 'Kontak', settings: 'Pengaturan' },
  pt: { chatBar: 'Menu', post: 'Publicar', contact: 'Contato', settings: 'Configurações' },
  th: { chatBar: 'เมนู', post: 'โพสต์', contact: 'ติดต่อ', settings: 'ตั้งค่า' },
};

async function createRichMenu(language: RichMenuLanguage, imageUrl: string, env: Env, replaceExisting = false) {
  const existing = await env.DB.prepare('SELECT rich_menu_id FROM rich_menus WHERE language = ?').bind(language).first<{ rich_menu_id: string }>();
  const copy = richMenuCopy[language];
  let richMenuId = existing?.rich_menu_id;
  if (richMenuId && !replaceExisting) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`richmenu_image_fetch_${imageResponse.status}`);
    const uploaded = await fetch(`https://api-data.line.me/v2/bot/richmenu/${encodeURIComponent(richMenuId)}/content`, {
      method: 'POST', headers: { authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`, 'content-type': 'image/jpeg' }, body: await imageResponse.arrayBuffer(),
    });
    if (!uploaded.ok) throw new Error(`richmenu_upload_${uploaded.status}:${await uploaded.text()}`);
    return richMenuId;
  }
  const definition = {
    size: { width: 2500, height: 1686 }, selected: true,
    name: `Sotocom ${language}`, chatBarText: copy.chatBar,
    areas: [
      { bounds: { x: 0, y: 0, width: 1250, height: 843 }, action: { type: 'postback', data: 'submission:menu', displayText: copy.post } },
      { bounds: { x: 1250, y: 0, width: 1250, height: 843 }, action: { type: 'uri', uri: `${PUBLIC_SITE}/ja/home/` } },
      { bounds: { x: 0, y: 843, width: 1250, height: 843 }, action: { type: 'postback', data: 'contact:menu', displayText: copy.contact } },
      { bounds: { x: 1250, y: 843, width: 1250, height: 843 }, action: { type: 'postback', data: 'settings:menu', displayText: copy.settings } },
    ],
  };
  const created = await lineApi('/v2/bot/richmenu', env.LINE_CHANNEL_ACCESS_TOKEN, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(definition) });
  if (!created.ok) throw new Error(`richmenu_create_${created.status}:${await created.text()}`);
  richMenuId = (await created.json<{ richMenuId: string }>()).richMenuId;
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`richmenu_image_fetch_${imageResponse.status}`);
  const uploaded = await fetch(`https://api-data.line.me/v2/bot/richmenu/${encodeURIComponent(richMenuId)}/content`, {
    method: 'POST', headers: { authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`, 'content-type': imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg' }, body: await imageResponse.arrayBuffer(),
  });
  if (!uploaded.ok) throw new Error(`richmenu_upload_${uploaded.status}:${await uploaded.text()}`);
  await env.DB.prepare(`INSERT INTO rich_menus (language, rich_menu_id, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(language) DO UPDATE SET rich_menu_id = excluded.rich_menu_id, updated_at = datetime('now')`).bind(language, richMenuId).run();
  return richMenuId;
}

async function setupRichMenus(env: Env) {
  const japanese = await createRichMenu('ja', `${PUBLIC_SITE}/images/line/rich-menu.jpg`, env, true);
  const traditionalChinese = await createRichMenu('zh-TW', `${PUBLIC_SITE}/images/line/rich-menu-zh-TW.jpg`, env, true);
  const simplifiedChinese = await createRichMenu('zh-CN', `${PUBLIC_SITE}/images/line/rich-menu-zh-CN.jpg`, env, true);
  const english = await createRichMenu('en', `${PUBLIC_SITE}/images/line/rich-menu-en.jpg`, env, true);
  const korean = await createRichMenu('ko', `${PUBLIC_SITE}/images/line/rich-menu-ko-full.jpg`, env, true);
  const vietnamese = await createRichMenu('vi', `${PUBLIC_SITE}/images/line/rich-menu-vi.jpg`, env, true);
  const nepali = await createRichMenu('ne', `${PUBLIC_SITE}/images/line/rich-menu-ne.jpg`, env, true);
  const tagalog = await createRichMenu('tl', `${PUBLIC_SITE}/images/line/rich-menu-tl.jpg`, env, true);
  const indonesian = await createRichMenu('id', `${PUBLIC_SITE}/images/line/rich-menu-id.jpg`, env, true);
  const portuguese = await createRichMenu('pt', `${PUBLIC_SITE}/images/line/rich-menu-pt.jpg`, env, true);
  const thai = await createRichMenu('th', `${PUBLIC_SITE}/images/line/rich-menu-th.jpg`, env, true);
  await lineApi(`/v2/bot/user/all/richmenu/${encodeURIComponent(japanese)}`, env.LINE_CHANNEL_ACCESS_TOKEN, { method: 'POST' });
  const users = await env.DB.prepare("SELECT line_user_id, language FROM line_users WHERE language IS NOT NULL").all<{ line_user_id: string; language: string }>();
  for (const user of users.results) await linkRichMenu(user.line_user_id, user.language, env);
  return { japanese, traditionalChinese, simplifiedChinese, english, korean, vietnamese, nepali, tagalog, indonesian, portuguese, thai };
}

async function handleInquiryText(userId: string, displayName: string, language: string, text: string, env: Env) {
  let inquiry = await env.DB.prepare("SELECT id FROM inquiries WHERE line_user_id = ? AND status = 'open' ORDER BY updated_at DESC LIMIT 1").bind(userId).first<{ id: number }>();
  if (!inquiry) {
    await env.DB.prepare("INSERT INTO inquiries (line_user_id, user_language) VALUES (?, ?)").bind(userId, language).run();
    inquiry = await env.DB.prepare("SELECT id FROM inquiries WHERE line_user_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1").bind(userId).first<{ id: number }>();
  }
  if (!inquiry?.id) throw new Error('inquiry_create_failed');
  await env.DB.prepare(`INSERT INTO inquiry_messages (inquiry_id, sender, original_language, original_text, translated_language, translated_text)
    VALUES (?, 'user', ?, ?, 'zh-TW', ?)`).bind(inquiry.id, language, text, text).run();
  await env.DB.prepare("UPDATE inquiries SET updated_at = datetime('now') WHERE id = ?").bind(inquiry.id).run();
  const translated = directInquiryLanguages.has(language) ? text : await translateText(text, language, 'zh-TW', env);
  await env.DB.prepare("UPDATE inquiry_messages SET translated_text = ? WHERE id = (SELECT MAX(id) FROM inquiry_messages WHERE inquiry_id = ? AND sender = 'user')").bind(translated, inquiry.id).run();
  const admins = await env.DB.prepare('SELECT line_user_id FROM line_users WHERE is_admin = 1').all<{ line_user_id: string }>();
  const notice = `📩 問い合わせ #${inquiry.id}\n投稿者：${displayName}\n語言：${language}\n\n原文：\n${text}\n\n繁中翻譯：\n${translated}\n\n回覆格式：#${inquiry.id} 回覆內容`;
  for (const admin of admins.results) {
    const response = await pushLine(admin.line_user_id, [{ type: 'text', text: notice.slice(0, 5000) }], env.LINE_CHANNEL_ACCESS_TOKEN);
    if (!response.ok) console.error(JSON.stringify({ error: 'admin_inquiry_push_failed', inquiryId: inquiry.id, status: response.status, body: await response.text() }));
  }
  await env.DB.prepare('UPDATE line_users SET conversation_mode = NULL WHERE line_user_id = ?').bind(userId).run();
  return inquiry.id;
}

async function handleAdminReply(adminId: string, inquiryId: number, text: string, env: Env) {
  const admin = await env.DB.prepare('SELECT is_admin FROM line_users WHERE line_user_id = ?').bind(adminId).first<{ is_admin: number }>();
  if (!admin?.is_admin) return false;
  const inquiry = await env.DB.prepare('SELECT line_user_id, user_language FROM inquiries WHERE id = ?').bind(inquiryId).first<{ line_user_id: string; user_language: string }>();
  if (!inquiry) return false;
  // The administrator may reply in any language. DeepL detects the source language automatically.
  const translated = directInquiryLanguages.has(inquiry.user_language)
    ? (await translateText(text, 'auto', inquiry.user_language, env))
    : await translateText(text, 'auto', inquiry.user_language, env);
  await env.DB.prepare(`INSERT INTO inquiry_messages (inquiry_id, sender, original_language, original_text, translated_language, translated_text)
    VALUES (?, 'admin', 'auto', ?, ?, ?)`).bind(inquiryId, text, inquiry.user_language, translated).run();
  await env.DB.prepare("UPDATE inquiries SET updated_at = datetime('now') WHERE id = ?").bind(inquiryId).run();
  await pushLine(inquiry.line_user_id, [{ type: 'text', text: translated.slice(0, 5000) }], env.LINE_CHANNEL_ACCESS_TOKEN);
  return true;
}

async function getMessagingProfile(userId: string, token: string) {
  const response = await lineApi(`/v2/bot/profile/${encodeURIComponent(userId)}`, token);
  if (!response.ok) return null;
  return response.json<{ displayName?: string; pictureUrl?: string }>();
}

async function verifyIdToken(idToken: string, channelId: string): Promise<LineIdentity | null> {
  if (!idToken || !channelId) return null;
  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
  });
  if (!response.ok) return null;
  const result = await response.json<LineIdentity>();
  return result.sub ? result : null;
}

async function copyAvatar(url: string | undefined, userId: string, env: Env) {
  if (!url || !url.startsWith('https://')) return null;
  const response = await fetch(url);
  if (!response.ok || !response.body) return null;
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) return null;
  const key = `avatars/line/${userId}`;
  await env.PHOTOS.put(key, response.body, { httpMetadata: { contentType } });
  return key;
}

function languageQuestion() {
  return {
    type: 'text',
    text: '歡迎加入 Sotocom！まず、使用する言語を選んでください。\nPlease choose your language.',
    quickReply: { items: languages.map(([code, label]) => ({ type: 'action', action: { type: 'postback', label, data: `onboarding:language:${code}`, displayText: label } })) },
  };
}

function nationalityQuestion(language: string) {
  const text = language === 'zh-TW' ? '請選擇你的國籍。' : language === 'zh-CN' ? '请选择你的国籍。' : language === 'en' ? 'Please choose your nationality.' : language === 'ko' ? '국적을 선택해 주세요.' : language === 'vi' ? 'Vui lòng chọn quốc tịch của bạn.' : '国籍を選んでください。';
  return {
    type: 'text',
    text,
    quickReply: { items: nationalities.map(([code, label]) => ({ type: 'action', action: { type: 'postback', label, data: `onboarding:nationality:${code}`, displayText: label } })) },
  };
}

function completedMessage(language: string) {
  const text = language === 'zh-TW' ? '設定完成！投稿時，名字旁邊會顯示你的國旗。' : language === 'zh-CN' ? '设置完成！投稿时，名字旁边会显示你的国旗。' : language === 'en' ? 'Setup complete! Your flag will appear beside your name when you post.' : language === 'ko' ? '설정 완료! 게시할 때 이름 옆에 국기가 표시됩니다.' : language === 'vi' ? 'Đã hoàn tất! Cờ quốc gia sẽ hiển thị cạnh tên khi bạn đăng bài.' : '設定が完了しました。投稿時に名前の横へ国旗が表示されます。';
  return { type: 'text', text };
}

function profileSetupMessage() {
  return {
    type: 'text',
    text: '投稿前に、国籍と言語を設定してください。\n請先設定國籍與使用語言。',
    quickReply: { items: [{ type: 'action', action: { type: 'uri', label: '国籍・言語を設定', uri: `${LIFF_URL}?mode=profile` } }] },
  };
}

function typeMessage() {
  return {
    type: 'text', text: '投稿するカテゴリーを選んでください。',
    quickReply: { items: submissionTypes.map(([value, label]) => ({ type: 'action', action: { type: 'postback', label, data: `submission:type:${value}`, displayText: label } })) },
  };
}

function settingsMessage() {
  return { type: 'text', text: '何を設定しますか？', quickReply: { items: [{ type: 'action', action: { type: 'postback', label: '言語を変更', data: 'settings:language', displayText: '言語を変更' } }] } };
}

function languageSettingsMessage() {
  return { type: 'text', text: '表示する言語を選択してください。国籍は変更できません。', quickReply: { items: [{ type: 'action', action: { type: 'uri', label: '言語を選択する', uri: `${LIFF_URL}?mode=language` } }] } };
}

function contactMessage() {
  return { type: 'text', text: 'お問い合わせはこちらから送信できます。', quickReply: { items: [{ type: 'action', action: { type: 'uri', label: 'お問い合わせ', uri: `${PUBLIC_SITE}/ja/help-request/` } }] } };
}

function liffMessage(value: string) {
  const label = submissionTypes.find(([key]) => key === value)?.[1] || '投稿';
  return { type: 'text', text: `${label}の投稿フォームを開いてください。`, quickReply: { items: [{ type: 'action', action: { type: 'uri', label: '投稿フォームを開く', uri: `${LIFF_URL}?type=${encodeURIComponent(value)}` } }] } };
}

async function ensureUser(userId: string, displayName: string, pictureUrl: string | undefined, env: Env) {
  const existing = await env.DB.prepare('SELECT line_user_id, avatar_key FROM line_users WHERE line_user_id = ?').bind(userId).first<{ line_user_id: string; avatar_key: string | null }>();
  const avatarKey = pictureUrl && (!existing || !existing.avatar_key) ? await copyAvatar(pictureUrl, userId, env) : existing?.avatar_key || null;
  const defaultAvatar = crypto.getRandomValues(new Uint32Array(1))[0] % 10 + 1;
  await env.DB.prepare(`INSERT INTO line_users (line_user_id, display_name, avatar_key, default_avatar, onboarding_step, updated_at)
    VALUES (?, ?, ?, ?, 'language', datetime('now'))
    ON CONFLICT(line_user_id) DO UPDATE SET display_name = excluded.display_name, avatar_key = COALESCE(excluded.avatar_key, line_users.avatar_key), updated_at = datetime('now')`)
    .bind(userId, displayName, avatarKey, defaultAvatar).run();
}

async function handleWebhookEvent(event: LineEvent, env: Env, ctx?: ExecutionContext) {
  const userId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!userId || !replyToken) return;

  if (event.type === 'follow') {
    const profile = await getMessagingProfile(userId, env.LINE_CHANNEL_ACCESS_TOKEN);
    await ensureUser(userId, profile?.displayName || 'LINEユーザー', profile?.pictureUrl, env);
    const savedProfile = await env.DB.prepare('SELECT language, nationality_code FROM line_users WHERE line_user_id = ?').bind(userId).first<{ language: string | null; nationality_code: string | null }>();
    if (!savedProfile?.language || !savedProfile?.nationality_code) {
      await replyLine(replyToken, [profileSetupMessage()], env.LINE_CHANNEL_ACCESS_TOKEN);
    } else {
      await replyLine(replyToken, [{ type: 'text', text: 'おかえりなさい。登録済みのプロフィールをそのまま利用できます。' }], env.LINE_CHANNEL_ACCESS_TOKEN);
    }
    return;
  }

  const profile = await env.DB.prepare('SELECT display_name, language, nationality_code, is_admin, conversation_mode FROM line_users WHERE line_user_id = ?').bind(userId).first<{ display_name: string; language: string | null; nationality_code: string | null; is_admin: number; conversation_mode: string | null }>();
  if (!profile) {
    const lineProfile = await getMessagingProfile(userId, env.LINE_CHANNEL_ACCESS_TOKEN);
    await ensureUser(userId, lineProfile?.displayName || 'LINEユーザー', lineProfile?.pictureUrl, env);
    await replyLine(replyToken, [profileSetupMessage()], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const postback = String(event.postback?.data || '');
  if (event.type === 'postback' && postback.startsWith('onboarding:language:')) {
    const language = postback.slice('onboarding:language:'.length);
    if (!languages.some(([code]) => code === language)) return;
    await env.DB.prepare("UPDATE line_users SET language = ?, onboarding_step = 'nationality', updated_at = datetime('now') WHERE line_user_id = ?").bind(language, userId).run();
    await linkRichMenu(userId, language, env);
    await replyLine(replyToken, [await localizeLineMessage(nationalityQuestion(language), language, env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback.startsWith('onboarding:nationality:')) {
    const code = postback.slice('onboarding:nationality:'.length);
    const nationality = nationalities.find(([value]) => value === code);
    if (!nationality) return;
    await env.DB.prepare("UPDATE line_users SET nationality_code = ?, nationality_label = ?, onboarding_step = 'complete', updated_at = datetime('now') WHERE line_user_id = ?").bind(nationality[0], nationality[1], userId).run();
    await replyLine(replyToken, [completedMessage(profile.language || 'ja'), await localizeLineMessage(typeMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (!profile.language) {
    await replyLine(replyToken, [profileSetupMessage()], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (!profile.nationality_code) {
    await replyLine(replyToken, [profileSetupMessage()], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback.startsWith('submission:type:')) {
    const value = postback.slice('submission:type:'.length);
    await replyLine(replyToken, [await localizeLineMessage(submissionTypes.some(([key]) => key === value) ? liffMessage(value) : typeMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback === 'submission:menu') {
    await replyLine(replyToken, [await localizeLineMessage(typeMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback === 'settings:menu') {
    await replyLine(replyToken, [await localizeLineMessage(settingsMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback === 'settings:language') {
    await replyLine(replyToken, [await localizeLineMessage(languageSettingsMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (event.type === 'postback' && postback === 'contact:menu') {
    await env.DB.prepare("UPDATE line_users SET conversation_mode = 'inquiry' WHERE line_user_id = ?").bind(userId).run();
    await replyLine(replyToken, [await localizedTextMessage('お問い合わせ内容をメッセージで送ってください。担当者へ翻訳してお届けします。', profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  const incomingText = event.message?.type === 'text' ? String(event.message.text || '').trim() : '';
  const adminReply = incomingText.match(/^#(\d+)\s+([\s\S]+)/);
  if (adminReply && profile.is_admin) {
    const sent = await handleAdminReply(userId, Number(adminReply[1]), adminReply[2].trim(), env);
    await replyLine(replyToken, [{ type: 'text', text: sent ? `問い合わせ #${adminReply[1]} へ翻訳して送信しました。` : '案件番号が見つかりません。' }], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (profile.is_admin && incomingText === '/setup-richmenus') {
    await replyLine(replyToken, [{ type: 'text', text: 'Rich Menuの登録を開始しました。完了後に結果をお知らせします。' }], env.LINE_CHANNEL_ACCESS_TOKEN);
    const setup = (async () => {
      try {
        const menus = await setupRichMenus(env);
        await pushLine(userId, [{ type: 'text', text: `Rich Menuを登録しました。\n11言語のメニューを登録しました。\n日本語: ${menus.japanese}\n繁體中文: ${menus.traditionalChinese}\n简体中文: ${menus.simplifiedChinese}\nEnglish: ${menus.english}\n한국어: ${menus.korean}\nTiếng Việt: ${menus.vietnamese}\nनेपाली: ${menus.nepali}\nTagalog: ${menus.tagalog}\nIndonesia: ${menus.indonesian}\nPortuguês: ${menus.portuguese}\nไทย: ${menus.thai}` }], env.LINE_CHANNEL_ACCESS_TOKEN);
      } catch (error) {
        await pushLine(userId, [{ type: 'text', text: `Rich Menu登録に失敗しました：${error instanceof Error ? error.message : String(error)}`.slice(0, 5000) }], env.LINE_CHANNEL_ACCESS_TOKEN);
      }
    })();
    if (ctx) ctx.waitUntil(setup);
    else await setup;
    return;
  }
  if (incomingText && profile.conversation_mode === 'inquiry') {
    const inquiryId = await handleInquiryText(userId, profile.display_name || 'LINEユーザー', profile.language || 'ja', incomingText, env);
    await replyLine(replyToken, [await localizedTextMessage(`お問い合わせ #${inquiryId} を受け付けました。担当者からこのLINEへ返信します。`, profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }
  if (incomingText && /^(投稿|投稿する|我要投稿)$/i.test(incomingText)) {
    await replyLine(replyToken, [await localizeLineMessage(typeMessage(), profile.language || 'ja', env)], env.LINE_CHANNEL_ACCESS_TOKEN);
  }
}

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('origin') || '';
    const allowedOrigin = resolveAllowedOrigin(origin, env.ALLOWED_ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'access-control-allow-origin': allowedOrigin,
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    }});

    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/webhook') {
      const raw = await request.text();
      if (!(await verifySignature(request, raw, env.LINE_CHANNEL_SECRET))) return new Response('Bad signature', { status: 401 });
      const eventBody = JSON.parse(raw) as { events?: LineEvent[] };
      for (const event of eventBody.events || []) await handleWebhookEvent(event, env, ctx);
      return new Response('OK');
    }

    if (request.method === 'GET' && url.pathname === '/api/avatars') {
      const key = url.searchParams.get('key') || '';
      if (!key.startsWith('avatars/line/') || key.includes('..')) return json({ ok: false, error: 'invalid_avatar_key' }, 400, allowedOrigin);
      const object = await env.PHOTOS.get(key);
      if (!object) return json({ ok: false, error: 'avatar_not_found' }, 404, allowedOrigin);
      return new Response(object.body, { headers: {
        'content-type': object.httpMetadata?.contentType || 'image/jpeg',
        'access-control-allow-origin': allowedOrigin,
        'cache-control': 'public, max-age=86400',
      }});
    }

    if (request.method === 'GET' && url.pathname === '/api/photos') {
      const key = url.searchParams.get('key') || '';
      if (!key.startsWith('submissions/') || key.includes('..')) return json({ ok: false, error: 'invalid_photo_key' }, 400, allowedOrigin);
      const published = await env.DB.prepare("SELECT id FROM submissions WHERE status = 'published' AND instr(payload, ?) > 0 LIMIT 1").bind(key).first();
      if (!published) return json({ ok: false, error: 'photo_not_found' }, 404, allowedOrigin);
      const object = await env.PHOTOS.get(key);
      if (!object) return json({ ok: false, error: 'photo_not_found' }, 404, allowedOrigin);
      return new Response(object.body, { headers: {
        'content-type': object.httpMetadata?.contentType || 'application/octet-stream',
        'access-control-allow-origin': allowedOrigin,
        'cache-control': 'public, max-age=3600',
      }});
    }

    if (request.method === 'GET' && url.pathname === '/api/profile') {
      const identity = await verifyIdToken(getBearerToken(request), env.LINE_LOGIN_CHANNEL_ID);
      if (!identity) return json({ ok: false, error: 'invalid_line_login' }, 401, allowedOrigin);
      await ensureUser(identity.sub, identity.name || 'LINEユーザー', identity.picture, env);
      const user = await env.DB.prepare('SELECT display_name, avatar_key, default_avatar, nationality_code, nationality_label, language FROM line_users WHERE line_user_id = ?').bind(identity.sub).first();
      if (user?.nationality_code && user?.nationality_label) {
        await env.DB.prepare("UPDATE submissions SET author_nationality_code = ?, author_nationality_label = ? WHERE line_user_id = ? AND type = 'listings' AND (author_nationality_code IS NULL OR author_nationality_code = '')")
          .bind(user.nationality_code, user.nationality_label, identity.sub).run();
      }
      return json({ ok: true, profile: user }, 200, allowedOrigin);
    }

    if (request.method === 'POST' && url.pathname === '/api/profile') {
      const identity = await verifyIdToken(getBearerToken(request), env.LINE_LOGIN_CHANNEL_ID);
      if (!identity) return json({ ok: false, error: 'invalid_line_login' }, 401, allowedOrigin);
      const body = await request.json<{ nationalityCode?: string; languageCode?: string }>();
      const nationalityCode = String(body.nationalityCode || '').toUpperCase();
      const languageCode = String(body.languageCode || '').trim().replace(/^([a-z]{2,3})(?:-([A-Za-z]{2}))?$/, (_match, base, region) => base.toLowerCase() + (region ? '-' + region.toUpperCase() : ''));
      if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(languageCode) || !languages.some(([code]) => code === languageCode)) return json({ ok: false, error: 'invalid_profile_options' }, 400, allowedOrigin);
      const existing = await env.DB.prepare('SELECT nationality_code, nationality_label FROM line_users WHERE line_user_id = ?').bind(identity.sub).first<{ nationality_code: string | null; nationality_label: string | null }>();
      const submittedNationality = /^[A-Z]{2}$/.test(nationalityCode) || nationalityCode === 'OTHER' ? nationalityCode : '';
      const finalNationalityCode = submittedNationality || existing?.nationality_code || null;
      let nationalityLabel = existing?.nationality_label || null;
      if (submittedNationality === 'OTHER') nationalityLabel = 'その他';
      if (/^[A-Z]{2}$/.test(submittedNationality)) {
        try { nationalityLabel = new Intl.DisplayNames(['ja'], { type: 'region' }).of(submittedNationality) || submittedNationality; } catch { nationalityLabel = submittedNationality; }
      }
      if (!finalNationalityCode || !nationalityLabel) return json({ ok: false, error: 'nationality_required' }, 409, allowedOrigin);
      let languageLabel = languageCode;
      try { languageLabel = new Intl.DisplayNames(['ja'], { type: 'language' }).of(languageCode) || languageCode; } catch {}
      await ensureUser(identity.sub, identity.name || 'LINEユーザー', identity.picture, env);
      await env.DB.prepare("UPDATE line_users SET nationality_code = ?, nationality_label = ?, language = ?, onboarding_step = 'complete', updated_at = datetime('now') WHERE line_user_id = ?")
        .bind(finalNationalityCode, nationalityLabel, languageCode, identity.sub).run();
      await env.DB.prepare("UPDATE submissions SET author_nationality_code = ?, author_nationality_label = ? WHERE line_user_id = ? AND type = 'listings' AND (author_nationality_code IS NULL OR author_nationality_code = '')")
        .bind(finalNationalityCode, nationalityLabel, identity.sub).run();
      await linkRichMenu(identity.sub, languageCode, env);
      return json({ ok: true, profile: { nationality_code: finalNationalityCode, nationality_label: nationalityLabel, language: languageCode, language_label: languageLabel } }, 200, allowedOrigin);
    }

    if (request.method === 'GET' && url.pathname === '/api/submissions') {
      const type = url.searchParams.get('type');
      const fields = `s.id, s.type, s.payload, s.display_name, s.avatar_url,
        CASE WHEN s.type = 'listings' THEN COALESCE(s.author_nationality_code, u.nationality_code) ELSE NULL END AS author_nationality_code,
        CASE WHEN s.type = 'listings' THEN COALESCE(s.author_nationality_label, u.nationality_label) ELSE NULL END AS author_nationality_label,
        s.created_at`;
      const query = type && submissionTypes.some(([value]) => value === type)
        ? env.DB.prepare(`SELECT ${fields} FROM submissions s LEFT JOIN line_users u ON u.line_user_id = s.line_user_id WHERE s.type = ? AND s.status = 'published' ORDER BY s.created_at DESC LIMIT 50`).bind(type)
        : env.DB.prepare(`SELECT ${fields} FROM submissions s LEFT JOIN line_users u ON u.line_user_id = s.line_user_id WHERE s.status = 'published' ORDER BY s.created_at DESC LIMIT 100`);
      const result = await query.all<Record<string, unknown> & { id: number; payload: string; avatar_url?: string | null }>();
      return json({ ok: true, submissions: result.results.map((row) => ({
        ...row,
        avatar_url: row.avatar_url || `${PUBLIC_SITE}/images/avatars/avatar-${String((row.id - 1) % 10 + 1).padStart(2, '0')}.webp`,
        payload: JSON.parse(row.payload),
      })) }, 200, allowedOrigin);
    }

    if (request.method !== 'POST' || url.pathname !== '/api/submissions') return json({ ok: true, service: 'sotocom-api' }, 200, allowedOrigin);

    try {
      const identity = await verifyIdToken(getBearerToken(request), env.LINE_LOGIN_CHANNEL_ID);
      if (!identity) return json({ ok: false, error: 'invalid_line_login' }, 401, allowedOrigin);
      await ensureUser(identity.sub, identity.name || 'LINEユーザー', identity.picture, env);
      const user = await env.DB.prepare('SELECT avatar_key, default_avatar, nationality_code, nationality_label FROM line_users WHERE line_user_id = ?').bind(identity.sub).first<{ avatar_key: string | null; default_avatar: number; nationality_code: string | null; nationality_label: string | null }>();
      if (!user?.nationality_code) return json({ ok: false, error: 'profile_required' }, 409, allowedOrigin);

      const formData = await request.formData();
      const body = JSON.parse(String(formData.get('submission') || '{}')) as Record<string, unknown>;
      const type = typeof body.type === 'string' ? body.type : '';
      const payload = body.payload && typeof body.payload === 'object' ? body.payload : null;
      const nameMode = body.publishNameMode === 'private' || body.publishNameMode === 'custom' ? body.publishNameMode : 'line';
      const requestedName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 30) : '';
      const displayName = nameMode === 'line' ? (identity.name || 'LINEユーザー') : nameMode === 'private' ? '非公開' : requestedName;
      const avatarMode = body.publishAvatarMode === 'private' ? 'private' : 'line';
      const requestedAvatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : '';
      const selectedAvatarUrl = /^\/images\/avatars\/avatar-(0[1-9]|10)\.webp$/.test(requestedAvatarUrl) ? `${PUBLIC_SITE}${requestedAvatarUrl}` : '';
      if (!submissionTypes.some(([value]) => value === type) || !payload || !displayName) return json({ ok: false, error: 'invalid_submission' }, 400, allowedOrigin);

      const photoKeys: string[] = [];
      for (const entry of formData.getAll('photos')) {
        if (!(entry instanceof File) || !entry.size) continue;
        if (!entry.type.startsWith('image/') || entry.size > 8 * 1024 * 1024 || photoKeys.length >= 8) return json({ ok: false, error: 'invalid_photo' }, 400, allowedOrigin);
        const key = `submissions/${crypto.randomUUID()}-${entry.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        await env.PHOTOS.put(key, entry.stream(), { httpMetadata: { contentType: entry.type } });
        photoKeys.push(key);
      }
      const defaultAvatar = Math.max(1, Math.min(10, user?.default_avatar || 1));
      const avatarUrl = avatarMode === 'line' && user?.avatar_key
        ? `${API_BASE}/api/avatars?key=${encodeURIComponent(user.avatar_key)}`
        : selectedAvatarUrl
          ? selectedAvatarUrl
        : `${PUBLIC_SITE}/images/avatars/avatar-${String(defaultAvatar).padStart(2, '0')}.webp`;
      const storedPayload = { ...(payload as Record<string, unknown>), photoKeys };
      await env.DB.prepare(`INSERT INTO submissions (type, payload, line_user_id, display_name, avatar_url, author_nationality_code, author_nationality_label, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`)
        .bind(type, JSON.stringify(storedPayload), identity.sub, displayName, avatarUrl, user?.nationality_code || '', user?.nationality_label || '').run();
      return json({ ok: true, status: 'published' }, 201, allowedOrigin);
    } catch (error) {
      console.error(JSON.stringify({ error: 'submission_failed', message: error instanceof Error ? error.message : String(error) }));
      return json({ ok: false, error: 'invalid_request' }, 400, allowedOrigin);
    }
  },
} satisfies ExportedHandler<Env>;
