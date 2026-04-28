export type Lesson = {
  id: number;
  title: string;
  duration: string;
  status: "done" | "current" | "locked";
};

export type Unit = {
  id: number;
  title: string;
  desc: string;
  icon: "star" | "book" | "map" | "shop" | "cloud" | "briefcase";
  iconBg: string; // tailwind bg class
  hours: string;
  lessons: Lesson[];
};

export type Level = {
  id: number;
  name: string;
  unitsCount: number;
  gradient: string; // tailwind bg-grad-N
  units: Unit[];
};

const mkLessons = (titles: string[], doneCount: number, lockFromIdx?: number): Lesson[] =>
  titles.map((t, i) => ({
    id: i + 1,
    title: t,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status:
      i < doneCount
        ? "done"
        : lockFromIdx !== undefined && i >= lockFromIdx
          ? "locked"
          : i === doneCount
            ? "current"
            : "locked",
  }));

const mkOpenLessons = (titles: string[], doneCount = 0): Lesson[] =>
  titles.map((t, i) => ({
    id: i + 1,
    title: t,
    duration: `${12 + ((i * 3) % 12)}分钟`,
    status: i < doneCount ? "done" : "current",
  }));

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "LEVEL 1",
    unitsCount: 12,
    gradient: "bg-grad-1",
    units: [
      {
        id: 1,
        title: "基础问候与介绍",
        desc: "学习日常问候、自我介绍和基本礼貌用语",
        icon: "star",
        iconBg: "bg-emerald-500",
        hours: "2小时",
        lessons: mkLessons(
          ["自我介绍", "问候与告别", "基本礼貌用语", "介绍他人", "谈论职业", "描述兴趣爱好", "国籍与语言", "数字 1–20"],
          8,
        ),
      },
      {
        id: 2,
        title: "日常对话",
        desc: "掌握日常生活中的常用对话和表达方式",
        icon: "book",
        iconBg: "bg-violet-500",
        hours: "2.5小时",
        lessons: mkOpenLessons(
          ["早晨问候", "在咖啡馆", "约朋友见面", "打电话", "问时间", "聊天气", "聊周末", "聊家人", "聊工作", "告别用语"],
          3,
        ),
      },
      {
        id: 3,
        title: "购物与消费",
        desc: "学习购物场景下的英语交流技巧",
        icon: "shop",
        iconBg: "bg-amber-500",
        hours: "3小时",
        lessons: mkOpenLessons(["进店招呼", "询问价格", "试穿衣服", "颜色与尺码", "讨价还价", "结账付款", "退换货", "在超市", "买水果", "买电子产品", "找洗手间", "离店道谢"]),
      },
      {
        id: 4,
        title: "旅行与交通",
        desc: "出行场景下的实用英语表达",
        icon: "map",
        iconBg: "bg-sky-500",
        hours: "3小时",
        lessons: mkOpenLessons(["问路", "打车", "搭地铁", "买火车票", "在机场", "酒店入住", "景点游览", "餐厅点餐", "纪念品", "退房"]),
      },
      {
        id: 5,
        title: "家庭与朋友",
        desc: "介绍家人朋友，描述人物和表达关心",
        icon: "star",
        iconBg: "bg-rose-500",
        hours: "2.5小时",
        lessons: mkOpenLessons(["家庭成员", "描述人物", "朋友相处", "邀请做客", "生日聚会", "日常作息", "家庭活动", "表达关心"]),
      },
      {
        id: 6,
        title: "时间与日期",
        desc: "学习时间、日期、预约和计划安排",
        icon: "cloud",
        iconBg: "bg-cyan-500",
        hours: "2.5小时",
        lessons: mkOpenLessons(["星期与月份", "预约时间", "日程安排", "频率副词", "今天明天昨天", "节假日", "准时迟到", "制定计划"]),
      },
      {
        id: 7,
        title: "餐饮与点餐",
        desc: "掌握餐厅、外卖和食物偏好的表达",
        icon: "shop",
        iconBg: "bg-orange-500",
        hours: "3小时",
        lessons: mkOpenLessons(["预订餐位", "看菜单", "点饮料", "点主菜", "特殊要求", "结账小费", "外卖订餐", "食物喜好"]),
      },
      {
        id: 8,
        title: "居家生活",
        desc: "围绕房间、家具、家务和租房的生活英语",
        icon: "book",
        iconBg: "bg-lime-600",
        hours: "2.5小时",
        lessons: mkOpenLessons(["房间家具", "租房看房", "家务分工", "修理问题", "邻里问候", "生活用品", "描述位置", "搬家安排"]),
      },
      {
        id: 9,
        title: "健康与运动",
        desc: "描述身体、症状、运动和健康习惯",
        icon: "star",
        iconBg: "bg-emerald-600",
        hours: "3小时",
        lessons: mkOpenLessons(["身体部位", "看医生", "描述症状", "买药", "健身计划", "运动爱好", "健康习惯", "紧急求助"]),
      },
      {
        id: 10,
        title: "学校与学习",
        desc: "覆盖课堂、作业、考试和学习目标",
        icon: "book",
        iconBg: "bg-indigo-500",
        hours: "3小时",
        lessons: mkOpenLessons(["课堂用语", "询问作业", "图书馆", "考试复习", "小组讨论", "在线学习", "学习目标", "请求解释"]),
      },
      {
        id: 11,
        title: "城市服务",
        desc: "银行、邮局、公共服务和求助场景",
        icon: "briefcase",
        iconBg: "bg-slate-600",
        hours: "2.5小时",
        lessons: mkOpenLessons(["银行业务", "邮局寄件", "问警察", "公共设施", "预约服务", "填写表格", "投诉问题", "寻求帮助"]),
      },
      {
        id: 12,
        title: "综合复习",
        desc: "复习 Level 1 的核心生活英语能力",
        icon: "star",
        iconBg: "bg-fuchsia-500",
        hours: "3小时",
        lessons: mkOpenLessons(["自我介绍复习", "日常对话复习", "购物旅行复习", "餐饮健康复习", "时间计划复习", "家庭朋友复习", "学校城市复习", "Level 1 总测"]),
      },
    ],
  },
  {
    id: 2,
    name: "LEVEL 2",
    unitsCount: 15,
    gradient: "bg-grad-2",
    units: [
      { id: 1, title: "深入日常会话", desc: "更自然地表达感受、想法与意见", icon: "book", iconBg: "bg-violet-500", hours: "3小时",
        lessons: mkOpenLessons(["表达观点", "同意与反对", "礼貌打断", "表达感受", "讲述经历", "提出建议", "回应建议", "结束对话"]) },
      { id: 2, title: "工作与办公室", desc: "办公室常用表达与同事沟通", icon: "briefcase", iconBg: "bg-slate-600", hours: "3小时",
        lessons: mkOpenLessons(["问候同事", "安排会议", "请假说明", "电话沟通", "电子邮件", "项目分工", "进度汇报", "下班告别"]) },
      { id: 3, title: "出行与旅游进阶", desc: "旅游中的预订、应急与文化交流", icon: "map", iconBg: "bg-sky-500", hours: "3小时",
        lessons: mkOpenLessons(["机票预订", "海关入境", "租车自驾", "酒店问题", "导游讲解", "拍照请求", "突发情况", "购买保险"]) },
      { id: 4, title: "餐桌文化", desc: "西餐厅礼仪、酒水搭配与餐桌交流", icon: "shop", iconBg: "bg-orange-500", hours: "2.5小时",
        lessons: mkOpenLessons(["餐厅订位", "西餐礼仪", "点酒水", "讨论菜品", "分享美食", "买单结账", "餐桌话题", "餐后甜点"]) },
      { id: 5, title: "购物与品牌", desc: "购物比价、品牌偏好和退换", icon: "shop", iconBg: "bg-amber-500", hours: "2.5小时",
        lessons: mkOpenLessons(["品牌偏好", "网购下单", "比价砍价", "促销活动", "包装服务", "投诉商品", "退款流程", "礼物赠送"]) },
      { id: 6, title: "情感与人际", desc: "表达情绪、化解矛盾与表达感谢", icon: "star", iconBg: "bg-rose-500", hours: "3小时",
        lessons: mkOpenLessons(["表达高兴", "表达失望", "安慰他人", "道歉认错", "化解矛盾", "表达感谢", "表达赞美", "约定见面"]) },
      { id: 7, title: "媒体与娱乐", desc: "电影、音乐、运动与休闲讨论", icon: "cloud", iconBg: "bg-cyan-500", hours: "3小时",
        lessons: mkOpenLessons(["看电影", "聊电视剧", "聊音乐", "运动比赛", "聊明星", "周末活动", "推荐节目", "购买门票"]) },
      { id: 8, title: "科技与数码", desc: "手机、电脑、网络服务的常用表达", icon: "briefcase", iconBg: "bg-indigo-500", hours: "3小时",
        lessons: mkOpenLessons(["买手机", "App 使用", "网络问题", "云盘存储", "智能家居", "在线支付", "账号安全", "更新升级"]) },
      { id: 9, title: "健康进阶", desc: "饮食营养、心理健康与就医交流", icon: "star", iconBg: "bg-emerald-600", hours: "3小时",
        lessons: mkOpenLessons(["饮食营养", "睡眠习惯", "心理压力", "看专科医生", "做检查", "用药指导", "保险报销", "康复建议"]) },
      { id: 10, title: "教育与培训", desc: "课程学习、考试与学习方法", icon: "book", iconBg: "bg-indigo-500", hours: "3小时",
        lessons: mkOpenLessons(["选课报名", "学习方法", "做笔记", "课堂提问", "小组项目", "在线课程", "应对考试", "学习反馈"]) },
      { id: 11, title: "城市生活", desc: "公共交通、社区互助与城市探索", icon: "map", iconBg: "bg-sky-600", hours: "2.5小时",
        lessons: mkOpenLessons(["公交地铁", "共享单车", "社区活动", "邻里互助", "市政服务", "环保节能", "城市探索", "夜生活"]) },
      { id: 12, title: "金融基础", desc: "银行账户、信用卡与基础理财", icon: "briefcase", iconBg: "bg-emerald-700", hours: "3小时",
        lessons: mkOpenLessons(["开户办卡", "存款取款", "信用卡使用", "网上银行", "汇款转账", "外币兑换", "记账预算", "理财基础"]) },
      { id: 13, title: "节日与文化", desc: "中外节日、习俗与跨文化交流", icon: "star", iconBg: "bg-fuchsia-500", hours: "2.5小时",
        lessons: mkOpenLessons(["春节中秋", "圣诞新年", "感恩节", "万圣节", "婚礼习俗", "送礼礼仪", "文化差异", "节日祝福"]) },
      { id: 14, title: "兴趣与爱好", desc: "深入聊读书、运动、收藏等爱好", icon: "book", iconBg: "bg-lime-600", hours: "2.5小时",
        lessons: mkOpenLessons(["读书分享", "户外运动", "摄影艺术", "烹饪美食", "园艺养花", "宠物趣事", "收藏爱好", "DIY 手作"]) },
      { id: 15, title: "Level 2 综合复习", desc: "综合运用 Level 2 所学", icon: "star", iconBg: "bg-fuchsia-600", hours: "3小时",
        lessons: mkOpenLessons(["职场场景复习", "旅行场景复习", "餐饮购物复习", "情感人际复习", "科技健康复习", "教育金融复习", "文化兴趣复习", "Level 2 总测"]) },
    ],
  },
  {
    id: 3,
    name: "LEVEL 3",
    unitsCount: 18,
    gradient: "bg-grad-3",
    units: [
      { id: 1, title: "高级日常表达", desc: "更地道的口语习语与连接表达", icon: "book", iconBg: "bg-violet-600", hours: "3小时",
        lessons: mkOpenLessons(["口语习语", "连接词", "委婉表达", "强调语气", "假设语气", "条件表达", "复杂时态", "口语缩略"]) },
      { id: 2, title: "商务沟通", desc: "邮件、会议与谈判的商务英语", icon: "briefcase", iconBg: "bg-slate-700", hours: "3.5小时",
        lessons: mkOpenLessons(["商务邮件", "会议主持", "做演示", "谈判技巧", "礼貌反对", "达成共识", "跟进事项", "总结汇报"]) },
      { id: 3, title: "面试与求职", desc: "简历、面试与职业规划", icon: "briefcase", iconBg: "bg-indigo-600", hours: "3小时",
        lessons: mkOpenLessons(["写简历", "求职信", "电话面试", "线下面试", "自我介绍", "回答常见问题", "薪资谈判", "入职准备"]) },
      { id: 4, title: "新闻与时事", desc: "看懂新闻标题与讨论时事", icon: "cloud", iconBg: "bg-cyan-600", hours: "3小时",
        lessons: mkOpenLessons(["新闻标题", "经济新闻", "政治时事", "科技报道", "体育新闻", "突发事件", "评论分析", "假新闻识别"]) },
      { id: 5, title: "学术英语入门", desc: "课堂讨论、阅读论文与学术写作", icon: "book", iconBg: "bg-indigo-700", hours: "3.5小时",
        lessons: mkOpenLessons(["学术词汇", "课堂讨论", "做演讲", "学术阅读", "学术写作", "引用资料", "提问澄清", "小组协作"]) },
      { id: 6, title: "出国留学", desc: "申请、签证、住宿与校园生活", icon: "map", iconBg: "bg-sky-700", hours: "3小时",
        lessons: mkOpenLessons(["选学校", "网申文书", "签证面试", "机票行李", "找房合同", "校园报到", "选课注册", "适应新环境"]) },
      { id: 7, title: "讨论与辩论", desc: "围绕话题展开有逻辑的讨论", icon: "star", iconBg: "bg-rose-600", hours: "3小时",
        lessons: mkOpenLessons(["陈述观点", "举例论证", "反驳对方", "找共同点", "总结立场", "提问反问", "情绪管理", "礼貌结束"]) },
      { id: 8, title: "创业与商业", desc: "公司介绍、产品推广与融资", icon: "briefcase", iconBg: "bg-emerald-700", hours: "3小时",
        lessons: mkOpenLessons(["公司介绍", "产品推广", "市场分析", "团队介绍", "商业计划", "融资路演", "客户洽谈", "签订合同"]) },
      { id: 9, title: "科技前沿", desc: "AI、新能源与互联网热词", icon: "cloud", iconBg: "bg-sky-500", hours: "3小时",
        lessons: mkOpenLessons(["AI 应用", "云计算", "新能源车", "可穿戴设备", "区块链", "网络安全", "数据隐私", "未来趋势"]) },
      { id: 10, title: "深度旅行", desc: "深度游、文化探访与背包旅行", icon: "map", iconBg: "bg-emerald-500", hours: "3小时",
        lessons: mkOpenLessons(["背包旅行", "深度文化游", "民宿体验", "美食之旅", "户外探险", "志愿旅行", "旅行博客", "环保旅行"]) },
      { id: 11, title: "情感与心理", desc: "情绪管理、关系沟通与自我成长", icon: "star", iconBg: "bg-pink-500", hours: "3小时",
        lessons: mkOpenLessons(["情绪管理", "压力释放", "亲密关系", "亲子沟通", "友情维护", "自我接纳", "目标设定", "心理咨询"]) },
      { id: 12, title: "环境与可持续", desc: "环保、气候与可持续生活", icon: "cloud", iconBg: "bg-emerald-500", hours: "2.5小时",
        lessons: mkOpenLessons(["全球变暖", "垃圾分类", "节能减排", "可持续饮食", "循环经济", "野生动物", "绿色出行", "环保倡议"]) },
      { id: 13, title: "艺术与设计", desc: "聊艺术、设计、博物馆与展览", icon: "star", iconBg: "bg-fuchsia-500", hours: "2.5小时",
        lessons: mkOpenLessons(["聊画展", "聊电影艺术", "建筑欣赏", "设计风格", "音乐流派", "戏剧表演", "时尚潮流", "艺术家访谈"]) },
      { id: 14, title: "饮食文化", desc: "世界饮食、营养与烹饪", icon: "shop", iconBg: "bg-orange-500", hours: "2.5小时",
        lessons: mkOpenLessons(["世界美食", "素食选择", "营养搭配", "厨房工具", "下厨教学", "甜品烘焙", "酒文化", "饮食健康"]) },
      { id: 15, title: "公共演讲", desc: "结构化表达与情绪感染力", icon: "book", iconBg: "bg-violet-700", hours: "3小时",
        lessons: mkOpenLessons(["开场吸引", "结构化表达", "故事讲述", "数据呈现", "情绪感染", "互动提问", "应对紧张", "完美收尾"]) },
      { id: 16, title: "城市与建筑", desc: "城市规划、建筑特色与生活方式", icon: "map", iconBg: "bg-sky-600", hours: "2.5小时",
        lessons: mkOpenLessons(["城市规划", "地标建筑", "历史街区", "现代都市", "宜居城市", "交通拥堵", "城市更新", "未来城市"]) },
      { id: 17, title: "媒体素养", desc: "辨别信息、写作与表达", icon: "cloud", iconBg: "bg-indigo-500", hours: "2.5小时",
        lessons: mkOpenLessons(["信息辨别", "社交媒体", "短视频文化", "网络礼仪", "数字身份", "内容创作", "评论互动", "媒体伦理"]) },
      { id: 18, title: "Level 3 综合复习", desc: "综合运用 Level 3 进阶能力", icon: "star", iconBg: "bg-fuchsia-600", hours: "3小时",
        lessons: mkOpenLessons(["商务场景复习", "学术留学复习", "讨论辩论复习", "科技环境复习", "艺术饮食复习", "演讲媒体复习", "情感心理复习", "Level 3 总测"]) },
    ],
  },
  {
    id: 4,
    name: "LEVEL 4",
    unitsCount: 20,
    gradient: "bg-grad-4",
    units: [
      { id: 1, title: "高级口语策略", desc: "灵活运用习语、俚语与文化表达", icon: "book", iconBg: "bg-violet-700", hours: "3.5小时",
        lessons: mkOpenLessons(["地道俚语", "文化双关", "幽默表达", "讽刺反语", "情境玩笑", "情感强调", "话语标记", "口音差异"]) },
      { id: 2, title: "高级商务谈判", desc: "复杂场景下的谈判与协议", icon: "briefcase", iconBg: "bg-slate-800", hours: "3.5小时",
        lessons: mkOpenLessons(["开场策略", "BATNA 准备", "讨价还价", "条款细化", "处理僵局", "多方谈判", "签约流程", "后续维护"]) },
      { id: 3, title: "项目管理", desc: "立项、进度、风险与汇报", icon: "briefcase", iconBg: "bg-indigo-700", hours: "3小时",
        lessons: mkOpenLessons(["项目立项", "目标拆解", "里程碑", "风险识别", "团队沟通", "进度跟进", "复盘总结", "经验沉淀"]) },
      { id: 4, title: "国际会议", desc: "组织、主持与参与国际会议", icon: "cloud", iconBg: "bg-sky-700", hours: "3小时",
        lessons: mkOpenLessons(["议程安排", "嘉宾介绍", "主旨演讲", "圆桌讨论", "茶歇社交", "会后跟进", "线上会议", "翻译协调"]) },
      { id: 5, title: "学术写作进阶", desc: "论文、综述与同行评审", icon: "book", iconBg: "bg-indigo-800", hours: "3.5小时",
        lessons: mkOpenLessons(["选题与摘要", "文献综述", "研究方法", "结果讨论", "结论与限制", "参考文献", "同行评审", "投稿修改"]) },
      { id: 6, title: "科技与创新", desc: "AI、生物技术、宇宙探索深度讨论", icon: "cloud", iconBg: "bg-cyan-700", hours: "3小时",
        lessons: mkOpenLessons(["AI 伦理", "脑机接口", "基因编辑", "宇宙探索", "量子计算", "可控核聚变", "数字孪生", "技术与人"]) },
      { id: 7, title: "全球商业", desc: "跨国合作、并购与本地化", icon: "briefcase", iconBg: "bg-emerald-800", hours: "3小时",
        lessons: mkOpenLessons(["跨国合作", "市场进入", "并购整合", "本地化策略", "供应链管理", "ESG 责任", "跨文化领导", "危机公关"]) },
      { id: 8, title: "金融与投资", desc: "股市、基金、加密资产与风险", icon: "briefcase", iconBg: "bg-emerald-900", hours: "3小时",
        lessons: mkOpenLessons(["宏观经济", "股票市场", "基金组合", "债券资产", "加密资产", "风险管理", "财报阅读", "投资策略"]) },
      { id: 9, title: "法律基础", desc: "合同、合规与基本法律概念", icon: "briefcase", iconBg: "bg-slate-700", hours: "3小时",
        lessons: mkOpenLessons(["合同条款", "知识产权", "劳动法", "数据合规", "争议解决", "法律咨询", "出庭流程", "国际法基础"]) },
      { id: 10, title: "高级演讲与表达", desc: "TED 风格演讲与说服力构建", icon: "book", iconBg: "bg-violet-800", hours: "3小时",
        lessons: mkOpenLessons(["选题立意", "故事弧线", "金句打造", "数据叙事", "肢体语言", "声音控制", "互动设计", "录制剪辑"]) },
      { id: 11, title: "全球文化", desc: "宗教、习俗、文化冲突与融合", icon: "star", iconBg: "bg-fuchsia-700", hours: "3小时",
        lessons: mkOpenLessons(["宗教信仰", "节庆传统", "文化禁忌", "礼仪差异", "移民议题", "文化融合", "身份认同", "全球公民"]) },
      { id: 12, title: "气候与可持续发展", desc: "气候政策、能源转型与碳中和", icon: "cloud", iconBg: "bg-emerald-600", hours: "3小时",
        lessons: mkOpenLessons(["气候科学", "能源转型", "碳市场", "绿色金融", "城市韧性", "海洋保护", "粮食安全", "气候正义"]) },
      { id: 13, title: "教育与未来", desc: "教育趋势、终身学习与个性化教育", icon: "book", iconBg: "bg-indigo-500", hours: "3小时",
        lessons: mkOpenLessons(["未来教育", "终身学习", "在线学习", "学习方法论", "教育公平", "教师角色", "技能培养", "评价体系"]) },
      { id: 14, title: "新闻深度报道", desc: "调查报道、专题写作与采访", icon: "cloud", iconBg: "bg-cyan-800", hours: "3小时",
        lessons: mkOpenLessons(["新闻线索", "深度访谈", "数据新闻", "现场报道", "事实核查", "专题策划", "图文呈现", "媒体伦理"]) },
      { id: 15, title: "影视与剧本", desc: "看美剧、写剧本与影视赏析", icon: "star", iconBg: "bg-rose-700", hours: "2.5小时",
        lessons: mkOpenLessons(["剧本结构", "人物弧光", "台词写作", "场景设置", "类型电影", "美剧赏析", "镜头语言", "影评写作"]) },
      { id: 16, title: "心理学应用", desc: "动机、决策与人际心理", icon: "star", iconBg: "bg-pink-600", hours: "3小时",
        lessons: mkOpenLessons(["动机理论", "决策偏差", "情绪调节", "人际心理", "正念冥想", "积极心理", "团体心理", "心理咨询"]) },
      { id: 17, title: "公共政策", desc: "政策制定、评估与公民参与", icon: "briefcase", iconBg: "bg-slate-600", hours: "3小时",
        lessons: mkOpenLessons(["政策制定", "公共预算", "政策评估", "公民参与", "民意调查", "公共服务", "智慧城市", "政府透明"]) },
      { id: 18, title: "全球健康", desc: "公共卫生、流行病与健康公平", icon: "star", iconBg: "bg-emerald-700", hours: "3小时",
        lessons: mkOpenLessons(["公共卫生", "传染病", "心理健康", "营养与肥胖", "老龄化", "医疗系统", "健康公平", "数字医疗"]) },
      { id: 19, title: "未来趋势", desc: "未来工作、社会与生活方式", icon: "cloud", iconBg: "bg-indigo-600", hours: "3小时",
        lessons: mkOpenLessons(["未来工作", "远程协作", "零工经济", "元宇宙", "数字身份", "Web3", "可持续生活", "下一代教育"]) },
      { id: 20, title: "Level 4 综合复习", desc: "综合运用 Level 4 高级能力", icon: "star", iconBg: "bg-fuchsia-700", hours: "3.5小时",
        lessons: mkOpenLessons(["商务全场景复习", "学术写作复习", "演讲表达复习", "科技金融复习", "文化政策复习", "影视心理复习", "未来趋势复习", "Level 4 总测"]) },
    ],
  },
  { id: 5, name: "LEVEL 5", unitsCount: 22, gradient: "bg-grad-5", units: [] },
  { id: 6, name: "LEVEL 6", unitsCount: 25, gradient: "bg-grad-6", units: [] },
];

