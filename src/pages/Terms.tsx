import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";

const Terms = () => {
  const t = useT();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={`${t("服务条款")} / Terms of Service`} subtitle="Last updated: 2026-04-29" back />

      <article className="prose prose-sm max-w-none rounded-2xl bg-card p-6 shadow-card md:p-8 dark:prose-invert">
        <h2><T>中文版</T></h2>

        <h3><T>1. 接受条款</T></h3>
        <p><T>注册或使用 Big Moon English（以下简称"本应用"）即表示你同意本服务条款。</T></p>

        <h3><T>2. 服务描述</T></h3>
        <p><T>本应用提供英语自适应学习功能，包括分级课程、水平测试、俚语学习、AI 批改等。</T></p>

        <h3><T>3. 用户责任</T></h3>
        <ul>
          <li><T>提供真实、准确的注册信息；</T></li>
          <li><T>保管好账户密码，不与他人共享；</T></li>
          <li><T>不得用本应用从事任何违法或侵权活动；</T></li>
          <li><T>不得对应用进行反向工程、抓取或滥用 API。</T></li>
        </ul>

        <h3><T>4. 知识产权</T></h3>
        <p><T>本应用的代码、设计、课程内容均归 Big Moon English团队所有。AI 生成的内容仅供学习使用。</T></p>

        <h3><T>5. 免责声明</T></h3>
        <p>
          <T>本应用按"现状"提供，不对内容的完全准确性作出保证。AI 生成的批改与建议仅供参考，不能替代专业语言教师的指导。</T>
        </p>

        <h3><T>6. 服务变更与终止</T></h3>
        <p><T>我们可能随时更新或终止部分功能，并会提前通知重大变更。你可随时删除账户终止本协议。</T></p>

        <h3><T>7. 适用法律</T></h3>
        <p><T>本条款的解释与执行适用相关司法管辖区的法律。</T></p>

        <h3><T>8. 联系方式</T></h3>
        <p>support@bigmoonenglish.com</p>

        <hr />

        <h2>English Version</h2>

        <h3>1. Acceptance</h3>
        <p>By registering or using Big Moon English ("the App"), you agree to these Terms.</p>

        <h3>2. Service</h3>
        <p>
          The App provides adaptive English learning, including leveled lessons, placement
          tests, slang learning, and AI-assisted grading.
        </p>

        <h3>3. User Responsibilities</h3>
        <ul>
          <li>Provide truthful registration info;</li>
          <li>Keep your password secure and do not share it;</li>
          <li>Do not use the App for unlawful or infringing activities;</li>
          <li>Do not reverse-engineer, scrape, or abuse the API.</li>
        </ul>

        <h3>4. Intellectual Property</h3>
        <p>
          All code, design, and curated content belong to the Big Moon English team.
          AI-generated content is for personal learning use only.
        </p>

        <h3>5. Disclaimer</h3>
        <p>
          The App is provided "as is" without warranty of full accuracy. AI grading and
          suggestions are for reference only and do not replace a professional language teacher.
        </p>

        <h3>6. Changes &amp; Termination</h3>
        <p>
          We may update or discontinue features at any time and will notify you of major
          changes. You may delete your account at any time to terminate this agreement.
        </p>

        <h3>7. Governing Law</h3>
        <p>These Terms are interpreted under the applicable jurisdiction's law.</p>

        <h3>8. Contact</h3>
        <p>support@bigmoonenglish.com</p>
      </article>
    </main>
  );
};

export default Terms;