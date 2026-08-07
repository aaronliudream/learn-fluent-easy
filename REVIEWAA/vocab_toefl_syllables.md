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
| broad-brimmed | broad · brim · med | brɔd · brɪm · d |
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
| ally | al · ly | ˈæl · aɪ |
| norm | norm | nɔrm |
| administrative | ad · min · is · tra · tive | əd · ˈmɪn · ɪs · trə · tɪv |
| flip | flip | flɪp |
| bias | bi · as | baɪ · əs |
| simultaneously | si · mul · ta · ne · ous · ly | sɪ · məl · ˈteɪ · ni · əs · li |
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

### 1 音节(481 词)

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
| maize | maize | meɪz |
| smack | smack | smæk |
| baste | baste | beɪst |
| mote | mote | moʊt |

### 2 音节(1470 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| concerned | con · cerned | kən · sɜrnd |
| warfare | war · fare | wɔːr · fɛr |
| gossip | gos · sip | ˈɡɑːs · ɪp |
| gourmet | gour · met | ɡʊr · ˈmeɪ |
| tangle | tan · gle | tæŋ · ɡəl |
| condone | con · done | kən · ˈdoʊn |
| molten | mol · ten | moʊl · tən |
| mirage | mi · rage | mɪ · rɑːʒ |
| placate | pla · cate | plə · keɪt |
| homesick | home · sick | hoʊm · sɪk |
| offhand | off · hand | ɔːf · hænd |
| bipedal | bi · pedal | baɪ · ˈpiː.dəl |

### 3 音节(1387 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| attorney | at · tor · ney | ə · tɜr · ni |
| concession | con · ces · sion | kən · sɛs · ʃən |
| advancement | ad · vance · ment | əd · ˈvæns · mənt |
| unify | u · ni · fy | juː · nɪ · faɪ |
| salient | sal · i · ent | seɪ · li · ənt |
| mesmerize | mes · mer · ize | mɛz · mə · raɪz |
| sculptural | sculp · tur · al | skʌlp · tʃər · əl |
| misfortune | mis · for · tune | mɪs · ˈfɔːr · tʃən |
| reschedule | re · sched · ule | riː · ʃɛdʒ · uːl |
| subspecies | sub · spe · cies | sʌb · spiː · sɪz |
| ventilate | ven · ti · late | vɛn · tɪ · leɪt |
| continence | con · ti · nence | kɒn · tɪ · nəns |

### 4 音节(795 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| demonstration | dem · on · stra · tion | dɛm · ən · streɪ · ʃən |
| accomplishment | ac · com · plish · ment | ə · kɒm · plɪʃ · mənt |
| deficiency | de · fi · cien · cy | dɪ · ˈfɪʃ · ən · si |
| diversify | di · ver · si · fy | daɪ · vɜːr · sɪ · faɪ |
| paralysis | pa · ral · y · sis | pə · ræl · ɪ · sɪs |
| metropolis | me · trop · o · lis | mə · trɒp · ə · lɪs |
| congenital | con · gen · i · tal | kən · ˈdʒɛn · ɪ · təl |
| discernible | dis · cern · i · ble | dɪs · ˈsɜrn · ə · bəl |
| incarcerate | in · car · cer · ate | ɪn · ˈkɑːr · sə · reɪt |
| malleable | mal · le · a · ble | ˈmæl · i · ə · bəl |
| depredation | dep · re · da · tion | dɛp · rə · deɪ · ʃən |
| indemnify | in · dem · ni · fy | ɪn · dɛm · nɪ · faɪ |

### 5 音节(284 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| administrator | ad · min · is · tra · tor | əd · mɪn · ɪs · treɪ · tər |
| inevitably | in · ev · i · ta · bly | ɪ · ˈnɛv · ɪ · təb · li |
| proliferation | pro · lif · er · a · tion | prəʊ · lɪf · ə · reɪ · ʃən |
| incidentally | in · ci · den · tal · ly | ɪn · sɪ · dɛn · tə · li |
| revolutionize | rev · o · lu · tion · ize | ˌrɛv · ə · ˈluː · ʃən · aɪz |
| methodically | me · thod · i · cal · ly | mə · ˈθɒd · ɪ · kəl · i |
| indefinitely | in · def · i · nit · ely | ˌɪn · ˈdɛf · ɪ · nət · li |
| evaporation | e · vap · o · ra · tion | ɪ · væp · ə · reɪ · ʃən |
| supplementation | sup · ple · men · ta · tion | sʌp · lə · mɛn · teɪ · ʃən |
| irreparable | ir · re · par · a · ble | ɪr · ˈrɛ · pə · reɪ · bəl |
| insufferable | in · suf · fer · a · ble | ɪn · sʌf · ər · ə · bəl |
| nonconformity | non · con · form · i · ty | ˌnɒn · kən · ˈfɔːr · mə · ti |

### 6 音节(50 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| simultaneously | si · mul · ta · ne · ous · ly | sɪ · məl · ˈteɪ · ni · əs · li |
| reconciliation | rec · on · cil · i · a · tion | ˌrɛk · ən · ˈsɪl · ɪ · eɪ · ʃən |
| variability | var · i · a · bil · i · ty | ˌvɛə · ri · ˈæb · ɪl · ɪ · ti |
| incomprehensible | in · com · pre · hen · si · ble | ɪn · kəm · prɪ · hɛn · sə · bəl |
| psychoanalysis | psy · cho · a · na · ly · sis | ˌsaɪ · kəʊ · ə · ˈnæl · ɪ · sɪs |
| meteorologist | me · te · or · ol · o · gist | ˌmiː · ti · ə · ˈrɒl · ə · dʒɪst |
| individualism | in · di · vid · u · al · ism | ˌɪn · dɪ · vɪdʒ · u · əl · ɪzəm |
| heterogeneous | het · er · o · ge · ne · ous | ˌhɛt · ər · oʊ · dʒə · ni · əs |
| irreconcilable | ir · re · con · cil · a · ble | ɪr · ɪ · kɒn · sə · laʊ · əbl̩ |
| potentiality | po · ten · ti · al · i · ty | pə · ˌtɛn · ʃi · ˈæl · ɪ · ti |
| malleability | mal · le · a · bil · i · ty | mæl · i · ə · bɪl · ɪ · ti |
| parapsychology | par · a · psy · cho · lo · gy | pær · ə · saɪ · ˈkɑ · lə · dʒi |

### 7 音节(4 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
| autobiographical | au · to · bi · o · graph · i · cal | ɔː · tə · baɪ · ə · ɡræf · ɪ · kəl |
| industrialization | in · dus · tri · al · i · za · tion | ɪn · ˌdʌs · tri · ə · laɪ · ˈzeɪ · ʃən |
| undifferentiated | un · dif · fer · en · ti · a · ted | ʌn · dɪf · ɛr · ən · ʧ · eɪ · tɪd |
| enthusiastically | en · thu · si · as · ti · cal · ly | ɪn · ˈθjuː · zi · ˈæs · tɪ · kəl · li |

