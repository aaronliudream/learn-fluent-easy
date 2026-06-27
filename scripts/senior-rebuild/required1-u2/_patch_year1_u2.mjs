import { readFileSync, writeFileSync } from 'node:fs';
const Y='src/data/gaokaoHub/year1.json';
const y=JSON.parse(readFileSync(Y,'utf8'));
const u=y.year1.semesters.gk_required1.units[2]; // gk1_required1_u3 = U2
if(u.unitKey!=='U2')throw new Error('unit[2] 不是 U2: '+u.unitKey);
const vf=JSON.parse(readFileSync('scripts/senior-rebuild/required1-u2/required1-u2-vocab.json','utf8'));
const fr=JSON.parse(readFileSync('scripts/senior-rebuild/required1-u2/required1-u2-finalreading.json','utf8')).finalReading;
const emojiFor=p=>/adj/.test(p)?'🔤':/v/.test(p)?'🏃':/n/.test(p)?'📦':'📘';
u.title='Travelling Around'; u.cn='环游世界 · 旅行'; u.emoji='✈️';
u.vocabulary=vf.words.map(w=>({en:w.word,cn:(w.meaning_cn||'').split(/[；;]/)[0],emoji:emojiFor(w.pos)}));
u.listeningQuestions=[
 {audio:'We are going to travel to Peru next summer.',opts:['我们打算明年夏天去秘鲁旅行。','我们昨天去了秘鲁。','我们不想去秘鲁。','秘鲁离这里很近。'],answer:0},
 {audio:'I have booked an early flight to Lima.',opts:['我订了一班飞往利马的早班机。','我错过了航班。','我在利马住了一年。','利马没有机场。'],answer:0},
 {audio:'The view from the mountain was amazing.',opts:['山上的景色令人惊叹。','山上什么也看不见。','下山很危险。','山很矮。'],answer:0},
 {audio:'Don\'t forget to apply for a visa before the trip.',opts:['旅行前别忘了申请签证。','旅行不需要任何准备。','签证已经过期。','别带护照。'],answer:0},
 {audio:'We hiked up a narrow path to the old city.',opts:['我们沿一条狭窄小路爬到古城。','我们开车进了古城。','古城在山脚下。','小路很宽。'],answer:0},
 {audio:'Public transport here is cheap and fast.',opts:['这里的公共交通又便宜又快。','这里没有公交。','打车很贵。','地铁很慢。'],answer:0},
];
u.quizQuestions=[
 {q:'「目的地」对应的英文单词是？',opts:['destination','castle','soldier','visa'],answer:0,point:'词汇',dim:'vocab'},
 {q:'「徒步旅行」对应的英文单词是？',opts:['hike','rent','admire','pack'],answer:0,point:'词汇',dim:'vocab'},
 {q:'accommodation 的中文意思是？',opts:['住宿','签证','帝国','航班'],answer:0,point:'词汇',dim:'vocab'},
 {q:'unique 的中文意思是？',opts:['独特的','狭窄的','平坦的','官方的'],answer:0,point:'词汇',dim:'vocab'},
 {q:'\"Look at the clouds! It ____ rain.\"',opts:['is going to','was','rained','rains'],answer:0,point:'语法',dim:'grammar'},
 {q:'\"Don\'t worry, I ____ help you.\"',opts:['will','was','am','did'],answer:0,point:'语法',dim:'grammar'},
 {q:'\"We ____ to Peru next Monday; tickets are booked.\"',opts:['are flying','flew','fly','flown'],answer:0,point:'语法',dim:'grammar'},
 {q:'\"She ____ apply for a visa tomorrow.\"',opts:['is going to','applied','applies','was'],answer:0,point:'语法',dim:'grammar'},
 {q:'🔊 听句子,选出与它相符的一项',opts:['我们打算明年夏天去秘鲁旅行。','我们已经从秘鲁回来了。','我们取消了旅行。','秘鲁不能去。'],answer:0,audio:'We are going to travel to Peru next summer.',point:'听力',dim:'listening'},
 {q:'🔊 听句子,选出与它相符的一项',opts:['山上的景色令人惊叹。','山上在下雨。','看不到山。','山被云遮住了。'],answer:0,audio:'The view from the mountain was amazing.',point:'听力',dim:'listening'},
];
u.reading={passage:'Peru is a country in South America with a rich history. The most famous site is Machu Picchu, an ancient city high in the mountains.',passageCn:'秘鲁课文见阅读关(探索秘鲁)。',questions:[{q:'What is Machu Picchu?',opts:['An ancient mountain city.','A modern airport.','A river.','A market.'],answer:0}]};
u.writing={prompt:'Write an email to your friend about a travel experience (about 80 words).',promptCn:'给朋友写一封旅行经历的邮件(约80词)。',sampleWords:['travel','destination','visit','hike','view','amazing','culture','journey','explore','unforgettable']};
u.dialogues=[{title:'Planning a Trip',lines:[{role:'A',text:'Where are you going this summer?',cn:'今年夏天你去哪儿?'},{role:'B',text:'We are going to travel to Peru.',cn:'我们打算去秘鲁旅行。'},{role:'A',text:'Amazing! Have you booked the flight?',cn:'太棒了!订机票了吗?'}]}];
u.finalReading=fr;
const st=u.stages;
const vs=st.find(s=>s.type==='vocab'); if(vs)vs.subtitle=u.vocabulary.length+'个教材词汇';
if(!st.some(s=>s.type==='cloze')){const ri=st.findIndex(s=>s.type==='reading');st.splice(ri+1,0,{id:'s5c',title:'完形填空',subtitle:'语境填词',icon:'✍️',type:'cloze',time:'8分钟'});}
u.grammarTitle='谈论将来:be going to / will / 现在进行时表将来';
u.grammarCode=null; u.grammarCodes=['u2.01','u2.02','u2.03'];
u.available=true;
writeFileSync(Y,JSON.stringify(y,null,2)+'\n');
console.log('U2 接hub完成: vocab',u.vocabulary.length,'| listenQ',u.listeningQuestions.length,'| stages',u.stages.length,'| finalReading',!!u.finalReading,'| grammarCodes',JSON.stringify(u.grammarCodes),'| available',u.available);
console.log('stages:',u.stages.map(s=>s.type).join(' > '));
