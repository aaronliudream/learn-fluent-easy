# G4V2 Unit 1 phonics audio

**当前状态：本目录没有录音文件，6 个词全部由共享儿童音 TTS 朗读。**

`src/data/primaryHub/phonics/g4v2_u1_er.ts` 的 `stage_1_listen` 已不带 `audio` 字段，
页面因此不会去请求这里的 mp3。（历史问题：以前写了 `audio: "water.mp3"` 等 6 个文件名，
但文件从未提交过；`vercel.json` 的 SPA 兜底又把 404 变成 200 + index.html，
于是每次点读都要先「下载 HTML 当音频 → 解码失败」再回退 TTS。）

## 将来要放真人录音时

1. 把 MP3 放进本目录：

   - `water.mp3`、`tiger.mp3`、`sister.mp3`、`dinner.mp3`、`computer.mp3`、`ruler.mp3`
   - 可选（stage 2 辨音词）：`teacher.mp3`、`farmer.mp3`、`number.mp3`、`mother.mp3`、`winter.mp3`

2. 回到 `g4v2_u1_er.ts`，给对应词补上 `audio: "water.mp3"`。
   只有**声明了 `audio` 且文件真实存在**的词才走本地录音，其余继续用 TTS。

3. 录制要点：语速平稳，突出词尾非重读的 **er** /ə(r)/。

`vercel.json` 已改为「带后缀的路径不再落入 SPA 兜底」，缺文件会返回真实 404，
因此以后「声明了却没放文件」会在控制台留下 `[phonics] bundled audio failed` 警告，不再被静默吞掉。
