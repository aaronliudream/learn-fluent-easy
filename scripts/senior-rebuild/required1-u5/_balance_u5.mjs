import { readFileSync, writeFileSync } from 'node:fs';
const DIR='scripts/senior-rebuild/required1-u5';
const L=['A','B','C','D'];
function balancedNoRun(n){const per=Math.floor(n/4);const c=[per,per,per,per];let r=n-per*4,i=0;while(r-->0)c[i++]++;const out=[];for(let k=0;k<n;k++){let cand=[0,1,2,3].filter(v=>c[v]>0);if(k>=2&&out[k-1]===out[k-2])cand=cand.filter(v=>v!==out[k-1]);if(!cand.length)cand=[0,1,2,3].filter(v=>c[v]>0);cand.sort((a,b)=>c[b]-c[a]||a-b);out.push(cand[0]);c[cand[0]]--;}return out;}
function rebal(qs){const tg=balancedNoRun(qs.length);qs.forEach((q,k)=>{const correct=q.options[q.answer_index];const others=q.options.filter((_,j)=>j!==q.answer_index);const want=tg[k];const out=[];let oi=0;for(let p=0;p<4;p++)out[p]=(p===want)?correct:others[oi++];q.options=out;q.answer_index=want;if('answer_text'in q)q.answer_text=out[want];});const d=[0,0,0,0];qs.forEach(q=>d[q.answer_index]++);return d.map((n,i)=>L[i]+':'+n).join(' ');}

// grammar
let g=JSON.parse(readFileSync(DIR+'/required1-u5-grammar.json','utf8'));
console.log('grammar',rebal(g.questions));writeFileSync(DIR+'/required1-u5-grammar.json',JSON.stringify(g,null,2)+'\n');
// reading(全24题global)
let r=JSON.parse(readFileSync(DIR+'/required1-u5-reading.json','utf8'));
let rq=[];r.passages.forEach(p=>p.questions.forEach(q=>rq.push(q)));console.log('reading',rebal(rq));writeFileSync(DIR+'/required1-u5-reading.json',JSON.stringify(r,null,2)+'\n');
// cloze(全60空)
let c=JSON.parse(readFileSync(DIR+'/required1-u5-cloze.json','utf8'));
let cq=[];c.passages.forEach(p=>p.questions.forEach(q=>cq.push(q)));console.log('cloze',rebal(cq));writeFileSync(DIR+'/required1-u5-cloze.json',JSON.stringify(c,null,2)+'\n');
// listening(全30题)
let s=JSON.parse(readFileSync(DIR+'/required1-u5-listening.json','utf8'));
let sq=[];s.exercises.forEach(e=>e.questions.forEach(q=>sq.push(q)));console.log('listening',rebal(sq));writeFileSync(DIR+'/required1-u5-listening.json',JSON.stringify(s,null,2)+'\n');
