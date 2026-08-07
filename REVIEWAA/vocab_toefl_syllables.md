# G 段 音节拆分 · 送审件(4471 词)

机器闸全量复检 **0 不合格**(y1 已于 2026-08-07 收紧,见下)。

---

## ⚠️ 2026-08-07 修订:连字符归一化(这一节请逐条全审)

**原 y1 闸有个洞**:它把两边的标点都 `regexp_replace('[^a-zA-Z]','')` 剥掉再比,
于是 `'a'+'vant'+'garde'` = `"avantgarde"` 能和 `"avant-garde"` 判等 ——
**16 个连字符词的连字符就是从这里漏掉的**,而且已经进了库。

已做三件事:
1. y1 收紧成**逐字符严格相等**(实测:全库除这 16 条外,其余 4455 条本来就满足,收紧不误伤);
2. 新增 **y3 连字符专项**闸(以 `-` 结尾的音节 token 数 = 原词连字符数);
3. 源文件 + 库补丁 `SQLAA/vocab_toefl_syllables_hyphen_fix.sql` 都已改好。

**约定(A 方案)**:连字符保留在**前一音节末尾**。

### 全部 18 个连字符词(改后)

音标列 = 2026-08-07 现查 DB `vocab_words.syllable_ipa` 原值,本次一个字符没动。

| 词 | 改前 | 改后 | 音标(未动) |
| --- | --- | --- | --- |
| avant-garde | a · vant · garde ❌ | **a · vant- · garde** | ɑː · vɒ̃t · ɡɑːrd |
| baby-sitter | ba · by · sit · ter ❌ | **ba · by- · sit · ter** | beɪ · bi · sɪt · ər |
| broad-brimmed | broad · brimmed ❌ | **broad- · brimmed** | brɔd · brɪmd |
| by-product | by · pro · duct ❌ | **by- · pro · duct** | baɪ · prɒd · ʌkt |
| cast-iron | cast- · iron ✅ | cast- · iron(原本就对,未动) | kæst · aɪərn |
| eye-catching | eye · catch · ing ❌ | **eye- · catch · ing** | aɪ · kætʃ · ɪŋ |
| far-reaching | far · reach · ing ❌ | **far- · reach · ing** | fɑːr · riː · tʃɪŋ |
| hands-on | hands- · on ✅ | hands- · on(原本就对,未动) | hændz · ɔːn |
| long-lasting | long · last · ing ❌ | **long- · last · ing** | lɔːŋ · læs · tɪŋ |
| long-range | long · range ❌ | **long- · range** | lɔŋ · reɪndʒ |
| long-standing | long · stand · ing ❌ | **long- · stand · ing** | lɔːŋ · stænd · ɪŋ |
| self-sufficient | self · suf · fi · cient ❌ | **self- · suf · fi · cient** | sɛlf · səf · ɪ · ʃənt |
| short-range | short · range ❌ | **short- · range** | ʃɔrt · reɪndʒ |
| thousand-fold | thou · sand · fold ❌ | **thou · sand- · fold** | θaʊ · zənd · foʊld |
| three-dimensional | three · di · men · sion · al ❌ | **three- · di · men · sion · al** | θriː · dɪ · mɛn · ʃən · əl |
| time-consuming | time · con · su · ming ❌ | **time- · con · su · ming** | taɪm · kən · sjuː · mɪŋ |
| wedge-shaped | wedge · shaped ❌ | **wedge- · shaped** | wɛdʒ · ʃeɪpt |
| well-being | well · be · ing ❌ | **well- · be · ing** | wɛl · bi · ɪŋ |

注:`thousand-fold` 的连字符落在第 2 个音节末尾(thou/sand-/fold),不是第 1 个 —— 因为
连字符在原词里的位置是 `thousand` 之后,不是 `thou` 之后。这条最容易看错,请重点核。

音标数组一个字符没动,所以音节数 = 音标段数(y2)自然仍成立。

### 顺带发现:3 条字母切分点与音标切分点不一致(本次未动,请裁决)

机器闸判不了这一层,列出来供你决定要不要一并修:

| 词 | 字母音节 | 音标 | 分歧 |
| --- | --- | --- | --- |
| far-reaching | reach · ing | riː · tʃɪŋ | 字母把 ch 归前,音标把 tʃ 归后 |
| long-lasting | last · ing | læs · tɪŋ | 字母把 t 归前,音标把 t 归后 |
| time-consuming | con · su · ming | kən · sjuː · mɪŋ | 字母 su/ming,音标 sjuː/mɪŋ,m 归属不同 |

