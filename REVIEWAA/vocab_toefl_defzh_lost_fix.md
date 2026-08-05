# def_zh 丢义项修复 · 改前改后逐条对照

> 本轮**只动这 14 个词的 def_zh**,例句 / 搭配 / 音标 / def_en / scene 一律未动。
> 取值为人工敲定(只有 14 条,人写比让模型再猜一轮可靠),**过你审才入库**。

## 为什么会丢

第二、三轮 `--only=double` 的目标是清同义堆砌(「目前；现在」这类),
但它按**类别**把所有双义词都重跑了一遍,模型顺手把真双义也压成单义 ——
连 prompt 里白纸黑字列为"保留两个"的 `context` / `coverage` / `defense` 都被压掉。
教训已固化成规矩:重修脚本作用面必须锚定**问题清单**而不是类别,验收必须**指标 + 人眼双轨**。

## 逐条对照

| 词 | 改前 | 改后 | 两义分属 | 英文释义(佐证) |
| --- | --- | --- | --- | --- |
| **adoption** | 收养 | **收养；采纳** | 家庭领域的收养 vs 制度领域的采纳 | The action of adopting something or someone. |
| **arena** | 体育或公共活动的场所 | **竞技场；活动领域** | 体育场地 vs 抽象的活动/竞争领域 | A place for sports or public events. |
| **cluster** | 集群 | **集群；聚类** | 一般名词的群集 vs 统计/计算机的聚类 | A group of similar things positioned closely together. |
| **context** | 上下文 | **上下文；背景** | 语言学的上下文 vs 事件的背景 | The circumstances or setting surrounding an event or idea. |
| **counseling** | 心理咨询 | **心理咨询；辅导** | 心理健康 vs 教育辅导 | Guidance or advice given, especially in a professional context. |
| **counselor** | 顾问 | **顾问；心理咨询师** | 一般顾问 vs 心理咨询专业角色 | A person trained to give guidance on personal, social, or psychological issues. |
| **coverage** | 覆盖范围 | **覆盖范围；保险范围** | 通用覆盖 vs 保险条款范围 | Extent to which something is covered or reported. |
| **dealer** | 经销商 | **经销商；荷官** | 商业经销 vs 博彩场所的发牌员 | A person who buys and sells goods or services. |
| **defense** | 防御 | **防御；辩护** | 军事防御 vs 法律辩护 | Protection against attack or harm. |
| **doctrine** | 教义 | **教义；学说** | 宗教教义 vs 学术/法律学说 | A set of beliefs held and taught by a group. |
| **grab** | 抓住 | **抓住；抢占** | 具体动作 vs 抢占机会的引申义 | To take hold of something quickly or suddenly. |
| **mandate** | 官方命令或授权行动的权利 | **授权；命令** | 法律授权 vs 政治指令 | An official order or authorization to act. |
| **odds** | 可能性 | **可能性；赔率** | 概率 vs 博彩赔率 | The likelihood or probability of something happening. |
| **perception** | 感知能力 | **知觉；看法** | 感官知觉 vs 主观看法(Aaron 裁定补入) | The ability to see, hear, or become aware of something. |

## 定稿口径

- 全部 **2-8 字词典体**,**禁括号注释** —— 扫描器建议里的「上下文(语言)」这种一律改掉
- 两义必须真的**分属不同领域**;同义堆砌(如 alliance「联盟；联合」)不在本轮范围
- 每条都过了 `defZhShapeProblem`(句号 / 长度 / 义项数 / 解释性标记词四道)

## 修复后指标

| | 值 |
| --- | ---: |
| 总词数 | 198 |
| 双义项 | 95(48.0%) |
| 体裁不合格 | 0 |

## 未纳入本轮的一条

扫描器 v2 把 `perception` 判成"单义正确",**我不同意**并提请裁决,你裁定补入 ——
知觉(感官)与看法(观点)是词典分列的两个义项。已含在上表。
