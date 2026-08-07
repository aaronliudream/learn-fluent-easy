# G 段 音节拆分 · 送审件(4471 词)

机器闸 y1-y5 全量复检 **0 不合格**。

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
| avant-garde | a · vant · garde | ɑː · vɒ̃t · ɡɑːrd |
| broad-brimmed | broad · brimmed | brɔd · brɪmd |
| constitutional | con · sti · tu · tion · al | kɒn · stɪ · tjuː · ʃən · əl |
| representation | rep · re · sen · ta · tion | rɛp · rɪ · zɛn · teɪ · ʃən |
| baby-sitter | ba · by · sit · ter | beɪ · bi · sɪt · ər |
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

