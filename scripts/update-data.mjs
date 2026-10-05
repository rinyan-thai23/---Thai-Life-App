import {readFile,writeFile,rename} from 'node:fs/promises';
import {updateData} from './data.mjs';
const file=new URL('../docs/daily.json',import.meta.url);
const previous=JSON.parse(await readFile(file,'utf8'));
const updated=await updateData(previous,process.argv[2]||'all');
// Nothing is written until every requested source has passed validation.
const temporary=new URL('../docs/daily.json.tmp',import.meta.url);
await writeFile(temporary,JSON.stringify(updated,null,2)+'\n');
await rename(temporary,file);
console.log('Updated shared data:',updated.updated_at);
