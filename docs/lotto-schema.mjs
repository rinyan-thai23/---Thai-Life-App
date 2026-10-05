export const GLO_API='https://www.glo.or.th/api/lottery/getLatestLottery';
const fields={first:[6,1],last2:[2,1],last3f:[3,2],last3b:[3,2],near1:[6,2]};
export function validateLotto(d){
  if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Number.isFinite(Date.parse(d.date))||new Date(d.date).toISOString().slice(0,10)!==d.date)throw Error('Invalid draw date');
  for(const [key,[digits,count]] of Object.entries(fields)){
    const values=d[key];
    if(!Array.isArray(values)||values.length!==count||new Set(values).size!==count||values.some(v=>typeof v!=='string'||!new RegExp('^\\d{'+digits+'}$').test(v)))throw Error('Incomplete lottery results: '+key);
  }
  if(d.pdf_url!==null){const url=new URL(d.pdf_url);if(url.protocol!=='https:'||!(url.hostname==='glo.or.th'||url.hostname.endsWith('.glo.or.th')))throw Error('Invalid official PDF URL');}
  return d;
}
export function parseLotto(raw){
  if(raw?.status!==true||raw.response?.status!==1)throw Error('Results not ready');
  const r=raw.response,d={date:r.date};
  for(const key of Object.keys(fields))d[key]=(r.data?.[key]?.number||[]).map(n=>n.value).sort();
  d.pdf_url=r.pdf_url||null;
  return validateLotto(d);
}
