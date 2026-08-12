import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const territoriesSource = JSON.parse(await readFile(join(tmpdir(), 'cldr-territories-ja.json'), 'utf8'));
const languagesSource = JSON.parse(await readFile(join(tmpdir(), 'cldr-languages-ja.json'), 'utf8'));
const territories = territoriesSource.main.ja.localeDisplayNames.territories;
const languages = languagesSource.main.ja.localeDisplayNames.languages;
const languageCodes = [
  ['ja', '日本語'], ['en', 'English'], ['zh-CN', '中文（简体）'], ['zh-TW', '中文（繁體）'], ['ko', '한국어'], ['id', 'Orang indonesia'], ['es', 'Español'], ['th', 'ภาษาไทย'], ['mn', 'Монгол'], ['tl', 'Tagalog'], ['pt', 'Português'], ['vi', 'Tiếng việt'], ['my', 'မြန်မာ'], ['ne', 'नेपाली'], ['km', 'ខ្មែរ'], ['fr', 'Le français'], ['de', 'Deutsch'], ['ru', 'русский'], ['ar', 'لعربية'], ['it', 'Italiano'], ['af', 'Afrikaans'], ['am', 'አማርኛ'], ['az', 'Azərbaycan'], ['be', 'Беларус'], ['bg', 'български'], ['bn', 'বাঙালি'], ['bs', 'Bosanski'], ['ca', 'Català'], ['ceb', 'Cebuano'], ['co', 'Corsu'], ['cs', 'Česky'], ['cy', 'Cymraeg'], ['da', 'dansk'], ['el', 'Ελληνικά'], ['eo', 'Esperanto'], ['et', 'Eestlane'], ['eu', 'Euskal'], ['fa', 'فارسی'], ['fi', 'suomalainen'], ['fy', 'Frysk'], ['ga', 'Gaeilge'], ['gd', 'Gàidhlig na h-Alba'], ['gl', 'Galego'], ['gu', 'ગુજરાતી'], ['ha', 'Hausa'], ['haw', 'ʻŌlelo Hawaiʻi'], ['hi', 'हिन्दी'], ['hmn', 'Hmong'], ['hr', 'hrvatski'], ['ht', 'Ayisyen'], ['hu', 'magyar'], ['hy', 'Հայերեն'], ['ig', 'Ndi Igbo'], ['is', 'Íslensku'], ['iw', 'עברית'], ['jw', 'Basa jawa'], ['ka', 'ქართული'], ['kk', 'Қазақ'], ['kn', 'ಕನ್ನಡ'], ['ku', 'Kurdî'], ['ky', 'Kirghiz'], ['la', 'Latine'], ['lb', 'Lëtzebuergesch'], ['lo', 'ລາວ'], ['lt', 'Lietuvis'], ['lv', 'Latvietis'], ['mg', 'Malagasy'], ['mi', 'Maori'], ['mk', 'Македонски'], ['ml', 'മലയാളം'], ['mr', 'मराठी'], ['ms', 'Melayu'], ['mt', 'Malti'], ['nl', 'Nederlands'], ['no', 'norsk'], ['ny', 'Chewa'], ['or', 'ଓଡିଆ'], ['pa', 'ਪੰਜਾਬੀ'], ['pl', 'Polski'], ['ps', 'پښتو'], ['ro', 'românesc'], ['rw', 'Kinyarwanda'], ['sd', 'سنڌي'], ['si', 'සිංහල'], ['sk', 'slovenský'], ['sl', 'Slovensko'], ['sm', 'Samoa'], ['sn', 'Shona'], ['so', 'Soomaali'], ['sq', 'Shqiptar'], ['sr', 'Српски'], ['st', 'Sotho'], ['su', 'Urang Sunda'], ['sv', 'Svenska'], ['sw', 'Kiswahili'], ['ta', 'தமிழ் மொழி'], ['te', 'తెలుగు'], ['tg', 'Точик'], ['tk', 'Türkmenler'], ['tr', 'Türk'], ['tt', 'Татар'], ['ug', 'ئۇيغۇر'], ['uk', 'Українська'], ['ur', 'اردو'], ['uz', "O'zbek"], ['xh', 'IsiXhosa'], ['yi', 'ייดีש'], ['yo', 'Yoruba'], ['zu', 'IsiZulu'],
];
const nonIsoRegions = new Set(['AC', 'CP', 'CQ', 'DG', 'EA', 'IC', 'TA', 'XK', 'EU', 'EZ', 'UN', 'XA', 'XB', 'ZZ', 'QO']);

const countries = Object.entries(territories)
  .filter(([code]) => /^[A-Z]{2}$/.test(code) && !nonIsoRegions.has(code))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const allLanguages = languageCodes.map(([code, fallbackName]) => ({
  code,
  name: fallbackName || languages[code] || code,
}));

await writeFile('src/data/profile-options.json', `${JSON.stringify({ countries, languages: allLanguages }, null, 2)}\n`, 'utf8');
console.log(`Generated ${countries.length} countries and ${allLanguages.length} languages.`);
