"""PEP primary textbook Let's talk dialogues (grades 3–6).

Source: 人教版 PEP 英语 Let's talk 原文，按 A/B 两节录入。
Each unit has 1–2 dialogues; lines are paired for the sentence-pattern stage.
"""

from __future__ import annotations

from typing import TypedDict


class Line(TypedDict):
    role: str
    text: str
    cn: str


class Dialogue(TypedDict):
    title: str
    lines: list[Line]


def _line(role: str, text: str, cn: str) -> Line:
    return {"role": role, "text": text, "cn": cn}


def _pair(a: tuple[str, str, str], b: tuple[str, str, str]) -> list[Line]:
    return [_line(*a), _line(*b)]


def _dialogue(title: str, *pairs: tuple[tuple[str, str, str], tuple[str, str, str]]) -> Dialogue:
    lines: list[Line] = []
    for pair in pairs:
        lines.extend(_pair(*pair))
    return {"title": title, "lines": lines}


# book → unit key → dialogues
PEP_UNIT_DIALOGUES: dict[str, dict[str, list[Dialogue]]] = {
    "3A": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Mike", "Hello! I'm Mike.", "你好！我是迈克。"), ("Sarah", "Hi! I'm Sarah.", "嗨！我是萨拉。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Hello, John.", "你好，约翰。"), ("John", "Hi, Sarah. I have a new pencil box.", "嗨，萨拉。我有一个新铅笔盒。")),
                (("Sarah", "Oh, really? What's in it?", "哦，真的吗？里面有什么？"), ("John", "Look! An eraser, a crayon and a ruler.", "看！一块橡皮、一支蜡笔和一把尺子。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "Hi, John!", "嗨，约翰！"), ("John", "Hi, Sarah! How are you?", "嗨，萨拉！你好吗？")),
                (("Sarah", "Fine, thank you.", "很好，谢谢。"), ("John", "Let's go to school.", "我们去上学吧。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Teacher", "Good morning. This is Miss Jones.", "早上好。这是琼斯老师。"), ("Class", "Good morning, Miss Jones.", "早上好，琼斯老师。")),
                (("Teacher", "Show me red.", "给我看看红色。"), ("Students", "OK.", "好的。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Chen Jie", "Hello! I'm Chen Jie.", "你好！我是陈杰。"), ("Sarah", "Hi! I'm Sarah.", "嗨！我是萨拉。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Let's make a puppet!", "我们一起做个木偶吧！"), ("John", "Great!", "太棒了！")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "What's this?", "这是什么？"), ("Wu Binbin", "It's a duck.", "是一只鸭子。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "What's that?", "那是什么？"), ("Wu Binbin", "It's a panda. I like it!", "是一只熊猫。我喜欢它！")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "I'd like some juice, please.", "请给我一些果汁。"), ("John", "Here you are.", "给你。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Can I have some bread, please?", "请给我一些面包好吗？"), ("John", "Here you are.", "给你。")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "This one, please.", "请给我这个。"), ("Shopkeeper", "Sure.", "好的。")),
            ),
            _dialogue(
                "B Let's talk",
                (("John", "How many plates?", "有多少个盘子？"), ("Sarah", "Five.", "五个。")),
            ),
        ],
    },
    "3B": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Amy", "Welcome!", "欢迎！"), ("Teacher", "Welcome back to school!", "欢迎回到学校！")),
            ),
            _dialogue(
                "B Let's talk",
                (("Amy", "Where are you from?", "你是哪里人？"), ("Mike", "I'm from China.", "我来自中国。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "Who's that man?", "那位男士是谁？"), ("Amy", "He's my father.", "他是我爸爸。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Who's that woman?", "那位女士是谁？"), ("Amy", "She's my mother.", "她是我妈妈。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "Look at the giraffe.", "看那只长颈鹿。"), ("Wu Binbin", "It's so tall!", "它好高啊！")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "Look at the monkey.", "看那只猴子。"), ("Sarah", "It's so funny!", "它真有趣！")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("John", "Where is my pencil box?", "我的铅笔盒在哪里？"), ("Sarah", "It's on the desk.", "在课桌上。")),
            ),
            _dialogue(
                "B Let's talk",
                (("John", "Where is my map?", "我的地图在哪里？"), ("Sarah", "It's in the desk.", "在课桌里。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "Do you like pears?", "你喜欢梨吗？"), ("John", "Yes, I do.", "是的，我喜欢。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Do you like apples?", "你喜欢苹果吗？"), ("John", "No, I don't. I like bananas.", "不，我不喜欢。我喜欢香蕉。")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "How many kites do you see?", "你看见多少只风筝？"), ("Amy", "I see 12.", "我看见12只。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "How many crayons do you have?", "你有多少支蜡笔？"), ("John", "I have 16.", "我有16支。")),
            ),
        ],
    },
    "4A": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Mike", "We have a new classroom.", "我们有一间新教室。"), ("Sarah", "Really? What's in the classroom?", "真的吗？教室里有什么？")),
                (("Mike", "Let's go and see!", "我们去看看吧！"), ("Sarah", "It's so big!", "它好大啊！")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Where is it?", "在哪里？"), ("John", "It's near the window.", "在窗户旁边。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Amy", "I have a new schoolbag.", "我有一个新书包。"), ("Wu Binbin", "Me too. What's in your schoolbag?", "我也是。你的书包里有什么？")),
            ),
            _dialogue(
                "B Let's talk",
                (("Amy", "My schoolbag is heavy.", "我的书包很重。"), ("Sarah", "What's in it?", "里面有什么？")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Amy", "I have a friend.", "我有一个朋友。"), ("Wu Binbin", "A boy or girl?", "男孩还是女孩？")),
                (("Amy", "A boy. He's tall and strong.", "男孩。他又高又壮。"), ("Wu Binbin", "Who is he?", "他是谁？")),
            ),
            _dialogue(
                "B Let's talk",
                (("Amy", "He has glasses and his shoes are blue.", "他戴眼镜，鞋子是蓝色的。"), ("Sarah", "His name is Zhang Peng.", "他叫张鹏。")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "Mum, I have a friend.", "妈妈，我有一个朋友。"), ("Mum", "A boy or girl?", "男孩还是女孩？")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Is she in the bedroom?", "她在卧室里吗？"), ("Mum", "No, she isn't. She's in the kitchen.", "不，她不在。她在厨房里。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Mum", "What would you like?", "你想吃什么？"), ("Sarah", "I'd like some soup, please.", "请给我一些汤。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mum", "Would you like some beef?", "你想吃一些牛肉吗？"), ("John", "Yes, please.", "好的，请给我。")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "How many people are there in your family, John?", "约翰，你家有几口人？"), ("John", "Three.", "三口。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "Is this your uncle?", "这是你叔叔吗？"), ("John", "No, it isn't. He's a football player.", "不，不是。他是足球运动员。")),
            ),
        ],
    },
    "4B": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Mike", "Excuse me. Where's the teachers' office?", "请问教师办公室在哪里？"), ("Boy", "It's on the second floor.", "在二楼。")),
                (("Mike", "OK. Thanks.", "好的，谢谢。"), ("Mike", "Hi. Is this the teachers' office?", "请问这是教师办公室吗？")),
                (("Lady", "No, it isn't. The teachers' office is next to the library.", "不是。教师办公室在图书馆旁边。"), ("Mike", "OK. Thank you.", "好的，谢谢。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Wu Binbin", "Welcome to our school! This is my classroom.", "欢迎来我们学校！这是我的教室。"), ("Visitor", "It's so big! How many students are there in your class?", "真大啊！你们班有多少学生？")),
                (("Wu Binbin", "Forty-five students.", "45个学生。"), ("Visitor", "Do you have a library?", "有图书馆吗？")),
                (("Wu Binbin", "Yes, we do. It's on the second floor.", "有，在二楼。"), ("Visitor", "Great!", "太棒了！")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Zhang Peng", "What time is it?", "几点了？"), ("Amy", "It's 6 o'clock. It's time for dinner!", "6点了。该吃晚饭了！")),
            ),
            _dialogue(
                "B Let's talk",
                (("Schoolgirl", "Hi, schoolgirl. What time is it?", "嗨，同学。几点了？"), ("Schoolboy", "It's 9 o'clock. It's time for English class.", "9点了。该上英语课了。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Mike", "Can I go outside now?", "我现在可以出去吗？"), ("Mum", "It's cold outside.", "外面很冷。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Chen Jie", "Hi, Chen Jie! This is Mark.", "嗨，陈杰！这是马克。"), ("Mark", "Hi! Have a good day!", "嗨！祝你有美好的一天！")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Mike", "What are these?", "这些是什么？"), ("Sarah", "They're tomatoes.", "是西红柿。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "Are these carrots?", "这些是胡萝卜吗？"), ("Sarah", "Yes, they are.", "是的，它们是。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "I like this green shirt.", "我喜欢这件绿色的衬衫。"), ("Amy", "Me too. And I like those pants.", "我也是。我还喜欢那条裤子。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Saleswoman", "Can I help you?", "我能帮你吗？"), ("Sarah", "Yes. Can I try these on?", "是的。我可以试穿这些吗？")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Saleswoman", "Can I help you?", "我能帮你吗？"), ("Sarah", "Yes. Can I try this dress on?", "是的。我可以试穿这条连衣裙吗？")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "How much is this skirt?", "这条短裙多少钱？"), ("Saleswoman", "It's $89.", "89美元。")),
            ),
        ],
    },
    "5A": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Wu Binbin", "Who's your art teacher?", "你的美术老师是谁？"), ("Oliver", "Mr Jones.", "琼斯老师。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Wu Binbin", "What's he like?", "他什么样？"), ("Oliver", "He's tall and strong.", "他又高又壮。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Zhang Peng", "What do you have on Mondays?", "你星期一有什么课？"), ("John", "I have Chinese, English and music.", "我有语文、英语和音乐。")),
            ),
            _dialogue(
                "B Let's talk",
                (("John", "Do you often play ping-pong on Thursdays?", "你星期四经常打乒乓球吗？"), ("Zhang Peng", "No, I don't.", "不，我不经常。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "What would you like to eat?", "你想吃什么？"), ("Mike", "I'd like a sandwich, please.", "请给我一个三明治。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "What would you like to drink?", "你想喝什么？"), ("Mike", "I'd like some water.", "我想喝点水。")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Teacher", "What can you do for the party, children?", "孩子们，你们能为派对做什么？"), ("Zhang Peng", "I can sing English songs.", "我会唱英文歌。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "Can you do any kung fu, John?", "约翰，你会武术吗？"), ("John", "Yes, I can.", "是的，我会。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "There is a big bed.", "有一张大床。"), ("Chen Jie", "There is a nice photo, too.", "还有一张漂亮的照片。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "This is my bedroom.", "这是我的卧室。"), ("Chen Jie", "Wow! You look cool!", "哇！你看起来很酷！")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Robin", "Is there a river in the forest, Miss White?", "怀特老师，森林里有河吗？"), ("Miss White", "Yes, there is.", "是的，有。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Robin", "Are there any lakes on the mountain?", "山上有湖吗？"), ("Miss White", "No, there aren't.", "不，没有。")),
            ),
        ],
    },
    "5B": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Mike", "When is the party?", "派对什么时候？"), ("Zhang Peng", "It's in April.", "在四月。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "When is Dragon Boat Festival?", "端午节是什么时候？"), ("Zhang Peng", "It's usually in June.", "通常在六月。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Miss White", "Which season do you like best, Mike?", "迈克，你最喜欢哪个季节？"), ("Mike", "Winter.", "冬天。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Amy", "Do you like summer?", "你喜欢夏天吗？"), ("Miss White", "No, I don't. I like spring.", "不，我不喜欢。我喜欢春天。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Mike", "When is the school trip?", "学校郊游是什么时候？"), ("Oliver", "It's in May.", "在五月。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "When is the sports meet?", "运动会是什么时候？"), ("Oliver", "It's in April.", "在四月。")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Saleswoman", "Can I help you?", "我能帮你吗？"), ("Sarah", "Yes. Can I try these on?", "是的。我可以试穿这些吗？")),
            ),
            _dialogue(
                "B Let's talk",
                (("Sarah", "How much are these shoes?", "这双鞋多少钱？"), ("Saleswoman", "They're ninety-nine yuan.", "99元。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Chen Jie", "The dog is yours.", "这只狗是你的。"), ("Mike", "No! It's his.", "不！是他的。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Chen Jie", "Is the dog eating?", "那只狗在吃东西吗？"), ("Mike", "Yes, he is.", "是的，它在吃。")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Mike", "Look at the pandas.", "看那些熊猫。"), ("Chen Jie", "They're so cute!", "它们真可爱！")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "What's the little monkey doing?", "那只小猴子在干什么？"), ("Chen Jie", "It's playing with its mother!", "它在和妈妈玩！")),
            ),
        ],
    },
    "6A": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Robin", "Where is the museum shop?", "博物馆的商店在哪里？"), ("Wu Binbin", "It's near the door.", "在大门附近。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Robin", "How can I get to the science museum?", "我怎么去科学博物馆？"), ("Wu Binbin", "Turn left at the bookstore.", "在书店左转。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Amy", "How do you come to school?", "你怎么来上学？"), ("Mike", "Usually, I come on foot.", "通常我走路来。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mrs Smith", "Don't go at the red light!", "别闯红灯！"), ("Amy", "I must pay attention to the traffic lights!", "我必须注意交通信号灯！")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("Mike", "What are you going to do tomorrow?", "你明天打算做什么？"), ("Sarah", "I'm going to have an art lesson.", "我打算上美术课。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "When are you going?", "你什么时候去？"), ("Sarah", "At 3 o'clock.", "3点。")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Oliver", "What are your hobbies?", "你的爱好是什么？"), ("Wu Binbin", "I like singing and doing kung fu.", "我喜欢唱歌和练武术。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Oliver", "Does he live in Sydney?", "他住在悉尼吗？"), ("Wu Binbin", "No, he doesn't.", "不，他不住在悉尼。")),
            ),
        ],
        "Unit 5": [
            _dialogue(
                "A Let's talk",
                (("Oliver", "What does he do?", "他是做什么的？"), ("Wu Binbin", "He's a businessman.", "他是商人。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Oliver", "Where does he work?", "他在哪里工作？"), ("Wu Binbin", "He works at sea.", "他在海上工作。")),
            ),
        ],
        "Unit 6": [
            _dialogue(
                "A Let's talk",
                (("Sarah", "How do you feel?", "你感觉怎么样？"), ("Sam", "I'm happy.", "我很开心。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mum", "What's wrong?", "怎么了？"), ("Sarah", "I have a cold.", "我感冒了。")),
            ),
        ],
    },
    "6B": {
        "Unit 1": [
            _dialogue(
                "A Let's talk",
                (("Mike", "How tall are you?", "你多高？"), ("Wu Binbin", "I'm 1.65 metres.", "我1.65米。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "What size are your shoes?", "你穿多大号的鞋？"), ("Wu Binbin", "Size 7.", "7号。")),
            ),
        ],
        "Unit 2": [
            _dialogue(
                "A Let's talk",
                (("Mike", "What did you do last weekend?", "你上周末做了什么？"), ("Amy", "I cleaned my room.", "我打扫了房间。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Mike", "Did you see a film?", "你看电影了吗？"), ("Amy", "Yes, I did.", "是的，我看了。")),
            ),
        ],
        "Unit 3": [
            _dialogue(
                "A Let's talk",
                (("John", "Where did you go?", "你去哪儿了？"), ("Amy", "We went to Sanya.", "我们去了三亚。")),
            ),
            _dialogue(
                "B Let's talk",
                (("John", "How did you go there?", "你们怎么去的？"), ("Amy", "We went there by plane.", "我们坐飞机去的。")),
            ),
        ],
        "Unit 4": [
            _dialogue(
                "A Let's talk",
                (("Grandpa", "There was no library in my old school.", "我以前的学校里没有图书馆。"), ("Mike", "There is one now.", "现在有了。")),
            ),
            _dialogue(
                "B Let's talk",
                (("Grandpa", "I was short.", "我以前很矮。"), ("Mike", "Now I'm tall.", "现在我长高了。")),
            ),
        ],
    },
}


def get_unit_dialogues(book: str, unit_key: str) -> list[Dialogue]:
    return PEP_UNIT_DIALOGUES.get(book, {}).get(unit_key, [])
