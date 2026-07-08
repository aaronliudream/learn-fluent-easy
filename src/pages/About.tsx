import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { Mail, Globe2, Heart } from "lucide-react";

const About = () => {
  const t = useT();
  const { lang } = useI18n();
  const brand = lang === "zh" ? "大月亮英语" : "Big Moon English";
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={t("关于我们")} subtitle={brand} back />

      <article className="prose prose-sm max-w-none rounded-2xl bg-card p-6 shadow-card md:p-8 dark:prose-invert">
        <h2><T>我们的使命</T></h2>
        <p>
          {brand}
          {" "}
          <T>由一支热爱语言学习的小团队打造。我们相信每个人都能在每天 5 分钟的轻松练习中，真正开口说英语。我们结合 AI 语音反馈、间隔重复（FSRS）、游戏化激励和真实场景对话，让学习像玩游戏一样上瘾，又像私教一样有效。</T>
        </p>

        <h3><T>核心价值</T></h3>
        <ul>
          <li><Globe2 className="inline size-4" /> <T>全球可用，为非英语母语者设计；支持 23+ 界面语言。</T></li>
          <li><Heart className="inline size-4" /> <T>不卖广告、不滥用数据。</T></li>
        </ul>

        <h3><T>联系我们</T></h3>
        <p>
          <Mail className="inline size-4" /> <a href="mailto:support@bigmoonenglish.com">support@bigmoonenglish.com</a>
        </p>
        <p>
          <T>反馈、合作、媒体咨询均欢迎。我们通常在 1–2 个工作日内回复。</T>
        </p>

        <p>
          <Link to="/privacy" className="underline"><T>隐私政策</T></Link>{" · "}
          <Link to="/terms" className="underline"><T>服务条款</T></Link>
        </p>
      </article>
    </main>
  );
};

export default About;
