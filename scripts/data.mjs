import {randomInt} from 'node:crypto';
export const HOLIDAY_SOURCE='https://www.bot.or.th/en/financial-institutions-holiday.html';
export const FX_URL='https://api.frankfurter.dev/v2/rates?base=USD&quotes=THB,JPY&providers=ECB';
const SEED_HOLIDAYS = [{"date": "2026-01-01", "name_ja": "元日", "name_en": "New Year’s Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-01-02", "name_ja": "特別休日", "name_en": "Additional special holiday", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-03-03", "name_ja": "万仏節", "name_en": "Makha Bucha Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-04-06", "name_ja": "チャクリー王朝記念日", "name_en": "Chakri Memorial Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-04-13", "name_ja": "ソンクラーン", "name_en": "Songkran", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-04-14", "name_ja": "ソンクラーン", "name_en": "Songkran", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-04-15", "name_ja": "ソンクラーン", "name_en": "Songkran", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-05-01", "name_ja": "労働者の日", "name_en": "National Labor Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-05-04", "name_ja": "戴冠記念日", "name_en": "Coronation Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-06-01", "name_ja": "仏誕節の振替休日", "name_en": "Visakha Bucha substitute holiday", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-06-03", "name_ja": "王妃誕生日", "name_en": "Queen Suthida’s Birthday", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-07-28", "name_ja": "国王誕生日", "name_en": "King’s Birthday", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-07-29", "name_ja": "三宝節", "name_en": "Asarnha Bucha Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-08-12", "name_ja": "シリキット王太后誕生日・母の日", "name_en": "Queen Mother’s Birthday / Mother’s Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-10-13", "name_ja": "ラーマ9世記念日", "name_en": "King Bhumibol Memorial Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-10-16", "name_ja": "バンコク限定の特別休日", "name_en": "Additional special holiday in Bangkok", "type": "bank", "province": "Bangkok", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-10-23", "name_ja": "チュラロンコン大王記念日", "name_en": "Chulalongkorn Memorial Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-12-07", "name_ja": "ラーマ9世誕生日・建国記念日・父の日の振替休日", "name_en": "Substitute for National Day / Father’s Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-12-10", "name_ja": "憲法記念日", "name_en": "Constitution Day", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}, {"date": "2026-12-31", "name_ja": "大晦日", "name_en": "New Year’s Eve", "type": "bank", "province": "all", "source": "https://www.bot.or.th/en/financial-institutions-holiday.html"}];

export function parseExchangeRates_(data, today) {
  if (!Array.isArray(data)) throw new Error('為替APIの形式が変わりました。');
  const find = quote => data.find(r => r.base === 'USD' && r.quote === quote);
  const jpy = find('JPY'), thb = find('THB');
  if (!jpy || !thb || !Number.isFinite(jpy.rate) || !Number.isFinite(thb.rate) || jpy.rate <= 0 || thb.rate <= 0 || jpy.date !== thb.date) throw new Error('為替レートまたは日付が不正です。');
  const asOf = date_(jpy.date, false);
  const age = (Date.parse(today) - Date.parse(asOf)) / 86400000;
  if (age < 0 || age > 10) throw new Error('為替データの日付が古いか未来です。前回値を保持します。');
  return {thb_jpy: jpy.rate / thb.rate, usd_thb: thb.rate, as_of: asOf};
}

export function randomLuckyNumbers_(random) {
  const pool = Array.from({length: 100}, (_, i) => String(i).padStart(2, '0'));
  for (let i = 0; i < 3; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

export function holidayUrl_(year) {
  return 'https://www.bot.or.th/content/bot/en/financial-institutions-holiday/jcr:content/root/container/holidaycalendar.model.' + year + '.json';
}

export function parseHolidays_(data, year, checkedAt) {
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


function date_(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('Invalid date: '+value);
  return value;
}
export function thaiStamp(now=new Date()) {
  return new Date(now.getTime()+7*3600000).toISOString().slice(0,19)+'+07:00';
}
export async function fetchJson(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('HTTP '+response.status+' from '+new URL(url).hostname);
  return response.json();
}
export function validateDaily(d) {
  if(d.schema_version!==1||!Number.isFinite(Date.parse(d.updated_at)))throw Error('Invalid schema/timestamp');
  if(!Number.isFinite(d.fx?.thb_jpy)||d.fx.thb_jpy<=0||!Number.isFinite(d.fx?.usd_thb)||d.fx.usd_thb<=0||typeof d.fx.is_sample!=='boolean')throw Error('Invalid FX');
  if(!Array.isArray(d.lucky?.numbers)||d.lucky.numbers.length!==3||new Set(d.lucky.numbers).size!==3||d.lucky.numbers.some(n=>typeof n!=='string'||!/^\d{2}$/.test(n))||typeof d.lucky.is_sample!=='boolean')throw Error('Invalid lucky numbers');
  if(!d.fx.is_sample)date_(d.fx.as_of);
  if(!d.lucky.is_sample)date_(d.lucky.date);
  if(!Array.isArray(d.holidays)||!d.holidays.length)throw Error('Missing holidays');
  const seen=new Set();
  for(const h of d.holidays){date_(h.date);const key=h.date+'|'+h.type+'|'+h.province;if(seen.has(key)||!h.name_ja||!h.name_en||!['bank','public','government'].includes(h.type)||!h.province||!String(h.source).startsWith('https://'))throw Error('Invalid holiday');seen.add(key)}
  return d;
}
export async function updateData(previous,mode,{getJson=fetchJson,now=new Date(),random=()=>randomInt(0,2**32)/2**32}={}) {
  if(!['all','daily','fx','lucky','holidays'].includes(mode))throw Error('Unknown update mode');
  const d=structuredClone(validateDaily(previous)),stamp=thaiStamp(now),today=stamp.slice(0,10);
  if(['all','daily','fx'].includes(mode))d.fx={...parseExchangeRates_(await getJson(FX_URL),today),is_sample:false,updated_at:stamp,source:'Frankfurter / ECB'};
  if(['all','daily','lucky'].includes(mode))d.lucky={numbers:randomLuckyNumbers_(random),is_sample:false,date:today,updated_at:stamp};
  if(['all','holidays'].includes(mode)){
    const year=Number(today.slice(0,4));
    const current=parseHolidays_(await getJson(holidayUrl_(year)),year,today);
    const next=parseHolidays_(await getJson(holidayUrl_(year+1)),year+1,today);
    if(current.length<10||(next.length&&next.length<10))throw Error('Incomplete holiday calendar');
    const retained=d.holidays.filter(h=>h.source!==HOLIDAY_SOURCE||h.type!=='bank'||(!h.date.startsWith(year+'-')&&!(next.length&&h.date.startsWith((year+1)+'-'))));
    d.holidays=retained.concat(current,next).map(h=>Array.isArray(h)?{date:h[0],name_ja:h[1],name_en:h[2],type:h[3],province:h[4],source:h[5]}:h).sort((a,b)=>a.date.localeCompare(b.date));
    d.holiday_years=[...new Set(d.holidays.map(h=>Number(h.date.slice(0,4))))];
    d.holidays_checked_at=today;
  }
  d.updated_at=stamp;
  return validateDaily(d);
}
