-- J 段 · 场景串记 30 个(**终态写法,可任意重放**)
--
-- 一个生活场景串起 8-15 个词/搭配/词块(叙事顺序),末尾双档短文把链词全串进去。
-- ⚠️ 终态:先删不在本表内的场景(items 靠 FK ON DELETE CASCADE 连带清),再按 title_zh 重建。
-- ⚠️ is_published 一律 false —— 建完不开灯,待 Aaron 审完再翻。
-- ⚠️ word_id 按 headword 关联 vocab_words;生活高频词多不在托福词表内,挂不上属正常。
-- ⚠️ 由 Aaron 执行。

BEGIN;

DELETE FROM vocab_scene_packs WHERE title_zh NOT IN (
  '网络购物', '租房搬家', '超市采购', '看病就医', '在餐厅点餐', '点外卖', '手机套餐与换运营商', '邻里噪音纠纷', '选课与退课', '小组作业', '图书馆借还书', '论文写作与查重', '考前复习', '找导师改论文', '求职面试', '第一天上班', '开会与汇报', '远程与混合办公', '加薪与升职', '辞职交接', '订机票与值机', '过海关入境', '酒店入住', '城市交通', '旅途出岔子', '租车与事故处理', '社交媒体', '网上支付与诈骗', '垃圾分类与环保', '人工智能进课堂'
);

