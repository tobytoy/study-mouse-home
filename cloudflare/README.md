# Study Mouse - Cloudflare 部署說明

本目錄為 Study Mouse (考鼠) 之 Cloudflare 託管與部署整合配置。

---

## 為什麼選擇 Cloudflare Pages 託管前端？

1. **完全免費，無流量限制**：
   - 免費方案包含 **無上限頻寬 (Unlimited bandwidth)**、**無並發請求限制 (Unlimited requests)**、全球 300+ 邊緣節點 Anycast CDN 快取。
   - 即使有上萬考友同時在 LINE 內打開刷題，也不會產生任何費用或被限流。
2. **極致速度與 LINE 內嵌相容**：
   - 內建 `_headers` 配置 `frame-ancestors https://*.line.me`，確保 LINE Mini App (LIFF) 在 iOS / Android 的 LINE Webview 內順暢全螢幕加載。
   - 靜態 Assets 啟用一年永久快取，二次開啟 < 30ms 秒開。

---

## 快速發布步驟 (One-Click Deploy)

### 方式 1：使用本機命令列 (Wrangler CLI)

1. 首次登入 Cloudflare（如尚未登入）：
   ```bash
   npx wrangler login
   ```
2. 執行一鍵建置與發布腳本：
   ```bash
   bash cloudflare/deploy.sh
   ```
3. 部署完成後，Wrangler 會輸出專屬網址：
   `https://study-mouse.pages.dev`

4. 將該網址複製，填入 **LINE Developers Console**：
   - 進入你的 LINE Login Channel → **LIFF** 分頁。
   - 將 **Developing** 的 `Endpoint URL` 改為：`https://study-mouse.pages.dev`。
   - 儲存後，用手機點擊 `https://miniapp.line.me/2011415192-g73n58un` 即可全螢幕體驗！

---

### 方式 2：GitHub 連動自動部署 (CI/CD 自動化)

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Compute (Workers & Pages)**。
2. 點擊 **Create application** → **Pages** → **Connect to Git**。
3. 選擇 `study-mouse-home` 儲存庫。
4. 設定建置參數：
   - **Framework preset**: `Vite`
   - **Build command**: `cd web && npm run build`
   - **Build output directory**: `web/dist`
   - **Environment variables**:
     - `VITE_LIFF_ID` = `2011415192-g73n58un`
5. 點擊 **Save and Deploy**。日後只要 push git commit，Cloudflare 自動為你更新線上題庫與介面！