export const LESSON_STEPS = [
  { id: 1, cn: "词汇学习", en: "Vocabulary", icon: "BookOpen" },
  { id: 2, cn: "词汇测试", en: "Vocab Quiz", icon: "Target" },
  { id: 3, cn: "课文阅读", en: "Reading", icon: "Book" },
  { id: 4, cn: "语法重点", en: "Grammar", icon: "FileText" },
  { id: 5, cn: "实用表达", en: "Expressions", icon: "MessageCircle" },
  { id: 6, cn: "选词填空", en: "Fill-in", icon: "Pencil" },
  { id: 7, cn: "阅读测验", en: "Quiz", icon: "HelpCircle" },
  { id: 8, cn: "听力填空", en: "Listening", icon: "Headphones" },
  { id: 9, cn: "实战产出", en: "Output", icon: "Mic" },
] as const;

export type VocabItem = {
  word: string;
  pron: string;
  meaning: string;
  example: string;
  example_cn: string;
};

export type Quiz = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string;
};

export type FillBlank = {
  sentence: string; // use ___ as blank
  cn: string;
  options: string[];
  answer: string;
};

export type LessonContent = {
  vocab: VocabItem[];
  reading: { en: string; cn: string }[]; // paragraphs
  grammar: { title: string; explain: string; examples: { en: string; cn: string }[] }[];
  expressions: { en: string; cn: string; scene: string }[];
  fillBlanks: FillBlank[];
  quiz: Quiz[];
  listening: { audio: string; blanks: { before: string; answer: string; after: string }[] };
  output: { prompt: string; cn: string; sample: string };
};