这类不一致在非连字符词里大概率也有,要系统排查是另一件事,先记账。

### 渲染规则(前端必须配套)

join 时音节之间默认插分隔点 `·`,但**前一 token 以 `-` 结尾时不插**:

- ✅ 正确:`ba·by-sit·ter`
- ❌ 错误:`ba·by-·sit·ter`

---

## 这一段人审看什么

**不是"拆得对不对"** —— 核心闸 y1 已经机械保证「按序拼接逐字母等于原词」,
字母不会丢、不会改。DB 侧的 count-validate 还会**再复验一遍**同一条。

**要看的是"拆分点符不符合发音直觉"** —— 这是机器判不了的那一层。
例:`minimize` 拆成 `mi·ni·mize` 也能拼回原词,但 `min·i·mize` 才是对的音节边界。

## 边界样本(370 条)—— 连字符 / 撇号 / 超长 / 超短

| 词 | 音节 | 音标 |
| --- | --- | --- |
| grab | grab | ɡræb |
| cite | cite | saɪt |
| avant-garde | a · vant- · garde | ɑː · vɒ̃t · ɡɑːrd |
| broad-brimmed | broad- · brimmed | brɔd · brɪmd |
| constitutional | con · sti · tu · tion · al | kɒn · stɪ · tjuː · ʃən · əl |
| representation | rep · re · sen · ta · tion | rɛp · rɪ · zɛn · teɪ · ʃən |
| baby-sitter | ba · by- · sit · ter | beɪ · bi · sɪt · ər |
| mall | mall | mɔl |
| myth | myth | mɪθ |
| sue | sue | suː |
| odds | odds | ɑdz |
| amid | a · mid | ə · mɪd |
| chip | chip | tʃɪp |
| ken | ken | kɛn |
| peer | peer | pɪr |
| ally | al · ly | æl · aɪ |
| norm | norm | nɔrm |
| administrative | ad · min · is · tra · tive | əd · mɪn · ɪs · trə · tɪv |
| flip | flip | flɪp |
| bias | bi · as | baɪ · əs |
| simultaneously | si · mul · ta · ne · ous · ly | sɪ · məl · teɪ · ni · əs · li |
| rip | rip | rɪp |
| slap | slap | slæp |
| haul | haul | hɔl |
| clip | clip | klɪp |
| deem | deem | diːm |
| hike | hike | haɪk |
| accomplishment | ac · com · plish · ment | ə · kɒm · plɪʃ · mənt |
| butt | butt | bʌt |
| toll | toll | toʊl |

## 按音节数分组抽样

### 1 音节(491 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| grab | grab | ɡræb |
| tile | tile | taɪl |
| jerk | jerk | dʒɜrk |
| curb | curb | kɜrb |
| bluff | bluff | blʌf |
| stunt | stunt | stʌnt |
| gleam | gleam | ɡliːm |
| yolk | yolk | joʊk |
| hump | hump | hʌmp |
| gash | gash | ɡæʃ |
| wrought | wrought | rɔt |
| skulk | skulk | skʌlk |

### 2 音节(1484 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| concerned | con · cerned | kən · sɜrnd |
| migrant | mi · grant | maɪ · ɡrənt |
| wrestling | wrest · ling | rɛs · lɪŋ |
| fragrance | fra · grance | freɪ · ɡrəns |
| exempt | ex · empt | ɪɡ · zɛmpt |
| forage | for · age | fɔːr · ɪdʒ |
| tranquil | tran · quil | træŋ · kwɪl |
| distort | dis · tort | dɪs · tɔrt |
| rapture | rap · ture | ræp · tʃər |
| carnal | car · nal | kɑrn · əl |
| arraign | ar · raign | ə · reɪn |
| fervid | fer · vid | fɜːr · vɪd |

### 3 音节(1365 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| attorney | at · tor · ney | ə · tɜr · ni |
| viable | vi · a · ble | vaɪ · ə · bəl |
| opposing | op · pos · ing | əp · poʊz · ɪŋ |
| imbalance | im · bal · ance | ɪm · bæ · ləns |
| maritime | mar · i · time | mær · ɪ · taɪm |
| recital | re · cit · al | rɪ · saɪt · əl |
| vertigo | ver · ti · go | vɜːr · tɪ · ɡoʊ |
| tenderness | ten · der · ness | tɛn · dɚ · nəs |
| longitude | lon · gi · tude | lɒn · dʒɪ · tuːd |
| legible | leg · i · ble | lɛdʒ · ɪ · bəl |
| levity | lev · i · ty | lɛv · ɪ · ti |
| martinet | mar · ti · net | mɑːr · tɪ · nɛt |

