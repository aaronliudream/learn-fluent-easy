import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";

const Privacy = () => {
  const t = useT();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={`${t("隐私政策")} / Privacy Policy`} subtitle="Last updated: 2026-04-29" back />

      <article className="prose prose-sm max-w-none rounded-2xl bg-card p-6 shadow-card md:p-8 dark:prose-invert">
        <h2><T>中文版</T></h2>
        <p>
          <T>欢迎使用 Big Moon English（以下简称"本应用"）。我们重视你的隐私，本政策说明我们收集哪些信息、如何使用以及如何保护它们。</T>
        </p>

        <h3><T>1. 我们收集的信息</T></h3>
        <ul>
          <li><T>账户信息：邮箱地址、昵称（注册时提供）；如使用 Google 登录，则获取你的姓名、邮箱和头像 URL。</T></li>
          <li><T>学习数据：完成的课程、答题记录、俚语掌握度、累计学习时间、连续打卡天数。</T></li>
          <li><T>本地数据：未登录时，进度信息存储在你设备的本地存储中，不会上传。</T></li>
          <li><T>设备信息：浏览器类型、语言偏好（用于优化体验）。</T></li>
        </ul>

        <h3><T>2. 我们如何使用这些信息</T></h3>
        <ul>
          <li><T>提供并改进个性化的学习体验；</T></li>
          <li><T>跨设备同步你的学习进度；</T></li>
          <li><T>生成统计数据以帮助你了解学习成果；</T></li>
        </ul>

        <h3><T>3. 数据保留与删除</T></h3>
        <p>
          <T>你的数据保留至你主动删除账户。你可以随时在"账户与隐私"页面删除账户，所有相关数据将立即且永久删除。</T>
        </p>

        <h3><T>4. 数据导出</T></h3>
        <p><T>你可以随时在"账户与隐私"页面导出全部个人数据（JSON 格式）。</T></p>

        <h3><T>5. 儿童隐私（COPPA / GDPR-K / CCPA 儿童条款）</T></h3>
        <p>
          <T>本应用面向所有年龄段的英语学习者，但根据美国《儿童在线隐私保护法》（COPPA）、欧盟《通用数据保护条例》（GDPR 第 8 条）以及加州《消费者隐私法案》（CCPA / CPRA）针对未成年人的特别规定：</T>
        </p>
        <ul>
          <li><T>13 岁以下儿童（在欧盟部分成员国为 16 岁以下）必须在家长或法定监护人明确同意下才能注册和使用本应用。</T></li>
        </ul>
        <ul>
          <li><T>对于已知的 13 岁以下用户，我们不会出售或"分享"（CCPA 定义下的跨情境行为广告）任何个人信息，也不会用于精准广告定向。</T></li>
          <li><T>家长可随时通过 support@bigmoonenglish.com 联系我们，要求查看、更正或删除其子女的全部数据，我们将在 30 天内处理。</T></li>
          <li><T>如发现我们在未取得家长同意的情况下收集了 13 岁以下儿童的信息，请立即与我们联系，我们会立刻删除相关数据。</T></li>
        </ul>

        <h3><T>6. 联系我们</T></h3>
        <p><T>如有任何隐私相关问题，请联系：</T>support@bigmoonenglish.com</p>

        <hr />

        <h2>English Version</h2>
        <p>
          Welcome to Big Moon English ("the App"). We respect your privacy. This policy
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
        </ul>

        <h3>3. Data Retention &amp; Deletion</h3>
        <p>
          Your data is kept until you delete your account. You can delete your account at
          any time from the "Account &amp; Privacy" page; all related data will be removed
          immediately and permanently.
        </p>

        <h3>4. Data Export</h3>
        <p>You can export all your personal data (JSON) at any time from the "Account &amp; Privacy" page.</p>

        <h3>5. Children's Privacy (COPPA / GDPR-K / CCPA)</h3>
        <p>
          The App is intended for English learners of all ages. In line with the U.S. Children's Online Privacy
          Protection Act (COPPA), Article 8 of the EU General Data Protection Regulation (GDPR), and the
          California Consumer Privacy Act (CCPA / CPRA) provisions for minors:
        </p>
        <ul>
          <li><strong>Children under 13</strong> (or under 16 in certain EU member states) must obtain
            <strong> verifiable parental or legal-guardian consent</strong> before creating an account or
            using the App.</li>
          <li>For users known to be under 13, we do <strong>not sell or "share" personal information</strong>
            (as defined by the CCPA, including cross-context behavioral advertising) and we do not use it for
            targeted advertising.</li>
          <li>Parents and guardians may contact us at <strong>support@bigmoonenglish.com</strong> at any time
            to review, correct, or request deletion of their child's data. We will respond within 30 days.</li>
          <li>If you believe we have collected information from a child under 13 without verifiable parental
            consent, please contact us immediately and we will delete the data without delay.</li>
        </ul>

        <h3>6. Contact</h3>
        <p>For privacy questions, contact: support@bigmoonenglish.com</p>
      </article>
    </main>
  );
};

export default Privacy;