INSERT INTO vocab_scene_packs
  (title_zh, theme_en, essay_short_en, essay_short_zh, essay_full_en, essay_full_zh, sort_order, is_published) VALUES
  ('网络购物', 'online shopping', 'Online shopping starts with browsing a wide selection and adding desired items to the cart. After placing an order, users often choose between free shipping and expedited shipping. Tracking the package provides updates on delivery time. If dissatisfied, returns are possible but may require dealing with customer service. Product reviews assist in decision-making by offering insights into quality.

Benefits include convenience, a wide selection, and time-saving. Drawbacks involve impersonal experiences, shipping delays, and difficult returns. While online shopping offers many advantages, balancing these with potential challenges is crucial for a satisfying experience.', '网络购物从浏览广泛的选择和将心仪商品加入购物车开始。下单后,用户通常在免费送货和加急送货之间选择。追踪包裹提供送货时间的更新。如果不满意,可以退货,但可能需要与客户服务打交道。产品评价通过提供质量见解帮助决策。

好处包括便利性、广泛选择和节省时间。缺点包括缺乏人情味的体验、送货延迟和退货困难。尽管网络购物有很多优势,但平衡这些与潜在挑战对于获得满意的体验至关重要。', 'Online shopping has transformed the way we purchase goods. It begins with browsing through a wide selection of products, where one can easily add to cart the desired items. Once satisfied, the next step is to place an order. Many platforms offer free shipping, though expedited shipping is available for those in a hurry. Customers can track the package using real-time updates, ensuring they know exactly when it will arrive. If the product doesn''t meet expectations, a return can be initiated, though it may involve dealing with customer service. Product reviews often guide the decision-making process, providing insight into the quality and reliability of items.

The benefits of online shopping are clear: it offers unparalleled convenience, a wide selection of products, and significant time-saving. However, it is not without its drawbacks. The experience can feel impersonal, with no face-to-face interaction. Shipping delays can be frustrating, especially when free shipping is selected. Additionally, returns can be complicated and time-consuming.

In conclusion, while online shopping offers numerous advantages, it also presents challenges that consumers must navigate. Balancing convenience with potential drawbacks is key to a satisfying online shopping experience.', '网络购物已经改变了我们购买商品的方式。首先是浏览各种产品,可以轻松将心仪的商品加入购物车。当满意后,下一步就是下单。许多平台提供免费送货,尽管加急送货可供赶时间的人选择。顾客可以通过实时更新追踪包裹,确保知道确切的到货时间。如果产品不符合预期,可以发起退货,但这可能涉及与客户服务打交道。产品评价通常会指导决策过程,提供关于商品质量和可靠性的见解。

网络购物的好处显而易见:它提供了无与伦比的便利性、广泛的产品选择和显著的时间节省。然而,它也并非没有缺点。体验可能显得缺乏人情味,没有面对面的互动。尤其选择免费送货时,送货延迟可能令人沮丧。此外,退货可能复杂且耗时。

总之,虽然网络购物提供了众多优势,但也存在消费者必须应对的挑战。平衡便利性与潜在缺点是获得满意的网络购物体验的关键。', 1, false),
  ('租房搬家', 'renting a flat', 'Renting an apartment involves several steps. First, you view an apartment to find a suitable one. After that, you sign a lease and pay a deposit. Setting up utilities is next, followed by arranging furniture and moving in. Meeting the neighbors is important for community integration. 

Renting offers benefits like more living space, independence, and a new environment. However, it also presents drawbacks such as high moving costs, adapting challenges, and potential noise. Overall, with proper preparation, renting can be a rewarding experience.', '租房包括几个步骤。首先,你需要看房以找到合适的住所。接下来,签租约并支付押金。然后开通水电气,安排家具并搬入。认识邻居有助于融入社区。

租房的好处包括更多的生活空间、独立生活和体验新环境。然而,也有搬家费用高、适应挑战和噪音问题等弊端。总体而言,如果准备充分,租房可以是一次值得的经历。', 'Renting an apartment and moving can be both exciting and challenging. Initially, you need to view an apartment to find one that suits your needs. Once satisfied, you sign a lease, a crucial step that legally binds you to the property. You then pay a deposit, which is usually refundable if no damage is done. Next, you set up utilities like water, gas, and electricity. After arranging your furniture, you finally move in, marking a new chapter in your life. Meeting the neighbors can help you integrate into the community. 

Living in an urban area often offers better access to amenities compared to a suburban area, which might be more peaceful. The benefits of renting an apartment include having more living space, living independently, and experiencing a new environment. However, there are drawbacks, such as high moving costs, the challenge of adapting to a new environment, and potential noise issues. Weighing these factors, renting an apartment is generally a positive experience if one is prepared for the initial challenges.', '租房搬家既令人兴奋又充满挑战。首先,你需要看房,以找到合适的住所。一旦满意,你便签租约,这是将你合法地与房产绑定的重要一步。接着,你支付押金,通常在没有损坏的情况下是可以退还的。然后,你开通水电气等公用设施。安排好家具后,你最终搬入,标志着生活新篇章的开始。认识邻居可以帮助你融入社区。

居住在城市地区通常比郊区更容易获得便利设施,而郊区可能更宁静。租房的好处包括更多的生活空间、独立生活和体验新环境。然而,也有一些弊端,如搬家费用高、适应新环境的挑战和可能遇到的噪音问题。权衡这些因素,如果准备好迎接初期的挑战,租房总体上是一个积极的经历。', 2, false),
  ('超市采购', 'grocery shopping', 'When grocery shopping, start by making a shopping list to save time and stay organized. As you walk through each aisle, check what is in stock and the best-before dates for freshness. At checkout, choose between self-checkout for small items or a cashier for larger purchases. Use a loyalty card and any coupons to save more. Lastly, bag the groceries carefully. While there are benefits like discounts and efficiency, challenges such as out-of-stock items and long lines exist. Being prepared can make your trip rewarding.', '在采购时,先列购物清单以节省时间和保持有条理。走过货架通道时,检查有货商品和保质期以确保新鲜。在结账时,小件商品可用自助结账,大件商品或需帮助时选择收银员。使用会员卡和优惠券可省更多。最后,小心装袋。尽管有折扣和效率等好处,但也有缺货和排队等挑战。做好准备可使购物之旅更有收获。', 'When heading to the supermarket for grocery shopping, it''s wise to first make a shopping list. This helps in saving time and ensures a more organized shopping experience. As you navigate through each aisle, you can quickly identify which products are in stock and avoid the disappointment of missing items. Checking the best-before date is essential to ensure the freshness of your groceries. 

When it''s time to pay, you might choose between self-checkout and a cashier. Self-checkout is great for small purchases and avoiding long lines, while a cashier is better for larger purchases or when you need assistance. Using a loyalty card can earn you points or discounts, adding to the savings. Don''t forget to use any coupons you have to further reduce the total cost. Finally, bag the groceries efficiently, ensuring fragile items are protected.

While grocery shopping can be efficient and cost-effective, there are drawbacks like potential out-of-stock items or forgetting your list. Sometimes, long lines can also be a hassle. Weighing these pros and cons, being prepared and organized can make your supermarket visit smooth and rewarding.', '去超市采购时,首先列购物清单是明智之举。这有助于节省时间,确保购物过程更有条理。在穿过每个货架通道时,你可以快速识别哪些商品有货,避免缺货的失望。检查保质期是确保食品新鲜的关键。

结账时,你可以选择自助结账或收银员结账。自助结账适合少量商品且不想排队,而收银员结账适合大量商品或需要人工帮助时。使用会员卡可以赚取积分或折扣,增加节省。别忘了使用任何优惠券,进一步降低总成本。最后,有效地装袋,确保易碎物品得到保护。

虽然超市采购可以高效且经济,但也有缺点,如可能缺货或忘记清单。有时,长队也可能是个麻烦。权衡这些利弊,做好准备和有条理可以使你的超市之行顺利且有收获。', 3, false),
  ('看病就医', 'seeing a doctor', 'Seeing a doctor involves making an appointment, discussing symptoms, undergoing a medical examination, and receiving a diagnosis from the doctor. Treatment can involve prescription or over-the-counter medications, both of which may have side effects. Follow-up appointments and health insurance play roles in managing the process, leading to recovery.

Benefits include early detection, personalized treatment, and professional advice. However, it can be time-consuming, expensive, and medications may cause side effects. Despite drawbacks, seeing a doctor is crucial for health as its benefits often outweigh the negatives.', '看病就医包括预约就诊、描述症状、进行体检和获得医生诊断。治疗可能涉及处方药或非处方药,两者都可能有副作用。复诊预约和健康保险在管理过程中起作用,最终实现康复。

好处包括早期发现、个性化治疗和专业建议。然而,这一过程可能耗时、昂贵,药物可能有副作用。尽管有弊端,就医对于健康至关重要,因为其好处往往超过缺点。', 'Seeing a doctor is a common necessity for maintaining good health. Initially, one must make an appointment to visit the doctor. During the visit, patients discuss their symptoms, which leads to a medical examination. Based on this, a diagnosis from the doctor is provided. Often, the treatment involves medication, which can be either prescription or over-the-counter. Prescription medications require a doctor''s approval, while over-the-counter drugs can be purchased directly. However, all medications can have side effects. After starting treatment, a follow-up appointment is usually necessary to monitor progress. Health insurance often helps with the costs involved in these processes. The ultimate goal is recovery.

The benefits of seeing a doctor include early detection of diseases, personalized treatment, and professional advice, which are crucial for effective health management. However, the process can be time-consuming and expensive, and medications may have side effects. Balancing these pros and cons, visiting a doctor remains essential for maintaining health, as the benefits of early intervention and expert guidance often outweigh the drawbacks.', '看病就医是保持健康的常见需求。首先,需要进行预约就诊。在就诊期间,患者会描述自己的症状,这会引导医生进行体检。根据体检结果,医生会给出诊断。通常,治疗方案包括用药,可能是处方药或非处方药。处方药需要医生开具,而非处方药可以直接购买。然而,所有药物都可能有副作用。在开始治疗后,通常需要复诊预约以监测病情进展。健康保险通常可以帮助支付这些过程中的费用。最终目标是康复。

看病就医的好处包括疾病的早期发现、个性化治疗和专业建议,这些对于有效的健康管理至关重要。然而,这一过程可能耗时且昂贵,药物可能有副作用。在权衡这些利弊后,就医仍然是保持健康的必要步骤,因为早期干预和专家指导的好处往往超过弊端。', 4, false),
  ('在餐厅点餐', 'eating out', 'Eating out begins by booking a table. Upon arrival, you are seated and given the menu. Consider if you are allergic to anything before you place an order. After the meal, request the check and decide if you want to split it with friends. You may need to consider a tip vs service charge. Finally, leave a review of your experience.

Eating out is convenient with diverse food options and social benefits. However, it can be expensive and limits control over meal ingredients, plus potential wait times. Despite drawbacks, the overall experience often justifies the choice.', '外出就餐从预订餐桌开始。到达后,您会入座并拿到菜单。点单前,考虑自己是否对某些食材过敏。用餐后,索要账单并决定是否与朋友平摊。您可能需要考虑给小费还是支付服务费。最后,留下对体验的评价。

外出就餐方便,食物多样,社交益处多。然而,价格昂贵,对食材控制有限,还有可能的等待时间。尽管有缺点,整体体验常常值得选择。', 'Eating out can be a delightful experience if planned well. First, you book a table to ensure a spot at your favorite restaurant. Once you arrive, you are seated comfortably and handed the menu. As you look through it, you might consider if you are allergic to any ingredients before you place an order. After enjoying your meal, you ask for the check. If dining with friends, you may decide to split it. Here, you might encounter the decision of giving a tip vs service charge; the former is optional and shows appreciation, while the latter is automatically added by the restaurant. Finally, you leave a review to share your experience.

Eating out offers a convenient dining experience with a variety of food options and opportunities for social interaction. However, it can be expensive, and you have limited control over the ingredients used in your meal. Additionally, potential wait times can be a downside. In conclusion, while there are drawbacks, the benefits of eating out often outweigh the negatives, making it a popular choice for many.', '如果计划得当,外出就餐可以是一次令人愉快的体验。首先,您需要预订餐桌以确保能在您喜欢的餐厅有位子。到达后,您会被带到座位上,并递上菜单。在查看菜单时,您可能会考虑自己是否对某些成分过敏,然后再点单。享用完美食后,您会要求账单。如果是和朋友一起就餐,您可能会决定平摊费用。在这里,您可能会遇到给小费还是支付服务费的选择;前者是自愿的,是对服务的赞赏,而后者是餐厅自动加上的。最后,您可以留下评价以分享您的体验。

外出就餐提供了一种便利的用餐体验,有多种食物选择,还能提供社交互动的机会。然而,外出就餐可能很昂贵,并且您对食材的控制有限。此外,可能的等待时间也是一个缺点。总的来说,尽管有一些缺点,但外出就餐的好处往往超过这些不足,使其成为许多人的热门选择。', 5, false),
  ('点外卖', 'food delivery', 'Ordering food delivery is now a common practice. People place an order considering the delivery fee. The main benefits are convenience, variety, and time-saving. However, estimated delivery time can be inaccurate, and notifications might indicate running late, leading to cold food instead of hot. Companies apologize, but customers might still leave a review.

While food delivery is convenient, drawbacks like increased fees, temperature issues, and uncertain waiting times can be frustrating. The choice to use these services depends on weighing benefits against drawbacks.', '点外卖已成常事。人们下订单时会考虑配送费。主要好处是方便、多样和省时。然而,预计送达时间可能不准,通知可能显示延迟,导致收到冷食而非热食。公司会道歉,但顾客可能仍会留下评价。

尽管外卖方便,但如费用增加、温度问题和不确定的等待时间等缺点可能让人沮丧。是否使用这些服务取决于权衡利弊。', 'Ordering food delivery has become a common practice in modern life. When people decide to place an order, they often consider the delivery fee as part of the cost. The convenience and variety offered by food delivery services are undeniable benefits. Additionally, these services save time for those with busy schedules. However, the estimated delivery time is not always accurate, and notifications may inform customers that their orders are running late. In such cases, delivery companies usually apologize, but this doesn''t always compensate for the disappointment of receiving cold food instead of hot food. Customers might feel compelled to leave a review to express their dissatisfaction or appreciation. 

While the convenience, variety, and time-saving aspects of food delivery are significant, drawbacks like increased costs, potential temperature issues with food, and uncertain waiting times can be frustrating. Ultimately, the decision to use food delivery services depends on weighing these benefits against the drawbacks.', '点外卖已成为现代生活中的常见做法。当人们决定下订单时,他们通常会考虑配送费作为成本的一部分。外卖服务提供的便利性和多样性是不可否认的好处。此外,对于时间紧张的人来说,这些服务节省了时间。然而,预计送达时间并不总是准确,通知可能会告知顾客订单延迟。在这种情况下,外卖公司通常会道歉,但这并不能总是弥补收到冷食而非热食的失望。顾客可能会觉得有必要留下评价来表达不满或欣赏。

尽管外卖的便利性、多样性和节省时间的优势显著,但如费用增加、食物温度问题和不确定的等待时间等缺点可能会令人沮丧。最终,是否使用外卖服务取决于对这些利弊的权衡。', 6, false),
  ('手机套餐与换运营商', 'mobile plans', 'Choosing a mobile plan requires considering data allowance needs. Unlimited plans suit heavy users, while limited plans work for occasional users. Roaming is vital for travelers. Benefits include larger data allowances and avoiding overage fees, but switching carriers can be a hassle with possible poor network coverage and hidden fees.

Running out of data leads to overage fees or the need to top up. Switching carriers might be economical, and you can keep your number. While new plans offer advantages, weigh the drawbacks of switching carriers carefully. The best choice depends on your needs.', '选择手机套餐时,要考虑流量额度需求。无限流量适合重度用户,有限流量适合偶尔使用者。漫游对旅行者至关重要。好处包括更大流量额度和避免超额费用,但换运营商可能麻烦,且网络覆盖不佳,还可能有隐藏费用。

流量用完会导致超额费用或需充值。换运营商可能更经济,且可保留号码。新套餐有优点,但需认真权衡换运营商的弊端。最佳选择取决于你的需求。', 'When choosing a mobile plan, it''s essential to consider your data allowance needs. Some people opt for unlimited plans, which are excellent for heavy users, while others prefer limited plans if they use data less frequently. Roaming is another crucial factor if you travel often. 

The benefits of selecting the right plan include a larger data allowance, avoiding overage fees, and potentially lower roaming charges. However, there are drawbacks to consider. Switching carriers can be a hassle, and you might face poor network coverage with a new provider. Hidden fees can also be an unwelcome surprise.

If you run out of data, you may have to pay overage fees, or you might need to top up your plan. In some cases, it might be more economical to switch carriers. Fortunately, you can keep your number when you change providers, maintaining continuity.

In conclusion, while there are benefits to choosing a new mobile plan, such as better data allowances and reduced costs, the potential drawbacks of switching carriers must be carefully weighed. Ultimately, the best decision depends on your specific needs and usage habits.', '在选择手机套餐时,了解自己的流量额度需求至关重要。有些人选择无限流量套餐,这对重度用户来说是不错的选择,而偶尔使用流量的人可能更倾向于有限流量套餐。如果你经常旅行,漫游也是一个需要考虑的重要因素。

选择合适套餐的好处包括更大流量额度、避免超额费用,以及可能更低的漫游费用。然而,也有一些弊端需要考虑。换运营商可能会很麻烦,而且新运营商的网络覆盖可能不佳。此外,隐藏费用也可能会让人措手不及。

如果流量用完,你可能需要支付超额费用,或者需要充值。在某些情况下,换运营商可能更经济。好在,你可以在更换服务商时保留原号码,保持联系的连续性。

总之,虽然选择新手机套餐有更大流量额度和降低费用等好处,但换运营商的潜在弊端也必须认真权衡。最终,最佳决定取决于你的具体需求和使用习惯。', 7, false),
  ('邻里噪音纠纷', 'noisy neighbours', 'Dealing with noisy neighbors often starts with a complaint, asking them to keep it down. If unresolved, you might talk to the landlord for mediation. Then, decide whether to put up with the noise or file a complaint. Filing a noise complaint could involve local authorities, but sometimes neighbors are willing to compromise.

Benefits include improved quality of life and better sleep. However, drawbacks like strained relationships and a time-consuming process exist. Ultimately, action depends on the noise''s impact on your life.', '处理吵闹邻居通常从抱怨开始，要求他们小声点。如果问题未解决，你可能会找房东调解。然后，决定是忍受噪音还是投诉。提交噪音投诉可能涉及当地部门，但有时邻居愿意妥协。

好处包括改善生活质量和提高睡眠质量。然而，也有关系紧张和耗时等弊端。最终，是否采取行动取决于噪音对生活的影响。', 'Dealing with noisy neighbors is a common issue that many people face. Initially, you might choose to complain directly to them and ask them to keep it down. If that doesn''t work, the next step could be to talk to the landlord to see if they can mediate the situation. At this point, you have to decide whether to put up with the noise or file a complaint. Filing a noise complaint might involve contacting local authorities. In some cases, neighbors might be willing to compromise, leading to a peaceful resolution.

The benefits of addressing noisy neighbors include improved quality of life, better sleep, and enhanced communication with those around you. However, there are drawbacks to consider, such as strained relationships with neighbors, a time-consuming process, and the potential for escalation if the situation worsens.

Ultimately, the decision to address noisy neighbors should be based on a balance of these factors. If the noise severely impacts your daily life, taking action may be necessary. However, if the issue is minor, it might be worth trying to live with it to maintain harmony in the neighborhood.', '处理吵闹的邻居是许多人面临的常见问题。最初，你可能会选择直接向他们抱怨并让他们小声点。如果这不起作用，下一步可能是找房东谈谈，看他们能否调解。在这时，你需要决定是忍受噪音还是提交投诉。提交噪音投诉可能涉及联系当地相关部门。在某些情况下，邻居可能愿意妥协，从而达成和平解决。

解决吵闹邻居的问题有许多好处，包括改善生活质量、提高睡眠质量以及增强与周围人的沟通。然而，也有一些弊端需要考虑，比如与邻居的关系紧张、耗时的处理过程，以及如果情况恶化可能导致的升级。

最终，是否处理吵闹的邻居应基于这些因素的平衡。如果噪音严重影响你的日常生活，采取行动可能是必要的。然而，如果问题较小，可能值得尝试忍受以维护邻里的和谐。', 8, false),
  ('选课与退课', 'course registration', 'Full-time students planning a semester begin by checking the class schedule. They need to meet prerequisites to enroll in courses, each offering credits toward graduation. Sometimes, a clash or overlap in schedule occurs, necessitating a course drop. It''s vital to consider the add/drop deadline and consult an advisor to manage academic workload. 

Benefits include flexible scheduling, exploring interests through electives, and a manageable workload. Drawbacks involve potential schedule conflicts, the risk of dropping essential courses, and decision-making stress. Properly managed, course registration balances academic needs and personal interests.', '全日制学生在规划学期时会先查看课程表，需完成先修课程才能注册，每门课提供毕业学分。有时会遇到时间冲突或重叠，需要退课。注意加退课截止日期并咨询顾问以管理学术负担。

好处包括灵活的课表安排、通过选修课探索兴趣以及可管理的学术负担。缺点是可能的时间冲突、退掉必要课程的风险以及决策压力。妥善管理下，选课可以平衡学术需求与个人兴趣。', 'When planning for a new semester, full-time students often start by checking the class schedule to decide which courses to take. They must ensure they have met any prerequisites before they can enroll in a course. Each course grants a certain number of credits, contributing to the required total for graduation. However, students might face a clash or overlap in their schedule, where courses occur at the same time or partially overlap. If this happens, they may need to drop a course. It''s crucial to be mindful of the add/drop deadline to make any necessary changes. Consulting an advisor can help in making informed decisions and managing academic workload effectively. 

The main benefits of this process include the flexibility in schedule, the opportunity to explore varied interests through electives, and maintaining a manageable academic workload. On the downside, students might encounter schedule conflicts, risk dropping necessary courses, and experience stress from decision-making. Despite these drawbacks, if managed well, course registration can be a rewarding experience that balances both academic requirements and personal interests.', '在规划新学期时，全日制学生通常会先查看课程表，以决定要选哪些课程。他们必须确保自己已完成任何先修课程才能注册课程。每门课程提供一定数量的学分，累积到毕业所需的总学分。然而，学生可能会遇到时间冲突或部分重叠的情况，即课程在同一时间进行或部分时间重合。如果发生这种情况，他们可能需要退课。注意加退课截止日期以便及时做出必要更改是至关重要的。咨询顾问可以帮助做出明智的决定，并有效管理学术负担。

这个过程的主要好处包括课表的灵活性，通过选修课探索不同兴趣的机会，以及保持可管理的学术负担。缺点是学生可能会遇到时间冲突，冒着退掉必要课程的风险，并因决策而感到压力。尽管有这些缺点，如果管理得当，选课可以是一个既满足学术要求又符合个人兴趣的有益体验。', 9, false),
  ('小组作业', 'group projects', 'In group projects, assigning roles is the first step to ensure everyone knows their tasks. This is followed by brainstorming to reach consensus on the project. Cooperation and collaboration are key, but the free-rider problem can occur if some members don''t contribute equally. Teams must meet deadlines, merge slides, and rehearse presentations. Afterward, feedback is gathered and the process is reflected upon.

Group projects enhance communication skills, foster team spirit, and promote innovative thinking. However, they also pose challenges like time management issues, potential conflicts, and uneven responsibility distribution. Despite these drawbacks, the benefits make group projects a valuable experience.', '在小组作业中,第一步是分配角色,确保每个人知道他们的任务。接下来是头脑风暴,以便在项目上达成共识。合作与协作是关键,但如果有些成员不均衡贡献,搭便车问题可能出现。团队必须遵守截止日期,合并幻灯片并排练演讲。之后,收集反馈并反思过程。

小组作业提高沟通能力,培养团队精神,促进创新思维。然而,它们也带来时间管理问题、潜在冲突和责任不均衡等挑战。尽管有这些缺点,小组作业的好处使其成为一项有价值的体验。', 'In group projects, the first step is often to assign roles to each member, ensuring that everyone knows their responsibilities. This is followed by a brainstorming session to generate ideas and reach consensus on the project''s direction. As the project progresses, members must cooperate and collaborate effectively. However, the free-rider problem can arise when some members do not contribute equally. Meeting the deadline becomes crucial, and teams often need to merge slides and rehearse the presentation to ensure smooth delivery. After the presentation, feedback is gathered, and it''s important to reflect on the process to identify areas for improvement.

Group projects offer several benefits. They enhance communication skills as members must articulate ideas clearly. They also foster team spirit, encouraging members to work together towards a common goal. Moreover, they promote innovative thinking by combining diverse perspectives.

However, group projects also have drawbacks. Time management can be challenging, especially when coordinating schedules. Conflicts may arise from differing opinions, and responsibilities might not be evenly distributed.

In conclusion, while group projects present certain challenges, their benefits in developing valuable skills make them a worthwhile endeavor.', '在小组作业中,第一步通常是为每个成员分配角色,确保每个人都知道他们的责任。接下来是头脑风暴,以产生想法并在项目方向上达成共识。随着项目的进展,成员们必须有效地合作与协作。然而,搭便车问题可能会出现,即有些成员贡献不均。此时,截止日期变得至关重要,团队通常需要合并幻灯片并排练演讲以确保顺利交付。演讲结束后,会收集反馈,反思过程以找出改进之处是很重要的。

小组作业有几个好处。它们提高沟通能力,因为成员必须清晰地表达想法。它们也培养团队精神,鼓励成员为共同目标一起努力。此外,通过结合多样化的视角,它们促进创新思维。

然而,小组作业也有一些弊端。时间管理可能是个挑战,尤其是在协调时间表时。不同意见可能引发冲突,责任可能分配不均。

总之,尽管小组作业存在某些挑战,但在培养有价值技能方面的好处使其成为值得尝试的事情。', 10, false),
  ('图书馆借还书', 'using the library', 'Making the most of the library starts with browsing the library catalog to locate the books you need. Use your library card to check out books, and note the due date to avoid overdue fines. You can renew books if needed, but remember, overdue books will incur fines. Set reminders to avoid missing due dates. If a book is unavailable, you can reserve it for later. Many students forget to renew, leading to fines, so staying organized is key. By following these steps, you can efficiently utilize library resources without unnecessary penalties.', '充分利用图书馆从浏览图书馆目录开始,找到你需要的书。使用图书馆卡借书,并记下到期日以避免逾期罚款。需要时可以续借,但要记住,逾期会产生罚款。设置提醒以避免错过到期日。如果书不可用,可以预约。许多学生忘记续借,导致罚款,所以保持有序很重要。通过遵循这些步骤,你可以高效利用图书馆资源,而不会产生不必要的罚款。', 'Using the library efficiently can greatly enhance your study experience. First, start by browsing the library catalog to see what''s available. Once you locate the book you need, you can decide whether to use your library card or student ID. Typically, a library card is necessary for checking out books, while a student ID may be used for identity verification. After checking out the book, make sure to note the due date to avoid any issues later. If you need more time, you can always renew the book, provided no one else has reserved it. 

It''s important to avoid letting a book become overdue, as this will result in a fine. Many students forget to renew or return books on time, leading to unnecessary penalties. A helpful tip is to set reminders on your phone for due dates and renewal periods.

Finally, if a book you need is checked out by someone else, you can reserve it for when it becomes available. By following these steps, you''ll make the most of your library''s resources without incurring fines or missing out on important materials.', '高效使用图书馆可以大大提升你的学习体验。首先,从浏览图书馆目录开始,看看有哪些书可以借阅。一旦找到所需的书籍,你可以决定使用图书馆卡还是学生证。通常,图书馆卡用于借书,而学生证可能用于身份验证。在借出书籍后,一定要记下到期日,以避免后续问题。如果需要更多时间,只要没有其他人预约,你总是可以续借。

重要的是要避免书籍逾期,因为这会导致罚款。许多学生忘记续借或按时归还书籍,从而导致不必要的罚款。一个有用的小建议是,在手机上设置提醒,以便记住到期日和续借期。

最后,如果你需要的书被其他人借走,可以预约,等它可用时借阅。通过遵循这些步骤,你可以最大限度地利用图书馆的资源,而不会产生罚款或错过重要材料。', 11, false),
  ('论文写作与查重', 'academic writing', 'Writing an academic paper starts with an outline to structure the paper. Then, gather sources to support arguments. Correct citation is crucial, deciding between paraphrase and quote to avoid plagiarism. Paraphrasing uses your words, while quoting uses exact words with quotes. Use plagiarism detection software for originality. Proofreading is essential to catch errors before finalizing the draft.

This process improves structure, ensures citations, and avoids misconduct, but is time-consuming and software reliability can be an issue. Balancing these is key to success.', '撰写学术论文从提纲开始,用于组织结构。然后,搜集资料支持论点。正确引用至关重要,需在paraphrase和quote之间选择以避免抄袭。paraphrase用自己的话,quote则用引号标出原文。使用查重软件确保原创性。校对对发现错误至关重要,然后定稿。

这个过程提高结构、确保引用、避免不端,但耗时且软件可靠性成问题。平衡这些是成功的关键。', 'Writing an academic paper requires careful planning and execution. The process begins with creating a detailed outline, which helps in structuring the paper effectively. Next, one must gather sources from various references to support the arguments. To maintain academic integrity, it is crucial to cite correctly and decide whether to paraphrase or quote, as paraphrasing involves using your own words to express the original idea, while quoting requires using the exact words with quotation marks. This practice helps to avoid plagiarism, a serious academic offense. To further ensure originality, one should use plagiarism detection software. After addressing these elements, proofreading becomes essential to catch any grammatical or typographical errors. Finally, the draft is finalized, ensuring that the paper is polished and ready for submission.

While this meticulous process improves the writing structure, ensures accurate citations, and avoids academic misconduct, it can be time-consuming and labor-intensive. Additionally, reliance on plagiarism detection software might not always be accurate, leading to false positives. Over-dependence on technology can also hinder the development of independent writing skills. Balancing these aspects is key to successful academic writing.', '写作学术论文需要精心的规划和执行。首先需要制定详细的提纲,有助于有效地组织论文结构。接下来,需要从各种参考资料中搜集资料来支持论点。为了维护学术诚信,正确引用至关重要,并需决定是paraphrase还是quote,因为paraphrase是用自己的话表达原意,而quote则需要用引号标出原文。这有助于避免抄袭,一种严重的学术违规行为。为进一步确保原创性,应使用查重软件。在解决这些问题后,校对是必不可少的,以发现任何语法或排版错误。最后,定稿确保论文已经打磨完毕,可以提交。

虽然这个细致的过程能提高写作结构,确保引用准确,避免学术不端,但也可能耗时费力。此外,对查重软件的依赖可能不够准确,导致误报。过度依赖技术也可能阻碍独立写作能力的发展。平衡这些方面是成功学术写作的关键。', 12, false),
  ('考前复习', 'exam revision', 'Preparing for an exam can be simplified by making a study plan and setting realistic goals. Prioritizing tasks allows students to focus on practice tests and reviewing old exams. Choosing between cramming and pacing yourself is crucial; cramming can lead to burnout, while pacing helps maintain focus. Taking breaks is essential to stay energized.

Benefits include improved time management, better retention, and reduced anxiety. However, potential burnout and time consumption are drawbacks, along with over-relying on old exams. Overall, a balanced approach, incorporating breaks, prepares students to take the exam confidently.', '通过制定学习计划和设定实际的目标，可以简化考试准备。优先考虑任务使学生能够专注于练习测试和复习旧试卷。选择临时抱佛脚还是合理分配时间至关重要；临时抱佛脚可能导致精疲力竭，而合理分配时间有助于保持专注。休息对保持精力至关重要。

好处包括改善时间管理、信息保留率提高和减少焦虑。然而，潜在的精疲力竭和耗时是缺点，还有过度依赖旧试卷。总体而言，结合休息的平衡方法可以让学生自信地参加考试。', 'Preparing for an exam can be a daunting task, but making a study plan can simplify the process. By setting realistic goals, students can prioritize their tasks effectively. Practice tests and reviewing old exams are great ways to identify strengths and weaknesses. However, students often face a dilemma: cram vs pace yourself. Cramming might lead to temporary knowledge gain but can also result in burnout. It''s crucial to pace yourself, allowing time to take breaks and stay focused. 

The benefits of a structured study approach include improved time management, better retention of information, and reduced exam anxiety. However, there are drawbacks to consider. The potential for burnout remains high if not managed well. Additionally, this approach can be time-consuming, and there may be an over-reliance on old exams, which might not cover new material.

In conclusion, while the structured approach to exam preparation has its challenges, its benefits often outweigh the drawbacks. By balancing study techniques and incorporating regular breaks, students can take the exam with confidence and perform to the best of their ability.', '准备考试可能是一项艰巨的任务，但制定学习计划可以简化这个过程。通过设定实际的目标，学生可以有效地优先考虑他们的任务。练习测试和复习旧试卷是识别优缺点的好方法。然而，学生常常面临一个难题：临时抱佛脚还是合理分配时间。临时抱佛脚可能导致知识的暂时性增加，但也可能导致精疲力竭。因此，合理分配时间至关重要，这样可以有时间休息并保持专注。

结构化学习方法的好处包括改善时间管理、提高信息保留率和减少考试焦虑。然而，也有一些缺点需要考虑。如果管理不当，精疲力竭的风险仍然很高。此外，这种方法可能耗时，并且可能过于依赖旧试卷，而这些试卷可能不涵盖新材料。

总之，虽然结构化的考试准备方法有其挑战，但其好处往往超过缺点。通过平衡学习技巧并融入定期休息，学生可以自信地参加考试并发挥最佳水平。', 13, false),
  ('找导师改论文', 'getting feedback', 'Engaging with a mentor during office hours provides valuable feedback, including constructive criticism. This guides you to revise and incorporate suggestions, improving clarity and coherence. Resubmitting the work allows you to gain new insights and enhance writing skills while building a mentor relationship.

However, it can be time-consuming and potentially discouraging if feedback is overly critical. There''s also a risk of over-dependence, impacting your ability to accept or reject suggestions independently.

Despite these challenges, the benefits of improved skills and relationships make seeking feedback a worthwhile endeavor.', '在办公时间与导师交流提供了宝贵的反馈,包括建设性的批评。这指导你修改并采纳建议,提高清晰度和连贯性。重新提交工作让你获得新见解,提高写作技能,同时建立与导师的关系。

然而,这可能非常耗时,并在反馈过于苛刻时带来挫败感。也有可能过于依赖,影响你独立接受或拒绝建议的能力。

尽管有这些挑战,但提高技能和关系的好处使得寻求反馈成为值得的努力。', 'Engaging with a mentor during office hours can profoundly impact your academic work. During these sessions, you receive valuable feedback that often includes constructive criticism. This feedback is crucial as it guides you to revise and improve your work. By incorporating suggestions, you can enhance the clarity and coherence of your paper. Once revisions are made, you resubmit your work for further evaluation. This process allows you to gain new insights and enhances your writing skills. Additionally, it fosters a strong mentor relationship, which can be beneficial for future academic endeavors.

However, seeking feedback has its drawbacks. It can be time-consuming, requiring multiple revisions and resubmissions. There''s also the potential for discouragement if feedback is overly critical. Moreover, there''s a risk of becoming over-dependent on your mentor''s guidance, hindering your ability to accept or reject suggestions independently.

On balance, while the process of seeking feedback and revising can be challenging, the benefits of improved skills and strengthened relationships outweigh the drawbacks, making it a worthwhile endeavor for any student.', '在办公时间与导师交流可以对你的学术工作产生深远影响。在这些会话中,你会收到宝贵的反馈,其中通常包括建设性的批评。这些反馈至关重要,因为它指导你修改和改善你的工作。通过采纳建议,你可以提高论文的清晰度和连贯性。一旦完成修改,你需要重新提交你的工作以供进一步评估。这一过程让你获得新的见解,并提高你的写作技能。此外,它还促进了与导师的良好关系,这对未来的学术发展大有裨益。

然而,寻求反馈也有其缺点。这可能非常耗时,需要多次修改和重新提交。如果反馈过于苛刻,也可能带来挫败感。此外,可能会过于依赖导师的指导,妨碍你独立接受或拒绝建议的能力。

总的来说,虽然寻求反馈和修改的过程可能具有挑战性,但提高技能和加强关系的好处大于其缺点,使其成为任何学生都值得尝试的努力。', 14, false),
  ('求职面试', 'job hunting', 'Job hunting starts with a job posting that interests you. Tailor your resume to fit the position and submit an application. If you get shortlisted, prepare for the interview. Upon receiving an offer, decide whether to negotiate salary or accept as is. Accepting the offer begins a new career chapter. Benefits include career advancement, financial stability, and networking, but it can be time-consuming and stressful, with the risk of rejection. Despite these drawbacks, the rewards make job hunting worthwhile, so approach it strategically to maximize benefits and minimize drawbacks.', '求职从一个吸引你的职位发布开始。量身定制简历以适应职位并提交申请。如果进入候选名单，准备面试。收到录用通知后，决定是谈判薪水还是接受现有薪水。接受录用开启职业生涯新篇章。好处包括职业发展、财务稳定和人脉机会，但过程可能耗时、压力大，并伴随被拒绝的风险。尽管有这些缺点，回报使求职值得，因此要战略性地接近这个过程，以最大化好处并最小化缺点。', 'Job hunting is an essential step in career development. It begins with a job posting that catches your eye. After identifying a suitable position, the next step is to tailor your resume to highlight relevant skills and experiences. Once you submit an application, there''s a waiting period to see if you get shortlisted or get rejected. Being shortlisted means preparing for the interview, which can be a high-pressure situation. If successful, you''ll receive an offer. At this point, you might decide to negotiate salary or accept as is, depending on your needs and the offer''s attractiveness. Accepting the offer marks the start of a new chapter in your career.

The benefits of this process include career advancement opportunities, increased financial stability, and networking opportunities. However, it can be time-consuming and comes with the risk of rejection. The interview itself can be a high-pressure experience. Despite these drawbacks, the potential rewards make job hunting a worthwhile endeavor. Balancing the pros and cons, it''s crucial to approach the process strategically, ensuring you maximize the benefits while mitigating the drawbacks.', '求职是职业发展的重要一步。它始于一个吸引你注意的职位发布。在确定合适的职位后，下一步是量身定制简历，突出相关技能和经验。一旦提交申请，就会有一段等待期，看是进入候选名单还是被拒绝。进入候选名单意味着要准备面试，这可能是一个高压的情况。如果成功，你会收到录用通知。这时，你可能会决定谈判薪水或接受现有薪水，取决于你的需求和录用的吸引力。接受录用标志着你职业生涯新篇章的开始。

这个过程的好处包括职业发展机会、增加的财务稳定性和人脉机会。然而，它可能耗时，并伴随被拒绝的风险。面试本身可能是一个高压的体验。尽管有这些缺点，潜在的回报使求职成为值得的努力。权衡利弊，关键是要战略性地接近这个过程，确保在最大化好处的同时减轻缺点。', 15, false),
  ('第一天上班', 'starting a new job', 'Starting a new job involves onboarding, which sets first impressions and aids adaptation. During probation, employees prove their worth before becoming permanent. Engaging with colleagues and getting up to speed are key. Understanding company culture is vital as it affects workplace interactions. Benefits include broadening your network, learning new skills, and increasing earning potential. However, the adaptation period can be stressful, job security is uncertain during probation, and work-life balance may be challenging. Despite drawbacks, starting a new job can be rewarding with a positive approach.', '开始一份新工作涉及入职培训,这奠定了第一印象并帮助适应。在试用期,员工在成为正式员工前展示他们的价值。与同事交流和跟上进度是关键。理解公司文化很重要,因为它影响着工作场所的互动。好处包括拓宽人际网络、学习新技能和提高收入潜力。然而,适应期可能压力大,试用期内工作安全性不确定,且工作与生活的平衡可能是挑战。尽管有缺点,以积极态度开始新工作可以是有益的。', 'Starting a new job is an exciting yet challenging experience. The onboarding process is crucial as it sets the stage for first impressions and helps new employees adapt to their roles. During the probation period, which precedes becoming a permanent employee, individuals have the chance to demonstrate their abilities and fit within the company. Engaging with colleagues is essential for building relationships and getting up to speed with tasks and responsibilities. Understanding company culture is another important aspect, as it influences how one interacts with others and navigates workplace dynamics. 

One of the main benefits of starting a new job is the opportunity to broaden your network, which can open doors to future opportunities. Additionally, it allows employees to learn new skills and increase their earning potential. However, there are drawbacks, such as the stressful adaptation period and uncertain job security during the probation phase. Additionally, maintaining work-life balance can be challenging. 

In conclusion, while starting a new job presents both benefits and drawbacks, the experience can be rewarding if approached with a positive attitude and readiness to adapt.', '开始一份新工作是一种既令人兴奋又具有挑战性的体验。入职培训非常重要,因为它为第一印象奠定了基础,并帮助新员工适应他们的角色。在试用期,即成为正式员工之前,个人有机会展示他们的能力并适应公司。与同事交流对于建立关系和跟上工作任务和责任的进度至关重要。理解公司文化是另一个重要方面,因为它影响着一个人与他人的互动方式以及在工作场所的动态。

开始新工作的主要好处之一是有机会拓宽人际网络,这可以为未来的机会打开大门。此外,它还允许员工学习新技能并提高他们的收入潜力。然而,也有一些弊端,如适应期的压力以及试用期内不确定的工作安全性。此外,维持工作与生活的平衡可能是一个挑战。

总之,虽然开始一份新工作有其优点和缺点,但如果以积极的态度和适应的准备来对待,这段经历可以是有益的。', 16, false),
  ('开会与汇报', 'meetings', 'Meetings start with setting the agenda, creating a framework for discussion. Once the floor is open, brainstorming begins. It''s crucial to know the difference between debate and discussion; debates are more confrontational, while discussions focus on sharing. Meetings may run over time, but they help everyone get on the same page and reach consensus. Identifying action items ensures ideas lead to actions, and taking minutes is essential for documenting the meeting.

Benefits include encouraging open communication and problem-solving, while drawbacks are time consumption and potential conflict. Balancing these is key to productive meetings.', '会议从制定议程开始，为讨论创造框架。议程开放后，头脑风暴开始。了解辩论和讨论的区别至关重要；辩论更具对抗性，而讨论则注重分享。会议可能会超时，但有助于达成共识。确定行动项目确保想法转化为行动，记录会议纪要是记录会议的关键。

好处包括鼓励开放沟通和问题解决，而缺点是耗时和潜在冲突。平衡这些是确保会议高效的关键。', 'Meetings are an integral part of business operations, beginning with the need to set the agenda, which lays the groundwork for a structured discussion. Once the agenda is established, the next step is to open the floor for discussion, allowing all participants to contribute. This often involves a brainstorming session where ideas flow freely. It''s important to distinguish between debate and discussion; while debate involves opposing views, discussion is more about sharing and listening. 

Meetings can sometimes run over time, but they are crucial for getting everyone on the same page and reaching consensus. Once consensus is achieved, it''s essential to identify action items to ensure that ideas are translated into actionable steps. Taking minutes is vital to document the meeting and serve as a reference for future follow-ups.

The benefits of meetings include encouraging open communication, facilitating problem-solving, and ensuring accountability. However, they can be time-consuming, potentially lead to conflict, and may lack focus. Balancing these pros and cons is necessary to ensure meetings are productive and contribute positively to organizational goals.', '会议是商业运作中不可或缺的一部分，首先需要制定议程，为结构化的讨论奠定基础。一旦议程确定，接下来就要开放讨论，让所有参与者都能贡献自己的意见。这通常包括一个头脑风暴的环节，让想法自由流动。重要的是要区分辩论和讨论；辩论涉及对立观点，而讨论更注重分享和倾听。

会议有时会超时，但对于让每个人达成共识和一致非常重要。一旦达成一致，就必须确定行动项目，以确保想法转化为可执行的步骤。记录会议纪要对于记录会议情况和作为未来跟进的参考至关重要。

会议的好处包括鼓励开放沟通、促进问题解决和确保责任。然而，它们可能耗时，可能导致冲突，并可能缺乏焦点。平衡这些优缺点对于确保会议富有成效并对组织目标做出积极贡献是必要的。', 17, false),
  ('远程与混合办公', 'remote and hybrid work', 'The debate between remote vs in-office work has led many companies to adopt a hybrid work model. Remote work offers flexibility in schedule, reduced commute time, and access to global talent. Employees can log on according to their time zone and use async communication. However, it can cause isolation from colleagues and communication difficulties. Regular check-ins and staying connected are essential. Without boundaries, burnout is a risk. The hybrid model provides a balance, but maintaining work-life balance is crucial for long-term success.', '关于远程与办公室工作的讨论促使许多公司采用混合办公模式。远程工作提供了时间灵活性、减少通勤时间和接触全球人才的机会。员工可以根据时区登录并使用异步沟通。然而，这可能导致与同事隔离和沟通困难。定期签到和保持联系很重要。没有界限，倦怠是一种风险。混合模式提供了平衡，但保持工作与生活的平衡对长期成功至关重要。', 'In recent years, the debate between remote vs in-office work has intensified. Many companies have adopted a hybrid work model, allowing employees to enjoy the benefits of both environments. One of the main advantages of remote work is the flexibility in schedule, as employees can log on at times that suit them best, adjusting for different time zones and async communication. This model reduces commute time and allows access to a global talent pool.

However, there are drawbacks to consider. Remote work can lead to feelings of isolation from colleagues, making it essential for employees to check in regularly and stay connected through various digital platforms. Communication can be challenging, especially when async methods are not effectively managed. Additionally, without clear boundaries, employees may face burnout due to potential overworking.

Ultimately, while the hybrid work model offers a promising solution by combining the best of both worlds, it is crucial to maintain a healthy work-life balance to ensure long-term productivity and employee satisfaction.', '近年来，关于远程与办公室工作的讨论愈加激烈。许多公司采用了混合办公模式，让员工可以享受两种环境的好处。远程工作的主要优势之一是时间上的灵活性，员工可以在适合自己的时间登录，调整不同的时区和异步沟通。这种模式减少了通勤时间，并能接触到全球人才库。

然而，也有一些弊端需要考虑。远程工作可能导致与同事的隔离感，因此员工必须定期签到，通过各种数字平台保持联系。沟通可能会有挑战，特别是当异步方法管理不当时。此外，如果没有明确的界限，员工可能会因为潜在的过度工作而感到倦怠。

最终，尽管混合办公模式通过结合两种模式的优势提供了一个有前景的解决方案，但保持健康的工作与生活的平衡对于确保长期的生产力和员工满意度至关重要。', 18, false),
  ('加薪与升职', 'pay and promotion', 'A performance review often leads to a raise or promotion. Meeting expectations can empower employees to ask for a raise, involving negotiation. Distinguishing a raise from a promotion is crucial; a raise is a salary increase, while a promotion involves more responsibilities. Taking on more responsibilities can lead to career advancement, recognition, and job satisfaction. Benefits include financial stability and increased motivation.

However, drawbacks like increased stress and work-life imbalance due to higher expectations must be considered. Balancing these factors is essential to ensure personal and professional goals align with added responsibilities.', '绩效评估常引导至加薪或升职。达到预期可使员工有底气要求加薪,涉及谈判。区分加薪与升职很重要;加薪是工资增加,升职则涉及更多责任。承担更多责任可带来职业发展、认可和工作满意度。好处包括财务稳定和增加动力。

然而,也要考虑由于更高期望而导致的压力增加和工作与生活失衡。平衡这些因素以确保个人和职业目标与增加的责任一致是至关重要的。', 'In the workplace, a performance review often initiates the process of seeking a raise or promotion. When employees meet expectations during their review, they might feel empowered to ask for a raise. This request typically involves negotiation with the employer. It''s important to differentiate between a raise and a promotion; a raise refers to an increase in salary, while a promotion involves moving to a higher position, usually with more responsibilities.

Taking on more responsibilities can lead to career advancement, providing recognition and improving job satisfaction. The benefits of receiving a raise or promotion include financial stability, increased motivation, and an enhanced reputation in the workplace.

However, there are drawbacks. With a promotion or raise, increased stress and work-life imbalance can occur due to higher expectations. Therefore, while the benefits of recognition and career advancement are significant, it is crucial to consider the potential drawbacks.

Ultimately, individuals need to weigh the pros and cons carefully. While the benefits can be substantial, the added responsibilities should align with one''s personal and professional goals.', '在职场中,绩效评估通常是寻求加薪或升职的起点。当员工在评估中达到预期时,他们可能会觉得有底气去要求加薪。这一请求通常涉及与雇主的谈判。需要明确加薪和升职的区别;加薪是指增加工资,而升职是指晋升到更高职位,通常伴随更多责任。

承担更多责任可以带来职业发展,提供认可并提高工作满意度。获得加薪或升职的好处包括财务稳定、增加动力和提升职场声誉。

然而,也有弊端。由于更高的期望,升职或加薪可能导致压力增加和工作与生活失衡。因此,尽管认可和职业发展的好处显著,考虑潜在的弊端也很重要。

最终,个人需要仔细权衡利弊。虽然好处可能相当可观,但增加的责任应与个人和职业目标一致。', 19, false),
  ('辞职交接', 'resigning', 'Resigning from a job starts with handing in your notice, often with a resignation letter, marking the notice period. During this time, a handover is essential to transfer responsibilities smoothly. An exit interview is conducted to discuss feedback. Leaving the company may result in receiving a severance package or a final paycheck.

Benefits include career advancement, emotional closure, and networking opportunities. However, drawbacks such as economic instability and adapting stress exist. Weigh these factors carefully to make an informed decision.', '辞职始于递交辞呈,通常附有辞职信,标志着通知期的开始。在此期间,交接是必不可少的,以顺利移交职责。离职面谈用于讨论反馈。离职后可能会收到遣散费或最后工资。

好处包括职业发展、情感上的告别和人脉关系的机会。然而,也存在经济不稳定和适应压力等弊端。仔细权衡这些因素,做出明智的决定。', 'Resigning from a job is a significant step in one''s career. To begin, you hand in your notice, which often involves submitting a formal resignation letter. This marks the start of the notice period, during which you are expected to continue working and fulfill your responsibilities. During this time, a handover process is crucial, as you must transfer responsibilities to ensure a smooth transition. An exit interview is typically conducted by HR to gather feedback and discuss any concerns. After leaving, employees may receive a severance package or, at the very least, a final paycheck.

The benefits of resigning include the opportunity for career advancement, emotional closure from leaving a job, and the chance to build new networking connections. However, there are drawbacks, such as potential economic instability, the stress of adapting to a new environment, and the possible loss of existing benefits. 

In conclusion, while resigning can offer new opportunities and personal growth, it also comes with challenges. It is important to weigh these factors carefully and make an informed decision based on both professional and personal considerations.', '辞职是职业生涯中的一个重要步骤。首先,你需要递交辞呈,通常需要提交一份正式的辞职信。这标志着通知期的开始,在此期间,你需要继续工作并履行职责。在这段时间内,交接过程至关重要,你必须移交职责以确保顺利过渡。人力资源部通常会进行离职面谈,以收集反馈并讨论任何问题。离职后,员工可能会收到遣散费,或者至少会有最后的工资单。

辞职的好处包括职业发展机会、情感上的告别,以及建立新人脉关系的机会。然而,也有一些弊端,如经济不稳定、适应新环境的压力和可能失去现有福利。

综上所述,虽然辞职可以提供新的机会和个人成长,但也伴随着挑战。重要的是,在做出决定时要仔细权衡这些因素,基于职业和个人考虑做出明智的选择。', 20, false),
  ('订机票与值机', 'flying', 'Booking flights via an online travel agency is popular for its convenience. Travelers choose between direct and connecting flights based on cost and time. After booking, you check in online, receive a boarding pass, and head to the gate. Delays can occur, causing stress, especially if you need to make the connection.

Benefits include convenience, access to multiple airlines, and often lower costs. Drawbacks involve longer travel times with connections, the risk of missing connections, and potential delays. Despite these issues, the convenience and savings make online agencies a favored choice.', '通过在线旅游代理订机票因其便利性而受欢迎。旅客根据成本和时间选择直飞或中转航班。订票后，在线办理登机手续，收到登机牌，然后前往登机口。延误可能发生，特别是在需要赶上转机时。

好处包括便利性、选择多家航空公司以及通常较低的费用。缺点包括中转航班旅行时间较长、错过转机的风险及可能的延误。尽管有这些问题，便利性和节省使在线代理成为首选。', 'Booking flights through an online travel agency has become increasingly popular due to its convenience. When deciding between a direct or connecting flight, travelers often weigh the benefits of cost and travel time. Once you choose, you can easily book a flight through the agency''s website. After booking, the next step is to check in online, which saves time at the airport. This process generates a boarding pass that you can either print or store on your phone. Arriving at the gate, you might find your flight is delayed, a common issue that can cause stress, especially if you have to make the connection for a connecting flight.

The benefits of using an online travel agency include the convenience of booking from home, access to multiple airlines, and often cheaper prices than traditional agents. However, there are drawbacks, such as longer travel times with connecting flights, the risk of missing your connection, and potential flight delays. Despite these drawbacks, the convenience and cost savings often make online travel agencies a preferred choice for many travelers.', '通过在线旅游代理订机票因其便利性而越来越受欢迎。当在直飞和中转航班之间做选择时，旅客通常会权衡成本和旅行时间的利弊。一旦做出选择，你可以通过代理的网站轻松订票。订票后，下一步是在线办理登机手续，这节省了在机场的时间。此过程会生成一个可以打印或存储在手机上的登机牌。到达登机口时，你可能会发现航班延误，这是一个常见问题，尤其是在你需要赶上转机航班时，会引起压力。

使用在线旅游代理的好处包括可以在家中预订、可以选择多家航空公司以及通常比传统代理价格便宜。然而，也有一些弊端，比如中转航班的旅行时间更长、可能错过转机以及潜在的航班延误。尽管有这些缺点，便利性和成本节省常常使在线旅游代理成为许多旅客的首选。', 21, false),
  ('过海关入境', 'going through customs', 'Going through customs involves several steps. First, go through passport control and present your passport. Then, fill out the customs declaration form. Proceed to baggage claim to get your luggage, followed by customs inspection. Decide whether you have nothing to declare or items to declare. Common mistakes include incorrect forms or forgetting declarations. To avoid issues, double-check the form and be honest. After the security check, head to the exit. Efficient processing and clear guidelines are benefits, but long wait times and complex procedures can be drawbacks. Be prepared for a smooth experience.', '过海关涉及几个步骤。首先是护照检查，出示护照。然后填写海关申报单，前往行李领取处拿行李，接着是海关检查。需决定是无申报物还是有申报物。常见失误包括填写错误或忘记申报。为避免问题，仔细检查申报单并如实申报。通过安全检查后，前往出口。高效处理和清晰指引是优点，但长时间等待和复杂程序是缺点。做好准备以确保顺利通关。', 'Going through customs can be a smooth process if you know what to expect. First, you''ll go through passport control where you need to present your passport. After that, fill out the customs declaration form to indicate what you are bringing into the country. Next, proceed to baggage claim to collect your luggage. Once you have your bags, it''s time for the customs inspection. At this point, you need to decide whether you have nothing to declare or items to declare. This decision impacts how you proceed through customs. Common mistakes include filling out the customs declaration form incorrectly or forgetting to declare certain items. To avoid these issues, always double-check the form and be honest about what you''re bringing in. Finally, after passing the security check, you can head to the exit. Remember, efficient processing and clear guidelines are benefits, but long wait times and complex procedures can be drawbacks. Being prepared is key to a hassle-free experience.', '过海关如果知道预期的流程会很顺利。首先，你会经过护照检查，需出示护照。之后，填写海关申报单，说明携带入境的物品。接下来，前往行李领取处拿行李。拿到行李后，就该进行海关检查了。此时，你需决定是无申报物还是有申报物，这会影响你过海关的流程。常见失误包括填写海关申报单错误或忘记申报某些物品。为避免这些问题，务必仔细检查申报单，并如实申报。最后，经过安全检查后，你可以前往出口。记住，效率高的处理和清晰的指引是优点，但长时间等待和复杂程序是缺点。准备充分是确保顺利通关的关键。', 22, false),
  ('酒店入住', 'staying at a hotel', 'Staying at a hotel starts with making a reservation and confirming the booking. Upon arrival, you check in by providing identification. During your stay, enjoy services like room service, but check if they are complimentary or charged. Request additional amenities if needed.

Hotels offer a convenient location, various services, and a comfortable stay, enhancing your travel experience. However, be aware of unexpected charges, noisy environments, and limited availability.

After your stay, check out, settle the check, and ensure your deposit refund is processed. Weigh the benefits against the drawbacks for the best experience.', '入住酒店从预订和确认预订开始。到达后,通过出示身份证明进行登记入住。期间,享受客房服务,但要确认是免费还是收费。如有需要,可要求额外设施。

酒店提供便利的位置、丰富的服务和舒适的住宿,提升旅行体验。但要注意意外费用、嘈杂环境和有限的供应。

入住结束后,退房、结算账单,确保押金退还。权衡利弊,以获得最佳体验。', 'Staying at a hotel involves several steps that can make your travel experience smooth and enjoyable. First, you need to make a reservation. This is followed by confirming the booking to ensure your room is secured. Upon arrival, the check-in process requires you to provide identification. Once settled in, you can enjoy various services, such as room service. However, it is essential to note whether these services are complimentary or charged, as this can vary from one hotel to another. You might also want to request additional amenities to enhance your stay.

The benefits of staying at a hotel include a convenient location, a variety of services, and a comfortable stay. These advantages can significantly improve your travel experience. However, there are drawbacks to consider, such as unexpected charges, a noisy environment, and limited availability during peak seasons.

In conclusion, while staying at a hotel offers numerous conveniences, it is crucial to weigh the benefits against the potential drawbacks. By planning and confirming details beforehand, you can maximize the positive aspects of your stay. After enjoying your time, the final steps are to check out, settle the check, and ensure your deposit refund is processed.', '入住酒店涉及多个步骤,可以让你的旅行体验顺畅愉快。首先,你需要预订,然后确认预订以确保你的房间已被保留。到达后,登记入住需要你出示身份证明。入住后,你可以享受各种服务,如客房服务。然而,需要注意这些服务是免费还是收费,因为不同酒店的政策不同。你也可能想要求额外设施以提升入住体验。

入住酒店的好处包括便利的位置、各种服务和舒适的住宿。这些优势可以显著提升你的旅行体验。然而,也有一些缺点需要考虑,例如意外费用、嘈杂的环境和旺季时的有限供应。

总之,尽管入住酒店提供了众多便利,但权衡利弊是很重要的。通过提前计划和确认细节,你可以最大化入住的积极方面。享受完入住后,最后的步骤是退房、结算账单,并确保押金退还。', 23, false),
  ('城市交通', 'getting around a city', 'Navigating city transport during rush hour involves transferring to another line and dealing with crowded subways. Getting off at the right stop is crucial, especially if running late. Hailing a cab becomes necessary for some. The subway vs bus debate highlights that subways are fast but crowded, while buses are flexible but face traffic. Inconvenient routes make individuals consider alternatives. Despite challenges, city transport saves time, is cost-effective, and environmentally friendly. Drawbacks include congestion, uncertain timing, and inconvenient routes. Weighing these, public transport often prevails as a viable option.', '在高峰时段乘坐城市交通需要换乘到另一条线路,应对拥挤的地铁。在正确的站点下车至关重要,特别是迟到时。打车对一些人来说是必要的。地铁和公交车的选择显示,地铁快但拥挤,公交车灵活但可能遇到堵车。不便的路线让人们考虑其他选择。尽管有挑战,城市交通节省时间、费用低廉且环保。缺点包括拥堵、时间不确定和不便的路线。权衡这些因素,公共交通常常是可行的选择。', 'Navigating city transportation during rush hour can be quite a challenge. One often needs to transfer to another line, especially when the subway is crowded. The need to get off at the right stop becomes crucial, and running late can add to the stress. Many find themselves needing to hail a cab if they are pressed for time. A subway vs bus debate often ensues: while the subway is faster, it can be more crowded during peak times; buses, on the other hand, offer flexibility but may face traffic jams. An inconvenient route can further complicate matters, prompting individuals to consider alternatives.

Despite these challenges, city transportation offers several benefits. It saves time, is cost-effective, and promotes environmental sustainability. However, drawbacks include traffic congestion, uncertain timing, and inconvenient routes. Weighing these pros and cons, the decision often boils down to personal preference and the specific circumstances one faces. For many, the benefits of using public transportation outweigh the drawbacks, making it a viable option for getting around the city efficiently.', '在高峰时段乘坐城市交通是一项挑战。通常需要换乘到另一条线路,特别是在地铁拥挤的时候。在正确的站点下车变得至关重要,迟到会增加压力。许多人在时间紧迫时需要打车。地铁和公交车的选择常常引发争论:地铁速度快,但高峰期更拥挤;而公交车灵活,但可能遇到堵车。不便的路线会进一步加剧问题,促使人们考虑其他选择。

尽管存在这些挑战,城市交通仍有许多好处。它节省时间、费用低廉,并促进环保出行。然而,缺点包括交通拥堵、时间不确定和不便的路线。权衡这些利弊,决定往往取决于个人偏好和所面对的具体情况。对许多人来说,使用公共交通的好处大于缺点,使其成为高效出行的可行选择。', 24, false),
  ('旅途出岔子', 'when travel goes wrong', 'Traveling can sometimes go wrong, like missing the train due to unexpected delays. First, contact customer service for options, such as alternative transportation or a refund. Travel insurance is crucial, offering financial protection and peace of mind. You can file a claim if necessary.

However, relying on insurance has drawbacks, like additional costs and time-consuming claims. Coverage might be limited, leaving some expenses uncovered.

Overall, while travel mishaps are frustrating, having a plan helps make the best of it. The flexibility and protection insurance offers ease stress, despite some limitations.', '旅行有时会出岔子，比如因意外延误错过火车。首先，联系客户服务以获取选择，如替代交通工具或退款。旅行保险至关重要，提供财务保护和心灵安宁。如有必要，可以提出索赔。

然而，依赖保险有弊端，如额外费用和耗时的索赔。保险覆盖可能有限，部分费用需自理。

总的来说，旅行失误虽令人沮丧，但有计划能尽量利用好。保险提供的灵活性和保护减轻压力，尽管有些限制。', 'Traveling can be a wonderful experience, but sometimes things don''t go as planned. Imagine you missed the train due to unexpected delays. In such situations, the first step is to contact customer service to explore your options. They might suggest alternative transportation methods, or even offer a refund if the delay was on their end. Having travel insurance can be invaluable in these scenarios. It not only offers financial protection but also provides peace of mind by covering unexpected expenses. If necessary, you can file a claim to recover some of your costs.

However, relying on travel insurance and refunds comes with its drawbacks. There are often additional costs involved, and the process of filing claims can be time-consuming. Additionally, the coverage might be limited, leaving you to cover some expenses out of pocket.

In conclusion, while travel mishaps can be frustrating, having a plan in place can make the best of it. The flexibility in plans and financial protection offered by insurance can significantly ease the stress, even if it doesn''t cover everything. Balancing the benefits and drawbacks is key to ensuring a smoother journey.', '旅行可以是一次美好的体验，但有时事情并不像计划的那样顺利。想象一下，由于意外延误，你错过了火车。在这种情况下，第一步是联系客户服务以探索你的选择。他们可能会建议替代交通工具，或者如果延误是他们的责任，甚至会提供退款。在这些情况下，旅行保险可能是无价的。它不仅提供财务保护，还通过涵盖意外费用提供心灵的安宁。如果有必要，你可以提出索赔以收回一些费用。

然而，依赖旅行保险和退款也有其弊端。通常涉及额外费用，而索赔的过程可能耗时。此外，保险覆盖范围可能有限，导致你需要自掏腰包支付部分费用。

总之，尽管旅行失误可能令人沮丧，但制定计划可以尽量利用好。保险提供的计划灵活性和财务保护可以显著减轻压力，即使它不能涵盖所有费用。平衡利弊是确保更顺利旅行的关键。', 25, false),
  ('租车与事故处理', 'renting a car', 'Renting a car is a convenient choice for travelers needing temporary transportation. The process involves signing a rental agreement and opting for insurance, which requires understanding the deductible vs premium difference. If damage occurs, you exchange information and file a claim. After approval, the car is repaired, and you may receive reimbursement.

Though convenient and flexible, renting a car has drawbacks like extra fees, complex insurance, and potential damage liability. However, for short-term needs, the benefits often outweigh these issues.', '租车是需要临时交通工具的旅行者的便利选择。过程包括签署租赁协议和选择保险,这需要了解 deductible 和 premium 的区别。如果发生损坏,你需要交换信息并提出索赔。索赔获批后,车辆被修理,你可能会收到报销。

尽管方便灵活,租车也有额外费用、复杂保险和潜在损坏责任等缺点。然而,对于短期需求,好处往往超过这些问题。', 'Renting a car provides convenience and flexibility for travelers who need temporary transportation. The process starts when you rent a car and sign a rental agreement, which outlines the terms of the rental. Opting for insurance is usually a wise decision to protect against unforeseen events. Understanding the difference between deductible and premium is crucial: the deductible is the amount you pay out-of-pocket before insurance covers the rest, while the premium is the cost of buying the insurance. 

If damage occurs, the first step is to exchange information with any involved parties. Following that, you should file a claim with the insurance company. Once the claim is approved, the car will be sent for repair. Eventually, you may receive reimbursement for any costs you initially covered. 

While renting a car is convenient, offering flexibility and no long-term commitment, it does come with drawbacks. Extra fees, complex insurance terms, and potential liability for damage can be downsides. Overall, the benefits often outweigh the drawbacks, especially for short-term needs.', '租车为需要临时交通工具的旅行者提供了便利和灵活性。整个过程从租车开始,签署租赁协议,该协议列出了租赁的条款。选择购买保险通常是明智的决定,以防不测。了解 deductible 和 premium 的区别至关重要:deductible 是在保险公司赔付之前你需要自付的金额,而 premium 是购买保险需支付的费用。

如果发生损坏,第一步是与相关方交换信息。接下来,你需要向保险公司提出索赔。一旦索赔获批,车辆将被送去修理。最终,你可能会收到对你最初支付费用的报销。

虽然租车很方便,提供灵活性且无需长期承诺,但也有缺点。额外费用、复杂的保险条款和潜在的损坏责任可能是缺点。总体而言,尤其是对于短期需求,好处往往超过弊端。', 26, false),
  ('社交媒体', 'social media', 'Social media is vital in modern life, with people regularly scrolling through feeds. Viral content can attract followers and expand social circles. Engaging with content allows for discussion, but misinformation and disinformation pose challenges. Misinformation is unintentional, whereas disinformation is deliberately false. Trolls further complicate interactions.

Despite drawbacks, social media keeps users informed and enhances brand influence. Risks like information overload and privacy breaches exist. A digital detox can help manage these issues. Striking a balance is crucial to enjoy benefits while minimizing negatives.', '社交媒体在现代生活中至关重要,人们经常滚动浏览动态。迅速走红的内容能吸引粉丝,扩大社交圈。与内容互动促进讨论,但错误信息和虚假信息带来挑战。错误信息是无意的,而虚假信息是故意的,喷子也让互动更复杂。

尽管有弊端,社交媒体帮助用户获取资讯,提升品牌影响力。信息过载和隐私泄露等风险存在。数字排毒有助于管理这些问题。找到平衡点对于享受其好处,同时将负面影响降至最低至关重要。', 'Social media has become an integral part of our lives. People often scroll through their feeds, seeking entertainment or information. When content goes viral, it can quickly reach millions, attracting new followers and expanding one''s social circle. Engaging with content allows users to participate in discussions and share their opinions. However, the spread of misinformation and disinformation is a significant downside. While misinformation is often shared unintentionally, disinformation is deliberately misleading. Additionally, trolls can create a hostile environment, discouraging genuine interaction.

Despite these drawbacks, social media offers undeniable benefits, such as keeping users informed with the latest news and trends, and enhancing brand influence. However, the risks of information overload, privacy breaches, and cyberbullying cannot be ignored.

To address these issues, many people opt for a digital detox, taking breaks from social media to recharge. Ultimately, it''s important to strike a balance between enjoying the benefits of social media and protecting oneself from its downsides. By being mindful of their usage, individuals can enjoy the positives while minimizing the negatives.', '社交媒体已经成为我们生活中不可或缺的一部分。人们常常滚动浏览自己的动态,寻找娱乐或信息。当内容迅速走红时,它可以迅速覆盖数百万人,吸引新粉丝并扩大社交圈。与内容互动让用户可以参与讨论,分享自己的观点。然而,错误信息和虚假信息的传播是一个显著的缺点。错误信息通常是无意间传播的,而虚假信息是故意误导的。此外,喷子可能会制造敌对的环境,阻碍真实的互动。

尽管存在这些弊端,社交媒体也有不可否认的好处,如帮助用户获取最新资讯和趋势,提升品牌影响力。然而,信息过载、隐私泄露风险和网络欺凌的风险也不容忽视。

为了解决这些问题,许多人选择进行数字排毒,从社交媒体中抽身,以便重新充电。最终,重要的是找到在享受社交媒体好处与保护自己免受其弊端之间的平衡。通过注意使用方式,个人可以享受其积极面,同时将消极面降至最低。', 27, false),
  ('网上支付与诈骗', 'online payment and scams', 'Online payments have changed how we transact, beginning with linking a card to your account. Enhancing security with two-factor authentication protects against phishing attacks. However, risks remain, such as identity theft and financial loss. If unauthorized activity occurs, freezing the account and filing a dispute may be necessary. Fraud is more elaborate than a scam, a smaller trick. Despite the convenience and security of online payments, offering real-time records, users must be cautious of identity theft risks and potential financial losses.', '网上支付改变了我们的交易方式,首先需绑定银行卡。通过启用双重身份验证来增强安全性,以防范网络钓鱼攻击。然而,风险依然存在,如身份盗窃和经济损失。如果发生未经授权的活动,可能需要冻结账户并提交争议。fraud 比 scam 更复杂,后者是较小骗局。尽管网上支付的便利性和安全性提供实时记录,用户仍需警惕身份盗窃风险和潜在的经济损失。', 'Online payments have revolutionized the way we handle transactions. To start using online payment systems, you first need to link a card to your account. This step is crucial as it sets the foundation for all future transactions. To enhance security, it''s advisable to enable two-factor authentication. This extra layer of protection helps safeguard against phishing attacks, which are attempts to steal sensitive information like passwords and credit card numbers.

Despite these precautions, online payments are not without risks. Phishing can lead to identity theft, causing significant financial loss. If you suspect unauthorized activity, you may need to freeze the account and file a dispute to resolve the issue. It''s important to distinguish between fraud and scam; fraud is often a more elaborate financial deceit, while a scam is a smaller-scale trick.

The convenience and security of online payments are undeniable benefits, offering real-time transaction records. However, they come with drawbacks like the risk of identity theft and potential financial loss. In conclusion, while online payments offer numerous advantages, users must remain vigilant to mitigate the associated risks.', '网上支付革新了我们处理交易的方式。要开始使用网上支付系统,首先需要绑定银行卡。这一步至关重要,因为它为未来的所有交易奠定了基础。为了增强安全性,建议启用双重身份验证。这一额外的保护层有助于防范网络钓鱼攻击,这些攻击试图窃取密码和信用卡号等敏感信息。

尽管有这些预防措施,网上支付并非没有风险。网络钓鱼可能导致身份盗窃,从而造成重大经济损失。如果怀疑有未经授权的活动,可能需要冻结账户并提交争议以解决问题。重要的是要区分 fraud 和 scam; fraud 通常是更复杂的金融欺诈,而 scam 则是较小规模的骗局。

网上支付的便利性和安全性是不可否认的好处,提供实时交易记录。然而,它们也有缺点,如身份盗窃风险和潜在的经济损失。总之,虽然网上支付提供了许多优势,但用户必须保持警惕以减轻相关风险。', 28, false),
  ('垃圾分类与环保', 'recycling', 'Recently, I''ve focused on reducing my environmental impact through waste management. I started by sorting waste, separating recyclables for proper recycling. Avoiding single-use plastics was crucial, so I reduced consumption by using reusable items. Composting became a routine, enhancing soil health. Recognizing biodegradable vs non-biodegradable materials helped me choose environmentally friendly products. I also considered my carbon footprint, aiming to reduce it by using public transport and supporting sustainable brands. Initially, the process was time-consuming and led to some misclassification, but starting small made it manageable.', '最近,我通过垃圾管理来减少环境影响。我从分类垃圾开始,确保可回收物正确回收。避免一次性塑料至关重要,因此我通过使用可重复使用的物品来减少消费。堆肥成为日常,改善土壤健康。识别可生物降解与不可生物降解材料帮助我选择环保产品。我也考虑到自己的碳足迹,努力通过公共交通和支持可持续品牌来减少。起初,这个过程耗时且偶有误分类,但从小事做起使其可控。', 'In recent years, I have become more conscious of my environmental impact, particularly through waste management. First, I learned to sort waste by separating recyclables from non-recyclables. This was a crucial step in ensuring that materials like paper, glass, and metal could be recycled. Next, I focused on avoiding single-use plastics, which contribute significantly to pollution and landfill waste. Instead, I tried to reduce consumption by opting for reusable items. Composting organic waste became a part of my routine, allowing me to return nutrients to the soil. Understanding the difference between biodegradable and non-biodegradable materials helped me make more environmentally friendly choices. For example, choosing products with biodegradable packaging whenever possible. I also began to consider my carbon footprint, aiming to minimize it by using public transportation and supporting sustainable brands. Initially, I struggled with the time and effort required, and occasionally misclassified items. My advice is to start small, gradually incorporating these practices into daily life, and soon, they will become second nature.', '近年来,我对自己的环保影响尤其是垃圾管理变得更加关注。首先,我学会了分类垃圾,将可回收物与不可回收物分开。这是确保纸张、玻璃和金属等材料可以回收利用的关键步骤。接下来,我专注于避免使用一次性塑料,因为它们对污染和垃圾填埋场的贡献很大。取而代之,我尝试通过选择可重复使用的物品来减少消费。堆肥有机废物成为我日常生活的一部分,这让我能把养分还给土壤。了解可生物降解和不可生物降解材料的区别帮助我做出更环保的选择。例如,尽可能选择可生物降解包装的产品。我也开始考虑自己的碳足迹,努力通过使用公共交通和支持可持续品牌来减少它。最初,我在时间和精力上有些挣扎,偶尔还会误分类。我的建议是从小事做起,逐渐将这些做法融入日常生活,不久它们就会成为习惯。', 29, false),
  ('人工智能进课堂', 'AI in the classroom', 'AI''s role in the classroom is hotly debated. Students start by writing a prompt and generating a draft with AI. Distinguishing between AI-assisted and AI-generated work is key. Fact-checking and citing sources are vital for credibility, and disclosing AI use ensures transparency.

AI boosts efficiency, creativity, and provides feedback. Yet, over-reliance can hinder critical thinking and spread misinformation. It also risks plagiarism, challenging academic integrity.

Institutions must decide to ban or embrace AI. A balanced approach, integrating AI with academic standards, may offer the best path forward.', '人工智能在课堂中的角色引发热议。学生首先写提示并用 AI 生成初稿。区分 AI 辅助和 AI 完全生成的工作至关重要。核实信息和引用来源对保持可信度至关重要，披露 AI 使用确保透明度。

AI 提高效率、创造力并提供反馈。然而，过度依赖可能阻碍批判性思维并传播错误信息。它也带来抄袭风险，挑战学术诚信。

机构必须决定是禁止还是接受 AI。结合 AI 和学术标准的平衡方法可能是最佳路径。', 'The integration of AI in the classroom has sparked a lively debate. Initially, students write a prompt and use AI to generate a draft. The distinction between AI-assisted and AI-generated work becomes crucial; the former involves human input while the latter is entirely AI-driven. After obtaining the AI-generated content, it is essential to fact-check the output and cite your sources to maintain credibility. Disclosing AI use is also recommended to ensure transparency.

The benefits of AI in education are clear. It increases efficiency, enhances creativity, and provides instant feedback. However, there are drawbacks. Over-relying on AI may reduce critical thinking, and there is potential for misinformation. Furthermore, it poses a risk of plagiarism, challenging academic integrity policies.

Ultimately, institutions face a choice: ban or embrace AI. A balanced approach that incorporates AI while upholding academic standards could be the solution. Embracing AI with caution can lead to a more innovative and accountable educational environment.', '人工智能进入课堂引发了热烈的讨论。首先，学生写一个提示并使用 AI 生成初稿。AI 辅助生成与 AI 完全生成之间的区别至关重要；前者有人类参与，后者完全由 AI 生成。获得 AI 生成的内容后，核实输出内容和引用来源以保持可信度是必不可少的。还建议披露 AI 使用情况以确保透明度。

AI 在教育中的好处显而易见。它提高了效率，增强了创造力，并提供即时反馈。然而，也存在弊端。过度依赖 AI 可能会降低批判性思维能力，并且存在错误信息的可能。此外，它还带来了抄袭的风险，挑战着学术诚信政策。

最终，机构面临选择：禁止还是接受 AI。一个在保持学术标准的同时结合 AI 的平衡方法可能是解决方案。谨慎地接受 AI 可以带来一个更具创新性和责任心的教育环境。', 30, false)
ON CONFLICT (title_zh) DO UPDATE SET
  theme_en = EXCLUDED.theme_en,
  essay_short_en = EXCLUDED.essay_short_en, essay_short_zh = EXCLUDED.essay_short_zh,
  essay_full_en = EXCLUDED.essay_full_en,   essay_full_zh = EXCLUDED.essay_full_zh,
  sort_order = EXCLUDED.sort_order, updated_at = now();

-- 链上节点:整包重建(避免旧节点残留导致 sort_order 冲突)
DELETE FROM vocab_scene_items i
 USING vocab_scene_packs p
 WHERE i.pack_id = p.id AND p.title_zh IN ('网络购物', '租房搬家', '超市采购', '看病就医', '在餐厅点餐', '点外卖', '手机套餐与换运营商', '邻里噪音纠纷', '选课与退课', '小组作业', '图书馆借还书', '论文写作与查重', '考前复习', '找导师改论文', '求职面试', '第一天上班', '开会与汇报', '远程与混合办公', '加薪与升职', '辞职交接', '订机票与值机', '过海关入境', '酒店入住', '城市交通', '旅途出岔子', '租车与事故处理', '社交媒体', '网上支付与诈骗', '垃圾分类与环保', '人工智能进课堂');

INSERT INTO vocab_scene_items (pack_id, kind, text_en, text_zh, word_id, sort_order)
SELECT p.id, v.kind, v.text_en, v.text_zh, w.id, v.sort_order
  FROM (VALUES
    ('网络购物', 'word', 'browse', '浏览', NULL, 1),
    ('网络购物', 'collocation', 'add to cart', '加入购物车', NULL, 2),
    ('网络购物', 'chunk', 'place an order', '下单', NULL, 3),
    ('网络购物', 'contrast', 'free shipping vs. expedited shipping', '免费送货 vs. 加急送货;免费送货通常较慢,加急送货则更快但需额外付费。', NULL, 4),
    ('网络购物', 'collocation', 'track the package', '追踪包裹', NULL, 5),
    ('网络购物', 'word', 'return', '退货', NULL, 6),
    ('网络购物', 'collocation', 'customer service', '客户服务', NULL, 7),
    ('网络购物', 'collocation', 'product review', '产品评价', NULL, 8),
    ('租房搬家', 'chunk', 'view an apartment', '看房', NULL, 1),
    ('租房搬家', 'collocation', 'sign a lease', '签租约', NULL, 2),
    ('租房搬家', 'word', 'deposit', '押金', NULL, 3),
    ('租房搬家', 'chunk', 'set up utilities', '开通水电气', NULL, 4),
    ('租房搬家', 'word', 'furniture', '家具', NULL, 5),
    ('租房搬家', 'collocation', 'move in', '搬入', NULL, 6),
    ('租房搬家', 'chunk', 'meet the neighbors', '认识邻居', NULL, 7),
    ('租房搬家', 'contrast', 'urban vs suburban', '城市 vs 郊区,城市通常交通便利,但郊区环境更安静', NULL, 8),
    ('超市采购', 'chunk', 'make a shopping list', '列购物清单', NULL, 1),
    ('超市采购', 'word', 'aisle', '货架通道', NULL, 2),
    ('超市采购', 'collocation', 'in stock', '有货', NULL, 3),
    ('超市采购', 'chunk', 'check the best-before date', '检查保质期', NULL, 4),
    ('超市采购', 'contrast', 'self-checkout vs cashier', '自助结账 vs 收银员结账。前者适合少量商品且不想排队,后者适合大量商品或需要人工帮助时。', NULL, 5),
    ('超市采购', 'collocation', 'use a loyalty card', '使用会员卡', NULL, 6),
    ('超市采购', 'word', 'coupon', '优惠券', NULL, 7),
    ('超市采购', 'chunk', 'bag the groceries', '装袋', NULL, 8),
    ('看病就医', 'chunk', 'make an appointment', '预约就诊', NULL, 1),
    ('看病就医', 'word', 'symptoms', '症状', NULL, 2),
    ('看病就医', 'collocation', 'medical examination', '体检', NULL, 3),
    ('看病就医', 'chunk', 'diagnosis from the doctor', '医生诊断', NULL, 4),
    ('看病就医', 'contrast', 'prescription vs over-the-counter', '处方药 vs 非处方药; 处方药需要医生开具,非处方药可直接购买。', NULL, 5),
    ('看病就医', 'word', 'side effects', '副作用', NULL, 6),
    ('看病就医', 'chunk', 'follow-up appointment', '复诊预约', NULL, 7),
    ('看病就医', 'collocation', 'health insurance', '健康保险', NULL, 8),
    ('看病就医', 'word', 'recovery', '康复', NULL, 9),
    ('在餐厅点餐', 'collocation', 'book a table', '预订餐桌', NULL, 1),
    ('在餐厅点餐', 'chunk', 'be seated', '入座', NULL, 2),
    ('在餐厅点餐', 'word', 'menu', '菜单', NULL, 3),
    ('在餐厅点餐', 'chunk', 'allergic to', '对…过敏', NULL, 4),
    ('在餐厅点餐', 'collocation', 'place an order', '点单', NULL, 5),
    ('在餐厅点餐', 'word', 'the check', '账单', NULL, 6),
    ('在餐厅点餐', 'chunk', 'split it', '平摊费用', NULL, 7),
    ('在餐厅点餐', 'contrast', 'tip vs service charge', '小费 vs 服务费:小费是顾客自愿给的;服务费是餐厅自动加上的。', NULL, 8),
    ('在餐厅点餐', 'chunk', 'leave a review', '留下评价', NULL, 9),
    ('点外卖', 'chunk', 'place an order', '下订单', NULL, 1),
    ('点外卖', 'collocation', 'delivery fee', '配送费', NULL, 2),
    ('点外卖', 'collocation', 'estimated delivery time', '预计送达时间', NULL, 3),
    ('点外卖', 'word', 'notification', '通知', NULL, 4),
    ('点外卖', 'chunk', 'running late', '延迟送达', NULL, 5),
    ('点外卖', 'word', 'apologize', '道歉', NULL, 6),
    ('点外卖', 'contrast', 'cold food vs hot food', '冷食与热食的对比:冷食多因延迟或保温不当而热量不足,热食则是送达及时并保温得当。', NULL, 7),
    ('点外卖', 'chunk', 'leave a review', '留下评价', NULL, 8),
    ('手机套餐与换运营商', 'chunk', 'choose a plan', '选择套餐', NULL, 1),
    ('手机套餐与换运营商', 'collocation', 'data allowance', '流量额度', NULL, 2),
    ('手机套餐与换运营商', 'contrast', 'unlimited vs limited', '无限流量 vs 有限流量:无限流量适合常用网络的人,有限流量适合偶尔使用的人', NULL, 3),
    ('手机套餐与换运营商', 'word', 'roaming', '漫游', 'roam', 4),
    ('手机套餐与换运营商', 'chunk', 'run out of data', '流量用完', NULL, 5),
    ('手机套餐与换运营商', 'word', 'overage', '超额费用', NULL, 6),
    ('手机套餐与换运营商', 'chunk', 'top up', '充值', NULL, 7),
    ('手机套餐与换运营商', 'chunk', 'switch carriers', '换运营商', NULL, 8),
    ('手机套餐与换运营商', 'chunk', 'keep your number', '保留号码', NULL, 9),
    ('邻里噪音纠纷', 'collocation', 'noisy neighbors', '吵闹的邻居', NULL, 1),
    ('邻里噪音纠纷', 'word', 'complain', '抱怨', NULL, 2),
    ('邻里噪音纠纷', 'chunk', 'keep it down', '小声点', NULL, 3),
    ('邻里噪音纠纷', 'chunk', 'talk to the landlord', '找房东谈谈', NULL, 4),
    ('邻里噪音纠纷', 'word', 'mediate', '调解', 'mediate', 5),
    ('邻里噪音纠纷', 'contrast', 'put up with vs file a complaint', '忍受 vs 投诉,如果噪音不大,可以忍受;如果影响生活,就要投诉。', NULL, 6),
    ('邻里噪音纠纷', 'chunk', 'file a noise complaint', '提交噪音投诉', NULL, 7),
    ('邻里噪音纠纷', 'word', 'compromise', '妥协', NULL, 8),
    ('选课与退课', 'collocation', 'check the class schedule', '查看课程表', NULL, 1),
    ('选课与退课', 'word', 'prerequisite', '先修课程', 'prerequisite', 2),
    ('选课与退课', 'chunk', 'enroll in a course', '注册课程', NULL, 3),
    ('选课与退课', 'word', 'credit', '学分', NULL, 4),
    ('选课与退课', 'contrast', 'clash vs overlap', '时间冲突 vs 部分重叠:冲突时无法同时上,重叠可能部分上课时间重合', NULL, 5),
    ('选课与退课', 'collocation', 'drop a course', '退课', NULL, 6),
    ('选课与退课', 'chunk', 'add/drop deadline', '加退课截止日期', NULL, 7),
    ('选课与退课', 'word', 'advisor', '顾问', NULL, 8),
    ('选课与退课', 'chunk', 'academic workload', '学术负担', NULL, 9),
    ('选课与退课', 'word', 'elective', '选修课', NULL, 10),
    ('选课与退课', 'collocation', 'full-time student', '全日制学生', NULL, 11),
    ('小组作业', 'collocation', 'assign roles', '分配角色', NULL, 1),
    ('小组作业', 'word', 'brainstorm', '头脑风暴', NULL, 2),
    ('小组作业', 'chunk', 'reach consensus', '达成共识', NULL, 3),
    ('小组作业', 'contrast', 'cooperate vs collaborate', '合作(cooperate)通常指为了共同目标分工协作,而协作(collaborate)更强调共同参与和贡献。', NULL, 4),
    ('小组作业', 'chunk', 'free-rider problem', '搭便车问题', NULL, 5),
    ('小组作业', 'word', 'deadline', '截止日期', NULL, 6),
    ('小组作业', 'collocation', 'merge slides', '合并幻灯片', NULL, 7),
    ('小组作业', 'chunk', 'rehearse presentation', '排练演讲', NULL, 8),
    ('小组作业', 'word', 'feedback', '反馈', NULL, 9),
    ('小组作业', 'chunk', 'reflect on the process', '反思过程', NULL, 10),
    ('图书馆借还书', 'collocation', 'library catalog', '图书馆目录', NULL, 1),
    ('图书馆借还书', 'chunk', 'locate the book', '找到书籍', NULL, 2),
    ('图书馆借还书', 'contrast', 'library card vs student ID', '图书馆卡和学生证的使用区别;图书馆卡用于借书,学生证用于身份验证', NULL, 3),
    ('图书馆借还书', 'collocation', 'check out', '借出书籍', NULL, 4),
    ('图书馆借还书', 'chunk', 'due date', '到期日', NULL, 5),
    ('图书馆借还书', 'collocation', 'renew', '续借', NULL, 6),
    ('图书馆借还书', 'word', 'overdue', '逾期', NULL, 7),
    ('图书馆借还书', 'word', 'fine', '罚款', NULL, 8),
    ('图书馆借还书', 'chunk', 'reserve a book', '预约书籍', NULL, 9),
    ('论文写作与查重', 'word', 'outline', '提纲', NULL, 1),
    ('论文写作与查重', 'chunk', 'gather sources', '搜集资料', NULL, 2),
    ('论文写作与查重', 'collocation', 'cite correctly', '正确引用', NULL, 3),
    ('论文写作与查重', 'contrast', 'paraphrase vs quote', 'paraphrase 是用自己的话表达原意,quote 是直接引用原文,需加引号', NULL, 4),
    ('论文写作与查重', 'collocation', 'avoid plagiarism', '避免抄袭', NULL, 5),
    ('论文写作与查重', 'chunk', 'use plagiarism detection software', '使用查重软件', NULL, 6),
    ('论文写作与查重', 'word', 'proofread', '校对', 'proofread', 7),
    ('论文写作与查重', 'collocation', 'finalize the draft', '定稿', NULL, 8),
    ('考前复习', 'collocation', 'make a study plan', '制定学习计划', NULL, 1),
    ('考前复习', 'collocation', 'set realistic goals', '设定实际的目标', NULL, 2),
    ('考前复习', 'word', 'prioritize', '优先考虑', NULL, 3),
    ('考前复习', 'collocation', 'practice tests', '练习测试', NULL, 4),
    ('考前复习', 'collocation', 'review old exams', '复习旧试卷', NULL, 5),
    ('考前复习', 'contrast', 'cram vs pace yourself', '临时抱佛脚 vs 合理分配时间；在考试前临时抱佛脚可能导致疲惫不堪，而合理分配时间有助于保持精力和自信。', NULL, 6),
    ('考前复习', 'collocation', 'burn out', '精疲力竭', NULL, 7),
    ('考前复习', 'collocation', 'take breaks', '休息', NULL, 8),
    ('考前复习', 'collocation', 'stay focused', '保持专注', NULL, 9),
    ('考前复习', 'chunk', 'take the exam', '参加考试', NULL, 10),
    ('找导师改论文', 'collocation', 'office hours', '办公时间', NULL, 1),
    ('找导师改论文', 'word', 'feedback', '反馈', NULL, 2),
    ('找导师改论文', 'chunk', 'constructive criticism', '建设性的批评', NULL, 3),
    ('找导师改论文', 'word', 'revise', '修改', NULL, 4),
    ('找导师改论文', 'collocation', 'incorporate suggestions', '采纳建议', NULL, 5),
    ('找导师改论文', 'chunk', 'improve clarity and coherence', '提高清晰度和连贯性', NULL, 6),
    ('找导师改论文', 'word', 'resubmit', '重新提交', NULL, 7),
    ('找导师改论文', 'contrast', 'accept vs reject', '接受 vs 拒绝,接受表示同意或赞成,拒绝表示不同意或反对', NULL, 8),
    ('求职面试', 'collocation', 'job posting', '职位发布', NULL, 1),
    ('求职面试', 'chunk', 'tailor your resume', '量身定制简历', NULL, 2),
    ('求职面试', 'collocation', 'submit an application', '提交申请', NULL, 3),
    ('求职面试', 'contrast', 'get shortlisted vs get rejected', '进入候选名单 vs 被拒绝', NULL, 4),
    ('求职面试', 'collocation', 'prepare for the interview', '准备面试', NULL, 5),
    ('求职面试', 'collocation', 'receive an offer', '收到录用通知', NULL, 6),
    ('求职面试', 'contrast', 'negotiate salary vs accept as is', '谈判薪水 vs 接受现有薪水', NULL, 7),
    ('求职面试', 'chunk', 'accept the offer', '接受录用', NULL, 8),
    ('第一天上班', 'collocation', 'starting a new job', '开始一份新工作', NULL, 1),
    ('第一天上班', 'word', 'onboarding', '入职培训', NULL, 2),
    ('第一天上班', 'chunk', 'first impressions', '第一印象', NULL, 3),
    ('第一天上班', 'contrast', 'probation vs permanent', '试用期 vs 正式员工,试用期是刚开始工作时的考察阶段,而正式员工是在通过试用期后转正的员工。', NULL, 4),
    ('第一天上班', 'word', 'colleague', '同事', NULL, 5),
    ('第一天上班', 'collocation', 'get up to speed', '跟上进度', NULL, 6),
    ('第一天上班', 'chunk', 'company culture', '公司文化', NULL, 7),
    ('第一天上班', 'collocation', 'work-life balance', '工作与生活的平衡', NULL, 8),
    ('开会与汇报', 'collocation', 'set the agenda', '制定议程', NULL, 1),
    ('开会与汇报', 'chunk', 'open the floor for discussion', '开放讨论', NULL, 2),
    ('开会与汇报', 'word', 'brainstorm', '头脑风暴', NULL, 3),
    ('开会与汇报', 'contrast', 'debate vs discussion', '辩论 vs 讨论:辩论更具对抗性，而讨论更注重分享和倾听。', NULL, 4),
    ('开会与汇报', 'chunk', 'run over time', '超时', NULL, 5),
    ('开会与汇报', 'collocation', 'get on the same page', '达成共识', NULL, 6),
    ('开会与汇报', 'chunk', 'reach consensus', '达成一致', NULL, 7),
    ('开会与汇报', 'collocation', 'identify action items', '确定行动项目', NULL, 8),
    ('开会与汇报', 'collocation', 'take minutes', '记录会议纪要', NULL, 9),
    ('开会与汇报', 'collocation', 'follow up', '跟进', NULL, 10),
    ('远程与混合办公', 'contrast', 'remote vs in-office', '远程 vs 办公室工作', NULL, 1),
    ('远程与混合办公', 'collocation', 'hybrid work model', '混合办公模式', NULL, 2),
    ('远程与混合办公', 'chunk', 'log on', '登录', NULL, 3),
    ('远程与混合办公', 'word', 'time zone', '时区', NULL, 4),
    ('远程与混合办公', 'word', 'async', '异步', NULL, 5),
    ('远程与混合办公', 'collocation', 'check in', '签到', NULL, 6),
    ('远程与混合办公', 'collocation', 'stay connected', '保持联系', NULL, 7),
    ('远程与混合办公', 'word', 'burnout', '倦怠', NULL, 8),
    ('远程与混合办公', 'chunk', 'work-life balance', '工作与生活的平衡', NULL, 9),
    ('加薪与升职', 'word', 'performance review', '绩效评估', NULL, 1),
    ('加薪与升职', 'collocation', 'meet expectations', '达到预期', NULL, 2),
    ('加薪与升职', 'chunk', 'ask for a raise', '要求加薪', NULL, 3),
    ('加薪与升职', 'word', 'negotiation', '谈判', 'negotiation', 4),
    ('加薪与升职', 'contrast', 'raise vs promotion', '加薪 vs 升职:加薪指增加工资,升职指职位晋升,通常伴随更多责任。', NULL, 5),
    ('加薪与升职', 'chunk', 'take on more responsibilities', '承担更多责任', NULL, 6),
    ('加薪与升职', 'collocation', 'career advancement', '职业发展', NULL, 7),
    ('加薪与升职', 'word', 'recognition', '认可', NULL, 8),
    ('加薪与升职', 'collocation', 'job satisfaction', '工作满意度', NULL, 9),
    ('辞职交接', 'chunk', 'hand in notice', '递交辞呈', NULL, 1),
    ('辞职交接', 'word', 'resignation letter', '辞职信', NULL, 2),
    ('辞职交接', 'collocation', 'notice period', '通知期', NULL, 3),
    ('辞职交接', 'word', 'handover', '交接', NULL, 4),
    ('辞职交接', 'chunk', 'transfer responsibilities', '移交职责', NULL, 5),
    ('辞职交接', 'collocation', 'exit interview', '离职面谈', NULL, 6),
    ('辞职交接', 'contrast', 'severance package vs final paycheck', '遣散费和最后工资单通常都在离职后发放,前者是公司给予的补偿,后者是应得的工资。', NULL, 7),
    ('辞职交接', 'chunk', 'emotional closure', '情感上的告别', NULL, 8),
    ('辞职交接', 'word', 'networking', '人脉关系', NULL, 9),
    ('订机票与值机', 'chunk', 'online travel agency', '在线旅游代理', NULL, 1),
    ('订机票与值机', 'contrast', 'direct vs connecting', '直飞 vs 中转', NULL, 2),
    ('订机票与值机', 'collocation', 'book a flight', '订机票', NULL, 3),
    ('订机票与值机', 'collocation', 'check in', '办理登机手续', NULL, 4),
    ('订机票与值机', 'word', 'boarding pass', '登机牌', NULL, 5),
    ('订机票与值机', 'word', 'gate', '登机口', NULL, 6),
    ('订机票与值机', 'word', 'delayed', '延误', NULL, 7),
    ('订机票与值机', 'chunk', 'make the connection', '赶上转机', NULL, 8),
    ('过海关入境', 'collocation', 'passport control', '护照检查', NULL, 1),
    ('过海关入境', 'collocation', 'customs declaration form', '海关申报单', NULL, 2),
    ('过海关入境', 'collocation', 'baggage claim', '行李领取', NULL, 3),
    ('过海关入境', 'collocation', 'customs inspection', '海关检查', NULL, 4),
    ('过海关入境', 'contrast', 'nothing to declare vs items to declare', '无申报物 vs 有申报物:无申报物时选择前者,否则选择后者', NULL, 5),
    ('过海关入境', 'chunk', 'present your passport', '出示护照', NULL, 6),
    ('过海关入境', 'collocation', 'security check', '安全检查', NULL, 7),
    ('过海关入境', 'word', 'exit', '出口', NULL, 8),
    ('酒店入住', 'chunk', 'make a reservation', '预订', NULL, 1),
    ('酒店入住', 'collocation', 'confirm the booking', '确认预订', NULL, 2),
    ('酒店入住', 'word', 'check-in', '登记入住', NULL, 3),
    ('酒店入住', 'chunk', 'provide identification', '出示身份证明', NULL, 4),
    ('酒店入住', 'collocation', 'room service', '客房服务', NULL, 5),
    ('酒店入住', 'contrast', 'complimentary vs charged', '免费 vs 收费,有些酒店提供免费的客房服务,而有些则收取费用,入住前需确认清楚。', NULL, 6),
    ('酒店入住', 'chunk', 'request additional amenities', '要求额外设施', NULL, 7),
    ('酒店入住', 'word', 'check-out', '退房', NULL, 8),
    ('酒店入住', 'chunk', 'settle the check', '结算账单', NULL, 9),
    ('酒店入住', 'collocation', 'deposit refund', '退还押金', NULL, 10),
    ('城市交通', 'collocation', 'rush hour', '高峰时段', NULL, 1),
    ('城市交通', 'chunk', 'transfer to another line', '换乘到另一条线路', NULL, 2),
    ('城市交通', 'word', 'crowded', '拥挤', NULL, 3),
    ('城市交通', 'collocation', 'get off', '下车', NULL, 4),
    ('城市交通', 'chunk', 'running late', '迟到', NULL, 5),
    ('城市交通', 'collocation', 'hail a cab', '打车', NULL, 6),
    ('城市交通', 'contrast', 'subway vs bus', '地铁 vs 公交车:地铁速度快,但高峰期更拥挤;公交车灵活,但可能遇到堵车。', NULL, 7),
    ('城市交通', 'collocation', 'inconvenient route', '不便的路线', NULL, 8),
    ('城市交通', 'chunk', 'consider alternatives', '考虑其他选择', NULL, 9),
    ('旅途出岔子', 'collocation', 'missed the train', '错过火车', NULL, 1),
    ('旅途出岔子', 'chunk', 'unexpected delays', '意外延误', NULL, 2),
    ('旅途出岔子', 'chunk', 'contact customer service', '联系客户服务', NULL, 3),
    ('旅途出岔子', 'collocation', 'alternative transportation', '替代交通工具', NULL, 4),
    ('旅途出岔子', 'word', 'refund', '退款', 'refund', 5),
    ('旅途出岔子', 'collocation', 'travel insurance', '旅行保险', NULL, 6),
    ('旅途出岔子', 'chunk', 'file a claim', '提出索赔', NULL, 7),
    ('旅途出岔子', 'chunk', 'make the best of it', '尽量利用好', NULL, 8),
    ('租车与事故处理', 'collocation', 'rent a car', '租车', NULL, 1),
    ('租车与事故处理', 'collocation', 'rental agreement', '租赁协议', NULL, 2),
    ('租车与事故处理', 'word', 'insurance', '保险', NULL, 3),
    ('租车与事故处理', 'contrast', 'deductible vs premium', 'deductible 是指保险自付额,即在保险公司赔付之前,个人需要承担的费用;而 premium 是指保费,即为购买保险所支付的金额。', NULL, 4),
    ('租车与事故处理', 'word', 'damage', '损坏', NULL, 5),
    ('租车与事故处理', 'chunk', 'exchange information', '交换信息', NULL, 6),
    ('租车与事故处理', 'collocation', 'file a claim', '提出索赔', NULL, 7),
    ('租车与事故处理', 'word', 'repair', '修理', NULL, 8),
    ('租车与事故处理', 'word', 'reimbursement', '报销', NULL, 9),
    ('社交媒体', 'word', 'scroll', '滚动浏览', 'scroll', 1),
    ('社交媒体', 'collocation', 'go viral', '迅速走红', NULL, 2),
    ('社交媒体', 'word', 'follower', '粉丝', NULL, 3),
    ('社交媒体', 'collocation', 'engage with content', '与内容互动', NULL, 4),
    ('社交媒体', 'contrast', 'misinformation vs disinformation', 'misinformation指无意传播的错误信息,而disinformation指故意传播的虚假信息', NULL, 5),
    ('社交媒体', 'word', 'troll', '喷子', NULL, 6),
    ('社交媒体', 'collocation', 'digital detox', '数字排毒', NULL, 7),
    ('社交媒体', 'chunk', 'strike a balance', '找到平衡点', NULL, 8),
    ('网上支付与诈骗', 'collocation', 'link a card', '绑定银行卡', NULL, 1),
    ('网上支付与诈骗', 'chunk', 'enable two-factor authentication', '启用双重身份验证', NULL, 2),
    ('网上支付与诈骗', 'word', 'phishing', '网络钓鱼', NULL, 3),
    ('网上支付与诈骗', 'chunk', 'freeze the account', '冻结账户', NULL, 4),
    ('网上支付与诈骗', 'chunk', 'file a dispute', '提交争议', NULL, 5),
    ('网上支付与诈骗', 'contrast', 'fraud vs scam', 'fraud 通常指金融上的欺诈,而 scam 则指较小规模的骗局', NULL, 6),
    ('网上支付与诈骗', 'word', 'identity theft', '身份盗窃', NULL, 7),
    ('网上支付与诈骗', 'word', 'secure', '安全的', NULL, 8),
    ('网上支付与诈骗', 'collocation', 'financial loss', '经济损失', NULL, 9),
    ('垃圾分类与环保', 'chunk', 'sort waste', '分类垃圾', NULL, 1),
    ('垃圾分类与环保', 'word', 'recycle', '回收利用', NULL, 2),
    ('垃圾分类与环保', 'collocation', 'single-use plastic', '一次性塑料', NULL, 3),
    ('垃圾分类与环保', 'chunk', 'reduce consumption', '减少消费', NULL, 4),
    ('垃圾分类与环保', 'word', 'compost', '堆肥', NULL, 5),
    ('垃圾分类与环保', 'contrast', 'biodegradable vs non-biodegradable', '可生物降解 vs 不可生物降解,可生物降解指能够自然分解的物质,而不可生物降解则需特殊处理', NULL, 6),
    ('垃圾分类与环保', 'collocation', 'carbon footprint', '碳足迹', NULL, 7),
    ('垃圾分类与环保', 'chunk', 'environmentally friendly', '环保的', NULL, 8),
    ('人工智能进课堂', 'chunk', 'write a prompt', '写一个提示', NULL, 1),
    ('人工智能进课堂', 'chunk', 'generate a draft', '生成初稿', NULL, 2),
    ('人工智能进课堂', 'contrast', 'AI-assisted vs AI-generated', 'AI 辅助生成 vs AI 完全生成:前者人类参与,后者完全由 AI 生成', NULL, 3),
    ('人工智能进课堂', 'chunk', 'fact-check the output', '核实输出内容', NULL, 4),
    ('人工智能进课堂', 'chunk', 'cite your sources', '引用来源', NULL, 5),
    ('人工智能进课堂', 'chunk', 'disclose AI use', '披露 AI 使用情况', NULL, 6),
    ('人工智能进课堂', 'chunk', 'over-rely on it', '过度依赖 AI', NULL, 7),
    ('人工智能进课堂', 'chunk', 'academic integrity policy', '学术诚信政策', NULL, 8),
    ('人工智能进课堂', 'chunk', 'ban or embrace', '禁止还是接受', NULL, 9)
  ) AS v(title_zh, kind, text_en, text_zh, headword, sort_order)
  JOIN vocab_scene_packs p ON p.title_zh = v.title_zh
  LEFT JOIN vocab_words w ON lower(w.headword) = v.headword;

-- ── validate:七行都必须是 t ──
SELECT '场景恰 30 个' AS expect,
       (SELECT count(*) FROM vocab_scene_packs) = 30 AS ok
UNION ALL
SELECT '节点恰 262 个',
       (SELECT count(*) FROM vocab_scene_items) = 262
UNION ALL
SELECT '每个场景 8-15 个节点',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs p
                    LEFT JOIN vocab_scene_items i ON i.pack_id = p.id
                    GROUP BY p.id HAVING count(i.id) NOT BETWEEN 8 AND 15)
UNION ALL
SELECT '每个场景的 sort_order 是 1..n 全序',
       NOT EXISTS (SELECT 1 FROM vocab_scene_items i
                    GROUP BY i.pack_id
                   HAVING min(i.sort_order) <> 1
                       OR max(i.sort_order) <> count(*)
                       OR count(DISTINCT i.sort_order) <> count(*))
UNION ALL
SELECT '完整版短文含链上 >=80% 节点(与生成端 j4 同一把尺)',
       NOT EXISTS (
         SELECT 1 FROM vocab_scene_packs p
         CROSS JOIN LATERAL (
           SELECT count(*) FILTER (
                    WHERE NOT (
           SELECT count(*) FILTER (WHERE position(w in regexp_replace(regexp_replace(regexp_replace(lower(p.essay_full_en), '''[a-z]+', '', 'g'), '[^a-z ]', ' ', 'g'), '\s+', ' ', 'g')) > 0)::numeric
                  / NULLIF(count(*), 0)
             FROM unnest(string_to_array(regexp_replace(regexp_replace(regexp_replace(lower(i.text_en), '''[a-z]+', '', 'g'), '[^a-z ]', ' ', 'g'), '\s+', ' ', 'g'), ' ')) AS w
            WHERE length(w) > 2 AND w NOT IN ('that', 'this', 'there', 'these', 'those', 'you', 'she', 'they', 'him', 'her', 'them', 'your', 'his', 'its', 'our', 'their', 'one', 'ones', 'yourself', 'himself', 'herself', 'themselves', 'are', 'was', 'were', 'been', 'being', 'the', 'for', 'and', 'but', 'not', 'does', 'did', 'whatever', 'wherever', 'whenever', 'however')
         ) < 0.6
                  )::numeric / NULLIF(count(*), 0) AS r
             FROM vocab_scene_items i
            WHERE i.pack_id = p.id AND i.kind <> 'contrast'
         ) s
         WHERE s.r < 0.8
       )
UNION ALL
SELECT '四篇短文均无 em-dash',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs
                    WHERE essay_full_en ~ '[—–]' OR essay_full_zh ~ '[—–]'
                       OR essay_short_en ~ '[—–]' OR essay_short_zh ~ '[—–]')
UNION ALL
SELECT '全部未开灯(is_published = false),待审后再翻',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs WHERE is_published);

COMMIT;