### 4 音节(794 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| demonstration | dem · on · stra · tion | dɛm · ən · streɪ · ʃən |
| accomplishment | ac · com · plish · ment | ə · kɒm · plɪʃ · mənt |
| analogy | a · nal · o · gy | ə · næl · ə · dʒi |
| intuition | in · tu · i · tion | ɪn · tu · ɪ · ʃən |
| fidelity | fi · del · i · ty | fɪ · dɛl · ɪ · ti |
| unrestricted | un · re · strict · ed | ʌn · rɪ · strɪk · tɪd |
| subsequently | sub · se · quent · ly | sʌb · sɪ · kwənt · li |
| regenerate | re · gen · er · ate | rɪ · dʒɛn · ə · reɪt |
| inquisitive | in · qui · si · tive | ɪn · kwɪ · zɪ · tɪv |
| suburbanite | sub · ur · ban · ite | sə · bɜːr · bə · naɪt |
| obligated | ob · li · ga · ted | ɑːb · lɪ · ɡeɪ · tɪd |
| malediction | mal · e · dic · tion | mæl · ɪ · dɪk · ʃən |

### 5 音节(285 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| administrator | ad · min · is · tra · tor | əd · mɪn · ɪs · treɪ · tər |
| inevitably | in · ev · i · ta · bly | ɪ · nɛv · ɪ · təb · li |
| anthropology | an · thro · pol · o · gy | æn · θrə · pɑːl · ə · dʒi |
| continuation | con · tin · u · a · tion | kən · tɪn · ju · eɪ · ʃən |
| illumination | il · lu · mi · na · tion | ɪl · uː · mɪ · neɪ · ʃən |
| choreography | cho · re · o · graph · y | kɔː · ri · ɒ · ɡrəf · i |
| rehabilitate | re · ha · bil · i · tate | riː · hə · bɪl · ɪ · teɪt |
| domesticated | do · mes · ti · ca · ted | də · mɛs · tɪ · keɪ · tɪd |
| uninhabited | un · in · hab · it · ed | ʌn · ɪn · hæb · ɪt · ɪd |
| facilitation | fa · cil · i · ta · tion | fə · sɪl · ɪ · teɪ · ʃən |
| recapitulate | re · ca · pit · u · late | riː · kə · pɪtʃ · ə · leɪt |
| quadrilateral | quad · ri · lat · er · al | kwɒd · rɪ · læt · ər · əl |

### 6 音节(48 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| simultaneously | si · mul · ta · ne · ous · ly | sɪ · məl · teɪ · ni · əs · li |
| reconciliation | rec · on · cil · i · a · tion | rɛk · ən · sɪl · ɪ · eɪ · ʃən |
| generalization | gen · er · al · i · za · tion | dʒɛn · ə · rə · lə · zeɪ · ʃən |
| intermediary | in · ter · me · di · ar · y | ɪn · tər · miː · di · ə · ri |
| paleontologist | pa · le · on · to · lo · gist | peɪ · li · ɒn · tɒl · ə · dʒɪst |
| accessibility | ac · ces · si · bil · i · ty | æk · sɛs · ə · bɪl · ə · ti |
| diversification | di · ver · si · fi · ca · tion | daɪ · vɜːr · sɪ · fɪ · keɪ · ʃən |
| idiosyncrasy | id · i · o · syn · cra · sy | ɪd · i · ə · sɪŋ · krə · si |
| reinterpretation | re · in · ter · pre · ta · tion | riː · ɪn · tɜːr · prɪ · teɪ · ʃən |
| survivability | sur · vi · va · bil · i · ty | sər · vaɪ · və · bɪl · ɪ · ti |
| impracticality | im · prac · ti · cal · i · ty | ɪm · prækt · ɪ · kæl · ɪ · ti |
| electromagnetic | e · lec · tro · mag · ne · tic | ɪ · lɛk · trəʊ · mæɡ · nɛt · ɪk |

### 7 音节(4 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| autobiographical | au · to · bi · o · graph · i · cal | ɔː · tə · baɪ · ə · ɡræf · ɪ · kəl |
| industrialization | in · dus · tri · al · i · za · tion | ɪn · dʌs · tri · ə · laɪ · zeɪ · ʃən |
| undifferentiated | un · dif · fer · en · ti · a · ted | ʌn · dɪf · ə · rɛn · ʃi · eɪ · tɪd |
| enthusiastically | en · thu · si · as · ti · cal · ly | ɪn · θjuː · zi · æs · tɪ · kəl · li |

