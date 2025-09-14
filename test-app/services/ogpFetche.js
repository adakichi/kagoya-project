// ogpFetcher.js
// 取得: undici / 解析: cheerio
import { request } from "undici";
import * as cheerio from "cheerio";
import { URL } from "node:url";

/**
 * @typedef {Object} FetchOgpOptions
 * @property {number}  [headersTimeout=5000]      応答ヘッダ待ち上限(ms)
 * @property {number}  [bodyTimeout=8000]         本文読み取りの停滞上限(ms)
 * @property {number}  [maxRedirects=3]           最大リダイレクト回数
 * @property {number}  [ttlSec=21600]             メモリキャッシュTTL(秒) デフォ6時間
 * @property {string}  [userAgent]                送信User-Agent
 * @property {string[]} [allowHostSuffixes]       許可ドメイン（末尾一致）例: ["tabelog.com"]
 * @property {boolean} [resolveRelativeImage=true] og:imageが相対URLなら絶対化
 */

// ---- 超シンプルなメモリキャッシュ（URLごとにTTL）----
const cache = new Map();

/**
 * 指定URLのOGP/Twitterカード/フォールバックを抽出して返す
 * 失敗時は例外を投げます（呼び出し側で握ってOK）
 * @param {string} targetUrl
 * @param {FetchOgpOptions} [opts]
 * @returns {Promise<{url:string, site:string, title:string, description:string, image:string}>}
 */
export async function fetchOgp(targetUrl, opts = {}) {
  const {
    headersTimeout = 5000,
    bodyTimeout = 8000,
    maxRedirects = 3,
    ttlSec = 60 * 60 * 6,
    userAgent = "Link-Unfurl/1.0",
    allowHostSuffixes,
    resolveRelativeImage = true,
  } = opts;

  // ---- キャッシュ命中 ----
  const now = Date.now();
  const cached = cache.get(targetUrl);
  if (cached && cached.exp > now) return cached.data;

  // ---- URL検証 & 簡易SSRF対策 ----
  let u;
  try { u = new URL(targetUrl); } catch { throw new Error("Invalid URL"); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http/https is allowed");

  if (Array.isArray(allowHostSuffixes) && allowHostSuffixes.length > 0) {
    const ok = allowHostSuffixes.some(sfx => u.hostname === sfx || u.hostname.endsWith("." + sfx));
    if (!ok) throw new Error("Domain not allowed");
  }
  const forbiddenHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (forbiddenHosts.has(u.hostname)) throw new Error("Forbidden host");

  // ---- 取得（undici）----
  const resp = await request(u.toString(), {
    method: "GET",
    headers: { "user-agent": userAgent, "accept-language": "ja,en;q=0.8" },
    maxRedirections: maxRedirects,
    headersTimeout,
    bodyTimeout,
  });
  if (resp.statusCode >= 400) throw new Error(`Fetch failed: ${resp.statusCode}`);

  const html = await resp.body.text();
  const $ = cheerio.load(html);

  // ---- 抽出ヘルパ ----
  const pick = (name) =>
    $(`meta[property="${name}"]`).attr("content") ||
    $(`meta[name="${name}"]`).attr("content") ||
    "";

  const title =
    (pick("og:title") || pick("twitter:title") || $("title").text() || "").trim();

  const description =
    (pick("og:description") ||
      pick("twitter:description") ||
      $('meta[name="description"]').attr("content") ||
      "").trim();

  let image = (pick("og:image") || pick("twitter:image") || "").trim();
  if (image && resolveRelativeImage) {
    try { image = new URL(image, u.origin).toString(); } catch { /* noop */ }
  }

  const data = {
    url: u.toString(),
    site: u.hostname,
    title,
    description,
    image, // 表示時は /img?u=... に通すと安全
  };

  cache.set(targetUrl, { data, exp: now + ttlSec * 1000 });
  return data;
}

/**
 * プロキシ画像URLを生成（外部直リンクを避ける）
 * EJS等で <img src="<%= makeImageProxyUrl(c.image) %>"> のように使用
 * @param {string} rawImageUrl
 */
export function makeImageProxyUrl(rawImageUrl) {
  return rawImageUrl ? `/img?u=${encodeURIComponent(rawImageUrl)}` : "";
}
