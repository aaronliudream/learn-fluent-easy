import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";

const Disclaimer = () => {
  const t = useT();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={`${t("免责声明")} / Disclaimer`} subtitle="Last updated: 2026-05-04" back />

      <article className="prose prose-sm max-w-none rounded-2xl bg-card p-6 shadow-card md:p-8 dark:prose-invert">
        <h2><T>中文版</T></h2>

        <h3><T>1. 非官方机构声明</T></h3>
        <p>
          <T>Big Moon English（以下简称"本应用"）是一款独立开发的英语学习产品，与以下任何机构、组织、考试主办方均无任何关联、合作或授权关系：</T>
        </p>
        <ul>
          <li><T>中华人民共和国教育部及其下属任何单位；</T></li>
          <li><T>剑桥大学考试委员会（Cambridge Assessment / Cambridge English）；</T></li>
          <li><T>ETS（托福、GRE 主办方）、British Council、IELTS、Pearson PTE 等任何国际或国内英语考试机构；</T></li>
          <li><T>任何省市级教育考试院、招生办公室或公立学校。</T></li>
        </ul>
        <p>
          <T>本应用所提及的"高考""中考""四级""六级""新课标"等名词，仅用于描述课程难度对标参考，不代表任何官方背书。</T>
        </p>

        <h3><T>2. 学习效果声明</T></h3>
        <p>
          <T>本应用不承诺、不保证任何具体的考试分数、提分幅度、录取结果或学习效果。学习成果取决于使用者自身的投入时间、基础水平、学习方法等多种因素。</T>
        </p>
        <p>
          <T>本应用的核心价值在于：通过 AI 技术帮助你识别薄弱知识点、提供科学的复习路径、记录长期学习数据，作为你学习过程中的辅助工具。</T>
        </p>

        <h3><T>3. AI 生成内容声明</T></h3>
        <p>
          <T>本应用使用人工智能（包括但不限于 Google Gemini、OpenAI GPT 系列）生成课程内容、批改、释义与建议。AI 输出可能存在事实性错误、语法不严谨或文化偏差，仅供学习参考，不可作为权威答案。如发现错误，欢迎通过反馈按钮告知我们。</T>
        </p>

        <h3><T>4. 第三方内容声明</T></h3>
        <p>
          <T>应用中出现的真实人名、品牌、影视作品、新闻片段等仅为语言学习例句之用，不代表本应用与上述方有任何关联或商业合作。</T>
        </p>

        <h3><T>5. 责任限制</T></h3>
        <p>
          <T>在适用法律允许的最大范围内，因使用或无法使用本应用所产生的任何直接、间接、附带或后果性损失，本应用及其开发者不承担责任。</T>
        </p>

        <h3><T>6. 联系方式</T></h3>
        <p>support@bigmoonenglish.com</p>

        <hr />

        <h2>English Version</h2>

        <h3>1. No Official Affiliation</h3>
        <p>
          Big Moon English ("the App") is an independently developed English-learning product. We are <strong>not affiliated with, endorsed by, sponsored by, or in any way officially connected to</strong>:
        </p>
        <ul>
          <li>The Ministry of Education of the People's Republic of China or any of its subordinate bodies;</li>
          <li>Cambridge Assessment / Cambridge English / the University of Cambridge;</li>
          <li>ETS (TOEFL, GRE), the British Council, IELTS, Pearson PTE, or any other international or domestic English-testing organization;</li>
          <li>Any provincial or municipal examination authority, admissions office, or public school.</li>
        </ul>
        <p>
          References to "Gaokao", "Zhongkao", "CET-4 / CET-6", "New Curriculum Standards", or any standardized examination are used <strong>solely as a reference for content difficulty</strong> and do not imply any official endorsement.
        </p>

        <h3>2. No Guarantee of Results</h3>
        <p>
          The App makes <strong>no promise and no guarantee</strong> of any specific exam score, score increase, admission outcome, or learning result. Outcomes depend on each learner's effort, baseline level, study habits, and many other factors.
        </p>
        <p>
          What the App does aim to do: use AI to help you <strong>identify weak knowledge points</strong>, provide a <strong>structured review path</strong>, and track <strong>long-term learning data</strong> as a study aid.
        </p>

        <h3>3. AI-Generated Content</h3>
        <p>
          The App uses artificial-intelligence systems (including but not limited to Google Gemini and OpenAI GPT models) to generate lessons, grading, explanations, and suggestions. AI output may contain <strong>factual errors, imperfect grammar, or cultural bias</strong>, and should be treated as study reference only — not as an authoritative answer. Please report any errors via the in-app feedback button.
        </p>

        <h3>4. Third-Party Content</h3>
        <p>
          References to real people, brands, films, or news within example sentences are for language-learning purposes only and do not imply any partnership, sponsorship, or endorsement.
        </p>

        <h3>5. Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by applicable law, the App and its developers are not liable for any direct, indirect, incidental, or consequential losses arising from the use of, or inability to use, the App.
        </p>

        <h3>6. Contact</h3>
        <p>support@bigmoonenglish.com</p>
      </article>
    </main>
  );
};

export default Disclaimer;
