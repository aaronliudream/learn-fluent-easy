# 英语小冒险·一年级 v2

中国大陆 PEP 一年级英语学习系统，基于四层教学架构（输入 / 练习 / 输出 / 反馈）。

---

## 📊 内容规模

| 分类 | 数量 | 说明 |
|---|---|---|
| 字母 | 26 | 大小写 + 例词 + emoji |
| 单词 | **150** | 14 个 unit，PEP 一年级核心词 |
| 句型 | **50** | 问候/介绍/课堂/感受/能力/天气 |
| 听力对话 | **30** | 短对话 + 中文选项 |
| 拼读 | 50 | CVC 短长元音 + 字母组合 |
| **分级阅读** | **30 篇** | L1 (10 篇 30-50 词) / L2 (10 篇 50-100 词) / L3 (10 篇 100-150 词) |
| **故事** | 8 | 图文故事，emoji + 英文 + 中文 |
| **儿歌** | 5 | 经典儿歌，自动朗读 |
| **看图说话** | 30 | 开放性输出（不扣分） |
| **看图造句** | 30 | 选词填空 |

总内容量约 30000 字英文 + 中文翻译。

---

## 📁 文件清单

```
english-grade1-v2/
├── index.html            主入口（按四层架构展示 9 模块）
├── 1-字母篇.html
├── 2-单词篇.html
├── 3-句型篇.html
├── 4-听力篇.html
├── 5-拼读篇.html
├── 6-家长报告.html
├── 7-阅读篇.html         🆕 30 篇分级阅读
├── 8-故事篇.html         🆕 8 故事 + 5 儿歌
├── 9-说话篇.html         🆕 看图说话 + 看图造句
├── data.js               核心数据（字母/词/句/听力/拼读）
├── reading-data.js       🆕 30 篇阅读数据
├── story-data.js         🆕 故事 + 儿歌数据
├── output-data.js        🆕 说话/造句任务数据
├── engine.js             SRS / TTS / 共享工具
└── styles.css            共享样式
```

---

## 🚀 使用方式

### 方式 A：直接双击 index.html 玩（最简单）
- Mac/Windows 都行
- 任何浏览器都能打开
- 完全离线，发音用浏览器自带 TTS

### 方式 B：导入 Lovable AI（你想要的方式）

由于你的 Lovable 项目是 React + TypeScript，把这套原生 HTML 直接导入会比较麻烦。**推荐做法**是：

1. **只导入数据文件**（`data.js`、`reading-data.js`、`story-data.js`、`output-data.js`）
   - 这些是纯 JavaScript 数组/对象，可以直接在 React 中 import
   - 改一下：把 `window.XXX = XXX` 改成 `export const XXX = ...`
   
2. **让 Lovable AI 用这些数据重新生成 React 组件**
   - 给 Lovable 的提示词例子：
     > "我有一个数据文件 reading-data.js，里面有 30 篇分级阅读。请生成一个 PrimaryReading.tsx 组件，按 level 分 tab，点击文章后显示朗读 + 中文大意 + 3 道题。参考我的 7-阅读篇.html 的 UI 风格。"
   
3. **关于 TTS**：Lovable 没有浏览器 TTS，可以：
   - 调用 OpenAI TTS API（每次播放都付费，用 supabase edge function 缓存）
   - 或预先生成 mp3：用我下面给的脚本一次生成所有音频

### 方式 C：原生 HTML + Lovable 一起用

在 Lovable 项目里建一个 `/learn` 路径，直接挂载这套 HTML：
1. 把整个 `english-grade1-v2/` 文件夹放到 Lovable 项目的 `public/learn/` 目录下
2. 在你的 React 路由里加：跳转到 `/learn/index.html`
3. 这样这套学习系统就成了你 App 的一个子模块，互不干扰

---

## 🎙️ 升级 OpenAI TTS（可选）

浏览器 TTS 在 iPhone/Mac 很好，Android 一般。想要更好音质，用 OpenAI TTS 预合成 mp3：

```python
# generate_audio.py - 一次性脚本
import openai
import json
import os

openai.api_key = os.getenv('OPENAI_API_KEY')

# 把所有需要发音的句子收集起来
TEXTS = [
    # 词
    *['cat', 'dog', 'apple', ...],  # 从 data.js VOCAB 抓
    # 句
    *['Hello!', 'My name is Tom.', ...],  # 从 SENTENCES 抓
    # 阅读
    *[...],  # 从 READING.paragraphs 抓
]

for text in TEXTS:
    fname = f"audio/{hash(text)}.mp3"
    if os.path.exists(fname): continue
    response = openai.audio.speech.create(
        model="tts-1",
        voice="nova",  # 或 alloy/echo/fable/onyx/shimmer
        input=text
    )
    response.stream_to_file(fname)
    print(f"✓ {text}")
```

预算：G1 全部内容约 30000 字符，OpenAI TTS 是 $15 / 100 万字符，**总成本 < $0.5**。

合成完后改 engine.js 的 speak 函数：
```javascript
function speak(text) {
  const audio = new Audio(`audio/${hashFn(text)}.mp3`);
  audio.play();
}
```

---

## 🐛 已知限制

1. **词表与教材不会 100% 重合**：我做的是 PEP 主流核心词，跟具体某本教材有 30-40% 差异是正常的
2. **30 篇阅读是 AI 生成的**：严格控制在 G1 词表内，但风格不如真人编辑过的精雕
3. **emoji 替代图**：看图任务的"图"是 emoji，不是真插画。视觉效果一般，但内容是对的
4. **没有真人配音**：用浏览器 TTS。Android 设备发音可能不如 iPhone

---

## 📈 下一步建议

如果你这套用着满意，**G2-G6 是同样架构 × 难度递进**：

| 维度 | G1 | G6 |
|---|---|---|
| 词汇 | 150 | 600 (累计 1200) |
| 句型 | 50 | 120 (含被动/比较级) |
| 阅读 | 30 篇 30-150 词 | 30 篇 300-400 词 |
| 输出 | 看图说/造句 | 50-100 词小作文 |
| 语法 | 不教（语感） | 显式教 |

每个年级的工作量跟 G1 差不多。

---

> 任何问题、bug、词库错误，告诉我，我改。
