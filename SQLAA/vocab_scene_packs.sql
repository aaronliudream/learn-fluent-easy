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
  ('租房搬家', 'renting a flat', 'Renting a flat involves several steps. First, you view a flat to find a suitable one. After that, you sign a lease and pay a deposit. Setting up utilities is next, followed by arranging furniture and moving in. Meeting the neighbours is important for community integration. 

Renting offers benefits like more living space, independence, and a new environment. However, it also presents drawbacks such as high moving costs, adapting challenges, and potential noise. Overall, with proper preparation, renting can be a rewarding experience.', '租房包括几个步骤。首先,你需要看房以找到合适的住所。接下来,签租约并支付押金。然后开通水电气,安排家具并搬入。认识邻居有助于融入社区。

租房的好处包括更多的生活空间、独立生活和体验新环境。然而,也有搬家费用高、适应挑战和噪音问题等弊端。总体而言,如果准备充分,租房可以是一次值得的经历。', 'Renting a flat and moving can be both exciting and challenging. Initially, you need to view a flat to find one that suits your needs. Once satisfied, you sign a lease, a crucial step that legally binds you to the property. You then pay a deposit, which is usually refundable if no damage is done. Next, you set up utilities like water, gas, and electricity. After arranging your furniture, you finally move in, marking a new chapter in your life. Meeting the neighbours can help you integrate into the community. 

Living in an urban area often offers better access to amenities compared to a suburban area, which might be more peaceful. The benefits of renting a flat include having more living space, living independently, and experiencing a new environment. However, there are drawbacks, such as high moving costs, the challenge of adapting to a new environment, and potential noise issues. Weighing these factors, renting a flat is generally a positive experience if one is prepared for the initial challenges.', '租房搬家既令人兴奋又充满挑战。首先,你需要看房,以找到合适的住所。一旦满意,你便签租约,这是将你合法地与房产绑定的重要一步。接着,你支付押金,通常在没有损坏的情况下是可以退还的。然后,你开通水电气等公用设施。安排好家具后,你最终搬入,标志着生活新篇章的开始。认识邻居可以帮助你融入社区。

居住在城市地区通常比郊区更容易获得便利设施,而郊区可能更宁静。租房的好处包括更多的生活空间、独立生活和体验新环境。然而,也有一些弊端,如搬家费用高、适应新环境的挑战和可能遇到的噪音问题。权衡这些因素,如果准备好迎接初期的挑战,租房总体上是一个积极的经历。', 2, false),
  ('超市采购', 'grocery shopping', 'When grocery shopping, start by making a shopping list to save time and stay organized. As you walk through each aisle, check what is in stock and the best-before dates for freshness. At checkout, choose between self-checkout for small items or a cashier for larger purchases. Use a loyalty card and any coupons to save more. Lastly, bag the groceries carefully. While there are benefits like discounts and efficiency, challenges such as out-of-stock items and long queues exist. Being prepared can make your trip rewarding.', '在采购时,先列购物清单以节省时间和保持有条理。走过货架通道时,检查有货商品和保质期以确保新鲜。在结账时,小件商品可用自助结账,大件商品或需帮助时选择收银员。使用会员卡和优惠券可省更多。最后,小心装袋。尽管有折扣和效率等好处,但也有缺货和排队等挑战。做好准备可使购物之旅更有收获。', 'When heading to the supermarket for grocery shopping, it''s wise to first make a shopping list. This helps in saving time and ensures a more organized shopping experience. As you navigate through each aisle, you can quickly identify which products are in stock and avoid the disappointment of missing items. Checking the best-before date is essential to ensure the freshness of your groceries. 

When it''s time to pay, you might choose between self-checkout and a cashier. Self-checkout is great for small purchases and avoiding long lines, while a cashier is better for larger purchases or when you need assistance. Using a loyalty card can earn you points or discounts, adding to the savings. Don''t forget to use any coupons you have to further reduce the total cost. Finally, bag the groceries efficiently, ensuring fragile items are protected.

While grocery shopping can be efficient and cost-effective, there are drawbacks like potential out-of-stock items or forgetting your list. Sometimes, long queues can also be a hassle. Weighing these pros and cons, being prepared and organized can make your supermarket visit smooth and rewarding.', '去超市采购时,首先列购物清单是明智之举。这有助于节省时间,确保购物过程更有条理。在穿过每个货架通道时,你可以快速识别哪些商品有货,避免缺货的失望。检查保质期是确保食品新鲜的关键。

结账时,你可以选择自助结账或收银员结账。自助结账适合少量商品且不想排队,而收银员结账适合大量商品或需要人工帮助时。使用会员卡可以赚取积分或折扣,增加节省。别忘了使用任何优惠券,进一步降低总成本。最后,有效地装袋,确保易碎物品得到保护。

虽然超市采购可以高效且经济,但也有缺点,如可能缺货或忘记清单。有时,长队也可能是个麻烦。权衡这些利弊,做好准备和有条理可以使你的超市之行顺利且有收获。', 3, false),
  ('看病就医', 'seeing a doctor', 'Seeing a doctor involves making an appointment, discussing symptoms, undergoing a medical examination, and receiving a diagnosis from the doctor. Treatment can involve prescription or over-the-counter medications, both of which may have side effects. Follow-up appointments and health insurance play roles in managing the process, leading to recovery.

Benefits include early detection, personalized treatment, and professional advice. However, it can be time-consuming, expensive, and medications may cause side effects. Despite drawbacks, seeing a doctor is crucial for health as its benefits often outweigh the negatives.', '看病就医包括预约就诊、描述症状、进行体检和获得医生诊断。治疗可能涉及处方药或非处方药,两者都可能有副作用。复诊预约和健康保险在管理过程中起作用,最终实现康复。

好处包括早期发现、个性化治疗和专业建议。然而,这一过程可能耗时、昂贵,药物可能有副作用。尽管有弊端,就医对于健康至关重要,因为其好处往往超过缺点。', 'Seeing a doctor is a common necessity for maintaining good health. Initially, one must make an appointment to visit the doctor. During the visit, patients discuss their symptoms, which leads to a medical examination. Based on this, a diagnosis from the doctor is provided. Often, the treatment involves medication, which can be either prescription or over-the-counter. Prescription medications require a doctor''s approval, while over-the-counter drugs can be purchased directly. However, all medications can have side effects. After starting treatment, a follow-up appointment is usually necessary to monitor progress. Health insurance often helps with the costs involved in these processes. The ultimate goal is recovery.

The benefits of seeing a doctor include early detection of diseases, personalized treatment, and professional advice, which are crucial for effective health management. However, the process can be time-consuming and expensive, and medications may have side effects. Balancing these pros and cons, visiting a doctor remains essential for maintaining health, as the benefits of early intervention and expert guidance often outweigh the drawbacks.', '看病就医是保持健康的常见需求。首先,需要进行预约就诊。在就诊期间,患者会描述自己的症状,这会引导医生进行体检。根据体检结果,医生会给出诊断。通常,治疗方案包括用药,可能是处方药或非处方药。处方药需要医生开具,而非处方药可以直接购买。然而,所有药物都可能有副作用。在开始治疗后,通常需要复诊预约以监测病情进展。健康保险通常可以帮助支付这些过程中的费用。最终目标是康复。

看病就医的好处包括疾病的早期发现、个性化治疗和专业建议,这些对于有效的健康管理至关重要。然而,这一过程可能耗时且昂贵,药物可能有副作用。在权衡这些利弊后,就医仍然是保持健康的必要步骤,因为早期干预和专家指导的好处往往超过弊端。', 4, false),
  ('在餐厅点餐', 'eating out', 'Eating out begins with booking a table. Upon arrival, you are seated and given a menu. If allergic, choose carefully before placing an order. After eating, request the bill or check, depending on your location. Splitting it with friends makes it affordable. Leaving a tip is customary, followed by leaving a review.

Eating out offers convenient service, diverse choices, and social opportunities. However, it can be expensive, involve long waits, and lead to decision fatigue from too many menu options. Despite these drawbacks, it remains a popular choice for variety and social engagement.', '在外就餐从预订餐桌开始。到达后，你会入座并拿到菜单。如果过敏，需谨慎选择再下单。用餐后，要求结账，在英国称“the bill”，在美国称“check”。与朋友分摊费用更实惠。留下小费是习惯，接着留下评价。

外出就餐提供方便的服务、多样的选择和社交机会。然而，它可能昂贵，需要长时间等待，并因菜单过多导致选择困难。尽管有这些缺点，外出就餐仍是追求多样性和社交互动的热门选择。', 'Eating out at a restaurant starts with the familiar process of booking a table. Once you arrive, you are usually quickly seated and handed a menu. The variety of choices can be overwhelming, especially if you are allergic to certain ingredients. However, placing an order is an opportunity to explore new dishes. After enjoying your meal, it''s time to ask for the bill, or check, depending on whether you''re in the UK or the US. If dining with friends, you might decide to split it, making the meal more affordable for everyone. Leaving a tip is customary, rewarding the staff for their service. Finally, you can leave a review online to share your experience.

Eating out provides convenient and quick service, a diverse array of options, and social interaction opportunities. However, it can be expensive, involve long waiting times, and the extensive menu may lead to decision fatigue. Balancing these pros and cons, dining out remains a popular choice for many seeking variety and social engagement, despite its drawbacks.', '在餐厅用餐通常从预订餐桌开始。到达后，你会很快入座，并拿到菜单。丰富的选择可能让人眼花缭乱，尤其是如果你对某些成分过敏的话。然而，下单是探索新菜品的好机会。享用完美味之后，就该结账了，在英国称为“the bill”，在美国则称为“check”。如果和朋友一起用餐，你可能会选择分摊费用，这样大家都更能负担得起。留下小费是惯例，以感谢服务员的服务。最后，你可以在线留下评价，与他人分享你的体验。

在外就餐提供方便快捷的服务、多样化的选择以及社交活动的机会。然而，它可能昂贵、需要长时间等待，而且菜单选择过多可能导致选择困难。权衡利弊，尽管有缺点，外出就餐仍然是许多人追求多样性和社交互动的热门选择。', 5, false),
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
  ('邻里噪音纠纷', 'noisy neighbours', 'Noisy neighbours are a common issue. Initially, one might complain and ask them to keep it down. If that fails, talking to the landlord to mediate might help reach a compromise. Alternatively, filing a noise complaint or organizing a community meeting could be necessary. 

Benefits include solving the problem and improving relationships. However, drawbacks are time consumption, potential conflicts, and the challenge of compromise. 

Ultimately, mediation and compromise lead to a harmonious environment, balancing tolerance and endurance to find a peaceful solution.', '吵闹的邻居是常见问题。一开始可以抱怨并要求对方保持安静。如果无效，找房东调解可能有助于达成妥协。或者，可能需要提交噪音投诉或组织社区会议。

好处包括解决问题和改善关系。然而，弊端是耗时长、可能引发冲突和妥协的挑战。

最终，调解和妥协能带来和谐环境，平衡容忍和忍受以找到和平解决方案。', 'Dealing with noisy neighbours is a common issue that many people face. When the noise becomes unbearable, the first step is often to complain and ask them to keep it down. If this doesn''t work, you might need to talk to the landlord who can mediate the situation. Mediation can lead to a compromise, where both parties agree on a reasonable noise level. Alternatively, you might need to file a noise complaint with local authorities or organize a community meeting to discuss solutions. 

The benefits of addressing noise issues include solving the problem, promoting understanding, and improving relationships among neighbours. However, there are drawbacks; resolving such issues can be time-consuming, may lead to conflicts, and finding a compromise isn''t always easy. 

In conclusion, while dealing with noisy neighbours can be challenging, the process of mediation and compromise often leads to a more harmonious living environment. It''s important to tolerate minor disturbances but endure only when absolutely necessary. Ultimately, finding a peaceful solution benefits everyone involved.', '处理邻里噪音是许多人面临的常见问题。当噪音变得无法忍受时，第一步通常是抱怨并要求他们保持安静。如果这不起作用，你可能需要找房东谈谈，让他来调解。调解可以导致妥协，双方同意一个合理的噪音水平。或者，你可能需要向当地政府提交噪音投诉，或组织社区会议以讨论解决方案。

解决噪音问题的好处包括解决问题、促进理解和改善邻里关系。然而，也有一些弊端：解决这些问题可能耗时长，可能引发冲突，而且妥协并不总是容易的。

总之，虽然处理邻里噪音可能具有挑战性，但调解和妥协的过程通常会带来更和谐的生活环境。重要的是容忍小的干扰，但只有在绝对必要时才忍受。最终，找到一个和平的解决方案对所有相关方都有利。', 8, false),
  ('选课与退课', 'course registration', 'Students begin by identifying prerequisite courses. After meeting the requirements, they register for classes and enrol in courses that suit their interests. The option to drop a course is beneficial if it doesn''t meet expectations. Earning credits in mandatory courses is vital, but choosing electives adds flexibility. 

Benefits include credit accumulation and career-oriented choices. However, drawbacks like time clashes in class schedules and cumbersome procedures exist. Despite these challenges, the benefits of flexibility and credit accumulation generally outweigh the drawbacks.', '学生首先确定先修课。满足要求后，他们注册课程，选修符合兴趣的课。退课选项在不符合期望时是有益的。获得必修课学分至关重要，但选择选修课增加了灵活性。

好处包括学分积累和职业导向选择。然而，也存在时间冲突和繁琐手续等缺点。尽管有这些挑战，灵活性和学分积累的好处通常超过缺点。', 'When students plan their academic journey, they often start by identifying which prerequisite courses they need to take. Once they meet the requirements, they can register for classes and enrol in a course that aligns with their interests and academic goals. The ability to drop a course if it does not meet their expectations can be beneficial. Earning credit for mandatory courses is crucial, but students also enjoy the flexibility of choosing elective courses based on their interests. 

One benefit of this process is that students can accumulate credits towards their degree. Additionally, having the option to choose electives allows students to tailor their education to their career goals. However, the process is not without drawbacks. Students often face time clashes in their class schedule, requiring them to resolve a clash, which can be stressful. Furthermore, the administrative procedures involved in registration can be cumbersome, and sometimes the course content may not meet students'' expectations.

In conclusion, while there are challenges in the course registration process, the benefits of flexibility and credit accumulation generally outweigh the drawbacks.', '当学生规划他们的学术旅程时，他们通常从确定需要修读哪些先修课开始。一旦满足要求，他们就可以注册课程，选修与兴趣和学术目标相符的课程。如果课程不符合期望，退课的能力可能是有益的。获得必修课的学分是至关重要的，但学生也享受根据兴趣选择选修课的灵活性。

这一过程的一个好处是学生可以积累学位所需的学分。此外，选择选修课的选项允许学生根据职业目标定制他们的教育。然而，这一过程也存在缺点。学生们经常在课程表中遇到时间冲突，需要解决冲突，这可能会带来压力。此外，注册过程中涉及的行政程序可能非常繁琐，有时课程内容可能不符合学生的期望。

总之，尽管选课过程中有挑战，但灵活性和学分积累的好处通常超过了缺点。', 9, false),
  ('小组作业', 'group projects', 'In group projects, assigning roles is the first step to ensure everyone knows their tasks. This is followed by brainstorming to reach consensus on the project. Cooperation and collaboration are key, but the free-rider problem can occur if some members don''t contribute equally. Teams must meet deadlines, merge slides, and rehearse presentations. Afterward, feedback is gathered and the process is reflected upon.

Group projects enhance communication skills, foster team spirit, and promote innovative thinking. However, they also pose challenges like time management issues, potential conflicts, and uneven responsibility distribution. Despite these drawbacks, the benefits make group projects a valuable experience.', '在小组作业中,第一步是分配角色,确保每个人知道他们的任务。接下来是头脑风暴,以便在项目上达成共识。合作与协作是关键,但如果有些成员不均衡贡献,搭便车问题可能出现。团队必须遵守截止日期,合并幻灯片并排练演讲。之后,收集反馈并反思过程。

小组作业提高沟通能力,培养团队精神,促进创新思维。然而,它们也带来时间管理问题、潜在冲突和责任不均衡等挑战。尽管有这些缺点,小组作业的好处使其成为一项有价值的体验。', 'In group projects, the first step is often to assign roles to each member, ensuring that everyone knows their responsibilities. This is followed by a brainstorming session to generate ideas and reach consensus on the project''s direction. As the project progresses, members must cooperate and collaborate effectively. However, the free-rider problem can arise when some members do not contribute equally. Meeting the deadline becomes crucial, and teams often need to merge slides and rehearse the presentation to ensure smooth delivery. After the presentation, feedback is gathered, and it''s important to reflect on the process to identify areas for improvement.

Group projects offer several benefits. They enhance communication skills as members must articulate ideas clearly. They also foster team spirit, encouraging members to work together towards a common goal. Moreover, they promote innovative thinking by combining diverse perspectives.

However, group projects also have drawbacks. Time management can be challenging, especially when coordinating schedules. Conflicts may arise from differing opinions, and responsibilities might not be evenly distributed.

In conclusion, while group projects present certain challenges, their benefits in developing valuable skills make them a worthwhile endeavor.', '在小组作业中,第一步通常是为每个成员分配角色,确保每个人都知道他们的责任。接下来是头脑风暴,以产生想法并在项目方向上达成共识。随着项目的进展,成员们必须有效地合作与协作。然而,搭便车问题可能会出现,即有些成员贡献不均。此时,截止日期变得至关重要,团队通常需要合并幻灯片并排练演讲以确保顺利交付。演讲结束后,会收集反馈,反思过程以找出改进之处是很重要的。

小组作业有几个好处。它们提高沟通能力,因为成员必须清晰地表达想法。它们也培养团队精神,鼓励成员为共同目标一起努力。此外,通过结合多样化的视角,它们促进创新思维。

然而,小组作业也有一些弊端。时间管理可能是个挑战,尤其是在协调时间表时。不同意见可能引发冲突,责任可能分配不均。

总之,尽管小组作业存在某些挑战,但在培养有价值技能方面的好处使其成为值得尝试的事情。', 10, false),
  ('图书馆借还书', 'using the library', 'Using the library efficiently requires knowing a few steps. When you check out a book, note the due date to avoid issues. You can renew a book if needed, but avoid making it overdue to escape fines. If a book is unavailable, reserve it through the library catalog. Some libraries need a library card instead of a student ID. Common mistakes include not returning on time, leading to fines. Familiarize yourself with the library''s rules to make the most of its resources, which offer benefits like a quiet environment and free access, despite some drawbacks like fines and wait times.', '有效利用图书馆需要了解几个步骤。借书时,注意到期日以避免问题。如果需要,可以续借,但要避免过期以免罚款。如书不可用,可通过图书馆目录预约。有些图书馆需用图书馆卡而非学生证。常见错误包括未按时归还,导致罚款。熟悉图书馆规则以充分利用其资源,享受安静环境和免费使用等好处,尽管也有罚款和等待时间等缺点。', 'Using the library efficiently involves understanding a few key steps. First, when you check out a book, always note the due date. This helps you manage your time and avoid issues. If you need more time with the book, you can often renew it, extending your borrowing period. However, if you forget and the book becomes overdue, you may have to pay a fine. To avoid this, it''s wise to set reminders. If the book you want is not available, you can reserve it through the library catalog. This ensures you get the book when it''s returned. Be aware that some libraries require a library card instead of a student ID for borrowing. A common mistake is forgetting to return books on time, leading to overdue fines. To prevent this, always return on time. My advice is to familiarize yourself with the library''s rules and utilize their resources effectively. Libraries offer a wealth of benefits, including a quiet environment and free access to a wide range of materials, but they also have some drawbacks such as overdue fines and wait times for reserved books.', '有效利用图书馆需要了解一些关键步骤。首先,当你借书时,一定要注意到期日。这有助于你管理时间,避免问题。如果你需要更多时间,通常可以续借,延长借阅期。然而,如果你忘记了,书过期了,你可能需要支付罚款。为了避免这种情况,最好设置提醒。如果你想要的书不可用,可以通过图书馆目录预约。这确保了书一归还,你就可以借到。注意,有些图书馆要求使用图书馆卡而不是学生证。常见的错误是忘记按时归还,导致过期罚款。为了避免这种情况,一定要按时归还。我的建议是熟悉图书馆的规则,有效利用他们的资源。图书馆提供丰富的好处,包括安静的环境和免费使用各种材料,但也有一些缺点,如过期罚款和预约等待时间。', 11, false),
  ('论文写作与查重', 'academic writing', 'Writing an academic paper starts with an outline to structure the paper. Then, gather sources to support arguments. Correct citation is crucial, deciding between paraphrase and quote to avoid plagiarism. Paraphrasing uses your words, while quoting uses exact words with quotes. Use plagiarism detection software for originality. Proofreading is essential to catch errors before finalizing the draft.

This process improves structure, ensures citations, and avoids misconduct, but is time-consuming and software reliability can be an issue. Balancing these is key to success.', '撰写学术论文从提纲开始,用于组织结构。然后,搜集资料支持论点。正确引用至关重要,需在paraphrase和quote之间选择以避免抄袭。paraphrase用自己的话,quote则用引号标出原文。使用查重软件确保原创性。校对对发现错误至关重要,然后定稿。

这个过程提高结构、确保引用、避免不端,但耗时且软件可靠性成问题。平衡这些是成功的关键。', 'Writing an academic paper requires careful planning and execution. The process begins with creating a detailed outline, which helps in structuring the paper effectively. Next, one must gather sources from various references to support the arguments. To maintain academic integrity, it is crucial to cite correctly and decide whether to paraphrase or quote, as paraphrasing involves using your own words to express the original idea, while quoting requires using the exact words with quotation marks. This practice helps to avoid plagiarism, a serious academic offense. To further ensure originality, one should use plagiarism detection software. After addressing these elements, proofreading becomes essential to catch any grammatical or typographical errors. Finally, the draft is finalized, ensuring that the paper is polished and ready for submission.

While this meticulous process improves the writing structure, ensures accurate citations, and avoids academic misconduct, it can be time-consuming and labor-intensive. Additionally, reliance on plagiarism detection software might not always be accurate, leading to false positives. Over-dependence on technology can also hinder the development of independent writing skills. Balancing these aspects is key to successful academic writing.', '写作学术论文需要精心的规划和执行。首先需要制定详细的提纲,有助于有效地组织论文结构。接下来,需要从各种参考资料中搜集资料来支持论点。为了维护学术诚信,正确引用至关重要,并需决定是paraphrase还是quote,因为paraphrase是用自己的话表达原意,而quote则需要用引号标出原文。这有助于避免抄袭,一种严重的学术违规行为。为进一步确保原创性,应使用查重软件。在解决这些问题后,校对是必不可少的,以发现任何语法或排版错误。最后,定稿确保论文已经打磨完毕,可以提交。

虽然这个细致的过程能提高写作结构,确保引用准确,避免学术不端,但也可能耗时费力。此外,对查重软件的依赖可能不够准确,导致误报。过度依赖技术也可能阻碍独立写作能力的发展。平衡这些方面是成功学术写作的关键。', 12, false),
  ('考前复习', 'exam revision', 'Many students cram for exams, using past papers to guide their study, but this can lead to burn out. To avoid this, pace yourself by starting early and setting a study schedule. Joining a study group and using active recall methods, like flashcards or mind maps, can further enhance your learning. Taking a mock exam will prepare you for the real test. When you sit the exam, you''ll feel more confident. However, cramming can cause stress, affecting health and study efficiency, so balance study with relaxation.', '许多学生临时抱佛脚,使用历年试卷指导学习,但这可能导致精疲力竭。为避免这种情况,要合理安排时间,提前开始并制定学习计划。加入学习小组和使用主动回忆法,如单词卡片或思维导图,可以增强学习效果。参加模拟考试可为正式考试做准备。当你参加考试时,会更有信心。然而,临时抱佛脚会导致压力,影响健康和学习效率,因此要在学习与放松之间找到平衡。', 'When it comes to exam revision, many students find themselves cramming for exams at the last minute. While this method can sometimes be effective, especially if you use past papers to guide your study, it can also lead to burn out. To avoid this, it''s important to pace yourself by starting early and setting a realistic study schedule. Joining a study group can also be beneficial, as it allows for discussion and active recall of the material. Additionally, using tools like flashcards or mind maps can help structure your learning; flashcards are great for memorizing specific information, while mind maps are useful for organizing complex concepts. Taking a mock exam can further prepare you for the real thing. Ultimately, when you finally sit the exam, you''ll feel more confident and less stressed. 

However, there are drawbacks to consider. Stress from cramming can negatively impact your health and reduce overall study efficiency. Therefore, balancing intensive study with relaxation is crucial for success.', '谈到考前复习,许多学生往往在最后一刻为考试临时抱佛脚。虽然这种方法有时是有效的,特别是当你使用历年试卷来指导学习时,但它也可能导致精疲力竭。为了避免这种情况,重要的是要合理安排时间,提前开始并制定切实可行的学习计划。加入学习小组也很有帮助,因为它可以进行讨论和主动回忆材料。此外,使用单词卡片或思维导图等工具可以帮助你更好地安排学习;单词卡片适合记忆具体信息,而思维导图适合整理复杂概念。参加模拟考试可以让你更好地准备真正的考试。最终,当你参加考试时,会感到更加自信和不那么紧张。

然而,也有一些弊端需要考虑。临时抱佛脚带来的压力可能会对健康产生负面影响,并降低整体学习效率。因此,在紧张学习与放松之间找到平衡对于成功至关重要。', 13, false),
  ('找导师改论文', 'getting feedback', 'Engaging with a mentor during office hours provides valuable feedback, including constructive criticism. This guides you to revise and incorporate suggestions, improving clarity and coherence. Resubmitting the work allows you to gain new insights and enhance writing skills while building a mentor relationship.

However, it can be time-consuming and potentially discouraging if feedback is overly critical. There''s also a risk of over-dependence, impacting your ability to accept or reject suggestions independently.

Despite these challenges, the benefits of improved skills and relationships make seeking feedback a worthwhile endeavor.', '在办公时间与导师交流提供了宝贵的反馈,包括建设性的批评。这指导你修改并采纳建议,提高清晰度和连贯性。重新提交工作让你获得新见解,提高写作技能,同时建立与导师的关系。

然而,这可能非常耗时,并在反馈过于苛刻时带来挫败感。也有可能过于依赖,影响你独立接受或拒绝建议的能力。

尽管有这些挑战,但提高技能和关系的好处使得寻求反馈成为值得的努力。', 'Engaging with a mentor during office hours can profoundly impact your academic work. During these sessions, you receive valuable feedback that often includes constructive criticism. This feedback is crucial as it guides you to revise and improve your work. By incorporating suggestions, you can enhance the clarity and coherence of your paper. Once revisions are made, you resubmit your work for further evaluation. This process allows you to gain new insights and enhances your writing skills. Additionally, it fosters a strong mentor relationship, which can be beneficial for future academic endeavors.

However, seeking feedback has its drawbacks. It can be time-consuming, requiring multiple revisions and resubmissions. There''s also the potential for discouragement if feedback is overly critical. Moreover, there''s a risk of becoming over-dependent on your mentor''s guidance, hindering your ability to accept or reject suggestions independently.

On balance, while the process of seeking feedback and revising can be challenging, the benefits of improved skills and strengthened relationships outweigh the drawbacks, making it a worthwhile endeavor for any student.', '在办公时间与导师交流可以对你的学术工作产生深远影响。在这些会话中,你会收到宝贵的反馈,其中通常包括建设性的批评。这些反馈至关重要,因为它指导你修改和改善你的工作。通过采纳建议,你可以提高论文的清晰度和连贯性。一旦完成修改,你需要重新提交你的工作以供进一步评估。这一过程让你获得新的见解,并提高你的写作技能。此外,它还促进了与导师的良好关系,这对未来的学术发展大有裨益。

然而,寻求反馈也有其缺点。这可能非常耗时,需要多次修改和重新提交。如果反馈过于苛刻,也可能带来挫败感。此外,可能会过于依赖导师的指导,妨碍你独立接受或拒绝建议的能力。

总的来说,虽然寻求反馈和修改的过程可能具有挑战性,但提高技能和加强关系的好处大于其缺点,使其成为任何学生都值得尝试的努力。', 14, false),
  ('求职面试', 'job hunting', 'Job hunting involves finding a suitable job posting and tailoring your CV to match. If successful, you may be shortlisted and need to prepare for the interview, balancing confidence with arrogance. Receiving an offer leads to negotiating salary before acceptance.

Benefits include skill improvement, increased job opportunities, and confidence boosts. However, intense competition, interview stress, and complex negotiations are drawbacks.

In conclusion, the benefits of skill enhancement and job opportunities often outweigh the challenges, making job hunting a valuable endeavor.', '求职包括找到合适的职位发布并定制简历以匹配。如果成功,你可能会入围,需要准备面试,在自信与自大之间取得平衡。收到录用通知后,谈判薪资,然后决定是否接受。

好处包括提高技能、增加就业机会和增强自信。然而,激烈的竞争、面试压力和复杂的谈判是缺点。

总之,技能提升和就业机会增加的好处通常超过挑战,使求职成为有价值的尝试。', 'Job hunting involves several key steps, starting with identifying a suitable job posting. Once you find a position that interests you, tailor your CV to match the job requirements. If your application is successful, you may be placed on a shortlist. This is followed by preparing for the interview, where you must strike a balance between confidence and arrogance. If you impress the interviewers, you may receive an offer. At this stage, negotiate salary to ensure it meets your expectations before deciding on acceptance.

The benefits of this process include improving your professional skills, as each step requires you to refine your abilities. Additionally, it increases employment opportunities by presenting yourself as a strong candidate. Furthermore, successfully navigating the process can boost your confidence.

However, there are drawbacks. The competition is fierce, making it challenging to stand out. The interview stage can be stressful, requiring significant mental preparation. Moreover, the negotiation process can be complex and demanding.

In conclusion, while job hunting has its challenges, the benefits, such as skill enhancement and increased job opportunities, often outweigh the drawbacks, making it a worthwhile endeavor.', '求职涉及几个关键步骤,首先是找到合适的职位发布。一旦找到感兴趣的职位,就要定制简历以匹配职位要求。如果申请成功,你可能会进入入围名单。接下来是准备面试,在这过程中要在自信与自大之间取得平衡。如果给面试官留下深刻印象,你可能会收到录用通知。在此阶段,谈判薪资以确保符合你的期望,然后再决定是否接受。

这一过程的好处包括提高职业技能,因为每一步都要求你提升自己的能力。此外,它通过展示你作为强有力的候选人而增加就业机会。此外,成功完成这一过程可以提升自信心。

然而,也有缺点。竞争激烈,使得脱颖而出具有挑战性。面试阶段可能会带来压力,需要大量的心理准备。此外,谈判过程可能复杂且要求高。

总之,尽管求职有其挑战,但技能提升和就业机会增加等好处往往超过缺点,使其成为值得的尝试。', 15, false),
  ('第一天上班', 'starting a new job', 'Starting a new job involves onboarding, which sets first impressions and aids adaptation. During probation, employees prove their worth before becoming permanent. Engaging with colleagues and getting up to speed are key. Understanding company culture is vital as it affects workplace interactions. Benefits include broadening your network, learning new skills, and increasing earning potential. However, the adaptation period can be stressful, job security is uncertain during probation, and work-life balance may be challenging. Despite drawbacks, starting a new job can be rewarding with a positive approach.', '开始一份新工作涉及入职培训,这奠定了第一印象并帮助适应。在试用期,员工在成为正式员工前展示他们的价值。与同事交流和跟上进度是关键。理解公司文化很重要,因为它影响着工作场所的互动。好处包括拓宽人际网络、学习新技能和提高收入潜力。然而,适应期可能压力大,试用期内工作安全性不确定,且工作与生活的平衡可能是挑战。尽管有缺点,以积极态度开始新工作可以是有益的。', 'Starting a new job is an exciting yet challenging experience. The onboarding process is crucial as it sets the stage for first impressions and helps new employees adapt to their roles. During the probation period, which precedes becoming a permanent employee, individuals have the chance to demonstrate their abilities and fit within the company. Engaging with colleagues is essential for building relationships and getting up to speed with tasks and responsibilities. Understanding company culture is another important aspect, as it influences how one interacts with others and navigates workplace dynamics. 

One of the main benefits of starting a new job is the opportunity to broaden your network, which can open doors to future opportunities. Additionally, it allows employees to learn new skills and increase their earning potential. However, there are drawbacks, such as the stressful adaptation period and uncertain job security during the probation phase. Additionally, maintaining work-life balance can be challenging. 

In conclusion, while starting a new job presents both benefits and drawbacks, the experience can be rewarding if approached with a positive attitude and readiness to adapt.', '开始一份新工作是一种既令人兴奋又具有挑战性的体验。入职培训非常重要,因为它为第一印象奠定了基础,并帮助新员工适应他们的角色。在试用期,即成为正式员工之前,个人有机会展示他们的能力并适应公司。与同事交流对于建立关系和跟上工作任务和责任的进度至关重要。理解公司文化是另一个重要方面,因为它影响着一个人与他人的互动方式以及在工作场所的动态。

开始新工作的主要好处之一是有机会拓宽人际网络,这可以为未来的机会打开大门。此外,它还允许员工学习新技能并提高他们的收入潜力。然而,也有一些弊端,如适应期的压力以及试用期内不确定的工作安全性。此外,维持工作与生活的平衡可能是一个挑战。

总之,虽然开始一份新工作有其优点和缺点,但如果以积极的态度和适应的准备来对待,这段经历可以是有益的。', 16, false),
  ('开会与汇报', 'meetings', 'Setting a clear agenda is key to effective meetings. Despite the risk of running over time, keeping everyone on the same page helps avoid misunderstandings. Identifying action items and following up are crucial for progress. Deciding between detailed minutes or a summary impacts how information is recorded. Reaching a consensus and opening the floor for brainstorming can lead to innovative solutions. 

Meetings improve efficiency, clarify responsibilities, and enhance communication, but they can also consume time, cause disagreements, and lead to information overload. Balancing these aspects is essential for productive meetings.', '设定明确的议程是高效会议的关键。尽管有超时的风险,让每个人达成共识有助于避免误解。确定行动事项和后续跟进对进展至关重要。决定是做详细的会议记录还是简要的总结会影响信息的记录方式。达成共识和开放讨论以进行头脑风暴可以带来创新的解决方案。

会议提高效率、明确责任、促进沟通,但也可能消耗时间、引发分歧并导致信息过载。平衡这些方面对提高会议效率至关重要。', 'In meetings, setting a clear agenda is crucial to ensuring that the discussion remains focused. However, sometimes the meeting might run over, which can be frustrating for participants. It is important for everyone to be on the same page to avoid misunderstandings. Identifying action items is essential, as it provides a clear path forward. After the meeting, follow up is necessary to ensure that these action items are addressed. 

One of the key decisions is whether to create detailed minutes or simply a summary. Minutes provide a comprehensive record, while a summary offers a concise overview. Reaching a consensus during the meeting can significantly enhance productivity. Additionally, opening the floor for discussion and encouraging participants to brainstorm can lead to innovative solutions.

While there are clear benefits such as increased efficiency, clear responsibility, and enhanced communication, meetings also have drawbacks. They can consume a lot of time, lead to disagreements, and result in information overload. Thus, balancing the benefits and drawbacks is essential to make meetings as productive as possible.', '在会议中,设定明确的议程对于确保讨论的集中性至关重要。然而,有时会议可能会超时,这可能让参与者感到沮丧。让每个人达成共识很重要,以避免误解。确定行动事项是必要的,因为这提供了一条明确的前进路径。会议结束后,需要进行后续跟进以确保这些行动事项得到解决。

一个关键的决定是制作详细的会议记录还是简要的会议总结。会议记录提供详尽的记录,而会议总结则提供简要的概述。在会议中达成共识可以显著提高效率。此外,开放讨论和鼓励参与者进行头脑风暴,可以带来创新的解决方案。

虽然会议有提高效率、明确责任、促进沟通等明显的好处,但也存在缺点。会议可能消耗大量时间,导致意见分歧,并造成信息过载。因此,平衡好处和弊端对于使会议尽可能高效至关重要。', 17, false),
  ('远程与混合办公', 'remote and hybrid work', 'The ability to log on from anywhere has transformed work environments. The hybrid work model, merging remote and in-office work, offers increased flexibility, allowing work across time zones and fostering asynchronous communication. It reduces commuting time and broadens the talent pool. However, challenges like communication difficulties and feelings of isolation may arise. Without regular check-ins, staying connected can be tough, leading to burnout. Balancing work-life is essential. In conclusion, while hybrid work offers many benefits, addressing its challenges is crucial to harness its full potential.', '能够从任何地方登录的能力改变了工作环境。混合办公模式融合了远程和办公室工作,提供了更大的灵活性,允许跨时区工作并促进异步沟通。它减少了通勤时间并扩大了人才库。然而,沟通困难和孤立感等挑战可能会出现。没有定期沟通,保持联系可能很困难,导致倦怠。平衡工作与生活至关重要。总之,虽然混合办公提供了许多好处,但解决其挑战对于充分利用其潜力至关重要。', 'In the modern work environment, the ability to log on from virtually anywhere has revolutionized how we work. The hybrid work model, combining remote and in-office work, has become increasingly popular. One major advantage is increased flexibility, allowing employees to work across different time zones. This flexibility often leads to asynchronous communication, where team members can contribute at their own pace. Additionally, reduced commuting time means more time for personal activities, and companies can access a wider talent pool without geographical limitations.

However, there are drawbacks to consider. Communication challenges can arise when team members are not in the same location. Feelings of isolation may develop without regular check-ins and efforts to stay connected. Furthermore, the blurred lines between work and home life can lead to burnout if not managed properly. Achieving a healthy work-life balance is crucial.

In conclusion, while the hybrid work model offers numerous benefits, it''s important to address its challenges. Balancing remote and in-office work can provide the best of both worlds, combining the flexibility of remote work with the collaborative strengths of in-office environments.', '在现代工作环境中,几乎可以从任何地方登录的能力革新了我们的工作方式。混合办公模式,结合了远程和办公室工作,变得越来越流行。一个主要优点是增加了灵活性,允许员工跨不同时区工作。这种灵活性通常导致异步沟通,团队成员可以按照自己的节奏做出贡献。此外,减少通勤时间意味着有更多时间用于个人活动,公司可以不受地域限制地接触到更广泛的人才库。

然而,也有需要考虑的缺点。当团队成员不在同一地点时,沟通挑战可能会出现。如果没有定期的沟通和保持联系的努力,孤立感可能会产生。此外,如果没有妥善管理,工作和家庭生活之间模糊的界限可能会导致倦怠。实现健康的工作与生活平衡至关重要。

总之,虽然混合办公模式提供了许多好处,但解决其挑战也很重要。平衡远程和办公室工作可以提供两全其美的结果,结合远程工作的灵活性和办公室环境的协作优势。', 18, false),
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
  ('订机票与值机', 'flying', 'Booking flights is easy with online travel agencies, offering the convenience of online booking and flexibility in itinerary planning. Travelers can check in online and receive a boarding pass, allowing them to arrive early at the airport to smoothly pass through security screening. Direct flights save time, though some prefer connecting flights for cost or schedule flexibility.

However, there are drawbacks like flight delays and the hassle of security checks. Despite these, the benefits of convenience and flexibility often outweigh the negatives, making modern flight booking a worthwhile experience.', '通过在线旅行社订机票很简单,提供了在线订票的便利性和行程规划的灵活性。旅客可以在线值机并收到登机牌,让他们可以提前到达机场顺利通过安检。直飞航班节省时间,尽管有些人因成本或时间灵活性选择中转航班。

然而,也有航班延误和安检烦恼等弊端。尽管如此,便利性和灵活性的好处通常超过缺点,使现代订机票成为值得的体验。', 'Booking a flight has become a seamless process thanks to online travel agencies. With just a few clicks, one can book a flight and receive an itinerary instantly. The convenience of online booking cannot be overstated. Travelers can also check in online, which saves time at the airport. Upon successful check-in, a boarding pass is generated, allowing passengers to arrive early at the airport. Arriving early is crucial to navigate through security screening smoothly.

Direct flights offer significant time-saving advantages, yet sometimes travelers opt for connecting flights due to cost or schedule flexibility. However, connecting flights come with their own set of challenges, such as the complexity of managing multiple boarding gates and the risk of flight delays.

While the process is generally smooth, there are drawbacks. Flight delays can disrupt plans, and security screening can be a hassle. Despite these issues, the benefits of online booking and the flexibility of itinerary adjustments often outweigh the drawbacks. In conclusion, while there are pros and cons to booking flights, the convenience and flexibility offered by modern travel arrangements make it a worthwhile experience.', '由于在线旅行社的存在,订机票变得非常简单。只需点击几下,就可以订到机票并立即收到行程。在线订票的便利性不言而喻。旅客还可以在线值机,这节省了在机场的时间。成功值机后,系统会生成登机牌,允许旅客提前到达机场。提前到达对于顺利通过安检至关重要。

直飞航班提供了显著的节省时间的好处,但有时旅客会选择中转航班,因为它们可能更便宜或提供灵活的时间选择。然而,中转航班带来了自身的挑战,如管理多个登机口的复杂性和航班延误的风险。

虽然整体过程通常很顺利,但也存在一些弊端。航班延误可能会打乱计划,安检可能令人烦恼。尽管存在这些问题,在线订票的好处和行程调整的灵活性通常超过了缺点。总之,尽管订票有利有弊,但现代旅行安排所提供的便利性和灵活性使其成为值得的体验。', 21, false),
  ('过海关入境', 'going through customs', 'Going through customs starts with passport control, ensuring your documents are in order. Next, declare goods if necessary, and a customs officer will guide you to fill out a declaration form. Choose the green channel for no declarations or the red channel if you have something to declare. After potential inspection, proceed to baggage claim. Sometimes, you might face lost luggage.

A common mistake is choosing the wrong channel, causing delays. To avoid this, know the regulations beforehand. Stay calm and prepared with all documents to enjoy a smooth entry, despite possible inspections or language barriers.', '过海关从护照检查开始,确保你的证件无误。接下来,如有必要,申报物品,海关官员会指导你填写申报表。无物品申报走绿色通道,有物品申报走红色通道。经过可能的检查后,去行李提取处。有时你可能会遇到行李丢失。

一个常见错误是选择错误通道,导致延误。为了避免这种情况,提前了解规定。保持冷静,准备好所有文件,以享受顺利入境,尽管可能遇到检查或语言障碍。', 'Going through customs can be a daunting experience, especially for first-time international travelers. The first step is passport control, where your documents are checked to ensure everything is in order. Next, you may need to declare goods you are bringing into the country. If you have items to declare, a customs officer will direct you to fill out a declaration form. This is where knowing the difference between the green channel and the red channel becomes crucial. The green channel is for those with nothing to declare, while the red channel is for those who do. 

After choosing the appropriate channel, you might face an inspection. Once cleared, proceed to baggage claim to collect your luggage. However, sometimes you may encounter lost luggage, which can be frustrating.

A common mistake is not knowing which channel to choose, leading to unnecessary delays. To avoid this, always check the regulations beforehand. My advice is to stay calm and be prepared with all necessary documents. This way, you can enjoy the benefits of a quick and smooth entry, despite potential drawbacks like inspections or language barriers.', '过海关可能是一个令人生畏的经历,特别是对于第一次出国旅行的人。第一步是护照检查,确保你的证件一切正常。接下来,你可能需要申报携带入境的物品。如果有物品需要申报,海关官员会指引你填写申报表。这时,了解绿色通道和红色通道的区别就很重要了。无物品申报的人走绿色通道,有物品申报的人走红色通道。

选择合适的通道后,你可能会面临检查。一旦通过,就可以去行李提取处领取行李。然而,有时你可能会遇到行李丢失,这会令人沮丧。

一个常见的错误是不知道该选择哪个通道,导致不必要的延误。为了避免这种情况,请提前了解相关规定。我的建议是保持冷静,准备好所有必要的文件。这样,即使可能遇到检查或语言障碍等问题,你仍然可以享受快速顺利入境的好处。', 22, false),
  ('酒店入住', 'staying at a hotel', 'Staying at a hotel starts with making a reservation and confirming the booking. Upon arrival, you check in by providing identification. During your stay, enjoy services like room service, but check if they are complimentary or charged. Request additional amenities if needed.

Hotels offer a convenient location, various services, and a comfortable stay, enhancing your travel experience. However, be aware of unexpected charges, noisy environments, and limited availability.

After your stay, check out, settle the bill, and ensure your deposit refund is processed. Weigh the benefits against the drawbacks for the best experience.', '入住酒店从预订和确认预订开始。到达后,通过出示身份证明进行登记入住。期间,享受客房服务,但要确认是免费还是收费。如有需要,可要求额外设施。

酒店提供便利的位置、丰富的服务和舒适的住宿,提升旅行体验。但要注意意外费用、嘈杂环境和有限的供应。

入住结束后,退房、结算账单,确保押金退还。权衡利弊,以获得最佳体验。', 'Staying at a hotel involves several steps that can make your travel experience smooth and enjoyable. First, you need to make a reservation. This is followed by confirming the booking to ensure your room is secured. Upon arrival, the check-in process requires you to provide identification. Once settled in, you can enjoy various services, such as room service. However, it is essential to note whether these services are complimentary or charged, as this can vary from one hotel to another. You might also want to request additional amenities to enhance your stay.

The benefits of staying at a hotel include a convenient location, a variety of services, and a comfortable stay. These advantages can significantly improve your travel experience. However, there are drawbacks to consider, such as unexpected charges, a noisy environment, and limited availability during peak seasons.

In conclusion, while staying at a hotel offers numerous conveniences, it is crucial to weigh the benefits against the potential drawbacks. By planning and confirming details beforehand, you can maximize the positive aspects of your stay. After enjoying your time, the final steps are to check out, settle the bill, and ensure your deposit refund is processed.', '入住酒店涉及多个步骤,可以让你的旅行体验顺畅愉快。首先,你需要预订,然后确认预订以确保你的房间已被保留。到达后,登记入住需要你出示身份证明。入住后,你可以享受各种服务,如客房服务。然而,需要注意这些服务是免费还是收费,因为不同酒店的政策不同。你也可能想要求额外设施以提升入住体验。

入住酒店的好处包括便利的位置、各种服务和舒适的住宿。这些优势可以显著提升你的旅行体验。然而,也有一些缺点需要考虑,例如意外费用、嘈杂的环境和旺季时的有限供应。

总之,尽管入住酒店提供了众多便利,但权衡利弊是很重要的。通过提前计划和确认细节,你可以最大化入住的积极方面。享受完入住后,最后的步骤是退房、结算账单,并确保押金退还。', 23, false),
  ('城市交通', 'getting around a city', 'Navigating city transport during rush hour involves transferring to another line and dealing with crowded subways. Getting off at the right stop is crucial, especially if running late. Hailing a cab becomes necessary for some. The subway vs bus debate highlights that subways are fast but crowded, while buses are flexible but face traffic. Inconvenient routes make individuals consider alternatives. Despite challenges, city transport saves time, is cost-effective, and environmentally friendly. Drawbacks include congestion, uncertain timing, and inconvenient routes. Weighing these, public transport often prevails as a viable option.', '在高峰时段乘坐城市交通需要换乘到另一条线路,应对拥挤的地铁。在正确的站点下车至关重要,特别是迟到时。打车对一些人来说是必要的。地铁和公交车的选择显示,地铁快但拥挤,公交车灵活但可能遇到堵车。不便的路线让人们考虑其他选择。尽管有挑战,城市交通节省时间、费用低廉且环保。缺点包括拥堵、时间不确定和不便的路线。权衡这些因素,公共交通常常是可行的选择。', 'Navigating city transportation during rush hour can be quite a challenge. One often needs to transfer to another line, especially when the subway is crowded. The need to get off at the right stop becomes crucial, and running late can add to the stress. Many find themselves needing to hail a cab if they are pressed for time. A subway vs bus debate often ensues: while the subway is faster, it can be more crowded during peak times; buses, on the other hand, offer flexibility but may face traffic jams. An inconvenient route can further complicate matters, prompting individuals to consider alternatives.

Despite these challenges, city transportation offers several benefits. It saves time, is cost-effective, and promotes environmental sustainability. However, drawbacks include traffic congestion, uncertain timing, and inconvenient routes. Weighing these pros and cons, the decision often boils down to personal preference and the specific circumstances one faces. For many, the benefits of using public transportation outweigh the drawbacks, making it a viable option for getting around the city efficiently.', '在高峰时段乘坐城市交通是一项挑战。通常需要换乘到另一条线路,特别是在地铁拥挤的时候。在正确的站点下车变得至关重要,迟到会增加压力。许多人在时间紧迫时需要打车。地铁和公交车的选择常常引发争论:地铁速度快,但高峰期更拥挤;而公交车灵活,但可能遇到堵车。不便的路线会进一步加剧问题,促使人们考虑其他选择。

尽管存在这些挑战,城市交通仍有许多好处。它节省时间、费用低廉,并促进环保出行。然而,缺点包括交通拥堵、时间不确定和不便的路线。权衡这些利弊,决定往往取决于个人偏好和所面对的具体情况。对许多人来说,使用公共交通的好处大于缺点,使其成为高效出行的可行选择。', 24, false),
  ('旅途出岔子', 'when travel goes wrong', 'Traveling can be unpredictable. Issues like lost luggage or missed trains due to unexpected delays are common. In such events, contacting customer service for a refund and having travel insurance can be beneficial. Insurance offers financial protection and peace of mind, covering unexpected events. However, it comes with additional costs and limited coverage, and the claims process can be complex. Despite these drawbacks, making a claim rather than a complaint and finding alternative transportation can help. Being prepared and making the best of it can turn a stressful situation into a manageable one.', '旅行充满不确定性。行李丢失或因意外延误错过火车是常见问题。在这种情况下,联系客户服务申请退款和拥有旅游保险是有益的。保险提供财务保护和安心,涵盖意外事件。然而,保险伴随额外费用和有限的保障,索赔过程也可能复杂。尽管有这些弊端,索赔而非投诉和寻找备选交通方式可以有所帮助。做好准备,尽量做好,能将压力大的情况变为可控。', 'Traveling can be an exciting adventure, but it doesn''t always go as planned. One common issue is lost luggage, which can be frustrating. If you missed the train due to unexpected delays, it might lead to further complications. In such cases, a refund could be possible if you contact customer service promptly. Having travel insurance can be a great relief as it offers financial protection and peace of mind. It also provides coverage for unexpected events, such as lost luggage or missed connections, making stressful situations more manageable.

However, there are drawbacks to consider. Travel insurance often comes with an additional cost, and the coverage might be limited. Furthermore, the claims process can be complex, requiring detailed documentation. Despite these challenges, having insurance can be advantageous. If you encounter issues, you can make a claim instead of a complaint. Moreover, finding alternative transportation can help mitigate the inconvenience. Ultimately, while travel mishaps are stressful, making the best of it and being prepared can turn a challenging situation into a manageable one.', '旅行可以是一次激动人心的冒险,但并不总是一帆风顺。常见的问题之一是行李丢失,这可能令人沮丧。如果由于意外延误错过火车,可能会导致进一步的麻烦。在这种情况下,如果及时联系客户服务,可能会获得退款。拥有旅游保险可以带来极大的安心感,因为它提供财务保护和意外事件的保障,如行李丢失或错过的交通连接,使压力大的情况更易于应对。

然而,也有一些弊端需要考虑。旅游保险通常会增加额外费用,且保障范围可能有限。此外,索赔过程可能很复杂,需要详细的文件。尽管有这些挑战,拥有保险仍然有利。如果遇到问题,可以索赔而不是投诉。此外,寻找备选交通方式可以帮助缓解不便。总之,虽然旅行中的意外事件会带来压力,但尽量做好准备,可以将挑战转变为可控的情况。', 25, false),
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
  ('人工智能进课堂', 'AI in the classroom', 'AI in education is increasingly common. Teachers initially use prompts to stimulate critical and creative thinking, with AI generating content to support learning. Fact-checking is crucial to avoid errors from skimming. Over-reliance on AI can weaken critical thinking, sparking debate on whether to ban or embrace AI in classrooms.

AI''s benefits include enhanced learning through personalized education, efficiency, and instant feedback. However, drawbacks like over-dependence and data privacy concerns exist. Schools should cautiously embrace AI, ensuring it complements, not replaces, traditional teaching.', '教育中的人工智能越来越常见。教师最初使用提示来激发批判性和创造性思维,人工智能生成内容以支持学习。核实信息很重要,以避免浏览时出现错误。过度依赖人工智能可能削弱批判性思维,引发是否应禁止或接纳人工智能进入课堂的争论。

人工智能的好处包括通过个性化教育提升学习、提高效率和即时反馈。然而,也存在过度依赖和数据隐私问题等弊端。学校应谨慎接纳人工智能,确保其能补充而非取代传统教学。', 'AI in education has become increasingly prevalent. Initially, teachers use prompt techniques to encourage students to think critically and creatively. AI systems can generate content that assists in this learning process. However, it''s essential to fact-check the information AI provides, as errors can occur if only skimmed. A significant concern is the potential to over-rely on AI, which may lead to a loss of critical thinking skills. This raises the debate: should schools ban or embrace AI in the classroom? 

The benefits of AI in education are substantial. It can enhance learning by providing personalized education, adapting to each student''s needs. Enhanced engagement and tailored learning paths are possible because of AI''s efficiency. Moreover, students can receive instant feedback, allowing them to improve quickly. 

Despite these advantages, there are drawbacks. Over-dependence on technology can hinder students'' ability to think independently. Additionally, data privacy concerns arise with the use of AI. Therefore, while AI offers significant benefits, a balanced approach is necessary. Schools should embrace AI cautiously, ensuring it complements traditional teaching without replacing it.', '教育中的人工智能变得越来越普遍。最初,教师使用提示技术来鼓励学生进行批判性和创造性思维。人工智能系统可以生成内容,以辅助这个学习过程。然而,核实人工智能提供的信息是必要的,因为如果只浏览的话,可能会出现错误。一个重要的担忧是可能会过度依赖人工智能,这可能导致批判性思维能力的丧失。这引发了争论:学校应该禁止还是接纳人工智能进入课堂?

人工智能在教育中的好处是显著的。它可以通过提供个性化教育来提升学习,适应每个学生的需求。由于人工智能的效率,增强的参与度和量身定制的学习路径成为可能。此外,学生可以获得即时反馈,使他们能够快速改进。

尽管有这些优势,也存在弊端。对技术的过度依赖可能会妨碍学生独立思考的能力。此外,使用人工智能可能会引发数据隐私问题。因此,虽然人工智能提供了显著的好处,但有必要采取一种平衡的方法。学校应该谨慎地接纳人工智能,确保其能补充而不是取代传统教学。', 30, false)
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
    ('租房搬家', 'chunk', 'view a flat', '看房', NULL, 1),
    ('租房搬家', 'collocation', 'sign a lease', '签租约', NULL, 2),
    ('租房搬家', 'word', 'deposit', '押金', NULL, 3),
    ('租房搬家', 'chunk', 'set up utilities', '开通水电气', NULL, 4),
    ('租房搬家', 'word', 'furniture', '家具', NULL, 5),
    ('租房搬家', 'collocation', 'move in', '搬入', NULL, 6),
    ('租房搬家', 'chunk', 'meet the neighbours', '认识邻居', NULL, 7),
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
    ('在餐厅点餐', 'chunk', 'book a table', '预订餐桌', NULL, 1),
    ('在餐厅点餐', 'chunk', 'be seated', '入座', NULL, 2),
    ('在餐厅点餐', 'word', 'menu', '菜单', NULL, 3),
    ('在餐厅点餐', 'chunk', 'allergic to', '对...过敏', NULL, 4),
    ('在餐厅点餐', 'collocation', 'place an order', '下单', NULL, 5),
    ('在餐厅点餐', 'contrast', 'the bill vs check', '在英国常用“the bill”,而在美国则用“check”指代账单。', NULL, 6),
    ('在餐厅点餐', 'chunk', 'split it', '分摊费用', NULL, 7),
    ('在餐厅点餐', 'collocation', 'leave a tip', '留下小费', NULL, 8),
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
    ('邻里噪音纠纷', 'word', 'complain', '抱怨', NULL, 1),
    ('邻里噪音纠纷', 'collocation', 'keep it down', '保持安静', NULL, 2),
    ('邻里噪音纠纷', 'chunk', 'talk to the landlord', '找房东谈谈', NULL, 3),
    ('邻里噪音纠纷', 'word', 'mediate', '调解', 'mediate', 4),
    ('邻里噪音纠纷', 'word', 'compromise', '妥协', NULL, 5),
    ('邻里噪音纠纷', 'collocation', 'file a noise complaint', '提交噪音投诉', NULL, 6),
    ('邻里噪音纠纷', 'chunk', 'community meeting', '社区会议', NULL, 7),
    ('邻里噪音纠纷', 'contrast', 'tolerate vs endure', 'tolerate 指能容忍而不感到痛苦,而 endure 则是忍受痛苦或不愉快的事情。', NULL, 8),
    ('邻里噪音纠纷', 'word', 'solution', '解决方案', NULL, 9),
    ('选课与退课', 'word', 'prerequisite', '先修课', 'prerequisite', 1),
    ('选课与退课', 'collocation', 'meet the requirements', '满足要求', NULL, 2),
    ('选课与退课', 'chunk', 'register for classes', '注册课程', NULL, 3),
    ('选课与退课', 'chunk', 'enrol in a course', '选课', NULL, 4),
    ('选课与退课', 'collocation', 'drop a course', '退课', NULL, 5),
    ('选课与退课', 'word', 'credit', '学分', NULL, 6),
    ('选课与退课', 'contrast', 'mandatory vs elective', '必修课 vs 选修课，必修课是必须要上的，而选修课可以根据兴趣选择。', NULL, 7),
    ('选课与退课', 'collocation', 'class schedule', '课程表', NULL, 8),
    ('选课与退课', 'chunk', 'resolve a clash', '解决冲突', NULL, 9),
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
    ('图书馆借还书', 'word', 'check out', '借书', NULL, 1),
    ('图书馆借还书', 'collocation', 'due date', '到期日', NULL, 2),
    ('图书馆借还书', 'chunk', 'renew a book', '续借一本书', NULL, 3),
    ('图书馆借还书', 'word', 'overdue', '过期', NULL, 4),
    ('图书馆借还书', 'collocation', 'pay a fine', '支付罚款', NULL, 5),
    ('图书馆借还书', 'chunk', 'reserve a book', '预约一本书', NULL, 6),
    ('图书馆借还书', 'contrast', 'library card vs student ID', '在借书时,有些图书馆要求使用图书馆卡,而不是学生证。', NULL, 7),
    ('图书馆借还书', 'collocation', 'return on time', '按时归还', NULL, 8),
    ('图书馆借还书', 'chunk', 'library catalog', '图书馆目录', NULL, 9),
    ('论文写作与查重', 'word', 'outline', '提纲', NULL, 1),
    ('论文写作与查重', 'chunk', 'gather sources', '搜集资料', NULL, 2),
    ('论文写作与查重', 'collocation', 'cite correctly', '正确引用', NULL, 3),
    ('论文写作与查重', 'contrast', 'paraphrase vs quote', 'paraphrase 是用自己的话表达原意,quote 是直接引用原文,需加引号', NULL, 4),
    ('论文写作与查重', 'collocation', 'avoid plagiarism', '避免抄袭', NULL, 5),
    ('论文写作与查重', 'chunk', 'use plagiarism detection software', '使用查重软件', NULL, 6),
    ('论文写作与查重', 'word', 'proofread', '校对', 'proofread', 7),
    ('论文写作与查重', 'collocation', 'finalize the draft', '定稿', NULL, 8),
    ('考前复习', 'chunk', 'cram for exams', '为考试临时抱佛脚', NULL, 1),
    ('考前复习', 'word', 'past papers', '历年试卷', NULL, 2),
    ('考前复习', 'collocation', 'burn out', '精疲力竭', NULL, 3),
    ('考前复习', 'chunk', 'pace yourself', '合理安排时间', NULL, 4),
    ('考前复习', 'word', 'study group', '学习小组', NULL, 5),
    ('考前复习', 'chunk', 'active recall', '主动回忆', NULL, 6),
    ('考前复习', 'contrast', 'flashcards vs mind maps', '单词卡片 vs 思维导图:单词卡片适合记忆具体信息,思维导图适合整理复杂概念。', NULL, 7),
    ('考前复习', 'word', 'mock exam', '模拟考试', NULL, 8),
    ('考前复习', 'chunk', 'sit the exam', '参加考试', NULL, 9),
    ('找导师改论文', 'collocation', 'office hours', '办公时间', NULL, 1),
    ('找导师改论文', 'word', 'feedback', '反馈', NULL, 2),
    ('找导师改论文', 'chunk', 'constructive criticism', '建设性的批评', NULL, 3),
    ('找导师改论文', 'word', 'revise', '修改', NULL, 4),
    ('找导师改论文', 'collocation', 'incorporate suggestions', '采纳建议', NULL, 5),
    ('找导师改论文', 'chunk', 'improve clarity and coherence', '提高清晰度和连贯性', NULL, 6),
    ('找导师改论文', 'word', 'resubmit', '重新提交', NULL, 7),
    ('找导师改论文', 'contrast', 'accept vs reject', '接受 vs 拒绝,接受表示同意或赞成,拒绝表示不同意或反对', NULL, 8),
    ('求职面试', 'word', 'job posting', '职位发布', NULL, 1),
    ('求职面试', 'chunk', 'tailor your CV', '定制简历', NULL, 2),
    ('求职面试', 'word', 'shortlist', '入围名单', NULL, 3),
    ('求职面试', 'collocation', 'prepare for the interview', '准备面试', NULL, 4),
    ('求职面试', 'contrast', 'confidence vs arrogance', '自信与自大的区别在于自信是基于能力的信心,而自大则是过高估计自己。面试时要表现自信,但避免自大。', NULL, 5),
    ('求职面试', 'chunk', 'receive an offer', '收到录用通知', NULL, 6),
    ('求职面试', 'collocation', 'negotiate salary', '谈判薪资', NULL, 7),
    ('求职面试', 'word', 'acceptance', '接受', NULL, 8),
    ('第一天上班', 'collocation', 'starting a new job', '开始一份新工作', NULL, 1),
    ('第一天上班', 'word', 'onboarding', '入职培训', NULL, 2),
    ('第一天上班', 'chunk', 'first impressions', '第一印象', NULL, 3),
    ('第一天上班', 'contrast', 'probation vs permanent', '试用期 vs 正式员工,试用期是刚开始工作时的考察阶段,而正式员工是在通过试用期后转正的员工。', NULL, 4),
    ('第一天上班', 'word', 'colleague', '同事', NULL, 5),
    ('第一天上班', 'collocation', 'get up to speed', '跟上进度', NULL, 6),
    ('第一天上班', 'chunk', 'company culture', '公司文化', NULL, 7),
    ('第一天上班', 'collocation', 'work-life balance', '工作与生活的平衡', NULL, 8),
    ('开会与汇报', 'word', 'agenda', '议程', NULL, 1),
    ('开会与汇报', 'collocation', 'run over', '超时', NULL, 2),
    ('开会与汇报', 'chunk', 'on the same page', '达成共识', NULL, 3),
    ('开会与汇报', 'collocation', 'action items', '行动事项', NULL, 4),
    ('开会与汇报', 'chunk', 'follow up', '后续跟进', NULL, 5),
    ('开会与汇报', 'contrast', 'minutes vs summary', '会议记录 vs 会议总结:前者是详细记录,后者是简要概括', NULL, 6),
    ('开会与汇报', 'word', 'consensus', '共识', NULL, 7),
    ('开会与汇报', 'chunk', 'open floor', '开放讨论', NULL, 8),
    ('开会与汇报', 'word', 'brainstorm', '头脑风暴', NULL, 9),
    ('远程与混合办公', 'word', 'log on', '登录', NULL, 1),
    ('远程与混合办公', 'chunk', 'hybrid work model', '混合办公模式', NULL, 2),
    ('远程与混合办公', 'word', 'time zone', '时区', NULL, 3),
    ('远程与混合办公', 'chunk', 'asynchronous communication', '异步沟通', NULL, 4),
    ('远程与混合办公', 'collocation', 'check in with', '与……沟通', NULL, 5),
    ('远程与混合办公', 'collocation', 'stay connected', '保持联系', NULL, 6),
    ('远程与混合办公', 'word', 'burnout', '倦怠', NULL, 7),
    ('远程与混合办公', 'chunk', 'work-life balance', '工作与生活的平衡', NULL, 8),
    ('远程与混合办公', 'contrast', 'remote vs in-office', '远程 vs 办公室,远程适合灵活性,办公室适合面对面沟通', NULL, 9),
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
    ('订机票与值机', 'chunk', 'book a flight', '订机票', NULL, 1),
    ('订机票与值机', 'collocation', 'online travel agency', '在线旅行社', NULL, 2),
    ('订机票与值机', 'word', 'itinerary', '行程', 'itinerary', 3),
    ('订机票与值机', 'chunk', 'check in online', '在线值机', NULL, 4),
    ('订机票与值机', 'word', 'boarding pass', '登机牌', NULL, 5),
    ('订机票与值机', 'chunk', 'arrive early', '提前到达', NULL, 6),
    ('订机票与值机', 'word', 'security screening', '安检', NULL, 7),
    ('订机票与值机', 'contrast', 'direct flight vs connecting flight', '直飞航班 vs 中转航班:直飞航班通常更方便,但中转航班可能更便宜或提供灵活的时间选择。', NULL, 8),
    ('订机票与值机', 'word', 'delayed', '延误', NULL, 9),
    ('订机票与值机', 'collocation', 'boarding gate', '登机口', NULL, 10),
    ('过海关入境', 'collocation', 'passport control', '护照检查', NULL, 1),
    ('过海关入境', 'chunk', 'declare goods', '申报物品', NULL, 2),
    ('过海关入境', 'word', 'customs officer', '海关官员', NULL, 3),
    ('过海关入境', 'chunk', 'fill out a declaration form', '填写申报表', NULL, 4),
    ('过海关入境', 'contrast', 'green channel vs red channel', '绿色通道 vs 红色通道;无物品申报走绿色通道,有物品申报走红色通道', NULL, 5),
    ('过海关入境', 'word', 'inspection', '检查', NULL, 6),
    ('过海关入境', 'collocation', 'baggage claim', '行李提取', NULL, 7),
    ('过海关入境', 'chunk', 'lost luggage', '行李丢失', NULL, 8),
    ('酒店入住', 'chunk', 'make a reservation', '预订', NULL, 1),
    ('酒店入住', 'collocation', 'confirm the booking', '确认预订', NULL, 2),
    ('酒店入住', 'word', 'check-in', '登记入住', NULL, 3),
    ('酒店入住', 'chunk', 'provide identification', '出示身份证明', NULL, 4),
    ('酒店入住', 'collocation', 'room service', '客房服务', NULL, 5),
    ('酒店入住', 'contrast', 'complimentary vs charged', '免费 vs 收费,有些酒店提供免费的客房服务,而有些则收取费用,入住前需确认清楚。', NULL, 6),
    ('酒店入住', 'chunk', 'request additional amenities', '要求额外设施', NULL, 7),
    ('酒店入住', 'word', 'check-out', '退房', NULL, 8),
    ('酒店入住', 'chunk', 'settle the bill', '结算账单', NULL, 9),
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
    ('旅途出岔子', 'chunk', 'lost luggage', '行李丢失', NULL, 1),
    ('旅途出岔子', 'chunk', 'missed the train', '错过火车', NULL, 2),
    ('旅途出岔子', 'word', 'refund', '退款', 'refund', 3),
    ('旅途出岔子', 'collocation', 'travel insurance', '旅游保险', NULL, 4),
    ('旅途出岔子', 'chunk', 'contact customer service', '联系客户服务', NULL, 5),
    ('旅途出岔子', 'chunk', 'alternative transportation', '备选交通方式', NULL, 6),
    ('旅途出岔子', 'contrast', 'claim vs complaint', 'claim 用于索赔, complaint 用于投诉', NULL, 7),
    ('旅途出岔子', 'word', 'stressful', '压力大的', NULL, 8),
    ('旅途出岔子', 'collocation', 'unexpected delays', '意外延误', NULL, 9),
    ('旅途出岔子', 'chunk', 'make the best of it', '尽量做好', NULL, 10),
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
    ('人工智能进课堂', 'chunk', 'AI in education', '教育中的人工智能', NULL, 1),
    ('人工智能进课堂', 'word', 'prompt', '提示', NULL, 2),
    ('人工智能进课堂', 'collocation', 'generate content', '生成内容', NULL, 3),
    ('人工智能进课堂', 'contrast', 'fact-check vs skim', '细查 vs 浏览，细查用于需要确认信息准确性时，浏览用于快速获取大概信息时', NULL, 4),
    ('人工智能进课堂', 'word', 'over-rely', '过度依赖', NULL, 5),
    ('人工智能进课堂', 'contrast', 'ban vs embrace', '禁止 vs 接纳，禁止用于排除风险，接纳用于接受新技术', NULL, 6),
    ('人工智能进课堂', 'collocation', 'enhance learning', '提升学习', NULL, 7),
    ('人工智能进课堂', 'chunk', 'personalized education', '个性化教育', NULL, 8),
    ('人工智能进课堂', 'word', 'efficiency', '效率', NULL, 9)
  ) AS v(title_zh, kind, text_en, text_zh, headword, sort_order)
  JOIN vocab_scene_packs p ON p.title_zh = v.title_zh
  LEFT JOIN vocab_words w ON lower(w.headword) = v.headword;

-- ── validate:七行都必须是 t ──
SELECT '场景恰 30 个' AS expect,
       (SELECT count(*) FROM vocab_scene_packs) = 30 AS ok
UNION ALL
SELECT '节点恰 263 个',
       (SELECT count(*) FROM vocab_scene_items) = 263
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
