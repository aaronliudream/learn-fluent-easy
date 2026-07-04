# 美语课程 ② Chunk 语块卡 · 造内容规范(子代理必读)

给美语课某单元的"关6 美语点睛"(american_amencontrast 表)扩充**地道语块卡**。对每条现有条判三类处置,并为需要的条造内容。

## 三类处置(逐条判)
- **upgrade(升级)**:现有 `us` 本身是**能整块用的短语/口语/句子/感叹词/称呼**(如 Oops! / I know. / Make yourself at home. / gotta go / Say no more. / On it! / No way! / You've got this! 这类)→ 补 ipa + note_cn + 2 例句。`us` 必须与库**一字不差**保留。
- **insert(新插)**:该课**场景相关、现有没有**的高频地道美语表达,每课 **0–3 个**(视该课已有语块多寡;已有升级条多就少插甚至不插)。`us`=语块本身(新造,不得与全库任何现有 us 重复)。
- **keep(保留)**:**纯美英拼写/词汇差异词**(cabinet↔cupboard / soccer↔football / chips↔crisps / sneakers↔trainers / cart↔trolley / vacation↔holiday / downtown↔city centre)**或纯文化注**(taco night / garage sale / Thanksgiving / potluck / county fair / Route 66 / Trick or treat! / 露营文化 / 各种"…文化""…梗")→ 不造内容,action=keep。

判别要点:能当**对话里整块说出口**的 = upgrade;是**单词的英美叫法差异**或**文化背景解释** = keep。边界看 note_cn:若 note 是"…文化/传统/梗/符号/差异"多半 keep;若 note 是一句可用表达的释义则 upgrade。

## 每条 upgrade / insert 必须造(质量对标单元1范例)
- **ipa**:美式音标,`/…/` 记法(和词汇表一致)。
- **note_cn**:中文释义,讲清用法/语气(升级条即使库里已有 note 也重写得更清楚,**不得为空**)。
- **example1_en / example1_cn** 和 **example2_en / example2_cn**:2 句例句,**不同场景**、**本课水平能懂**、**真实地道**(不是硬凑同义替换)。中文自然口语翻译。

### 单元1 已验收范例(照这风格与密度)
- `Me too.` /miː tuː/ 我也是(附和肯定句) | "— I love pizza. — Me too!" 我爱披萨。——我也是！ | "I'm tired. — Me too." 我累了。——我也是。
- `on sale` /ɑːn seɪl/ 打折中、在促销 | "These shoes are on sale — 40% off!" 这鞋在打折——四折！ | "Everything's on sale today." 今天全场促销。
- `Got it.` /ˈɡɑːt ɪt/ 明白了(美语高频应答) | "— Turn left at the light. — Got it." 灯口左转。——明白。 | "Got it, I'll email you tonight." 懂了,我今晚发邮件给你。
- `My bad.` /maɪ bæd/ 我的错(高频口语) | "My bad, wrong door!" 走错门了,我的错！ | "— You took my seat. — Oh, my bad." 你坐了我位子。——哦抱歉。
- `Here you go.` /hɪr juː ɡoʊ/ 给你(递东西时) | "Here you go, one large coffee." 给你,一杯大杯咖啡。 | "— Can I see the menu? — Here you go." 能看下菜单吗？——给你。

## 硬自检(务必遵守)
1. insert 的 us **不与该课/全库现有 us 重复**(尤其跨课重复的地道语块只在别处升级、这里别再插)。
2. ipa 准确美式。
3. 例句 2 句不同场景、本课水平、真实地道。
4. upgrade 的 note_cn 非空。
5. upgrade 的 us 与库一字不差(照你读到的行原样)。
6. keep 条不造任何内容。

## 拿不准就标 flag
某条边界模糊(升级还是文化注)、或某语块拿不准音标/例句/是否超该课水平 → 该条加 `"flag":"待裁决:<原因>"`,照常给出你的最佳判断,但让人复核。

## 输出格式(**只输出 JSON,无任何解释文字**)
对你负责的每个单元输出一个对象,合成一个数组:
```json
[
  {"unit":3,"rows":[
    {"lesson_id":"am1_l13","us":"Oops!","action":"upgrade","ipa":"/uːps/","note_cn":"哎呀(小失误时)","example1_en":"Oops! I dropped my keys.","example1_cn":"哎呀!钥匙掉了。","example2_en":"Oops, wrong button.","example2_cn":"哎呀,按错键了。","flag":null},
    {"lesson_id":"am1_l13","us":"cabinet","action":"keep"},
    {"lesson_id":"am1_l13","us":"No biggie.","action":"insert","ipa":"/noʊ ˈbɪɡi/","note_cn":"小事一桩、没什么大不了","example1_en":"— Sorry I'm late. — No biggie.","example1_cn":"抱歉迟到。——没事。","example2_en":"It's just a scratch, no biggie.","example2_cn":"就一道划痕,不算啥。","flag":null}
  ]}
]
```
keep 条只需 `lesson_id/us/action`。upgrade/insert 条五列全给。us 用你读到的原文(upgrade)或你新造(insert)。
