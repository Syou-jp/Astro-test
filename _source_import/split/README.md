# 和-LIFE 網站頁面拆分套件

已將 `preview.html`（原檔 6140 行）拆成 **共用外殼 + 29 個頁面片段**，
方便你單獨編輯每個頁面，最後用腳本一鍵組回完整檔案。

已驗證：`build.py` 組出來的檔案與原始 `preview.html` **逐字元完全相同**（MD5 一致）。

## 資料夾結構

```
split/
├── shared/
│   ├── _head.html      共用外殼開頭：字體、CSS、頂部選單列(masthead)、
│   │                   分頁導覽列(tab-bar)、語言選單 —— 全站共用，改一次全站生效
│   └── _footer.html     共用外殼結尾：關閉標籤、廣告合作按鈕/彈窗、
│                        所有 JavaScript（含全部語言翻譯字典、
│                        車站資料庫、分頁切換邏輯等）
├── pages/                29 個檔案，純英文檔名（避免壓縮檔在不同系統
│                        下因中日文檔名編碼問題而打不開／內容跑掉）
├── manifest.json        記錄頁面順序與檔名對應（build.py 用）
└── build.py              重組腳本
```

### 檔名對照表

| 檔案 | 頁面 |
|---|---|
| 00-about.html | 關於我們 |
| 01-rent.html | 初期費用計算機 |
| 02-tax-realestate.html | 不動産の税金 |
| 03-loan.html | 住宅ローン計算 |
| 04-area.html | 面積單位換算 |
| 05-route.html | 距離・交通時間（2026/7 已併入「通勤定期券費用試算」） |
| 30-listings.html | 房源招租（新頁面，2026/7 新增：找合租／找租客） |
| 06-documents.html | 書類作成（2026/7 已合併 `07-business-docs.html`，內部分「ビジネス書類」「仲介用書類」兩個籤，前者在前） |
| 08-airport.html | 空港アクセス |
| 09-utilities.html | 電気・ガス・水道 |
| 10-living.html | 生活費計算 |
| 11-tax-personal.html | 個人・法人の税金 |
| 11b-legal.html | 行政書士料金 |
| 12-car-all.html | 中古車・車検・免許 |
| 13-waste.html | 粗大ごみ |
| 14-bank.html | 銀行口座開設 |
| 15-commuter.html | ~~通勤定期券計算~~（2026/7 已併入 `05-route.html`，此檔案已刪除） |
| 16-visa.html | 在留資格更新 |
| 17-japanese.html | 日本語学習資源 |
| 18-ward-office.html | 区役所手続 |
| 19-sim.html | 携帯電話SIM |
| 20-internet.html | インターネット回線 |
| 21-moveout.html | 退去費用 |
| 22-fire-insurance.html | 火災保険 |
| 23-holidays.html | 国民の祝日 |
| 24-nisa.html | 新NISA計算機（2026/7 已改名，原「NISA計算」） |
| 25-services.html | 外国語対応サービス |
| 26-jobs.html | 求人・採用 |
| 27-friend-offers.html | お得情報（2026/7 已改名並搬入「生活」分類，原「紹介コード・特典」／獨立的「お得・紹介」分類已移除） |
| 28-consumption-tax.html | 消費税計算機（新頁面，2026/7 新增） |
| 29-income-tax.html | 確定申告計算機（新頁面，2026/7 新增） |

> `24-nisa.html`（新NISA計算機）已在 2026/7 更新，加入實際的複利試算計算機。

## 怎麼用

### 編輯單一頁面
直接打開 `pages/` 底下對應的檔案修改內容（HTML／文字／連結等）即可，
不用管其他頁面或共用檔案。

⚠️ 有幾點要注意：
- 每個頁面檔案**只有內容片段**，不是完整可雙擊開啟的網頁（因為字體、CSS、
  語言切換 JS 都在 `shared/` 裡，是全站共用的）。要預覽效果，請執行下方的
  組回步驟後，用瀏覽器打開組回的完整檔案。
- 若某頁面的翻譯字典（例如水道頁面的 `WATER_PAGE_COPY`）是寫在
  `shared/_footer.html` 裡（而不是頁面片段本身），修改該頁文字時記得去
  `_footer.html` 裡搜尋對應的 key 修改。可以用你的編輯器全域搜尋頁面上
  看到的中文/日文字串去定位。
- 若要新增/刪除頁面分頁按鈕，要改 `shared/_head.html` 裡的 tab-bar 區塊。

### 組回完整檔案
在 `split/` 資料夾內執行：

```bash
python3 build.py
```

會輸出 `preview.built.html`，即為組合後的完整網站，可直接雙擊在瀏覽器開啟，
或上傳取代原本的 `preview.html`。

### 增減頁面
`manifest.json` 決定組回時頁面的排列順序，格式如下：

```json
[
  { "id": "page-about", "file": "00-about-關於我們.html" },
  { "id": "page-rent", "file": "01-rent-初期費用計算機.html" },
  ...
]
```

如果要**刪除**某個頁面：把該項目從 `manifest.json` 移除即可（同時建議也把
`shared/_head.html` 裡對應的 tab-bar 按鈕拿掉，不然選單上會出現點了沒反應的按鈕）。

如果要**新增**頁面：在 `pages/` 新建一個檔案，內容比照其他頁面的格式
（`<div id="page-xxx" class="page-view themeXXX"> ... </div>`），
再到 `manifest.json` 裡加入對應項目，並到 `shared/_head.html` 的 tab-bar
加上按鈕（`data-target="page-xxx"`）。

## 提醒

- 這個拆分是「共用殼 + 片段」的做法，不是完全獨立、可雙開的 HTML —— 這是刻意的，
  因為全站共用的字體/樣式/語言切換系統只有一份，改一次就能套用到全部頁面，
  不用在 29 個檔案裡各改一次、也不容易漏改造成不同步。
- 每次要看效果，都要跑一次 `python3 build.py` 重新組合。