const buildLessonContent = (title: string): LessonContent => ({
  vocab: [
    { word: "topic", pron: "/ˈtɑːpɪk/", meaning: "n. 主题", example: `Today's topic is ${title}.`, example_cn: `今天的主题是${title}。` },
    { word: "practice", pron: "/ˈpræktɪs/", meaning: "v./n. 练习", example: "I practice English every day.", example_cn: "我每天练习英语。" },
    { word: "question", pron: "/ˈkwestʃən/", meaning: "n. 问题", example: "Can I ask a question?", example_cn: "我可以问一个问题吗？" },
    { word: "answer", pron: "/ˈænsər/", meaning: "v./n. 回答", example: "Please answer in English.", example_cn: "请用英语回答。" },
    { word: "need", pron: "/niːd/", meaning: "v. 需要", example: "I need some help.", example_cn: "我需要一些帮助。" },
    { word: "want", pron: "/wɑːnt/", meaning: "v. 想要", example: "I want to learn more.", example_cn: "我想学更多。" },
    { word: "easy", pron: "/ˈiːzi/", meaning: "adj. 容易的", example: "This sentence is easy.", example_cn: "这个句子很简单。" },
    { word: "useful", pron: "/ˈjuːsfəl/", meaning: "adj. 有用的", example: "These words are useful.", example_cn: "这些单词很有用。" },
  ],
  reading: [
    { en: "Emma is learning English for everyday life.", cn: "艾玛正在为日常生活学习英语。" },
    { en: "Today, she practices a short conversation with her teacher.", cn: "今天，她和老师练习一段简短对话。" },
    { en: "She asks questions, gives answers, and writes down useful words.", cn: "她提问、回答，并记下有用的单词。" },
    { en: "After class, she can use the new sentences with her friends.", cn: "课后，她可以和朋友使用这些新句子。" },
  ],
  grammar: [
    {
      title: "Can I …? 礼貌提问",
      explain: "Can I + 动词原形 用来礼貌地询问自己是否可以做某事。",
      examples: [
        { en: "Can I ask a question?", cn: "我可以问一个问题吗？" },
        { en: "Can I practice with you?", cn: "我可以和你练习吗？" },
      ],
    },
    {
      title: "I need / I want",
      explain: "I need 表示需要；I want 表示想要，后面可以接名词或 to + 动词。",
      examples: [
        { en: "I need some help.", cn: "我需要一些帮助。" },
        { en: "I want to speak English.", cn: "我想说英语。" },
      ],
    },
  ],
  expressions: [
    { en: "Can I ask a question?", cn: "我可以问一个问题吗？", scene: "课堂提问" },
    { en: "Could you say that again?", cn: "你能再说一遍吗？", scene: "请求重复" },
    { en: "I need some help.", cn: "我需要一些帮助。", scene: "寻求帮助" },
    { en: "Let me try again.", cn: "让我再试一次。", scene: "继续练习" },
    { en: "That is useful.", cn: "那很有用。", scene: "表达评价" },
  ],
  fillBlanks: [
    { sentence: "Can I ask a ___?", cn: "我可以问一个问题吗？", options: ["question", "topic", "practice", "answer"], answer: "question" },
    { sentence: "I ___ some help.", cn: "我需要一些帮助。", options: ["need", "want", "easy", "useful"], answer: "need" },
    { sentence: "Please ___ in English.", cn: "请用英语回答。", options: ["answer", "topic", "need", "easy"], answer: "answer" },
    { sentence: "These words are ___.", cn: "这些单词很有用。", options: ["useful", "question", "want", "practice"], answer: "useful" },
  ],
  quiz: [
    { q: "Why is Emma learning English?", options: ["For everyday life", "For cooking", "For a movie", "For shopping only"], answer: 0 },
    { q: "Who does Emma practice with?", options: ["Her doctor", "Her teacher", "Her neighbor", "Her brother"], answer: 1 },
    { q: "What does Emma write down?", options: ["Useful words", "Phone numbers", "Prices", "Addresses"], answer: 0 },
    { q: "When can she use the new sentences?", options: ["After class", "Next year", "Only at home", "Never"], answer: 0 },
  ],
  listening: {
    audio: "Can I ask a question? I need some help. These words are useful.",
    blanks: [
      { before: "Can I ask a", answer: "question", after: "?" },
      { before: "I need some", answer: "help", after: "." },
      { before: "These words are", answer: "useful", after: "." },
    ],
  },
  output: {
    prompt: `Write 3–5 sentences about ${title}. Use at least two sentences from this lesson.`,
    cn: `请围绕“${title}”写 3–5 句话，并至少使用本课两个句型。`,
    sample: "Can I ask a question? I need some help with this topic. These words are useful, and I want to practice again.",
  },
});

