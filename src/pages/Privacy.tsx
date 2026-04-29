import { PageHeader } from "@/components/PageHeader";

const Privacy = () => {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title="隐私政策 / Privacy Policy" subtitle="最后更新：2026-04-29" back="/" />

      <article className="prose prose-sm max-w-none rounded-2xl bg-card p-6 shadow-card md:p-8 dark:prose-invert">
        <h2>中文版</h2>
        <p>
          欢迎使用 learn-fluent-easy（以下简称"本应用"）。我们重视你的隐私，本政策说明我们收集哪些信息、如何使用以及如何保护它们。
        </p>

        <h3>1. 我们收集的信息</h3>
        <ul>
          <li><strong>账户信息</strong>：邮箱地址、昵称（注册时提供）；如使用 Google 登录，则获取你的姓名、邮箱和头像 URL。</li>
          <li><strong>学习数据</strong>：完成的课程、答题记录、俚语掌握度、累计学习时间、连续打卡天数。</li>
          <li><strong>本地数据</strong>：未登录时，进度信息存储在你设备的本地存储中，不会上传。</li>
          <li><strong>设备信息</strong>：浏览器类型、语言偏好（用于优化体验）。</li>
        </ul>

        <h3>2. 我们如何使用这些信息</h3>
        <ul>
          <li>提供并改进个性化的学习体验；</li>
          <li>跨设备同步你的学习进度；</li>
          <li>生成统计数据以帮助你了解学习成果；</li>
          <li>调用 AI 服务（OpenAI / Google Gemini）来生成课程内容与批改作业。</li>
        </ul>

        <h3>3. 第三方服务</h3>
        <ul>
          <li><strong>Lovable Cloud（基于 Supabase）</strong>：账户认证与数据存储；</li>
          <li><strong>Google OAuth</strong>：可选的第三方登录；</li>
          <li><strong>Lovable AI Gateway</strong>：调用大型语言模型进行内容生成与批改；</li>
          <li><strong>ElevenLabs</strong>：文本转语音（朗读单词与例句）。</li>
        </ul>

        <h3>4. 数据保留与删除</h3>
        <p>
          你的数据保留至你主动删除账户。你可以随时在"账户与隐私"页面删除账户，所有相关数据将立即且永久删除。
        </p>

        <h3>5. 数据导出</h3>
        <p>你可以随时在"账户与隐私"页面导出全部个人数据（JSON 格式）。</p>

        <h3>6. 儿童隐私</h3>
        <p>本应用不面向 13 岁以下的儿童，我们不会主动收集其信息。</p>

        <h3>7. 联系我们</h3>
        <p>如有任何隐私相关问题，请联系：support@learn-fluent-easy.app</p>

        <hr />

        <h2>English Version</h2>
        <p>
          Welcome to learn-fluent-easy ("the App"). We respect your privacy. This policy
          explains what data we collect, how we use it, and how we protect it.
        </p>

        <h3>1. Information We Collect</h3>
        <ul>
          <li><strong>Account info</strong>: email and display name (provided on signup); when using Google Sign-In, we receive your name, email, and avatar URL.</li>
          <li><strong>Learning data</strong>: completed lessons, quiz results, slang mastery, study minutes, streaks.</li>
          <li><strong>Local data</strong>: when not signed in, progress is kept in your browser's local storage and never uploaded.</li>
          <li><strong>Device info</strong>: browser type and language preference (for UX optimization).</li>
        </ul>

        <h3>2. How We Use Information</h3>
        <ul>
          <li>Provide and improve a personalized learning experience;</li>
          <li>Sync your progress across devices;</li>
          <li>Generate statistics to show your learning outcomes;</li>
          <li>Call AI services (OpenAI / Google Gemini) to generate lesson content and grade writing.</li>
        </ul>

        <h3>3. Third-Party Services</h3>
        <ul>
          <li><strong>Lovable Cloud (powered by Supabase)</strong>: authentication and data storage;</li>
          <li><strong>Google OAuth</strong>: optional sign-in;</li>
          <li><strong>Lovable AI Gateway</strong>: large language models for content generation and grading;</li>
          <li><strong>ElevenLabs</strong>: text-to-speech for word and sentence playback.</li>
        </ul>

        <h3>4. Data Retention &amp; Deletion</h3>
        <p>
          Your data is kept until you delete your account. You can delete your account at
          any time from the "Account &amp; Privacy" page; all related data will be removed
          immediately and permanently.
        </p>

        <h3>5. Data Export</h3>
        <p>You can export all your personal data (JSON) at any time from the "Account &amp; Privacy" page.</p>

        <h3>6. Children's Privacy</h3>
        <p>The App is not directed to children under 13, and we do not knowingly collect their data.</p>

        <h3>7. Contact</h3>
        <p>For privacy questions, contact: support@learn-fluent-easy.app</p>
      </article>
    </main>
  );
};

export default Privacy;