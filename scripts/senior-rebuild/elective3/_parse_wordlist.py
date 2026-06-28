# 解析必修二 词汇表(统一字母序,(N)标单元) -> 每单元词条 JSON。专有名词(△)跳过。
import re, json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

lines = open('scripts/senior-rebuild/elective3/_raw/full.txt', encoding='utf-8').read().split('\n')
# 词汇表正文:找"词汇表"标记后,到"后记"/不规则动词表前
start = next(i for i,l in enumerate(lines) if l.strip()=='词汇表')
# 不规则动词表大致从 "Irregular" 或 后记;用页123(后记)截断
end = next(i for i,l in enumerate(lines) if ('不规则动词' in l or 'Irregular Verbs' in l or ('后' in l and '记' in l)) and i>start)
body = lines[start+1:end]

# 去掉页眉/页码/页码分隔
clean=[]
for l in body:
    s=l.strip()
    if not s: continue
    if re.match(r'^===== PAGE', s): continue
    if s in ('Vocabulary','Vocabulary  ','Workbook','WORKBOOK'): continue
    if re.match(r'^\d{1,3}$', s): continue          # 页码
    if re.match(r'^[A-Z]$', s): continue            # 字母分节 A B C...
    if s.startswith('注：'): continue
    clean.append(s)

text='\n'.join(clean)
# 按 (N) 切分为词条:每个词条以 (\d) 结尾
# 把跨行合并:在每个 (N) 处断开
entries=[]
buf=[]
for s in clean:
    buf.append(s)
    m=re.search(r'\((\d)\)\s*$', s)
    if m:
        entries.append((int(m.group(1)), ' '.join(buf)))
        buf=[]

def parse(raw):
    # 去掉末尾 (N)
    raw=re.sub(r'\s*\(\d\)\s*$','',raw).strip()
    propn = '△' in raw
    raw=raw.replace('△','').strip()
    # 取首词(可能含 & 或 短语) 与 IPA
    ipa=''
    m=re.search(r'/([^/]+)/', raw)
    if m: ipa=m.group(1)
    # word = IPA 前的英文部分;若无 IPA,取首个英文片段
    head=raw.split('/')[0].strip() if ipa else raw
    # word 取 head 中英文词(可能多词短语)
    wm=re.match(r"^([A-Za-z][A-Za-z'.\- ]*?)(?=\s+(?:n\.|v\.|vt\.|vi\.|adj\.|adv\.|abbr\.|prep\.|pron\.|conj\.|num\.|&|被|（|\(|[一-鿿]))", head)
    word = wm.group(1).strip() if wm else head.strip()
    # 中文释义 = 第一个中文起到末尾
    cm=re.search(r'[一-鿿].*$', raw)
    cn=cm.group(0).strip() if cm else ''
    return {'word':word,'ipa':ipa,'cn':cn,'propn':propn,'raw':raw}

byunit={1:[],2:[],3:[],4:[],5:[]}
for u,raw in entries:
    p=parse(raw)
    if p['propn']: continue
    if not p['word'] or not re.match(r'^[A-Za-z]', p['word']): continue
    byunit[u].append(p)

for u in byunit:
    json.dump(byunit[u], open(f'scripts/senior-rebuild/elective3/_raw/wl_u{u}.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'U{u}: {len(byunit[u])} words')
print('total entries:', len(entries))
