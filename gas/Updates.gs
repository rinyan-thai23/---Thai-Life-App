/** 手動実行用。将来は為替・数字を毎日、休日を毎月実行。トリガーは作成しない。 */
const FX_URL = 'https://api.frankfurter.dev/v2/rates?base=USD&quotes=THB,JPY&providers=ECB';
const HOLIDAY_SOURCE = 'https://www.bot.or.th/en/financial-institutions-holiday.html';

function fetchJson_(url) {
  const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  if (response.getResponseCode() !== 200) throw new Error('データ取得失敗: HTTP ' + response.getResponseCode());
  return JSON.parse(response.getContentText());
}

function nowThai_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX"); }

function parseExchangeRates_(data, today) {
  if (!Array.isArray(data)) throw new Error('為替APIの形式が変わりました。');
  const find = quote => data.find(r => r.base === 'USD' && r.quote === quote);
  const jpy = find('JPY'), thb = find('THB');
  if (!jpy || !thb || !Number.isFinite(jpy.rate) || !Number.isFinite(thb.rate) || jpy.rate <= 0 || thb.rate <= 0 || jpy.date !== thb.date) throw new Error('為替レートまたは日付が不正です。');
  const asOf = date_(jpy.date, false);
  const age = (Date.parse(today) - Date.parse(asOf)) / 86400000;
  if (age < 0 || age > 10) throw new Error('為替データの日付が古いか未来です。前回値を保持します。');
  return {thb_jpy: jpy.rate / thb.rate, usd_thb: thb.rate, as_of: asOf};
}

function updateExchangeRates() {
  const stamp = nowThai_();
  const fx = parseExchangeRates_(fetchJson_(FX_URL), stamp.slice(0, 10));
  return updateSection_('為替', [
    ['thb_jpy', fx.thb_jpy], ['usd_thb', fx.usd_thb], ['is_sample', false],
    ['as_of', fx.as_of], ['updated_at', stamp], ['source', 'Frankfurter / ECB']
  ]);
}

function randomLuckyNumbers_(random) {
  const pool = Array.from({length: 100}, (_, i) => String(i).padStart(2, '0'));
  for (let i = 0; i < 3; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

function updateLuckyNumbers() {
  const stamp = nowThai_();
  return updateSection_('ラッキーナンバー', randomLuckyNumbers_(Math.random).map(n => [n, false, stamp.slice(0, 10), stamp]));
}

function holidayUrl_(year) {
  return 'https://www.bot.or.th/content/bot/en/financial-institutions-holiday/jcr:content/root/container/holidaycalendar.model.' + year + '.json';
}

function parseHolidays_(data, year, checkedAt) {
  const list = data.holidayCalendarLists;
  if (!Array.isArray(list)) throw new Error('BOT休日データの形式が変わりました。');
  if (!list.length) return [];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const seen = new Set();
  return list.map(item => {
    const month = months.indexOf(item.month) + 1;
    const day = /\b(\d{1,2})\s*$/.exec(item.date);
    const name = String(item.holidayDescription || '').replace(/\s+/g, ' ').trim();
    if (Number(item.year) !== year || !month || !day || !name) throw new Error('BOT休日の日付・名称が不正です。');
    const date = date_(year + '-' + String(month).padStart(2, '0') + '-' + day[1].padStart(2, '0'), false);
    const province = /in Bangkok/i.test(name) ? 'Bangkok' : 'all';
    // Unknown regional restrictions must be reviewed rather than applied nationwide.
    if (province === 'all' && /\b(in|only|province|provinces|southern)\b/i.test(name)) throw new Error('対象地域の確認が必要な休日: ' + name);
    const key = date + '|' + province;
    if (seen.has(key)) throw new Error('BOT休日が重複しています。');
    seen.add(key);
    const known = SEED_HOLIDAYS.find(h => h.name_en === name);
    return [date, known ? known.name_ja : name, name, 'bank', province, HOLIDAY_SOURCE, checkedAt];
  });
}

function updateHolidays() {
  const stamp = nowThai_(), year = Number(stamp.slice(0, 4));
  const current = parseHolidays_(fetchJson_(holidayUrl_(year)), year, stamp.slice(0, 10));
  if (current.length < 10) throw new Error('当年の休日が不足しています。前回値を保持します。');
  // An empty next-year list means not yet published; transport/parse errors abort safely.
  const next = parseHolidays_(fetchJson_(holidayUrl_(year + 1)), year + 1, stamp.slice(0, 10));
  if (next.length && next.length < 10) throw new Error('翌年の休日が不足しています。');
  return updateSection_('休日', current.concat(next), {year: year, nextPublished: next.length > 0});
}

function updateSection_(name, rows, holidayOptions) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const book = getBook_(), sheet = book.getSheetByName(name);
    if (!sheet || !book.getSheetByName('出力')) throw new Error('先にsetupThaiLifeを実行してください。');
    if (holidayOptions) {
      const old = rows_('休日');
      // Preserve manually managed government/public holidays and unpublished future years.
      rows = old.filter(r => {
        const y = Number(date_(r[0], false).slice(0, 4));
        return r[3] !== 'bank' || r[5] !== HOLIDAY_SOURCE ||
          (y !== holidayOptions.year && !(holidayOptions.nextPublished && y === holidayOptions.year + 1));
      }).concat(rows).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    }
    const replacements = {}; replacements[name] = rows;
    const daily = buildDaily_(replacements);
    const json = JSON.stringify(daily, null, 2);
    if (json.length > 45000) throw new Error('JSONが大きすぎます。古い休日を整理してください。');
    const previous = sheet.getDataRange().getValues();
    const output = book.getSheetByName('出力').getRange(2, 1, 2, 2);
    const previousOutput = output.getValues();
    try {
      const columns = Math.max(previous[0].length, rows[0].length);
      const header = previous[0].slice();
      if (name === 'ラッキーナンバー') header[3] = 'updated_at';
      sheet.getDataRange().clearContent();
      if (name === 'ラッキーナンバー' || name === '休日') sheet.getRange(2, 1, rows.length, 1).setNumberFormat('@');
      const values = [header].concat(rows).map(r => Array.from({length: columns}, (_, i) => r[i] === undefined ? '' : r[i]));
      sheet.getRange(1, 1, values.length, columns).setValues(values);
      output.setValues([['updated_at', daily.updated_at], ['daily_json', json]]);
      SpreadsheetApp.flush();
    } catch (error) {
      sheet.getDataRange().clearContent();
      sheet.getRange(1, 1, previous.length, previous[0].length).setValues(previous);
      output.setValues(previousOutput);
      throw error;
    }
    console.log(name + 'を更新しました。公開用JSONも更新済みです。');
    return json;
  } finally { lock.releaseLock(); }
}