export const LESSON_CONTENT: Record<string, LessonContent> = {
  自我介绍: {
    vocab: [
      { word: "introduce", pron: "/ˌɪntrəˈdjuːs/", meaning: "v. 介绍；引进", example: "Let me introduce myself.", example_cn: "让我自我介绍一下。" },
      { word: "hello", pron: "/həˈloʊ/", meaning: "int. 你好", example: "Hello, I'm Mei.", example_cn: "你好，我叫梅。" },
      { word: "name", pron: "/neɪm/", meaning: "n. 名字", example: "My name is Mei.", example_cn: "我的名字叫梅。" },
      { word: "from", pron: "/frʌm/", meaning: "prep. 来自", example: "I'm from Beijing.", example_cn: "我来自北京。" },
      { word: "nice", pron: "/naɪs/", meaning: "adj. 美好的", example: "Nice to meet you.", example_cn: "很高兴认识你。" },
      { word: "meet", pron: "/miːt/", meaning: "v. 遇见，见面", example: "I meet new friends every day.", example_cn: "我每天都认识新朋友。" },
      { word: "student", pron: "/ˈstuːdənt/", meaning: "n. 学生", example: "I am a student.", example_cn: "我是一名学生。" },
      { word: "year", pron: "/jɪr/", meaning: "n. 年；岁", example: "I am twenty years old.", example_cn: "我二十岁。" },
    ],
    reading: [
      { en: "Hello, everyone! My name is Mei. I'm from Beijing, China.", cn: "大家好！我叫梅。我来自中国北京。" },
      { en: "I am twenty years old, and I am a college student.", cn: "我今年二十岁，是一名大学生。" },
      { en: "I love music, reading, and traveling. In my free time, I often listen to pop songs and read English books.", cn: "我喜欢音乐、阅读和旅行。空闲时我常常听流行歌、读英语书。" },
      { en: "I'm learning English because I want to make friends from all over the world. Nice to meet you!", cn: "我正在学英语，因为我想结识来自世界各地的朋友。很高兴认识你！" },
    ],
    grammar: [
      {
        title: "Be 动词：am / is / are",
        explain: "用于介绍身份、年龄、来源。第一人称单数（I）用 am；他/她/它用 is；你/我们/他们用 are。",
        examples: [
          { en: "I am a student.", cn: "我是学生。" },
          { en: "She is from Japan.", cn: "她来自日本。" },
          { en: "They are my friends.", cn: "他们是我的朋友。" },
        ],
      },
      {
        title: "My name is … / I'm …",
        explain: "两种最常见的介绍姓名结构，均可使用，I'm 更口语化。",
        examples: [
          { en: "My name is Lucas.", cn: "我叫卢卡斯。" },
          { en: "I'm Lucas.", cn: "我是卢卡斯。" },
        ],
      },
    ],
    expressions: [
      { en: "Nice to meet you.", cn: "很高兴认识你。", scene: "初次见面" },
      { en: "How do you do?", cn: "你好（正式）。", scene: "正式场合" },
      { en: "What's your name?", cn: "你叫什么名字？", scene: "询问姓名" },
      { en: "Where are you from?", cn: "你来自哪里？", scene: "询问来源" },
      { en: "I'm a student / engineer.", cn: "我是学生 / 工程师。", scene: "介绍身份" },
    ],
    fillBlanks: [
      { sentence: "Hello, my ___ is Mei.", cn: "你好，我的名字叫梅。", options: ["name", "from", "nice", "meet"], answer: "name" },
      { sentence: "I'm ___ Beijing.", cn: "我来自北京。", options: ["in", "at", "from", "on"], answer: "from" },
      { sentence: "___ to meet you.", cn: "很高兴认识你。", options: ["Nice", "Name", "Hello", "Year"], answer: "Nice" },
      { sentence: "I ___ a student.", cn: "我是一名学生。", options: ["am", "is", "are", "be"], answer: "am" },
    ],
    quiz: [
      {
        q: "Where is Mei from?",
        options: ["Shanghai", "Beijing", "Tokyo", "New York"],
        answer: 1,
        explain: "The text says 'I'm from Beijing, China.'",
      },
      {
        q: "How old is Mei?",
        options: ["18 years old", "19 years old", "20 years old", "21 years old"],
        answer: 2,
        explain: "I am twenty years old.",
      },
      {
        q: "Which of the following is NOT one of Mei's hobbies?",
        options: ["Music", "Reading", "Traveling", "Sports"],
        answer: 3,
        explain: "The text mentions music, reading and traveling — sports is not listed.",
      },
      {
        q: "Why is Mei learning English?",
        options: ["For exams", "For work", "To make friends from all over the world", "To study abroad"],
        answer: 2,
      },
    ],
    listening: {
      audio: "Hello, my name is Mei. I am from Beijing. I am a student.",
      blanks: [
        { before: "Hello, my name is", answer: "Mei", after: "." },
        { before: "I am from", answer: "Beijing", after: "." },
        { before: "I am a", answer: "student", after: "." },
      ],
    },
    output: {
      prompt: "Please introduce yourself in 3–5 sentences. Include your name, where you are from, your age, and your hobbies.",
      cn: "请用 3–5 句话介绍自己，包括姓名、来源、年龄和爱好。",
      sample: "Hello! My name is Alex. I'm from Shanghai. I'm twenty-two years old and I am a student. I love movies and basketball. Nice to meet you!",
    },
  },
  问候与告别: {
    vocab: [
      { word: "morning", pron: "/ˈmɔːrnɪŋ/", meaning: "n. 早晨", example: "Good morning, Tom!", example_cn: "早上好，汤姆！" },
      { word: "afternoon", pron: "/ˌæftərˈnuːn/", meaning: "n. 下午", example: "Good afternoon, class.", example_cn: "下午好，同学们。" },
      { word: "evening", pron: "/ˈiːvnɪŋ/", meaning: "n. 傍晚", example: "Good evening, sir.", example_cn: "晚上好，先生。" },
      { word: "goodbye", pron: "/ɡʊdˈbaɪ/", meaning: "int. 再见", example: "Goodbye, see you tomorrow.", example_cn: "再见，明天见。" },
      { word: "see", pron: "/siː/", meaning: "v. 看见", example: "See you later!", example_cn: "回头见！" },
      { word: "later", pron: "/ˈleɪtər/", meaning: "adv. 稍后", example: "Talk to you later.", example_cn: "稍后聊。" },
      { word: "how", pron: "/haʊ/", meaning: "adv. 怎么样", example: "How are you?", example_cn: "你好吗？" },
      { word: "fine", pron: "/faɪn/", meaning: "adj. 不错的", example: "I'm fine, thanks.", example_cn: "我很好，谢谢。" },
    ],
    reading: [
      { en: "Good morning, Lily! How are you today?", cn: "早上好，莉莉！你今天怎么样？" },
      { en: "I'm fine, thank you. And you?", cn: "我很好，谢谢。你呢？" },
      { en: "Pretty good. I'm on my way to class. See you later!", cn: "挺好的。我正要去上课。回头见！" },
      { en: "Okay, goodbye! Have a nice day.", cn: "好的，再见！祝你有美好的一天。" },
    ],
    grammar: [
      {
        title: "Good + 时间段",
        explain: "用于不同时段的问候：morning（早）、afternoon（午）、evening（晚）。睡前道别用 Good night。",
        examples: [
          { en: "Good morning!", cn: "早上好！" },
          { en: "Good evening, everyone.", cn: "大家晚上好。" },
          { en: "Good night, sleep well.", cn: "晚安，好梦。" },
        ],
      },
      {
        title: "How are you? 的回应",
        explain: "常见回答：I'm fine / Pretty good / Not bad，再加上 thanks 更礼貌，并可反问 And you?",
        examples: [
          { en: "I'm fine, thanks. And you?", cn: "我很好，谢谢。你呢？" },
          { en: "Pretty good!", cn: "挺好的！" },
        ],
      },
    ],
    expressions: [
      { en: "Good morning!", cn: "早上好！", scene: "上午问候" },
      { en: "How's it going?", cn: "最近怎么样？", scene: "朋友之间" },
      { en: "See you later.", cn: "回头见。", scene: "短暂告别" },
      { en: "Have a nice day!", cn: "祝你愉快！", scene: "礼貌告别" },
      { en: "Take care.", cn: "保重。", scene: "关心告别" },
    ],
    fillBlanks: [
      { sentence: "Good ___, everyone!", cn: "大家早上好！", options: ["morning", "night", "bye", "later"], answer: "morning" },
      { sentence: "I'm ___, thanks.", cn: "我很好，谢谢。", options: ["fine", "from", "name", "see"], answer: "fine" },
      { sentence: "See you ___!", cn: "回头见！", options: ["later", "morning", "fine", "nice"], answer: "later" },
      { sentence: "___ are you today?", cn: "你今天怎么样？", options: ["What", "How", "Where", "Who"], answer: "How" },
    ],
    quiz: [
      { q: "Where is Lily going right now?", options: ["Home", "To class", "To eat", "To exercise"], answer: 1, explain: "I'm on my way to class." },
      { q: "Someone says 'How are you?' — what is the most natural reply?", options: ["Goodbye.", "I'm fine, thanks.", "My name is Lily.", "Nice day."], answer: 1 },
      { q: "What do you say when meeting someone in the evening?", options: ["Good morning", "Good afternoon", "Good evening", "Good night"], answer: 2 },
      { q: "What does 'See you later.' mean?", options: ["Nice to meet you", "See you again soon", "Good night", "Take care"], answer: 1 },
    ],
    listening: {
      audio: "Good morning, Lily. How are you? I am fine, thank you. See you later.",
      blanks: [
        { before: "Good", answer: "morning", after: ", Lily." },
        { before: "I am", answer: "fine", after: ", thank you." },
        { before: "See you", answer: "later", after: "." },
      ],
    },
    output: {
      prompt: "Greet a friend in the morning, ask how they are, and say goodbye politely (3–4 sentences).",
      cn: "请用 3–4 句话向朋友问早安、询问近况，并礼貌道别。",
      sample: "Good morning, Anna! How are you today? I'm doing great, thanks. See you later, have a nice day!",
    },
  },
  基本礼貌用语: {
    vocab: [
      { word: "please", pron: "/pliːz/", meaning: "adv. 请", example: "Please sit down.", example_cn: "请坐。" },
      { word: "thank", pron: "/θæŋk/", meaning: "v. 感谢", example: "Thank you very much.", example_cn: "非常感谢。" },
      { word: "sorry", pron: "/ˈsɒri/", meaning: "adj. 抱歉的", example: "I'm sorry for being late.", example_cn: "抱歉我迟到了。" },
      { word: "excuse", pron: "/ɪkˈskjuːz/", meaning: "v. 原谅", example: "Excuse me, where is the bank?", example_cn: "打扰一下，银行在哪里？" },
      { word: "welcome", pron: "/ˈwelkəm/", meaning: "int. 不客气", example: "You're welcome.", example_cn: "不客气。" },
      { word: "help", pron: "/help/", meaning: "v. 帮助", example: "Can you help me?", example_cn: "你能帮我吗？" },
      { word: "problem", pron: "/ˈprɒbləm/", meaning: "n. 问题", example: "No problem.", example_cn: "没问题。" },
      { word: "kind", pron: "/kaɪnd/", meaning: "adj. 友好的", example: "You are very kind.", example_cn: "你真好。" },
    ],
    reading: [
      { en: "Excuse me, could you help me with this bag?", cn: "打扰一下，你能帮我拿一下这个包吗？" },
      { en: "Of course! Here you go.", cn: "当然！给你。" },
      { en: "Thank you so much. That's very kind of you.", cn: "非常感谢，你真是太好了。" },
      { en: "You're welcome. No problem at all.", cn: "不客气，完全没问题。" },
    ],
    grammar: [
      {
        title: "请求句型 Could you …?",
        explain: "Could you + 动词原形 是比 Can you 更礼貌的请求方式，常加 please。",
        examples: [
          { en: "Could you help me, please?", cn: "请问你能帮我吗？" },
          { en: "Could you say that again?", cn: "你能再说一遍吗？" },
        ],
      },
      {
        title: "感谢与回应",
        explain: "Thank you / Thanks 表示感谢；常见回应：You're welcome / No problem / My pleasure。",
        examples: [
          { en: "Thanks a lot. — You're welcome.", cn: "非常感谢。— 不客气。" },
          { en: "Thank you. — My pleasure.", cn: "谢谢。— 我的荣幸。" },
        ],
      },
    ],
    expressions: [
      { en: "Excuse me.", cn: "打扰一下。", scene: "引起注意" },
      { en: "I'm sorry.", cn: "对不起。", scene: "道歉" },
      { en: "No problem.", cn: "没问题。", scene: "回应感谢/道歉" },
      { en: "After you.", cn: "您先请。", scene: "礼让" },
      { en: "That's very kind of you.", cn: "你真好。", scene: "表达感激" },
    ],
    fillBlanks: [
      { sentence: "___ me, where is the toilet?", cn: "打扰一下，洗手间在哪里？", options: ["Excuse", "Sorry", "Please", "Thank"], answer: "Excuse" },
      { sentence: "Thank you. — You're ___.", cn: "谢谢。— 不客气。", options: ["welcome", "sorry", "fine", "kind"], answer: "welcome" },
      { sentence: "Could you ___ me, please?", cn: "请问你能帮我吗？", options: ["help", "thank", "sorry", "name"], answer: "help" },
      { sentence: "I'm ___ for being late.", cn: "抱歉我迟到了。", options: ["sorry", "thank", "kind", "fine"], answer: "sorry" },
    ],
    quiz: [
      { q: "What does the speaker ask for help with?", options: ["A book", "A bag", "A cup", "An umbrella"], answer: 1 },
      { q: "What does 'Of course!' mean as a reply?", options: ["Refusal", "Agreement", "Hesitation", "Confusion"], answer: 1 },
      { q: "When do you say 'You're welcome.'?", options: ["After apologizing", "After being thanked", "When asking directions", "When saying goodbye"], answer: 1 },
      { q: "How do you politely get a stranger's attention?", options: ["Hello!", "Excuse me.", "How are you?", "Goodbye."], answer: 1 },
    ],
    listening: {
      audio: "Excuse me, could you help me? Thank you so much. You are welcome.",
      blanks: [
        { before: "", answer: "Excuse", after: " me, could you help me?" },
        { before: "Thank you so", answer: "much", after: "." },
        { before: "You are", answer: "welcome", after: "." },
      ],
    },
    output: {
      prompt: "Politely ask a stranger for help, thank them, and respond when they say 'You're welcome.' (3–4 sentences).",
      cn: "请用 3–4 句话礼貌地向陌生人请求帮助、表达感谢，并对回应进行回礼。",
      sample: "Excuse me, could you help me carry this box, please? Thank you so much, that's very kind of you. — You're welcome. — Have a nice day!",
    },
  },
  介绍他人: {
    vocab: [
      { word: "this", pron: "/ðɪs/", meaning: "pron. 这个", example: "This is my friend, Tom.", example_cn: "这是我的朋友，汤姆。" },
      { word: "friend", pron: "/frend/", meaning: "n. 朋友", example: "She is my best friend.", example_cn: "她是我最好的朋友。" },
      { word: "colleague", pron: "/ˈkɒliːɡ/", meaning: "n. 同事", example: "He is my colleague.", example_cn: "他是我的同事。" },
      { word: "classmate", pron: "/ˈklɑːsmeɪt/", meaning: "n. 同学", example: "We are classmates.", example_cn: "我们是同学。" },
      { word: "brother", pron: "/ˈbrʌðər/", meaning: "n. 兄弟", example: "This is my brother, Jack.", example_cn: "这是我哥哥杰克。" },
      { word: "sister", pron: "/ˈsɪstər/", meaning: "n. 姐妹", example: "Meet my little sister.", example_cn: "见见我的妹妹。" },
      { word: "everyone", pron: "/ˈevriwʌn/", meaning: "pron. 大家", example: "Everyone, this is Lisa.", example_cn: "各位，这是丽莎。" },
      { word: "pleasure", pron: "/ˈpleʒər/", meaning: "n. 荣幸", example: "It's a pleasure to meet you.", example_cn: "很荣幸认识你。" },
    ],
    reading: [
      { en: "Hi everyone, I'd like you to meet my friend, Tom.", cn: "大家好，我想给你们介绍我的朋友汤姆。" },
      { en: "Tom is from London, and he is a software engineer.", cn: "汤姆来自伦敦，他是一名软件工程师。" },
      { en: "Tom, this is Lisa. She is my classmate at the university.", cn: "汤姆，这是丽莎。她是我大学的同学。" },
      { en: "Nice to meet you, Lisa! It's a pleasure.", cn: "很高兴认识你，丽莎！很荣幸。" },
    ],
    grammar: [
      {
        title: "This is … 介绍句型",
        explain: "用 This is + 姓名/称呼 来介绍身边的人；介绍多人用 These are …。",
        examples: [
          { en: "This is my brother, Jack.", cn: "这是我哥哥杰克。" },
          { en: "These are my friends, Mia and Leo.", cn: "这是我的朋友米娅和里奥。" },
        ],
      },
      {
        title: "I'd like you to meet …",
        explain: "更正式、礼貌的介绍方式，常用于工作或社交场合。",
        examples: [
          { en: "I'd like you to meet my colleague, Anna.", cn: "我想给你介绍我的同事安娜。" },
        ],
      },
    ],
    expressions: [
      { en: "This is my friend, …", cn: "这是我的朋友……", scene: "朋友间介绍" },
      { en: "Have you met …?", cn: "你见过……吗？", scene: "询问是否相识" },
      { en: "It's a pleasure to meet you.", cn: "很荣幸认识你。", scene: "正式场合" },
      { en: "I've heard a lot about you.", cn: "久仰大名。", scene: "见到熟人朋友" },
      { en: "Likewise.", cn: "我也是。", scene: "回应称赞/问候" },
    ],
    fillBlanks: [
      { sentence: "___ is my friend, Tom.", cn: "这是我朋友汤姆。", options: ["This", "He", "It", "That"], answer: "This" },
      { sentence: "It's a ___ to meet you.", cn: "很荣幸认识你。", options: ["pleasure", "friend", "name", "kind"], answer: "pleasure" },
      { sentence: "She is my ___ at school.", cn: "她是我学校的同学。", options: ["classmate", "colleague", "brother", "sister"], answer: "classmate" },
      { sentence: "I'd like you to ___ my brother.", cn: "我想给你介绍我哥哥。", options: ["meet", "see", "know", "look"], answer: "meet" },
    ],
    quiz: [
      { q: "What is Tom's job?", options: ["Teacher", "Student", "Software engineer", "Doctor"], answer: 2 },
      { q: "Where is Tom from?", options: ["Paris", "London", "New York", "Tokyo"], answer: 1 },
      { q: "How does the speaker know Lisa?", options: ["Sister", "Colleague", "University classmate", "Neighbor"], answer: 2 },
      { q: "Which is the most polite way to formally introduce someone?", options: ["This is …", "I'd like you to meet …", "Hey, look!", "That's …"], answer: 1 },
    ],
    listening: {
      audio: "This is my friend Tom. He is from London. Nice to meet you.",
      blanks: [
        { before: "This is my", answer: "friend", after: " Tom." },
        { before: "He is from", answer: "London", after: "." },
        { before: "Nice to", answer: "meet", after: " you." },
      ],
    },
    output: {
      prompt: "Introduce a friend or family member to someone new. Mention name, relationship, and one extra detail (3–5 sentences).",
      cn: "请用 3–5 句话向新朋友介绍你的一位朋友或家人，包括姓名、关系和一个其他细节。",
      sample: "Hi Anna, I'd like you to meet my brother, Kevin. He is a college student in Shanghai and he loves basketball. Kevin, this is Anna, my classmate. — Nice to meet you!",
    },
  },
  谈论职业: {
    vocab: [
      { word: "job", pron: "/dʒɒb/", meaning: "n. 工作", example: "What's your job?", example_cn: "你做什么工作？" },
      { word: "work", pron: "/wɜːrk/", meaning: "v./n. 工作", example: "I work in a hospital.", example_cn: "我在医院工作。" },
      { word: "teacher", pron: "/ˈtiːtʃər/", meaning: "n. 老师", example: "She is an English teacher.", example_cn: "她是英语老师。" },
      { word: "doctor", pron: "/ˈdɒktər/", meaning: "n. 医生", example: "My father is a doctor.", example_cn: "我父亲是医生。" },
      { word: "engineer", pron: "/ˌendʒɪˈnɪər/", meaning: "n. 工程师", example: "I am a software engineer.", example_cn: "我是软件工程师。" },
      { word: "company", pron: "/ˈkʌmpəni/", meaning: "n. 公司", example: "I work for a big company.", example_cn: "我在一家大公司工作。" },
      { word: "office", pron: "/ˈɒfɪs/", meaning: "n. 办公室", example: "My office is downtown.", example_cn: "我的办公室在市中心。" },
      { word: "love", pron: "/lʌv/", meaning: "v. 热爱", example: "I love my job.", example_cn: "我热爱我的工作。" },
    ],
    reading: [
      { en: "Hi, I'm David. What do you do for a living?", cn: "你好，我叫大卫。你是做什么工作的？" },
      { en: "I'm a nurse. I work at City Hospital.", cn: "我是护士，在城市医院工作。" },
      { en: "That sounds great! I'm a software engineer at a tech company.", cn: "听起来很棒！我在一家科技公司做软件工程师。" },
      { en: "Do you like your job? — Yes, I love it. It's challenging but fun.", cn: "你喜欢你的工作吗？— 是的，我很喜欢。有挑战但很有趣。" },
    ],
    grammar: [
      {
        title: "询问职业的两种问法",
        explain: "What do you do? = What's your job? 都是问职业；回答用 I'm a/an + 职业 或 I work + 介词短语。",
        examples: [
          { en: "What do you do? — I'm a teacher.", cn: "你做什么工作？— 我是老师。" },
          { en: "I work in a bank.", cn: "我在银行工作。" },
        ],
      },
      {
        title: "a 与 an 的区别",
        explain: "职业前要加冠词。辅音音开头用 a（a doctor），元音音开头用 an（an engineer, an artist）。",
        examples: [
          { en: "She is a nurse.", cn: "她是一名护士。" },
          { en: "He is an engineer.", cn: "他是一名工程师。" },
        ],
      },
    ],
    expressions: [
      { en: "What do you do?", cn: "你做什么工作？", scene: "初识询问" },
      { en: "I work for …", cn: "我在……公司工作", scene: "介绍雇主" },
      { en: "I'm in marketing / sales.", cn: "我做市场 / 销售。", scene: "介绍领域" },
      { en: "I love what I do.", cn: "我热爱我的工作。", scene: "表达态度" },
      { en: "It's a 9-to-5 job.", cn: "是朝九晚五的工作。", scene: "描述节奏" },
    ],
    fillBlanks: [
      { sentence: "I am ___ engineer.", cn: "我是工程师。", options: ["a", "an", "the", "—"], answer: "an" },
      { sentence: "She ___ in a hospital.", cn: "她在医院工作。", options: ["work", "works", "working", "is work"], answer: "works" },
      { sentence: "What do you ___?", cn: "你做什么工作？", options: ["do", "are", "work", "job"], answer: "do" },
      { sentence: "I love my ___.", cn: "我热爱我的工作。", options: ["job", "name", "office", "company"], answer: "job" },
    ],
    quiz: [
      { q: "What is the woman's job in the dialogue?", options: ["Doctor", "Nurse", "Teacher", "Engineer"], answer: 1 },
      { q: "What is David's job?", options: ["Software engineer", "Manager", "Student", "Doctor"], answer: 0 },
      { q: "How does the other person feel about their job?", options: ["Hates it", "Doesn't care", "Loves it", "Wants to switch"], answer: 2 },
      { q: "Which job should be preceded by 'an'?", options: ["doctor", "nurse", "engineer", "teacher"], answer: 2, explain: "'engineer' starts with a vowel sound." },
    ],
    listening: {
      audio: "I am a software engineer. I work for a tech company. I love my job.",
      blanks: [
        { before: "I am a software", answer: "engineer", after: "." },
        { before: "I work for a tech", answer: "company", after: "." },
        { before: "I love my", answer: "job", after: "." },
      ],
    },
    output: {
      prompt: "Talk about your job: what you do, where you work, and how you feel about it (3–5 sentences).",
      cn: "请用 3–5 句话谈论你的职业：做什么、在哪工作、对工作的感受。",
      sample: "I'm a graphic designer. I work for a small studio in Shanghai. My job is creative and busy, but I really love it because every day is different.",
    },
  },
};

// Auto-generate placeholder content for any lesson without manually authored content.
LEVELS.flatMap((level) => level.units.flatMap((unit) => unit.lessons))
  .forEach((lesson) => {
    LESSON_CONTENT[lesson.title] ??= buildLessonContent(lesson.title);
  });

// Backward compatibility
export const SAMPLE_VOCAB: Record<string, VocabItem[]> = Object.fromEntries(
  Object.entries(LESSON_CONTENT).map(([k, v]) => [k, v.vocab]),
);

export const findUnit = (levelId: number, unitId: number) =>
  LEVELS.find((l) => l.id === levelId)?.units.find((u) => u.id === unitId);

export const findLesson = (levelId: number, unitId: number, lessonId: number) =>
  findUnit(levelId, unitId)?.lessons.find((l) => l.id === lessonId);