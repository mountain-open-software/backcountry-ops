import {readFile,writeFile} from 'node:fs/promises';
import {tokens} from '@open-mountain/design-system';
const kebab = value => value.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
let css='/* Generated from @open-mountain/design-system. Run npm run design:generate. */\n:root {\n';
for(const [group,values] of Object.entries(tokens))for(const [name,value] of Object.entries(values)){
  const unit=['space','radius','type','control'].includes(group)?'px':'';
  css+=`  --om-${group}-${kebab(name)}: ${value}${unit};\n`;
}
css+='}\n';
const file=new URL('../packages/design-system/src/tokens.css',import.meta.url);
if(process.argv.includes('--check')){
 const current=await readFile(file,'utf8').catch(()=>'');
 if(current!==css){console.error('Design CSS is out of date. Run npm run design:generate.');process.exitCode=1;}
 else console.log('Shared design CSS matches the token source.');
}else await writeFile(file,css);
