# 托福词库:8 组词共用同一条英文释义 —— 送审件

**日期**:2026-08-09 · **状态**:⏳ 待 Aaron 审,**审过再跑 SQL**
**对应 SQL**:`SQLAA/20260809_vocab_def_en_dedupe.sql`(已写好,**先别跑**)

---

## 一、库内实证(现查,不是凭记忆)

拉全表 4471 行,按 `lower(trim(def_en))` 分组:**8 组完全相同,涉及 16 词**。
`headword` 重复:**0 组**(没有真正的重复词条)。

顺带查到的更大一笔账:按 `def_zh` 的**首义项**(分号前)分组,
托福库 4470 词里有 **559 组**首义项完全相同,涉及 1341 词 —— 见本文末尾第四节。

---

## 二、为什么这 8 组必须改

不是排版洁癖,是两件实事:

1. **教学上等于没教。** 学生点开 `satiric` 看到的英文释义,和点开 `satirical` 看到的
   一字不差 —— 那这一栏就没有提供任何信息。而这 8 组里有 6 组是**真正需要辨析的近义词**
   (sporadic/intermittent、accusation/allegation…),恰恰是最该讲清楚差别的地方。
2. **易混词辨析那个练习会退化。** 它的设计前提是"同组词有可分辨的差异";
   两个词共享同一条释义时,题目在语义上就没有唯一答案了。

---

## 三、逐组建议(请逐条改或否)

标注:🟥 = 我认为需要你裁决的;🟩 = 直接改即可。

### ① 🟥 millennia / millennium —— **这不是近义词,是同一个词的单复数**

| | 现 def_en | 现 def_zh | pos |
| --- | --- | --- | --- |
| millennium | a period of one thousand years. | 千年 | n. |
| millennia | a period of one thousand years. | 千年；千年期 | **(空)** |

`millennia` 是 `millennium` 的复数形。它 `pos` 是空的,基本可以确定是词表导入时
把一个屈折形当成独立词条收了进来。

**建议(三选一,请你定)**:
- **A(推荐)**:把 `millennia` 从托福库摘掉(`vocab_word_banks` 删这一条),
  词条本身留在 `vocab_words` 里不删 —— 万一别的库要用还在。
  理由:让学生把"复数形"当成一个要背的新词,是在教一个不存在的知识点。
- **B**:留着,但释义写清它是复数:
  `def_en = "plural of millennium; periods of one thousand years."` / `def_zh = "千年(millennium 的复数)"`,并补 `pos = "n."`。
- **C**:不动。

⚠️ SQL 里我按 **B** 写(最保守、不动词库归属),**你要 A 的话告诉我,我改**。

### ② 🟩 satiric / satirical —— 同义,但常用度差一个数量级

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| satirical | using humor, irony, or exaggeration to criticize or mock. | 讽刺的 |
| satiric | the same as *satirical*, but far less common and mostly used in literary criticism. | 讽刺的（较少用，多见于文学评论） |

这一组的差别本来就只在"用不用",释义写成一样不算错 —— 但学生需要知道**该用哪个**。

### ③ 🟩 sporadic / intermittent

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| sporadic | happening occasionally, at scattered and unpredictable times. | 零星的；偶发的 |
| intermittent | stopping and starting again repeatedly, often at fairly regular intervals. | 间歇的；断断续续的 |

差别:sporadic 强调**零散、无规律**;intermittent 强调**停停走走**,可以很有规律
(雨刷是 intermittent,不是 sporadic)。

### ④ 🟩 concomitant / simultaneous

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| simultaneous | happening at exactly the same moment. | 同时发生的 |
| concomitant | naturally accompanying something else, often as a side effect of it. | 伴随的；随之而来的 |

差别:simultaneous 只讲**时间重合**;concomitant 还含**伴随/因果**关系
(药物的 concomitant side effects,不是 simultaneous side effects)。

### ⑤ 🟩 accusation / allegation

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| accusation | a direct charge that someone has done something wrong. | 指责；控告 |
| allegation | a claim of wrongdoing that has not yet been proved, typically in a legal or news context. | 指称；(未经证实的)指控 |

差别:allegation 的核心是**尚未证实**,新闻和法律语境里几乎不可互换。这一条托福常考。

### ⑥ 🟩 annihilate / exterminate

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| annihilate | to destroy something completely, leaving nothing behind. | 彻底摧毁；歼灭 |
| exterminate | to kill off an entire population of living things, especially pests. | 灭绝；根除(害虫等) |

差别:annihilate 的宾语可以是**任何东西**(军队、论点、纪录);
exterminate 的宾语必须是**活的、成群的**。

### ⑦ 🟩 trifling / trivial

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| trivial | of little importance; not worth serious attention. | 微不足道的；不重要的 |
| trifling | very small in amount or value, especially of a sum of money. | 微薄的；(数额)极小的 |

差别:trivial 说的是**不重要**;trifling 说的是**量少**(a trifling sum)。
trifling 偏书面/旧式。

### ⑧ 🟩 nutritious / nourishing

| | 建议 def_en | 建议 def_zh |
| --- | --- | --- |
| nutritious | containing the nutrients the body needs. | 有营养的 |
| nourishing | giving the body what it needs to grow and stay healthy; also used figuratively of things that sustain the mind. | 滋养的；养人的(也可比喻) |

差别:nutritious 是**成分**的客观描述;nourishing 强调**滋养的作用**,且可以比喻
(a nourishing conversation)。

---

## 四、⚠️ 顺带查到的一笔更大的账(本次不动,只报)

按 `def_zh` **首义项**分组:托福 4470 词里 **559 组**首义项完全相同,涉及 **1341 词**。
其中 17 组的两个词在词表里下标相距不到一个取词窗口 —— 也就是**必然会同框**:

```
【最初】   initially#54  / originally#62
【遗产】   heritage#90   / legacy#91          ← 挨着
【描绘】   depict#95     / portray#102
【监督】   oversee#208   / supervise#545
【厌恶】   loathe#2342 / aversion#2362 / detest#3013 / abhor#3088 / antipathy#3274
【诽谤】   libel#2851 / slander#3579 / defame#3823 / aspersion#4018 / obloquy#4320 / traduce#4332
…(共 17 组)
```

**这已经造成了一个真 bug**(不是隐患):配对模式和今日学习的选择题按 `word_id` 判对错,
但牌面/选项显示的是释义 —— 两张一模一样的中文牌,学生点"另一张对的"被判错,
而且**两个词都会被记成错**写进掌握度。代码侧的修复在同一个 PR 里(选项按文本去重 + 11 条回归测试)。

内容侧要不要动这 559 组,是另一件事,**本次不碰**:
它牵涉"两个近义词到底要不要给不同的中文释义",工作量和判断量都远大于这 8 组。
建议单独立项,先从上面那 17 组"必然同框"的开始。

---

## 五、影响面核对

- **音频**:`def_zh` / `def_en` **都没有配音**(`vocab_words` 只有 headword 的 `audio_url`,
  例句音频在 `vocab_examples`)。所以改释义**不需要**置空任何 `audio_url` ——
  与"改了英文文本就要把 audio_url 置 NULL"那条铁律不冲突,这里根本不涉及。
- **用户数据**:掌握度 / 错题本都按 `word_id` 存,改释义**不影响任何一条用户记录**。
- **前端**:选项文本来自 `optionText()`(取 `def_zh` 分号前第一段),
  改完后 ②③④⑤⑥⑦⑧ 七组的首义项互不相同,顺带从那 559 组里消掉 7 组。
