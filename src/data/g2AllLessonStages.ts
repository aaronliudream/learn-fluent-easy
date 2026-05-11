/**
 * G2 30 节课完整 Stages 数据
 * 
 * 由 generate_all_stages.py 自动生成
 * 总:30 节 × 5 关 = 150 个关卡
 * 数据量:180 个词卡 + 180 个听音配图 + 180 个看图配词 + 150 个句子 + 90 个填空
 *         + 180 个词 quiz + 150 个句子 quiz
 * 
 * 来源:primaryLessonsG2.json(原 8 字段数据 → 5 关结构)
 */

import type { LessonStages } from './g2LessonStages';

export const G2_ALL_LESSON_STAGES: Record<string, LessonStages> = {
  "g2_l01": {
    "lesson_id": "g2_l01",
    "lesson_key": "How's the weather today? · 二年级第 1 课:今天天气怎样",
    "total_stages": 5,
    "stage1": [
      {
        "word": "weather",
        "ipa": "/ˈweðər/",
        "emoji": "🌤️",
        "meaning_cn": "天气",
        "example_en": "How's the weather today?",
        "example_cn": "今天天气怎样?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "天气",
          "options": [
            "晴朗的",
            "帽子",
            "天气",
            "蓝色的"
          ]
        }
      },
      {
        "word": "sunny",
        "ipa": "/ˈsʌni/",
        "emoji": "☀️",
        "meaning_cn": "晴朗的",
        "example_en": "It's sunny today.",
        "example_cn": "今天晴朗。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "晴朗的",
          "options": [
            "帽子",
            "天空",
            "天气",
            "晴朗的"
          ]
        }
      },
      {
        "word": "sky",
        "ipa": "/skaɪ/",
        "emoji": "☁️",
        "meaning_cn": "天空",
        "example_en": "The sky is blue.",
        "example_cn": "天空是蓝色。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "天空",
          "options": [
            "在外面",
            "蓝色的",
            "天空",
            "天气"
          ]
        }
      },
      {
        "word": "hat",
        "ipa": "/hæt/",
        "emoji": "🎩",
        "meaning_cn": "帽子",
        "example_en": "Wear your hat.",
        "example_cn": "戴上你的帽子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "帽子",
          "options": [
            "晴朗的",
            "蓝色的",
            "帽子",
            "天空"
          ]
        }
      },
      {
        "word": "outside",
        "ipa": "/aʊtˈsaɪd/",
        "emoji": "🚪",
        "meaning_cn": "在外面",
        "example_en": "Let's go outside.",
        "example_cn": "我们出去吧。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在外面",
          "options": [
            "在外面",
            "天气",
            "天空",
            "蓝色的"
          ]
        }
      },
      {
        "word": "blue",
        "ipa": "/bluː/",
        "emoji": "🟦",
        "meaning_cn": "蓝色的",
        "example_en": "The sky is blue.",
        "example_cn": "天空是蓝的。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "蓝色的",
          "options": [
            "在外面",
            "蓝色的",
            "天气",
            "天空"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "weather",
        "correct_emoji": "🌤️",
        "options": [
          "🌤️",
          "🚪",
          "☀️",
          "🎩"
        ]
      },
      {
        "audio_word": "sunny",
        "correct_emoji": "☀️",
        "options": [
          "🎩",
          "🟦",
          "🌤️",
          "☀️"
        ]
      },
      {
        "audio_word": "sky",
        "correct_emoji": "☁️",
        "options": [
          "🚪",
          "☁️",
          "🎩",
          "🟦"
        ]
      },
      {
        "audio_word": "hat",
        "correct_emoji": "🎩",
        "options": [
          "🚪",
          "🎩",
          "☁️",
          "☀️"
        ]
      },
      {
        "audio_word": "outside",
        "correct_emoji": "🚪",
        "options": [
          "🚪",
          "🎩",
          "🌤️",
          "☀️"
        ]
      },
      {
        "audio_word": "blue",
        "correct_emoji": "🟦",
        "options": [
          "🟦",
          "🚪",
          "☁️",
          "🌤️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🌤️",
        "correct_word": "weather",
        "options": [
          "sky",
          "hat",
          "weather",
          "sunny"
        ]
      },
      {
        "image_emoji": "☀️",
        "correct_word": "sunny",
        "options": [
          "sunny",
          "blue",
          "hat",
          "outside"
        ]
      },
      {
        "image_emoji": "☁️",
        "correct_word": "sky",
        "options": [
          "sky",
          "blue",
          "weather",
          "sunny"
        ]
      },
      {
        "image_emoji": "🎩",
        "correct_word": "hat",
        "options": [
          "sky",
          "weather",
          "hat",
          "sunny"
        ]
      },
      {
        "image_emoji": "🚪",
        "correct_word": "outside",
        "options": [
          "hat",
          "weather",
          "outside",
          "blue"
        ]
      },
      {
        "image_emoji": "🟦",
        "correct_word": "blue",
        "options": [
          "blue",
          "outside",
          "sky",
          "hat"
        ]
      }
    ],
    "stage4": [
      {
        "en": "How's the weather today?",
        "cn": "今天天气怎样?",
        "scene_hint": "问天气",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "今天天气怎样",
          "options": [
            "读书",
            "做作业",
            "今天天气怎样",
            "回家吃饭"
          ]
        }
      },
      {
        "en": "It's sunny.",
        "cn": "今天晴朗。",
        "scene_hint": "描述天气",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "今天晴朗",
          "options": [
            "问今天星期几",
            "今天晴朗",
            "回家吃饭",
            "去学校"
          ]
        }
      },
      {
        "en": "Look at the blue sky!",
        "cn": "看那蓝天!",
        "scene_hint": "感叹天气",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "看那蓝天",
          "options": [
            "买东西",
            "看那蓝天",
            "出去玩",
            "祝贺"
          ]
        }
      },
      {
        "en": "Let's go outside!",
        "cn": "我们出去吧!",
        "scene_hint": "提议活动",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们出去吧",
          "options": [
            "听音乐",
            "问今天星期几",
            "我们出去吧",
            "感谢别人"
          ]
        }
      },
      {
        "en": "Don't forget your hat.",
        "cn": "别忘了你的帽子。",
        "scene_hint": "提醒准备",
        "quiz": {
          "question": "这句话在提醒什么?",
          "correct": "别忘了你的帽子",
          "options": [
            "出去玩",
            "拜访朋友",
            "去学校",
            "别忘了你的帽子"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "How's ___ weather today?",
        "cn": "今天天气怎样?",
        "correct": "the",
        "options": [
          "a",
          "the",
          "an",
          "his"
        ]
      },
      {
        "sentence_with_blank": "It ___ sunny today.",
        "cn": "今天天气晴朗。",
        "correct": "is",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ]
      },
      {
        "sentence_with_blank": "Let's go ___!",
        "cn": "我们出去吧!",
        "correct": "outside",
        "options": [
          "inside",
          "outside",
          "downstairs",
          "back"
        ]
      }
    ]
  },
  "g2_l02": {
    "lesson_id": "g2_l02",
    "lesson_key": "It's raining outside. · 二年级第 2 课:外面在下雨",
    "total_stages": 5,
    "stage1": [
      {
        "word": "rain",
        "ipa": "/reɪn/",
        "emoji": "🌧️",
        "meaning_cn": "下雨;雨",
        "example_en": "It's raining.",
        "example_cn": "在下雨。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "下雨;雨",
          "options": [
            "多雨的",
            "在...旁边",
            "门",
            "下雨;雨"
          ]
        }
      },
      {
        "word": "umbrella",
        "ipa": "/ʌmˈbrelə/",
        "emoji": "☂️",
        "meaning_cn": "雨伞",
        "example_en": "Take an umbrella.",
        "example_cn": "拿一把伞。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "雨伞",
          "options": [
            "在...旁边",
            "下雨;雨",
            "雨伞",
            "门"
          ]
        }
      },
      {
        "word": "door",
        "ipa": "/dɔːr/",
        "emoji": "🚪",
        "meaning_cn": "门",
        "example_en": "It's by the door.",
        "example_cn": "在门边。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "门",
          "options": [
            "多雨的",
            "在...旁边",
            "雨伞",
            "门"
          ]
        }
      },
      {
        "word": "rainy",
        "ipa": "/ˈreɪni/",
        "emoji": "☔",
        "meaning_cn": "多雨的",
        "example_en": "A rainy day.",
        "example_cn": "下雨的一天。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "多雨的",
          "options": [
            "下雨;雨",
            "多雨的",
            "雨伞",
            "门"
          ]
        }
      },
      {
        "word": "wet",
        "ipa": "/wet/",
        "emoji": "💧",
        "meaning_cn": "湿的",
        "example_en": "My shoes are wet.",
        "example_cn": "我的鞋湿了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "湿的",
          "options": [
            "多雨的",
            "在...旁边",
            "湿的",
            "下雨;雨"
          ]
        }
      },
      {
        "word": "by",
        "ipa": "/baɪ/",
        "emoji": "📍",
        "meaning_cn": "在...旁边",
        "example_en": "By the door.",
        "example_cn": "在门边。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在...旁边",
          "options": [
            "湿的",
            "雨伞",
            "在...旁边",
            "多雨的"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "rain",
        "correct_emoji": "🌧️",
        "options": [
          "🌧️",
          "🚪",
          "📍",
          "☂️"
        ]
      },
      {
        "audio_word": "umbrella",
        "correct_emoji": "☂️",
        "options": [
          "☔",
          "🚪",
          "💧",
          "☂️"
        ]
      },
      {
        "audio_word": "door",
        "correct_emoji": "🚪",
        "options": [
          "📍",
          "☔",
          "🚪",
          "☂️"
        ]
      },
      {
        "audio_word": "rainy",
        "correct_emoji": "☔",
        "options": [
          "📍",
          "🚪",
          "💧",
          "☔"
        ]
      },
      {
        "audio_word": "wet",
        "correct_emoji": "💧",
        "options": [
          "🚪",
          "📍",
          "💧",
          "☂️"
        ]
      },
      {
        "audio_word": "by",
        "correct_emoji": "📍",
        "options": [
          "☂️",
          "📍",
          "🚪",
          "💧"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🌧️",
        "correct_word": "rain",
        "options": [
          "rain",
          "by",
          "umbrella",
          "rainy"
        ]
      },
      {
        "image_emoji": "☂️",
        "correct_word": "umbrella",
        "options": [
          "wet",
          "rainy",
          "by",
          "umbrella"
        ]
      },
      {
        "image_emoji": "🚪",
        "correct_word": "door",
        "options": [
          "rain",
          "rainy",
          "door",
          "wet"
        ]
      },
      {
        "image_emoji": "☔",
        "correct_word": "rainy",
        "options": [
          "by",
          "umbrella",
          "rainy",
          "door"
        ]
      },
      {
        "image_emoji": "💧",
        "correct_word": "wet",
        "options": [
          "door",
          "by",
          "wet",
          "umbrella"
        ]
      },
      {
        "image_emoji": "📍",
        "correct_word": "by",
        "options": [
          "wet",
          "rain",
          "rainy",
          "by"
        ]
      }
    ],
    "stage4": [
      {
        "en": "It's raining outside.",
        "cn": "外面在下雨。",
        "scene_hint": "描述天气",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "外面在下雨",
          "options": [
            "拜访朋友",
            "去学校",
            "外面在下雨",
            "数数字"
          ]
        }
      },
      {
        "en": "Take your umbrella.",
        "cn": "拿上你的伞。",
        "scene_hint": "提醒准备",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "拿上你的伞",
          "options": [
            "买东西",
            "去学校",
            "说再见",
            "拿上你的伞"
          ]
        }
      },
      {
        "en": "Where is my umbrella?",
        "cn": "我的伞在哪?",
        "scene_hint": "找东西",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "我的伞在哪",
          "options": [
            "出去玩",
            "看电视",
            "我的伞在哪",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "It's by the door.",
        "cn": "在门边。",
        "scene_hint": "回答位置",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "在门边",
          "options": [
            "说再见",
            "看电视",
            "睡觉了",
            "在门边"
          ]
        }
      },
      {
        "en": "I love rainy days.",
        "cn": "我喜欢雨天。",
        "scene_hint": "表达喜好",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我喜欢雨天",
          "options": [
            "数数字",
            "祝贺",
            "我喜欢雨天",
            "说再见"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "It ___ raining now.",
        "cn": "现在在下雨。",
        "correct": "is",
        "options": [
          "is",
          "are",
          "am",
          "be"
        ]
      },
      {
        "sentence_with_blank": "Where ___ my umbrella?",
        "cn": "我的伞在哪?",
        "correct": "is",
        "options": [
          "am",
          "are",
          "is",
          "be"
        ]
      },
      {
        "sentence_with_blank": "Take ___ umbrella.",
        "cn": "拿一把伞。",
        "correct": "an",
        "options": [
          "a",
          "an",
          "the",
          "any"
        ]
      }
    ]
  },
  "g2_l03": {
    "lesson_id": "g2_l03",
    "lesson_key": "What time is it? · 二年级第 3 课:几点了?",
    "total_stages": 5,
    "stage1": [
      {
        "word": "time",
        "ipa": "/taɪm/",
        "emoji": "⏰",
        "meaning_cn": "时间",
        "example_en": "What time is it?",
        "example_cn": "几点了?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "时间",
          "options": [
            "小时",
            "早上",
            "钟",
            "时间"
          ]
        }
      },
      {
        "word": "clock",
        "ipa": "/klɒk/",
        "emoji": "🕐",
        "meaning_cn": "钟",
        "example_en": "Look at the clock.",
        "example_cn": "看看钟。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "钟",
          "options": [
            "早上",
            "钟",
            "时间",
            "在...之后"
          ]
        }
      },
      {
        "word": "hour",
        "ipa": "/aʊər/",
        "emoji": "⌛",
        "meaning_cn": "小时",
        "example_en": "Two hours.",
        "example_cn": "两个小时。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "小时",
          "options": [
            "钟",
            "小时",
            "在...之前",
            "时间"
          ]
        }
      },
      {
        "word": "morning",
        "ipa": "/ˈmɔːrnɪŋ/",
        "emoji": "🌅",
        "meaning_cn": "早上",
        "example_en": "Good morning.",
        "example_cn": "早上好。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "早上",
          "options": [
            "钟",
            "小时",
            "早上",
            "在...之后"
          ]
        }
      },
      {
        "word": "after",
        "ipa": "/ˈæftər/",
        "emoji": "⏭️",
        "meaning_cn": "在...之后",
        "example_en": "After school.",
        "example_cn": "放学后。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在...之后",
          "options": [
            "小时",
            "时间",
            "早上",
            "在...之后"
          ]
        }
      },
      {
        "word": "before",
        "ipa": "/bɪˈfɔːr/",
        "emoji": "⏮️",
        "meaning_cn": "在...之前",
        "example_en": "Before breakfast.",
        "example_cn": "早餐前。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在...之前",
          "options": [
            "小时",
            "时间",
            "在...之前",
            "钟"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "time",
        "correct_emoji": "⏰",
        "options": [
          "🌅",
          "⏭️",
          "⏰",
          "⏮️"
        ]
      },
      {
        "audio_word": "clock",
        "correct_emoji": "🕐",
        "options": [
          "⏰",
          "🌅",
          "⌛",
          "🕐"
        ]
      },
      {
        "audio_word": "hour",
        "correct_emoji": "⌛",
        "options": [
          "⏭️",
          "⏮️",
          "🌅",
          "⌛"
        ]
      },
      {
        "audio_word": "morning",
        "correct_emoji": "🌅",
        "options": [
          "🌅",
          "⌛",
          "🕐",
          "⏰"
        ]
      },
      {
        "audio_word": "after",
        "correct_emoji": "⏭️",
        "options": [
          "⌛",
          "⏭️",
          "⏰",
          "🌅"
        ]
      },
      {
        "audio_word": "before",
        "correct_emoji": "⏮️",
        "options": [
          "🌅",
          "⏭️",
          "⏰",
          "⏮️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "⏰",
        "correct_word": "time",
        "options": [
          "time",
          "hour",
          "morning",
          "clock"
        ]
      },
      {
        "image_emoji": "🕐",
        "correct_word": "clock",
        "options": [
          "before",
          "after",
          "time",
          "clock"
        ]
      },
      {
        "image_emoji": "⌛",
        "correct_word": "hour",
        "options": [
          "time",
          "hour",
          "clock",
          "before"
        ]
      },
      {
        "image_emoji": "🌅",
        "correct_word": "morning",
        "options": [
          "hour",
          "clock",
          "time",
          "morning"
        ]
      },
      {
        "image_emoji": "⏭️",
        "correct_word": "after",
        "options": [
          "clock",
          "after",
          "time",
          "before"
        ]
      },
      {
        "image_emoji": "⏮️",
        "correct_word": "before",
        "options": [
          "clock",
          "after",
          "before",
          "time"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What time is it?",
        "cn": "几点了?",
        "scene_hint": "问时间",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "几点了?",
          "options": [
            "玩游戏",
            "做作业",
            "几点了?",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "It's three o'clock.",
        "cn": "三点了。",
        "scene_hint": "回答时间",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "三点了",
          "options": [
            "说再见",
            "数数字",
            "三点了",
            "买东西"
          ]
        }
      },
      {
        "en": "When can we go?",
        "cn": "我们什么时候能去?",
        "scene_hint": "询问时间",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "我们什么时候能去",
          "options": [
            "做作业",
            "看电视",
            "我们什么时候能去",
            "读书"
          ]
        }
      },
      {
        "en": "After your homework.",
        "cn": "做完作业之后。",
        "scene_hint": "条件性时间",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "做完作业之后",
          "options": [
            "听音乐",
            "玩游戏",
            "买东西",
            "做完作业之后"
          ]
        }
      },
      {
        "en": "Two more hours!",
        "cn": "还有两小时!",
        "scene_hint": "倒计时",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "还有两小时",
          "options": [
            "打招呼",
            "感谢别人",
            "还有两小时",
            "买东西"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "What time ___ it?",
        "cn": "几点了?",
        "correct": "is",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ]
      },
      {
        "sentence_with_blank": "I sleep ___ 9 PM.",
        "cn": "我在 9 点之后睡觉。",
        "correct": "after",
        "options": [
          "before",
          "after",
          "in",
          "by"
        ]
      },
      {
        "sentence_with_blank": "Brush teeth ___ bed.",
        "cn": "睡前刷牙。",
        "correct": "before",
        "options": [
          "after",
          "before",
          "by",
          "on"
        ]
      }
    ]
  },
  "g2_l04": {
    "lesson_id": "g2_l04",
    "lesson_key": "What day is today? · 二年级第 4 课:今天星期几",
    "total_stages": 5,
    "stage1": [
      {
        "word": "day",
        "ipa": "/deɪ/",
        "emoji": "📆",
        "meaning_cn": "天;日子",
        "example_en": "Have a nice day!",
        "example_cn": "祝你愉快!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "天;日子",
          "options": [
            "星期一",
            "周末",
            "天;日子",
            "星期日"
          ]
        }
      },
      {
        "word": "Saturday",
        "ipa": "/ˈsætərdeɪ/",
        "emoji": "📅",
        "meaning_cn": "星期六",
        "example_en": "It's Saturday.",
        "example_cn": "今天周六。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "星期六",
          "options": [
            "星期日",
            "星期六",
            "周末",
            "最喜爱的"
          ]
        }
      },
      {
        "word": "Sunday",
        "ipa": "/ˈsʌndeɪ/",
        "emoji": "🌞",
        "meaning_cn": "星期日",
        "example_en": "Sunday is a rest day.",
        "example_cn": "周日是休息日。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "星期日",
          "options": [
            "周末",
            "最喜爱的",
            "星期六",
            "星期日"
          ]
        }
      },
      {
        "word": "Monday",
        "ipa": "/ˈmʌndeɪ/",
        "emoji": "📋",
        "meaning_cn": "星期一",
        "example_en": "Monday morning.",
        "example_cn": "周一早上。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "星期一",
          "options": [
            "星期六",
            "天;日子",
            "星期一",
            "最喜爱的"
          ]
        }
      },
      {
        "word": "favorite",
        "ipa": "/ˈfeɪvərɪt/",
        "emoji": "⭐",
        "meaning_cn": "最喜爱的",
        "example_en": "My favorite day.",
        "example_cn": "我最爱的一天。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "最喜爱的",
          "options": [
            "星期一",
            "周末",
            "星期日",
            "最喜爱的"
          ]
        }
      },
      {
        "word": "weekend",
        "ipa": "/ˈwiːkend/",
        "emoji": "🎉",
        "meaning_cn": "周末",
        "example_en": "Happy weekend!",
        "example_cn": "周末快乐!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "周末",
          "options": [
            "周末",
            "星期日",
            "最喜爱的",
            "星期一"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "day",
        "correct_emoji": "📆",
        "options": [
          "📆",
          "📅",
          "📋",
          "🎉"
        ]
      },
      {
        "audio_word": "Saturday",
        "correct_emoji": "📅",
        "options": [
          "🌞",
          "📆",
          "📋",
          "📅"
        ]
      },
      {
        "audio_word": "Sunday",
        "correct_emoji": "🌞",
        "options": [
          "🌞",
          "📅",
          "📋",
          "📆"
        ]
      },
      {
        "audio_word": "Monday",
        "correct_emoji": "📋",
        "options": [
          "⭐",
          "📋",
          "📅",
          "📆"
        ]
      },
      {
        "audio_word": "favorite",
        "correct_emoji": "⭐",
        "options": [
          "🎉",
          "📆",
          "⭐",
          "📅"
        ]
      },
      {
        "audio_word": "weekend",
        "correct_emoji": "🎉",
        "options": [
          "📋",
          "📅",
          "🎉",
          "📆"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "📆",
        "correct_word": "day",
        "options": [
          "Monday",
          "favorite",
          "Sunday",
          "day"
        ]
      },
      {
        "image_emoji": "📅",
        "correct_word": "Saturday",
        "options": [
          "Saturday",
          "Sunday",
          "weekend",
          "Monday"
        ]
      },
      {
        "image_emoji": "🌞",
        "correct_word": "Sunday",
        "options": [
          "weekend",
          "Saturday",
          "Monday",
          "Sunday"
        ]
      },
      {
        "image_emoji": "📋",
        "correct_word": "Monday",
        "options": [
          "Saturday",
          "weekend",
          "Monday",
          "Sunday"
        ]
      },
      {
        "image_emoji": "⭐",
        "correct_word": "favorite",
        "options": [
          "favorite",
          "day",
          "Monday",
          "weekend"
        ]
      },
      {
        "image_emoji": "🎉",
        "correct_word": "weekend",
        "options": [
          "favorite",
          "Monday",
          "weekend",
          "Sunday"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What day is today?",
        "cn": "今天星期几?",
        "scene_hint": "问星期",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "今天星期几?",
          "options": [
            "今天星期几?",
            "出去玩",
            "做作业",
            "听音乐"
          ]
        }
      },
      {
        "en": "It's Saturday!",
        "cn": "今天周六!",
        "scene_hint": "回答星期",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "今天周六",
          "options": [
            "出去玩",
            "做作业",
            "听音乐",
            "今天周六"
          ]
        }
      },
      {
        "en": "No school today!",
        "cn": "今天不上学!",
        "scene_hint": "节假日",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "今天不上学",
          "options": [
            "做作业",
            "今天不上学",
            "玩游戏",
            "听音乐"
          ]
        }
      },
      {
        "en": "Saturday is my favorite day.",
        "cn": "周六是我最爱的一天。",
        "scene_hint": "喜好",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "周六是我最爱的一天",
          "options": [
            "回家吃饭",
            "周六是我最爱的一天",
            "祝贺",
            "做作业"
          ]
        }
      },
      {
        "en": "Let's go swimming!",
        "cn": "我们去游泳!",
        "scene_hint": "提议活动",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们去游泳",
          "options": [
            "我们去游泳",
            "问现在几点",
            "睡觉了",
            "拜访朋友"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "What ___ is today?",
        "cn": "今天星期几?",
        "correct": "day",
        "options": [
          "time",
          "day",
          "place",
          "color"
        ]
      },
      {
        "sentence_with_blank": "Saturday is my ___ day.",
        "cn": "周六是我最爱的一天。",
        "correct": "favorite",
        "options": [
          "bad",
          "favorite",
          "boring",
          "first"
        ]
      },
      {
        "sentence_with_blank": "On ___, we don't go to school.",
        "cn": "周日我们不上学。",
        "correct": "Sunday",
        "options": [
          "Monday",
          "Friday",
          "Sunday",
          "Wednesday"
        ]
      }
    ]
  },
  "g2_l05": {
    "lesson_id": "g2_l05",
    "lesson_key": "What are you wearing? · 二年级第 5 课:你穿什么?",
    "total_stages": 5,
    "stage1": [
      {
        "word": "wear",
        "ipa": "/wer/",
        "emoji": "👔",
        "meaning_cn": "穿;戴",
        "example_en": "Wear a hat.",
        "example_cn": "戴个帽子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "穿;戴",
          "options": [
            "毛衣",
            "穿;戴",
            "冷的",
            "温暖的"
          ]
        }
      },
      {
        "word": "sweater",
        "ipa": "/ˈswetər/",
        "emoji": "🧥",
        "meaning_cn": "毛衣",
        "example_en": "A red sweater.",
        "example_cn": "一件红毛衣。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "毛衣",
          "options": [
            "牛仔裤",
            "冷的",
            "温暖的",
            "毛衣"
          ]
        }
      },
      {
        "word": "jeans",
        "ipa": "/dʒiːnz/",
        "emoji": "👖",
        "meaning_cn": "牛仔裤",
        "example_en": "Blue jeans.",
        "example_cn": "蓝牛仔裤。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "牛仔裤",
          "options": [
            "温暖的",
            "牛仔裤",
            "袜子",
            "冷的"
          ]
        }
      },
      {
        "word": "socks",
        "ipa": "/sɒks/",
        "emoji": "🧦",
        "meaning_cn": "袜子",
        "example_en": "Warm socks.",
        "example_cn": "厚袜子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "袜子",
          "options": [
            "毛衣",
            "冷的",
            "牛仔裤",
            "袜子"
          ]
        }
      },
      {
        "word": "cold",
        "ipa": "/koʊld/",
        "emoji": "🥶",
        "meaning_cn": "冷的",
        "example_en": "It's cold.",
        "example_cn": "天冷。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "冷的",
          "options": [
            "温暖的",
            "冷的",
            "毛衣",
            "袜子"
          ]
        }
      },
      {
        "word": "warm",
        "ipa": "/wɔːrm/",
        "emoji": "🔥",
        "meaning_cn": "温暖的",
        "example_en": "I'm warm.",
        "example_cn": "我很暖和。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "温暖的",
          "options": [
            "穿;戴",
            "袜子",
            "温暖的",
            "冷的"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "wear",
        "correct_emoji": "👔",
        "options": [
          "🥶",
          "👔",
          "🔥",
          "🧦"
        ]
      },
      {
        "audio_word": "sweater",
        "correct_emoji": "🧥",
        "options": [
          "🧥",
          "👖",
          "🧦",
          "🔥"
        ]
      },
      {
        "audio_word": "jeans",
        "correct_emoji": "👖",
        "options": [
          "🧥",
          "🔥",
          "🥶",
          "👖"
        ]
      },
      {
        "audio_word": "socks",
        "correct_emoji": "🧦",
        "options": [
          "🧥",
          "👔",
          "🔥",
          "🧦"
        ]
      },
      {
        "audio_word": "cold",
        "correct_emoji": "🥶",
        "options": [
          "🔥",
          "👔",
          "🧥",
          "🥶"
        ]
      },
      {
        "audio_word": "warm",
        "correct_emoji": "🔥",
        "options": [
          "🧥",
          "🧦",
          "👔",
          "🔥"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "👔",
        "correct_word": "wear",
        "options": [
          "jeans",
          "wear",
          "socks",
          "cold"
        ]
      },
      {
        "image_emoji": "🧥",
        "correct_word": "sweater",
        "options": [
          "wear",
          "socks",
          "jeans",
          "sweater"
        ]
      },
      {
        "image_emoji": "👖",
        "correct_word": "jeans",
        "options": [
          "sweater",
          "wear",
          "jeans",
          "cold"
        ]
      },
      {
        "image_emoji": "🧦",
        "correct_word": "socks",
        "options": [
          "jeans",
          "wear",
          "warm",
          "socks"
        ]
      },
      {
        "image_emoji": "🥶",
        "correct_word": "cold",
        "options": [
          "warm",
          "jeans",
          "cold",
          "wear"
        ]
      },
      {
        "image_emoji": "🔥",
        "correct_word": "warm",
        "options": [
          "warm",
          "socks",
          "sweater",
          "wear"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What should I wear?",
        "cn": "我穿什么?",
        "scene_hint": "问穿着",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我穿什么?",
          "options": [
            "我穿什么?",
            "回家吃饭",
            "去学校",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "It's cold today.",
        "cn": "今天冷。",
        "scene_hint": "天气",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "今天冷",
          "options": [
            "出去玩",
            "听音乐",
            "今天冷",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "Wear your red sweater.",
        "cn": "穿你的红毛衣。",
        "scene_hint": "建议",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "穿你的红毛衣",
          "options": [
            "穿你的红毛衣",
            "听音乐",
            "出去玩",
            "做作业"
          ]
        }
      },
      {
        "en": "And warm socks too.",
        "cn": "也穿厚袜子。",
        "scene_hint": "添加",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "也穿厚袜子",
          "options": [
            "数数字",
            "玩游戏",
            "也穿厚袜子",
            "介绍自己"
          ]
        }
      },
      {
        "en": "I'm warm and cozy!",
        "cn": "我又暖又舒服!",
        "scene_hint": "感受",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我又暖又舒服",
          "options": [
            "我又暖又舒服",
            "听音乐",
            "睡觉了",
            "读书"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "It's cold today. Wear a ___.",
        "cn": "今天冷。穿件毛衣。",
        "correct": "sweater",
        "options": [
          "t-shirt",
          "swimsuit",
          "sweater",
          "shorts"
        ]
      },
      {
        "sentence_with_blank": "What ___ I wear?",
        "cn": "我穿什么?",
        "correct": "should",
        "options": [
          "am",
          "is",
          "should",
          "are"
        ]
      },
      {
        "sentence_with_blank": "My ___ are blue.",
        "cn": "我的牛仔裤是蓝的。",
        "correct": "jeans",
        "options": [
          "jeans",
          "sweater",
          "hat",
          "coat"
        ]
      }
    ]
  },
  "g2_l06": {
    "lesson_id": "g2_l06",
    "lesson_key": "Welcome to my room. · 二年级第 6 课:欢迎来我房间",
    "total_stages": 5,
    "stage1": [
      {
        "word": "room",
        "ipa": "/ruːm/",
        "emoji": "🛋️",
        "meaning_cn": "房间",
        "example_en": "My room.",
        "example_cn": "我的房间。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "房间",
          "options": [
            "地板",
            "书架",
            "房间",
            "书桌"
          ]
        }
      },
      {
        "word": "bookshelf",
        "ipa": "/ˈbʊkʃelf/",
        "emoji": "📚",
        "meaning_cn": "书架",
        "example_en": "A big bookshelf.",
        "example_cn": "一个大书架。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "书架",
          "options": [
            "书架",
            "地板",
            "书桌",
            "床"
          ]
        }
      },
      {
        "word": "toy",
        "ipa": "/tɔɪ/",
        "emoji": "🧸",
        "meaning_cn": "玩具",
        "example_en": "Many toys.",
        "example_cn": "很多玩具。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "玩具",
          "options": [
            "书桌",
            "房间",
            "床",
            "玩具"
          ]
        }
      },
      {
        "word": "floor",
        "ipa": "/flɔːr/",
        "emoji": "🟫",
        "meaning_cn": "地板",
        "example_en": "On the floor.",
        "example_cn": "在地板上。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "地板",
          "options": [
            "地板",
            "书桌",
            "床",
            "书架"
          ]
        }
      },
      {
        "word": "bed",
        "ipa": "/bed/",
        "emoji": "🛏️",
        "meaning_cn": "床",
        "example_en": "My bed.",
        "example_cn": "我的床。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "床",
          "options": [
            "床",
            "玩具",
            "地板",
            "书架"
          ]
        }
      },
      {
        "word": "desk",
        "ipa": "/desk/",
        "emoji": "🪑",
        "meaning_cn": "书桌",
        "example_en": "On my desk.",
        "example_cn": "在我桌上。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "书桌",
          "options": [
            "书架",
            "书桌",
            "房间",
            "玩具"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "room",
        "correct_emoji": "🛋️",
        "options": [
          "🛋️",
          "📚",
          "🛏️",
          "🧸"
        ]
      },
      {
        "audio_word": "bookshelf",
        "correct_emoji": "📚",
        "options": [
          "🧸",
          "📚",
          "🛏️",
          "🟫"
        ]
      },
      {
        "audio_word": "toy",
        "correct_emoji": "🧸",
        "options": [
          "🛋️",
          "🟫",
          "🛏️",
          "🧸"
        ]
      },
      {
        "audio_word": "floor",
        "correct_emoji": "🟫",
        "options": [
          "🛋️",
          "🟫",
          "🪑",
          "📚"
        ]
      },
      {
        "audio_word": "bed",
        "correct_emoji": "🛏️",
        "options": [
          "🛏️",
          "🧸",
          "🪑",
          "📚"
        ]
      },
      {
        "audio_word": "desk",
        "correct_emoji": "🪑",
        "options": [
          "📚",
          "🛋️",
          "🟫",
          "🪑"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🛋️",
        "correct_word": "room",
        "options": [
          "bookshelf",
          "desk",
          "room",
          "toy"
        ]
      },
      {
        "image_emoji": "📚",
        "correct_word": "bookshelf",
        "options": [
          "toy",
          "floor",
          "bookshelf",
          "desk"
        ]
      },
      {
        "image_emoji": "🧸",
        "correct_word": "toy",
        "options": [
          "toy",
          "floor",
          "bed",
          "room"
        ]
      },
      {
        "image_emoji": "🟫",
        "correct_word": "floor",
        "options": [
          "desk",
          "floor",
          "bed",
          "bookshelf"
        ]
      },
      {
        "image_emoji": "🛏️",
        "correct_word": "bed",
        "options": [
          "room",
          "bed",
          "floor",
          "desk"
        ]
      },
      {
        "image_emoji": "🪑",
        "correct_word": "desk",
        "options": [
          "bookshelf",
          "bed",
          "room",
          "desk"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Welcome to my room!",
        "cn": "欢迎来我房间!",
        "scene_hint": "欢迎",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "欢迎来我房间",
          "options": [
            "拜访朋友",
            "数数字",
            "欢迎来我房间",
            "出去玩"
          ]
        }
      },
      {
        "en": "Your room is so cool!",
        "cn": "你的房间真酷!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "你的房间真酷",
          "options": [
            "看电视",
            "出去玩",
            "祝贺",
            "你的房间真酷"
          ]
        }
      },
      {
        "en": "That's my new bookshelf.",
        "cn": "那是我的新书架。",
        "scene_hint": "介绍",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "那是我的新书架",
          "options": [
            "听音乐",
            "道歉",
            "那是我的新书架",
            "睡觉了"
          ]
        }
      },
      {
        "en": "I have many toys on the floor.",
        "cn": "地板上有很多玩具。",
        "scene_hint": "描述位置",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "地板上有很多玩具",
          "options": [
            "回家吃饭",
            "听音乐",
            "祝贺",
            "地板上有很多玩具"
          ]
        }
      },
      {
        "en": "Let's play with the cars!",
        "cn": "我们玩玩具车吧!",
        "scene_hint": "提议",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们玩玩具车吧",
          "options": [
            "道歉",
            "看电视",
            "我们玩玩具车吧",
            "祝贺"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "There ___ a bed in my room.",
        "cn": "我房间里有张床。",
        "correct": "is",
        "options": [
          "is",
          "are",
          "be",
          "am"
        ]
      },
      {
        "sentence_with_blank": "My toys are ___ the floor.",
        "cn": "我的玩具在地板上。",
        "correct": "on",
        "options": [
          "in",
          "on",
          "under",
          "by"
        ]
      },
      {
        "sentence_with_blank": "Books are on the ___.",
        "cn": "书在书架上。",
        "correct": "bookshelf",
        "options": [
          "bed",
          "bookshelf",
          "floor",
          "desk"
        ]
      }
    ]
  },
  "g2_l07": {
    "lesson_id": "g2_l07",
    "lesson_key": "What's your hobby? · 二年级第 7 课:你的爱好是什么?",
    "total_stages": 5,
    "stage1": [
      {
        "word": "hobby",
        "ipa": "/ˈhɒbi/",
        "emoji": "🎨",
        "meaning_cn": "爱好",
        "example_en": "My hobby is reading.",
        "example_cn": "我的爱好是阅读。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "爱好",
          "options": [
            "了不起的",
            "爱好",
            "图片;画",
            "钢琴"
          ]
        }
      },
      {
        "word": "draw",
        "ipa": "/drɔː/",
        "emoji": "✏️",
        "meaning_cn": "画",
        "example_en": "I love to draw.",
        "example_cn": "我爱画画。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "画",
          "options": [
            "画",
            "难的",
            "钢琴",
            "爱好"
          ]
        }
      },
      {
        "word": "piano",
        "ipa": "/piˈænoʊ/",
        "emoji": "🎹",
        "meaning_cn": "钢琴",
        "example_en": "Play the piano.",
        "example_cn": "弹钢琴。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "钢琴",
          "options": [
            "了不起的",
            "爱好",
            "难的",
            "钢琴"
          ]
        }
      },
      {
        "word": "picture",
        "ipa": "/ˈpɪktʃər/",
        "emoji": "🖼️",
        "meaning_cn": "图片;画",
        "example_en": "A nice picture.",
        "example_cn": "一张漂亮的画。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "图片;画",
          "options": [
            "图片;画",
            "难的",
            "爱好",
            "了不起的"
          ]
        }
      },
      {
        "word": "amazing",
        "ipa": "/əˈmeɪzɪŋ/",
        "emoji": "🌟",
        "meaning_cn": "了不起的",
        "example_en": "That's amazing!",
        "example_cn": "真了不起!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "了不起的",
          "options": [
            "了不起的",
            "钢琴",
            "画",
            "难的"
          ]
        }
      },
      {
        "word": "hard",
        "ipa": "/hɑːrd/",
        "emoji": "💪",
        "meaning_cn": "难的",
        "example_en": "It's hard.",
        "example_cn": "这很难。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "难的",
          "options": [
            "难的",
            "图片;画",
            "爱好",
            "画"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "hobby",
        "correct_emoji": "🎨",
        "options": [
          "🎨",
          "🎹",
          "🖼️",
          "✏️"
        ]
      },
      {
        "audio_word": "draw",
        "correct_emoji": "✏️",
        "options": [
          "💪",
          "🌟",
          "🎨",
          "✏️"
        ]
      },
      {
        "audio_word": "piano",
        "correct_emoji": "🎹",
        "options": [
          "🌟",
          "🎨",
          "💪",
          "🎹"
        ]
      },
      {
        "audio_word": "picture",
        "correct_emoji": "🖼️",
        "options": [
          "✏️",
          "🌟",
          "🎨",
          "🖼️"
        ]
      },
      {
        "audio_word": "amazing",
        "correct_emoji": "🌟",
        "options": [
          "✏️",
          "🎨",
          "🌟",
          "💪"
        ]
      },
      {
        "audio_word": "hard",
        "correct_emoji": "💪",
        "options": [
          "💪",
          "🎨",
          "🖼️",
          "✏️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🎨",
        "correct_word": "hobby",
        "options": [
          "picture",
          "hobby",
          "hard",
          "draw"
        ]
      },
      {
        "image_emoji": "✏️",
        "correct_word": "draw",
        "options": [
          "picture",
          "hobby",
          "draw",
          "hard"
        ]
      },
      {
        "image_emoji": "🎹",
        "correct_word": "piano",
        "options": [
          "piano",
          "amazing",
          "hard",
          "hobby"
        ]
      },
      {
        "image_emoji": "🖼️",
        "correct_word": "picture",
        "options": [
          "piano",
          "picture",
          "hard",
          "draw"
        ]
      },
      {
        "image_emoji": "🌟",
        "correct_word": "amazing",
        "options": [
          "hard",
          "amazing",
          "draw",
          "picture"
        ]
      },
      {
        "image_emoji": "💪",
        "correct_word": "hard",
        "options": [
          "hard",
          "hobby",
          "draw",
          "piano"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What do you like to do?",
        "cn": "你喜欢做什么?",
        "scene_hint": "问爱好",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "你喜欢做什么",
          "options": [
            "看电视",
            "介绍自己",
            "你喜欢做什么",
            "道歉"
          ]
        }
      },
      {
        "en": "I love drawing pictures.",
        "cn": "我爱画画。",
        "scene_hint": "回答爱好",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我爱画画",
          "options": [
            "我爱画画",
            "感谢别人",
            "读书",
            "数数字"
          ]
        }
      },
      {
        "en": "I play the piano every day.",
        "cn": "我每天弹钢琴。",
        "scene_hint": "频率",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我每天弹钢琴",
          "options": [
            "我每天弹钢琴",
            "睡觉了",
            "玩游戏",
            "出去玩"
          ]
        }
      },
      {
        "en": "That's amazing!",
        "cn": "真厉害!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "真厉害",
          "options": [
            "真厉害",
            "做作业",
            "说再见",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "Is it hard?",
        "cn": "难吗?",
        "scene_hint": "询问难度",
        "quiz": {
          "question": "这句话在做什么?",
          "correct": "难吗",
          "options": [
            "买东西",
            "祝贺",
            "难吗",
            "回家吃饭"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "What do you ___ to do?",
        "cn": "你喜欢做什么?",
        "correct": "like",
        "options": [
          "like",
          "am",
          "is",
          "play"
        ]
      },
      {
        "sentence_with_blank": "I draw ___ day.",
        "cn": "我每天画画。",
        "correct": "every",
        "options": [
          "all",
          "every",
          "some",
          "any"
        ]
      },
      {
        "sentence_with_blank": "Playing piano is ___.",
        "cn": "弹钢琴很难。",
        "correct": "hard",
        "options": [
          "easy",
          "hard",
          "fun",
          "small"
        ]
      }
    ]
  },
  "g2_l08": {
    "lesson_id": "g2_l08",
    "lesson_key": "Let's play soccer! · 二年级第 8 课:一起踢足球",
    "total_stages": 5,
    "stage1": [
      {
        "word": "soccer",
        "ipa": "/ˈsɒkər/",
        "emoji": "⚽",
        "meaning_cn": "足球",
        "example_en": "Play soccer.",
        "example_cn": "踢足球。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "足球",
          "options": [
            "球员",
            "队",
            "足球",
            "球"
          ]
        }
      },
      {
        "word": "ball",
        "ipa": "/bɔːl/",
        "emoji": "🏀",
        "meaning_cn": "球",
        "example_en": "A red ball.",
        "example_cn": "一个红球。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "球",
          "options": [
            "踢",
            "赢",
            "球",
            "足球"
          ]
        }
      },
      {
        "word": "kick",
        "ipa": "/kɪk/",
        "emoji": "🦵",
        "meaning_cn": "踢",
        "example_en": "Kick the ball.",
        "example_cn": "踢球。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "踢",
          "options": [
            "球员",
            "踢",
            "队",
            "赢"
          ]
        }
      },
      {
        "word": "player",
        "ipa": "/ˈpleɪər/",
        "emoji": "🏃",
        "meaning_cn": "球员",
        "example_en": "Two players.",
        "example_cn": "两个球员。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "球员",
          "options": [
            "踢",
            "球员",
            "赢",
            "球"
          ]
        }
      },
      {
        "word": "win",
        "ipa": "/wɪn/",
        "emoji": "🏆",
        "meaning_cn": "赢",
        "example_en": "We win!",
        "example_cn": "我们赢了!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "赢",
          "options": [
            "队",
            "球员",
            "赢",
            "足球"
          ]
        }
      },
      {
        "word": "team",
        "ipa": "/tiːm/",
        "emoji": "👥",
        "meaning_cn": "队",
        "example_en": "My team.",
        "example_cn": "我的队伍。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "队",
          "options": [
            "足球",
            "踢",
            "球员",
            "队"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "soccer",
        "correct_emoji": "⚽",
        "options": [
          "👥",
          "🏃",
          "⚽",
          "🦵"
        ]
      },
      {
        "audio_word": "ball",
        "correct_emoji": "🏀",
        "options": [
          "👥",
          "⚽",
          "🏀",
          "🏆"
        ]
      },
      {
        "audio_word": "kick",
        "correct_emoji": "🦵",
        "options": [
          "🏆",
          "⚽",
          "🦵",
          "🏀"
        ]
      },
      {
        "audio_word": "player",
        "correct_emoji": "🏃",
        "options": [
          "⚽",
          "👥",
          "🏃",
          "🏀"
        ]
      },
      {
        "audio_word": "win",
        "correct_emoji": "🏆",
        "options": [
          "⚽",
          "👥",
          "🏃",
          "🏆"
        ]
      },
      {
        "audio_word": "team",
        "correct_emoji": "👥",
        "options": [
          "👥",
          "⚽",
          "🏀",
          "🦵"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "⚽",
        "correct_word": "soccer",
        "options": [
          "kick",
          "win",
          "soccer",
          "player"
        ]
      },
      {
        "image_emoji": "🏀",
        "correct_word": "ball",
        "options": [
          "ball",
          "win",
          "soccer",
          "team"
        ]
      },
      {
        "image_emoji": "🦵",
        "correct_word": "kick",
        "options": [
          "win",
          "team",
          "kick",
          "player"
        ]
      },
      {
        "image_emoji": "🏃",
        "correct_word": "player",
        "options": [
          "team",
          "kick",
          "soccer",
          "player"
        ]
      },
      {
        "image_emoji": "🏆",
        "correct_word": "win",
        "options": [
          "kick",
          "team",
          "win",
          "ball"
        ]
      },
      {
        "image_emoji": "👥",
        "correct_word": "team",
        "options": [
          "player",
          "team",
          "kick",
          "win"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Want to play soccer?",
        "cn": "想踢足球吗?",
        "scene_hint": "邀请",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "想踢足球吗?",
          "options": [
            "出去玩",
            "说再见",
            "看电视",
            "想踢足球吗?"
          ]
        }
      },
      {
        "en": "I love soccer!",
        "cn": "我爱足球!",
        "scene_hint": "表达喜爱",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我爱足球",
          "options": [
            "我爱足球",
            "回家吃饭",
            "看电视",
            "问现在几点"
          ]
        }
      },
      {
        "en": "How many players?",
        "cn": "几个人?",
        "scene_hint": "问人数",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "几个人",
          "options": [
            "几个人",
            "去学校",
            "回家吃饭",
            "睡觉了"
          ]
        }
      },
      {
        "en": "Just us two.",
        "cn": "就我们俩。",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "就我们俩",
          "options": [
            "就我们俩",
            "去学校",
            "数数字",
            "听音乐"
          ]
        }
      },
      {
        "en": "I'll kick first!",
        "cn": "我先踢!",
        "scene_hint": "提议",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我先踢",
          "options": [
            "出去玩",
            "问现在几点",
            "我先踢",
            "问今天星期几"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "Want ___ play?",
        "cn": "想玩吗?",
        "correct": "to",
        "options": [
          "to",
          "for",
          "at",
          "of"
        ]
      },
      {
        "sentence_with_blank": "Let's ___ soccer.",
        "cn": "我们踢足球。",
        "correct": "play",
        "options": [
          "eat",
          "play",
          "see",
          "buy"
        ]
      },
      {
        "sentence_with_blank": "I ___ kick first.",
        "cn": "我会先踢。",
        "correct": "I'll",
        "options": [
          "am",
          "is",
          "I'll",
          "are"
        ]
      }
    ]
  },
  "g2_l09": {
    "lesson_id": "g2_l09",
    "lesson_key": "My mom is a doctor. · 二年级第 9 课:我妈妈是医生",
    "total_stages": 5,
    "stage1": [
      {
        "word": "doctor",
        "ipa": "/ˈdɒktər/",
        "emoji": "👨‍⚕️",
        "meaning_cn": "医生",
        "example_en": "She's a doctor.",
        "example_cn": "她是医生。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "医生",
          "options": [
            "工作",
            "生病的",
            "医生",
            "老师"
          ]
        }
      },
      {
        "word": "teacher",
        "ipa": "/ˈtiːtʃər/",
        "emoji": "👩‍🏫",
        "meaning_cn": "老师",
        "example_en": "My teacher.",
        "example_cn": "我的老师。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "老师",
          "options": [
            "老师",
            "生病的",
            "厨师",
            "医生"
          ]
        }
      },
      {
        "word": "chef",
        "ipa": "/ʃef/",
        "emoji": "👨‍🍳",
        "meaning_cn": "厨师",
        "example_en": "A famous chef.",
        "example_cn": "一位有名的厨师。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "厨师",
          "options": [
            "生病的",
            "工作",
            "厨师",
            "帮助"
          ]
        }
      },
      {
        "word": "job",
        "ipa": "/dʒɒb/",
        "emoji": "💼",
        "meaning_cn": "工作",
        "example_en": "My dad's job.",
        "example_cn": "我爸的工作。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "工作",
          "options": [
            "帮助",
            "工作",
            "厨师",
            "医生"
          ]
        }
      },
      {
        "word": "help",
        "ipa": "/help/",
        "emoji": "🤝",
        "meaning_cn": "帮助",
        "example_en": "Help others.",
        "example_cn": "帮助别人。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "帮助",
          "options": [
            "帮助",
            "医生",
            "厨师",
            "工作"
          ]
        }
      },
      {
        "word": "sick",
        "ipa": "/sɪk/",
        "emoji": "🤒",
        "meaning_cn": "生病的",
        "example_en": "Sick people.",
        "example_cn": "病人。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "生病的",
          "options": [
            "帮助",
            "老师",
            "医生",
            "生病的"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "doctor",
        "correct_emoji": "👨‍⚕️",
        "options": [
          "👨‍⚕️",
          "👩‍🏫",
          "🤝",
          "👨‍🍳"
        ]
      },
      {
        "audio_word": "teacher",
        "correct_emoji": "👩‍🏫",
        "options": [
          "👨‍⚕️",
          "👩‍🏫",
          "🤝",
          "💼"
        ]
      },
      {
        "audio_word": "chef",
        "correct_emoji": "👨‍🍳",
        "options": [
          "💼",
          "🤝",
          "👩‍🏫",
          "👨‍🍳"
        ]
      },
      {
        "audio_word": "job",
        "correct_emoji": "💼",
        "options": [
          "🤝",
          "💼",
          "👩‍🏫",
          "🤒"
        ]
      },
      {
        "audio_word": "help",
        "correct_emoji": "🤝",
        "options": [
          "👩‍🏫",
          "🤝",
          "💼",
          "👨‍🍳"
        ]
      },
      {
        "audio_word": "sick",
        "correct_emoji": "🤒",
        "options": [
          "👩‍🏫",
          "🤒",
          "🤝",
          "👨‍🍳"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "👨‍⚕️",
        "correct_word": "doctor",
        "options": [
          "sick",
          "doctor",
          "job",
          "teacher"
        ]
      },
      {
        "image_emoji": "👩‍🏫",
        "correct_word": "teacher",
        "options": [
          "chef",
          "job",
          "teacher",
          "doctor"
        ]
      },
      {
        "image_emoji": "👨‍🍳",
        "correct_word": "chef",
        "options": [
          "doctor",
          "sick",
          "chef",
          "teacher"
        ]
      },
      {
        "image_emoji": "💼",
        "correct_word": "job",
        "options": [
          "teacher",
          "doctor",
          "chef",
          "job"
        ]
      },
      {
        "image_emoji": "🤝",
        "correct_word": "help",
        "options": [
          "chef",
          "sick",
          "help",
          "teacher"
        ]
      },
      {
        "image_emoji": "🤒",
        "correct_word": "sick",
        "options": [
          "chef",
          "sick",
          "doctor",
          "job"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What does your mom do?",
        "cn": "你妈妈做什么的?",
        "scene_hint": "问职业",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "你妈妈做什么的",
          "options": [
            "问现在几点",
            "你妈妈做什么的",
            "出去玩",
            "数数字"
          ]
        }
      },
      {
        "en": "She's a doctor.",
        "cn": "她是医生。",
        "scene_hint": "回答职业",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她是医生",
          "options": [
            "做作业",
            "出去玩",
            "打招呼",
            "她是医生"
          ]
        }
      },
      {
        "en": "She helps sick people.",
        "cn": "她帮病人。",
        "scene_hint": "描述工作",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她帮病人",
          "options": [
            "她帮病人",
            "介绍自己",
            "出去玩",
            "说再见"
          ]
        }
      },
      {
        "en": "What about your dad?",
        "cn": "你爸爸呢?",
        "scene_hint": "问其他",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "你爸爸呢?",
          "options": [
            "数数字",
            "问今天星期几",
            "出去玩",
            "你爸爸呢?"
          ]
        }
      },
      {
        "en": "He's a teacher.",
        "cn": "他是老师。",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "他是老师",
          "options": [
            "他是老师",
            "回家吃饭",
            "问现在几点",
            "祝贺"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "She ___ a doctor.",
        "cn": "她是医生。",
        "correct": "is",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ]
      },
      {
        "sentence_with_blank": "What does your dad ___?",
        "cn": "你爸爸做什么?",
        "correct": "do",
        "options": [
          "does",
          "do",
          "is",
          "are"
        ]
      },
      {
        "sentence_with_blank": "He ___ sick people.",
        "cn": "他帮助病人。",
        "correct": "helps",
        "options": [
          "help",
          "helps",
          "helping",
          "to help"
        ]
      }
    ]
  },
  "g2_l10": {
    "lesson_id": "g2_l10",
    "lesson_key": "Let's take the bus. · 二年级第 10 课:我们坐公交",
    "total_stages": 5,
    "stage1": [
      {
        "word": "bus",
        "ipa": "/bʌs/",
        "emoji": "🚌",
        "meaning_cn": "公交车",
        "example_en": "Take the bus.",
        "example_cn": "坐公交。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "公交车",
          "options": [
            "票",
            "乘车",
            "公交车",
            "美元"
          ]
        }
      },
      {
        "word": "downtown",
        "ipa": "/ˌdaʊnˈtaʊn/",
        "emoji": "🏙️",
        "meaning_cn": "市中心",
        "example_en": "Go downtown.",
        "example_cn": "去市中心。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "市中心",
          "options": [
            "美元",
            "分钟",
            "市中心",
            "票"
          ]
        }
      },
      {
        "word": "dollar",
        "ipa": "/ˈdɒlər/",
        "emoji": "💵",
        "meaning_cn": "美元",
        "example_en": "Two dollars.",
        "example_cn": "两美元。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "美元",
          "options": [
            "乘车",
            "美元",
            "票",
            "市中心"
          ]
        }
      },
      {
        "word": "ride",
        "ipa": "/raɪd/",
        "emoji": "🚗",
        "meaning_cn": "乘车",
        "example_en": "Ride the bus.",
        "example_cn": "坐公交。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "乘车",
          "options": [
            "市中心",
            "乘车",
            "美元",
            "票"
          ]
        }
      },
      {
        "word": "ticket",
        "ipa": "/ˈtɪkɪt/",
        "emoji": "🎫",
        "meaning_cn": "票",
        "example_en": "Buy a ticket.",
        "example_cn": "买票。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "票",
          "options": [
            "公交车",
            "乘车",
            "分钟",
            "票"
          ]
        }
      },
      {
        "word": "minute",
        "ipa": "/ˈmɪnɪt/",
        "emoji": "⏱️",
        "meaning_cn": "分钟",
        "example_en": "15 minutes.",
        "example_cn": "15 分钟。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "分钟",
          "options": [
            "票",
            "公交车",
            "美元",
            "分钟"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "bus",
        "correct_emoji": "🚌",
        "options": [
          "💵",
          "🚌",
          "🚗",
          "🎫"
        ]
      },
      {
        "audio_word": "downtown",
        "correct_emoji": "🏙️",
        "options": [
          "⏱️",
          "🎫",
          "🚗",
          "🏙️"
        ]
      },
      {
        "audio_word": "dollar",
        "correct_emoji": "💵",
        "options": [
          "🎫",
          "🚗",
          "⏱️",
          "💵"
        ]
      },
      {
        "audio_word": "ride",
        "correct_emoji": "🚗",
        "options": [
          "🚌",
          "🚗",
          "⏱️",
          "💵"
        ]
      },
      {
        "audio_word": "ticket",
        "correct_emoji": "🎫",
        "options": [
          "🎫",
          "🚌",
          "💵",
          "🏙️"
        ]
      },
      {
        "audio_word": "minute",
        "correct_emoji": "⏱️",
        "options": [
          "🏙️",
          "💵",
          "⏱️",
          "🚌"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🚌",
        "correct_word": "bus",
        "options": [
          "downtown",
          "dollar",
          "ride",
          "bus"
        ]
      },
      {
        "image_emoji": "🏙️",
        "correct_word": "downtown",
        "options": [
          "dollar",
          "ticket",
          "downtown",
          "minute"
        ]
      },
      {
        "image_emoji": "💵",
        "correct_word": "dollar",
        "options": [
          "ride",
          "minute",
          "ticket",
          "dollar"
        ]
      },
      {
        "image_emoji": "🚗",
        "correct_word": "ride",
        "options": [
          "dollar",
          "bus",
          "downtown",
          "ride"
        ]
      },
      {
        "image_emoji": "🎫",
        "correct_word": "ticket",
        "options": [
          "ticket",
          "minute",
          "ride",
          "dollar"
        ]
      },
      {
        "image_emoji": "⏱️",
        "correct_word": "minute",
        "options": [
          "bus",
          "downtown",
          "minute",
          "ticket"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Does this bus go downtown?",
        "cn": "这车去市中心吗?",
        "scene_hint": "问路",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "这车去市中心吗?",
          "options": [
            "道歉",
            "打招呼",
            "这车去市中心吗?",
            "数数字"
          ]
        }
      },
      {
        "en": "Yes, get on!",
        "cn": "对,上车!",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "对,上车",
          "options": [
            "说再见",
            "对,上车",
            "介绍自己",
            "买东西"
          ]
        }
      },
      {
        "en": "How much is it?",
        "cn": "多少钱?",
        "scene_hint": "问价钱",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "多少钱",
          "options": [
            "回家吃饭",
            "看电视",
            "多少钱",
            "听音乐"
          ]
        }
      },
      {
        "en": "Two dollars, please.",
        "cn": "两元,谢谢。",
        "scene_hint": "回答价钱",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "两元,谢谢",
          "options": [
            "拜访朋友",
            "两元,谢谢",
            "去学校",
            "数数字"
          ]
        }
      },
      {
        "en": "Thank you very much!",
        "cn": "非常感谢!",
        "scene_hint": "感谢",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "非常感谢",
          "options": [
            "感谢别人",
            "读书",
            "打招呼",
            "非常感谢"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ this bus go downtown?",
        "cn": "这车去市中心吗?",
        "correct": "Does",
        "options": [
          "Do",
          "Is",
          "Does",
          "Are"
        ]
      },
      {
        "sentence_with_blank": "How ___ is it?",
        "cn": "多少钱?",
        "correct": "much",
        "options": [
          "many",
          "much",
          "long",
          "old"
        ]
      },
      {
        "sentence_with_blank": "It's ___ minutes.",
        "cn": "15 分钟。",
        "correct": "fifteen",
        "options": [
          "fifteen",
          "fifty",
          "fifteenth",
          "five"
        ]
      }
    ]
  },
  "g2_l11": {
    "lesson_id": "g2_l11",
    "lesson_key": "Hello, Grandma! · 二年级第 11 课:打电话给奶奶",
    "total_stages": 5,
    "stage1": [
      {
        "word": "grandma",
        "ipa": "/ˈɡrænmɑː/",
        "emoji": "👵",
        "meaning_cn": "奶奶",
        "example_en": "Hi, Grandma!",
        "example_cn": "你好,奶奶!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "奶奶",
          "options": [
            "宝贝",
            "想念",
            "电话",
            "奶奶"
          ]
        }
      },
      {
        "word": "miss",
        "ipa": "/mɪs/",
        "emoji": "💔",
        "meaning_cn": "想念",
        "example_en": "I miss you.",
        "example_cn": "我想你。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "想念",
          "options": [
            "电话",
            "想念",
            "周日",
            "打电话"
          ]
        }
      },
      {
        "word": "sweetie",
        "ipa": "/ˈswiːti/",
        "emoji": "🍬",
        "meaning_cn": "宝贝",
        "example_en": "Hi sweetie!",
        "example_cn": "嗨宝贝!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "宝贝",
          "options": [
            "宝贝",
            "想念",
            "奶奶",
            "电话"
          ]
        }
      },
      {
        "word": "call",
        "ipa": "/kɔːl/",
        "emoji": "📞",
        "meaning_cn": "打电话",
        "example_en": "Call grandma.",
        "example_cn": "给奶奶打电话。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "打电话",
          "options": [
            "奶奶",
            "宝贝",
            "想念",
            "打电话"
          ]
        }
      },
      {
        "word": "phone",
        "ipa": "/foʊn/",
        "emoji": "📱",
        "meaning_cn": "电话",
        "example_en": "On the phone.",
        "example_cn": "在电话上。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "电话",
          "options": [
            "宝贝",
            "打电话",
            "周日",
            "电话"
          ]
        }
      },
      {
        "word": "Sunday",
        "ipa": "/ˈsʌndeɪ/",
        "emoji": "🌞",
        "meaning_cn": "周日",
        "example_en": "See you Sunday.",
        "example_cn": "周日见。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "周日",
          "options": [
            "打电话",
            "想念",
            "周日",
            "宝贝"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "grandma",
        "correct_emoji": "👵",
        "options": [
          "🌞",
          "👵",
          "📱",
          "🍬"
        ]
      },
      {
        "audio_word": "miss",
        "correct_emoji": "💔",
        "options": [
          "🍬",
          "📱",
          "💔",
          "📞"
        ]
      },
      {
        "audio_word": "sweetie",
        "correct_emoji": "🍬",
        "options": [
          "👵",
          "🌞",
          "💔",
          "🍬"
        ]
      },
      {
        "audio_word": "call",
        "correct_emoji": "📞",
        "options": [
          "📞",
          "📱",
          "💔",
          "🌞"
        ]
      },
      {
        "audio_word": "phone",
        "correct_emoji": "📱",
        "options": [
          "📱",
          "💔",
          "🍬",
          "📞"
        ]
      },
      {
        "audio_word": "Sunday",
        "correct_emoji": "🌞",
        "options": [
          "🍬",
          "📞",
          "👵",
          "🌞"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "👵",
        "correct_word": "grandma",
        "options": [
          "Sunday",
          "grandma",
          "phone",
          "miss"
        ]
      },
      {
        "image_emoji": "💔",
        "correct_word": "miss",
        "options": [
          "phone",
          "sweetie",
          "grandma",
          "miss"
        ]
      },
      {
        "image_emoji": "🍬",
        "correct_word": "sweetie",
        "options": [
          "phone",
          "Sunday",
          "sweetie",
          "call"
        ]
      },
      {
        "image_emoji": "📞",
        "correct_word": "call",
        "options": [
          "grandma",
          "phone",
          "sweetie",
          "call"
        ]
      },
      {
        "image_emoji": "📱",
        "correct_word": "phone",
        "options": [
          "miss",
          "phone",
          "grandma",
          "sweetie"
        ]
      },
      {
        "image_emoji": "🌞",
        "correct_word": "Sunday",
        "options": [
          "Sunday",
          "phone",
          "sweetie",
          "miss"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Hello, Grandma! It's me!",
        "cn": "你好,奶奶!是我!",
        "scene_hint": "打电话开场",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "你好,奶奶是我",
          "options": [
            "说再见",
            "玩游戏",
            "祝贺",
            "你好,奶奶是我"
          ]
        }
      },
      {
        "en": "Hi, sweetie! How are you?",
        "cn": "嗨,宝贝!你好吗?",
        "scene_hint": "问候",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "嗨,宝贝你好吗?",
          "options": [
            "感谢别人",
            "嗨,宝贝你好吗?",
            "看电视",
            "买东西"
          ]
        }
      },
      {
        "en": "I miss you so much.",
        "cn": "我超想你。",
        "scene_hint": "表达想念",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我超想你",
          "options": [
            "我超想你",
            "回家吃饭",
            "玩游戏",
            "问现在几点"
          ]
        }
      },
      {
        "en": "See you on Sunday!",
        "cn": "周日见!",
        "scene_hint": "约见面",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "周日见",
          "options": [
            "周日见",
            "回家吃饭",
            "问现在几点",
            "看电视"
          ]
        }
      },
      {
        "en": "I love you, Grandma.",
        "cn": "我爱你,奶奶。",
        "scene_hint": "表达爱",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我爱你,奶奶",
          "options": [
            "我爱你,奶奶",
            "回家吃饭",
            "打招呼",
            "问现在几点"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "Hello, Grandma! It's ___!",
        "cn": "你好,奶奶!是我!",
        "correct": "me",
        "options": [
          "me",
          "I",
          "my",
          "mine"
        ]
      },
      {
        "sentence_with_blank": "I ___ you, Grandma.",
        "cn": "我想你,奶奶。",
        "correct": "miss",
        "options": [
          "like",
          "have",
          "miss",
          "give"
        ]
      },
      {
        "sentence_with_blank": "See you on ___!",
        "cn": "周日见!",
        "correct": "Sunday",
        "options": [
          "Sunday",
          "Monday",
          "school",
          "tomorrow"
        ]
      }
    ]
  },
  "g2_l12": {
    "lesson_id": "g2_l12",
    "lesson_key": "What's wrong? · 二年级第 12 课:去看医生",
    "total_stages": 5,
    "stage1": [
      {
        "word": "wrong",
        "ipa": "/rɒŋ/",
        "emoji": "❌",
        "meaning_cn": "不对的;有问题的",
        "example_en": "What's wrong?",
        "example_cn": "怎么了?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "不对的;有问题的",
          "options": [
            "感冒",
            "嘴",
            "不对的;有问题的",
            "疼"
          ]
        }
      },
      {
        "word": "hurt",
        "ipa": "/hɜːrt/",
        "emoji": "🤕",
        "meaning_cn": "疼",
        "example_en": "It hurts.",
        "example_cn": "疼。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "疼",
          "options": [
            "不对的;有问题的",
            "嘴",
            "疼",
            "水"
          ]
        }
      },
      {
        "word": "mouth",
        "ipa": "/maʊθ/",
        "emoji": "👄",
        "meaning_cn": "嘴",
        "example_en": "Open your mouth.",
        "example_cn": "张嘴。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "嘴",
          "options": [
            "生病的",
            "感冒",
            "不对的;有问题的",
            "嘴"
          ]
        }
      },
      {
        "word": "cold",
        "ipa": "/koʊld/",
        "emoji": "🥶",
        "meaning_cn": "感冒",
        "example_en": "Have a cold.",
        "example_cn": "感冒了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "感冒",
          "options": [
            "生病的",
            "疼",
            "感冒",
            "嘴"
          ]
        }
      },
      {
        "word": "water",
        "ipa": "/ˈwɔːtər/",
        "emoji": "💧",
        "meaning_cn": "水",
        "example_en": "Drink water.",
        "example_cn": "喝水。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "水",
          "options": [
            "生病的",
            "疼",
            "水",
            "嘴"
          ]
        }
      },
      {
        "word": "sick",
        "ipa": "/sɪk/",
        "emoji": "🤒",
        "meaning_cn": "生病的",
        "example_en": "I'm sick.",
        "example_cn": "我病了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "生病的",
          "options": [
            "生病的",
            "嘴",
            "感冒",
            "疼"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "wrong",
        "correct_emoji": "❌",
        "options": [
          "💧",
          "🤒",
          "❌",
          "👄"
        ]
      },
      {
        "audio_word": "hurt",
        "correct_emoji": "🤕",
        "options": [
          "🤕",
          "❌",
          "💧",
          "👄"
        ]
      },
      {
        "audio_word": "mouth",
        "correct_emoji": "👄",
        "options": [
          "💧",
          "👄",
          "🤒",
          "❌"
        ]
      },
      {
        "audio_word": "cold",
        "correct_emoji": "🥶",
        "options": [
          "👄",
          "💧",
          "🤕",
          "🥶"
        ]
      },
      {
        "audio_word": "water",
        "correct_emoji": "💧",
        "options": [
          "🤕",
          "💧",
          "🤒",
          "🥶"
        ]
      },
      {
        "audio_word": "sick",
        "correct_emoji": "🤒",
        "options": [
          "🥶",
          "🤒",
          "👄",
          "💧"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "❌",
        "correct_word": "wrong",
        "options": [
          "mouth",
          "water",
          "wrong",
          "hurt"
        ]
      },
      {
        "image_emoji": "🤕",
        "correct_word": "hurt",
        "options": [
          "cold",
          "sick",
          "wrong",
          "hurt"
        ]
      },
      {
        "image_emoji": "👄",
        "correct_word": "mouth",
        "options": [
          "wrong",
          "hurt",
          "cold",
          "mouth"
        ]
      },
      {
        "image_emoji": "🥶",
        "correct_word": "cold",
        "options": [
          "hurt",
          "water",
          "sick",
          "cold"
        ]
      },
      {
        "image_emoji": "💧",
        "correct_word": "water",
        "options": [
          "hurt",
          "mouth",
          "water",
          "wrong"
        ]
      },
      {
        "image_emoji": "🤒",
        "correct_word": "sick",
        "options": [
          "mouth",
          "hurt",
          "wrong",
          "sick"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What's wrong, my friend?",
        "cn": "怎么了,小朋友?",
        "scene_hint": "医生问诊",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "怎么了,小朋友",
          "options": [
            "出去玩",
            "问现在几点",
            "祝贺",
            "怎么了,小朋友"
          ]
        }
      },
      {
        "en": "My head hurts.",
        "cn": "我头疼。",
        "scene_hint": "描述症状",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我头疼",
          "options": [
            "我头疼",
            "道歉",
            "做作业",
            "打招呼"
          ]
        }
      },
      {
        "en": "Open your mouth, please.",
        "cn": "请张嘴。",
        "scene_hint": "医生指令",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "请张嘴",
          "options": [
            "介绍自己",
            "读书",
            "请张嘴",
            "做作业"
          ]
        }
      },
      {
        "en": "You have a cold.",
        "cn": "你感冒了。",
        "scene_hint": "诊断",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "你感冒了",
          "options": [
            "问现在几点",
            "读书",
            "打招呼",
            "你感冒了"
          ]
        }
      },
      {
        "en": "Drink lots of water.",
        "cn": "多喝水。",
        "scene_hint": "医嘱",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "多喝水",
          "options": [
            "说再见",
            "多喝水",
            "读书",
            "买东西"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "What's ___?",
        "cn": "怎么了?",
        "correct": "wrong",
        "options": [
          "right",
          "wrong",
          "good",
          "bad"
        ]
      },
      {
        "sentence_with_blank": "My head ___.",
        "cn": "我头疼。",
        "correct": "hurts",
        "options": [
          "hurt",
          "hurts",
          "hurting",
          "hurted"
        ]
      },
      {
        "sentence_with_blank": "Drink ___ of water.",
        "cn": "多喝水。",
        "correct": "lots",
        "options": [
          "a",
          "lots",
          "little",
          "no"
        ]
      }
    ]
  },
  "g2_l13": {
    "lesson_id": "g2_l13",
    "lesson_key": "Can I help you? · 二年级第 13 课:帮妈妈做家务",
    "total_stages": 5,
    "stage1": [
      {
        "word": "help",
        "ipa": "/help/",
        "emoji": "🤝",
        "meaning_cn": "帮助",
        "example_en": "Help your mom.",
        "example_cn": "帮你妈妈。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "帮助",
          "options": [
            "苹果",
            "帮助",
            "洗",
            "厨房"
          ]
        }
      },
      {
        "word": "wash",
        "ipa": "/wɒʃ/",
        "emoji": "🧼",
        "meaning_cn": "洗",
        "example_en": "Wash the dishes.",
        "example_cn": "洗碗。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "洗",
          "options": [
            "帮助",
            "厨房",
            "打扫",
            "洗"
          ]
        }
      },
      {
        "word": "apple",
        "ipa": "/ˈæpəl/",
        "emoji": "🍎",
        "meaning_cn": "苹果",
        "example_en": "A red apple.",
        "example_cn": "一个红苹果。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "苹果",
          "options": [
            "洗",
            "苹果",
            "五",
            "厨房"
          ]
        }
      },
      {
        "word": "kitchen",
        "ipa": "/ˈkɪtʃən/",
        "emoji": "🍳",
        "meaning_cn": "厨房",
        "example_en": "In the kitchen.",
        "example_cn": "在厨房。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "厨房",
          "options": [
            "帮助",
            "洗",
            "厨房",
            "苹果"
          ]
        }
      },
      {
        "word": "five",
        "ipa": "/faɪv/",
        "emoji": "5️⃣",
        "meaning_cn": "五",
        "example_en": "Five apples.",
        "example_cn": "五个苹果。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "五",
          "options": [
            "厨房",
            "帮助",
            "洗",
            "五"
          ]
        }
      },
      {
        "word": "clean",
        "ipa": "/kliːn/",
        "emoji": "🧹",
        "meaning_cn": "打扫",
        "example_en": "Clean the room.",
        "example_cn": "打扫房间。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "打扫",
          "options": [
            "厨房",
            "打扫",
            "五",
            "苹果"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "help",
        "correct_emoji": "🤝",
        "options": [
          "🍳",
          "🧹",
          "5️⃣",
          "🤝"
        ]
      },
      {
        "audio_word": "wash",
        "correct_emoji": "🧼",
        "options": [
          "🧼",
          "🧹",
          "🍎",
          "5️⃣"
        ]
      },
      {
        "audio_word": "apple",
        "correct_emoji": "🍎",
        "options": [
          "🍎",
          "🤝",
          "5️⃣",
          "🧼"
        ]
      },
      {
        "audio_word": "kitchen",
        "correct_emoji": "🍳",
        "options": [
          "🤝",
          "5️⃣",
          "🍳",
          "🧼"
        ]
      },
      {
        "audio_word": "five",
        "correct_emoji": "5️⃣",
        "options": [
          "🍎",
          "5️⃣",
          "🍳",
          "🧹"
        ]
      },
      {
        "audio_word": "clean",
        "correct_emoji": "🧹",
        "options": [
          "🧹",
          "🤝",
          "🧼",
          "🍎"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🤝",
        "correct_word": "help",
        "options": [
          "help",
          "five",
          "clean",
          "wash"
        ]
      },
      {
        "image_emoji": "🧼",
        "correct_word": "wash",
        "options": [
          "kitchen",
          "wash",
          "help",
          "five"
        ]
      },
      {
        "image_emoji": "🍎",
        "correct_word": "apple",
        "options": [
          "wash",
          "five",
          "apple",
          "help"
        ]
      },
      {
        "image_emoji": "🍳",
        "correct_word": "kitchen",
        "options": [
          "help",
          "five",
          "kitchen",
          "clean"
        ]
      },
      {
        "image_emoji": "5️⃣",
        "correct_word": "five",
        "options": [
          "apple",
          "wash",
          "clean",
          "five"
        ]
      },
      {
        "image_emoji": "🧹",
        "correct_word": "clean",
        "options": [
          "kitchen",
          "apple",
          "clean",
          "wash"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Mom, can I help you?",
        "cn": "妈妈,我能帮你吗?",
        "scene_hint": "主动帮忙",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "妈妈,我能帮你吗?",
          "options": [
            "妈妈,我能帮你吗?",
            "打招呼",
            "买东西",
            "读书"
          ]
        }
      },
      {
        "en": "Yes! You can wash the apples.",
        "cn": "好!你可以洗苹果。",
        "scene_hint": "分配任务",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "好你可以洗苹果。",
          "options": [
            "好你可以洗苹果。",
            "问今天星期几",
            "介绍自己",
            "做作业"
          ]
        }
      },
      {
        "en": "How many apples?",
        "cn": "几个苹果?",
        "scene_hint": "确认数量",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "几个苹果",
          "options": [
            "几个苹果",
            "感谢别人",
            "听音乐",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "Five apples, please.",
        "cn": "五个,谢谢。",
        "scene_hint": "回答数量",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "五个,谢谢",
          "options": [
            "数数字",
            "看电视",
            "五个,谢谢",
            "睡觉了"
          ]
        }
      },
      {
        "en": "I love helping you, Mom!",
        "cn": "我爱帮你,妈妈!",
        "scene_hint": "表达爱",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我爱帮你,妈妈",
          "options": [
            "出去玩",
            "问现在几点",
            "我爱帮你,妈妈",
            "去学校"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ I help you?",
        "cn": "我能帮你吗?",
        "correct": "Can",
        "options": [
          "May",
          "Can",
          "Should",
          "Do"
        ]
      },
      {
        "sentence_with_blank": "Wash ___ apples.",
        "cn": "洗苹果。",
        "correct": "the",
        "options": [
          "the",
          "a",
          "an",
          "any"
        ]
      },
      {
        "sentence_with_blank": "How ___ apples?",
        "cn": "几个苹果?",
        "correct": "many",
        "options": [
          "much",
          "many",
          "long",
          "old"
        ]
      }
    ]
  },
  "g2_l14": {
    "lesson_id": "g2_l14",
    "lesson_key": "I have a little brother. · 二年级第 14 课:我有个弟弟",
    "total_stages": 5,
    "stage1": [
      {
        "word": "brother",
        "ipa": "/ˈbrʌðər/",
        "emoji": "👦",
        "meaning_cn": "兄弟",
        "example_en": "My brother.",
        "example_cn": "我的兄弟。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "兄弟",
          "options": [
            "见面",
            "兄弟",
            "搞笑的",
            "姐妹"
          ]
        }
      },
      {
        "word": "sister",
        "ipa": "/ˈsɪstər/",
        "emoji": "👧",
        "meaning_cn": "姐妹",
        "example_en": "My sister.",
        "example_cn": "我的姐妹。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "姐妹",
          "options": [
            "年龄",
            "搞笑的",
            "姐妹",
            "小的"
          ]
        }
      },
      {
        "word": "little",
        "ipa": "/ˈlɪtl/",
        "emoji": "🤏",
        "meaning_cn": "小的",
        "example_en": "Little brother.",
        "example_cn": "小弟弟。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "小的",
          "options": [
            "年龄",
            "见面",
            "姐妹",
            "小的"
          ]
        }
      },
      {
        "word": "funny",
        "ipa": "/ˈfʌni/",
        "emoji": "😂",
        "meaning_cn": "搞笑的",
        "example_en": "He's funny.",
        "example_cn": "他搞笑。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "搞笑的",
          "options": [
            "姐妹",
            "年龄",
            "小的",
            "搞笑的"
          ]
        }
      },
      {
        "word": "age",
        "ipa": "/eɪdʒ/",
        "emoji": "🎂",
        "meaning_cn": "年龄",
        "example_en": "What age?",
        "example_cn": "几岁?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "年龄",
          "options": [
            "见面",
            "年龄",
            "搞笑的",
            "小的"
          ]
        }
      },
      {
        "word": "meet",
        "ipa": "/miːt/",
        "emoji": "🤝",
        "meaning_cn": "见面",
        "example_en": "Meet him.",
        "example_cn": "见他。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "见面",
          "options": [
            "搞笑的",
            "小的",
            "姐妹",
            "见面"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "brother",
        "correct_emoji": "👦",
        "options": [
          "👧",
          "😂",
          "👦",
          "🤝"
        ]
      },
      {
        "audio_word": "sister",
        "correct_emoji": "👧",
        "options": [
          "😂",
          "👧",
          "🤝",
          "👦"
        ]
      },
      {
        "audio_word": "little",
        "correct_emoji": "🤏",
        "options": [
          "🤏",
          "🎂",
          "🤝",
          "👧"
        ]
      },
      {
        "audio_word": "funny",
        "correct_emoji": "😂",
        "options": [
          "👦",
          "🤏",
          "😂",
          "🎂"
        ]
      },
      {
        "audio_word": "age",
        "correct_emoji": "🎂",
        "options": [
          "👧",
          "🎂",
          "😂",
          "👦"
        ]
      },
      {
        "audio_word": "meet",
        "correct_emoji": "🤝",
        "options": [
          "🤏",
          "👧",
          "🎂",
          "🤝"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "👦",
        "correct_word": "brother",
        "options": [
          "brother",
          "age",
          "funny",
          "sister"
        ]
      },
      {
        "image_emoji": "👧",
        "correct_word": "sister",
        "options": [
          "sister",
          "meet",
          "little",
          "brother"
        ]
      },
      {
        "image_emoji": "🤏",
        "correct_word": "little",
        "options": [
          "little",
          "sister",
          "age",
          "funny"
        ]
      },
      {
        "image_emoji": "😂",
        "correct_word": "funny",
        "options": [
          "funny",
          "meet",
          "brother",
          "age"
        ]
      },
      {
        "image_emoji": "🎂",
        "correct_word": "age",
        "options": [
          "age",
          "sister",
          "meet",
          "funny"
        ]
      },
      {
        "image_emoji": "🤝",
        "correct_word": "meet",
        "options": [
          "little",
          "meet",
          "brother",
          "funny"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Do you have any brothers?",
        "cn": "你有兄弟吗?",
        "scene_hint": "问家人",
        "quiz": {
          "question": "这句话在做什么?",
          "correct": "你有兄弟吗",
          "options": [
            "出去玩",
            "做作业",
            "玩游戏",
            "你有兄弟吗"
          ]
        }
      },
      {
        "en": "Yes, a little brother.",
        "cn": "有,一个弟弟。",
        "scene_hint": "回答有",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "有,一个弟弟",
          "options": [
            "问今天星期几",
            "回家吃饭",
            "做作业",
            "有,一个弟弟"
          ]
        }
      },
      {
        "en": "How old is he?",
        "cn": "他几岁?",
        "scene_hint": "问年龄",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "他几岁?",
          "options": [
            "他几岁?",
            "拜访朋友",
            "做作业",
            "祝贺"
          ]
        }
      },
      {
        "en": "He's three years old.",
        "cn": "他三岁。",
        "scene_hint": "回答年龄",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "他三岁",
          "options": [
            "他三岁",
            "去学校",
            "睡觉了",
            "数数字"
          ]
        }
      },
      {
        "en": "He is so funny!",
        "cn": "他很搞笑!",
        "scene_hint": "描述性格",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "他很搞笑",
          "options": [
            "他很搞笑",
            "数数字",
            "介绍自己",
            "问现在几点"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "I ___ a brother.",
        "cn": "我有个兄弟。",
        "correct": "have",
        "options": [
          "have",
          "has",
          "having",
          "am"
        ]
      },
      {
        "sentence_with_blank": "How ___ is your sister?",
        "cn": "你姐姐几岁?",
        "correct": "old",
        "options": [
          "many",
          "much",
          "old",
          "tall"
        ]
      },
      {
        "sentence_with_blank": "He ___ three years old.",
        "cn": "他三岁。",
        "correct": "is",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ]
      }
    ]
  },
  "g2_l15": {
    "lesson_id": "g2_l15",
    "lesson_key": "What's for lunch? · 二年级第 15 课:午餐吃什么",
    "total_stages": 5,
    "stage1": [
      {
        "word": "lunch",
        "ipa": "/lʌntʃ/",
        "emoji": "🍱",
        "meaning_cn": "午餐",
        "example_en": "Eat lunch.",
        "example_cn": "吃午餐。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "午餐",
          "options": [
            "米饭",
            "鸡;鸡肉",
            "午餐",
            "交换"
          ]
        }
      },
      {
        "word": "sandwich",
        "ipa": "/ˈsænwɪtʃ/",
        "emoji": "🥪",
        "meaning_cn": "三明治",
        "example_en": "A ham sandwich.",
        "example_cn": "一个火腿三明治。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "三明治",
          "options": [
            "分享",
            "三明治",
            "鸡;鸡肉",
            "交换"
          ]
        }
      },
      {
        "word": "rice",
        "ipa": "/raɪs/",
        "emoji": "🍚",
        "meaning_cn": "米饭",
        "example_en": "Eat rice.",
        "example_cn": "吃米饭。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "米饭",
          "options": [
            "米饭",
            "午餐",
            "交换",
            "分享"
          ]
        }
      },
      {
        "word": "chicken",
        "ipa": "/ˈtʃɪkɪn/",
        "emoji": "🍗",
        "meaning_cn": "鸡;鸡肉",
        "example_en": "Chicken soup.",
        "example_cn": "鸡汤。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "鸡;鸡肉",
          "options": [
            "分享",
            "米饭",
            "鸡;鸡肉",
            "午餐"
          ]
        }
      },
      {
        "word": "share",
        "ipa": "/ʃer/",
        "emoji": "🤲",
        "meaning_cn": "分享",
        "example_en": "Share with me.",
        "example_cn": "和我分享。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "分享",
          "options": [
            "分享",
            "米饭",
            "交换",
            "午餐"
          ]
        }
      },
      {
        "word": "trade",
        "ipa": "/treɪd/",
        "emoji": "🔄",
        "meaning_cn": "交换",
        "example_en": "Let's trade.",
        "example_cn": "我们换。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "交换",
          "options": [
            "分享",
            "米饭",
            "鸡;鸡肉",
            "交换"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "lunch",
        "correct_emoji": "🍱",
        "options": [
          "🤲",
          "🍚",
          "🍱",
          "🔄"
        ]
      },
      {
        "audio_word": "sandwich",
        "correct_emoji": "🥪",
        "options": [
          "🍗",
          "🍱",
          "🤲",
          "🥪"
        ]
      },
      {
        "audio_word": "rice",
        "correct_emoji": "🍚",
        "options": [
          "🔄",
          "🤲",
          "🍚",
          "🍗"
        ]
      },
      {
        "audio_word": "chicken",
        "correct_emoji": "🍗",
        "options": [
          "🍗",
          "🔄",
          "🍱",
          "🥪"
        ]
      },
      {
        "audio_word": "share",
        "correct_emoji": "🤲",
        "options": [
          "🤲",
          "🍗",
          "🔄",
          "🍱"
        ]
      },
      {
        "audio_word": "trade",
        "correct_emoji": "🔄",
        "options": [
          "🍱",
          "🔄",
          "🍚",
          "🥪"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🍱",
        "correct_word": "lunch",
        "options": [
          "trade",
          "share",
          "chicken",
          "lunch"
        ]
      },
      {
        "image_emoji": "🥪",
        "correct_word": "sandwich",
        "options": [
          "trade",
          "chicken",
          "rice",
          "sandwich"
        ]
      },
      {
        "image_emoji": "🍚",
        "correct_word": "rice",
        "options": [
          "lunch",
          "share",
          "rice",
          "sandwich"
        ]
      },
      {
        "image_emoji": "🍗",
        "correct_word": "chicken",
        "options": [
          "trade",
          "chicken",
          "sandwich",
          "lunch"
        ]
      },
      {
        "image_emoji": "🤲",
        "correct_word": "share",
        "options": [
          "chicken",
          "share",
          "sandwich",
          "trade"
        ]
      },
      {
        "image_emoji": "🔄",
        "correct_word": "trade",
        "options": [
          "trade",
          "sandwich",
          "rice",
          "share"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What's in your lunch box?",
        "cn": "你饭盒里有什么?",
        "scene_hint": "问午餐",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "你饭盒里有什么",
          "options": [
            "你饭盒里有什么",
            "买东西",
            "玩游戏",
            "打招呼"
          ]
        }
      },
      {
        "en": "Sandwich and an apple.",
        "cn": "三明治和苹果。",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "三明治和苹果",
          "options": [
            "感谢别人",
            "读书",
            "三明治和苹果",
            "听音乐"
          ]
        }
      },
      {
        "en": "It smells good!",
        "cn": "闻起来真香!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "闻起来真香",
          "options": [
            "闻起来真香",
            "感谢别人",
            "看电视",
            "听音乐"
          ]
        }
      },
      {
        "en": "Want to share?",
        "cn": "要分享吗?",
        "scene_hint": "分享",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "要分享吗?",
          "options": [
            "要分享吗?",
            "数数字",
            "睡觉了",
            "玩游戏"
          ]
        }
      },
      {
        "en": "Let's trade!",
        "cn": "我们换换!",
        "scene_hint": "交换",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们换换",
          "options": [
            "我们换换",
            "问今天星期几",
            "看电视",
            "感谢别人"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ in your bag?",
        "cn": "你包里有什么?",
        "correct": "What's",
        "options": [
          "What",
          "What's",
          "Where",
          "How"
        ]
      },
      {
        "sentence_with_blank": "Let's ___ food!",
        "cn": "我们分享食物!",
        "correct": "share",
        "options": [
          "throw",
          "share",
          "buy",
          "lose"
        ]
      },
      {
        "sentence_with_blank": "It ___ good.",
        "cn": "闻起来真香。",
        "correct": "smells",
        "options": [
          "smell",
          "smells",
          "smelling",
          "smelled"
        ]
      }
    ]
  },
  "g2_l16": {
    "lesson_id": "g2_l16",
    "lesson_key": "Happy birthday! · 二年级第 16 课:生日快乐",
    "total_stages": 5,
    "stage1": [
      {
        "word": "birthday",
        "ipa": "/ˈbɜːrθdeɪ/",
        "emoji": "🎂",
        "meaning_cn": "生日",
        "example_en": "Happy birthday!",
        "example_cn": "生日快乐!",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "生日",
          "options": [
            "巧克力",
            "生日",
            "蛋糕",
            "愿望;希望"
          ]
        }
      },
      {
        "word": "cake",
        "ipa": "/keɪk/",
        "emoji": "🍰",
        "meaning_cn": "蛋糕",
        "example_en": "Birthday cake.",
        "example_cn": "生日蛋糕。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "蛋糕",
          "options": [
            "蛋糕",
            "愿望;希望",
            "吹",
            "蜡烛"
          ]
        }
      },
      {
        "word": "chocolate",
        "ipa": "/ˈtʃɒklət/",
        "emoji": "🍫",
        "meaning_cn": "巧克力",
        "example_en": "Chocolate cake.",
        "example_cn": "巧克力蛋糕。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "巧克力",
          "options": [
            "巧克力",
            "蛋糕",
            "愿望;希望",
            "吹"
          ]
        }
      },
      {
        "word": "wish",
        "ipa": "/wɪʃ/",
        "emoji": "🌠",
        "meaning_cn": "愿望;希望",
        "example_en": "Make a wish.",
        "example_cn": "许个愿。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "愿望;希望",
          "options": [
            "巧克力",
            "生日",
            "愿望;希望",
            "蛋糕"
          ]
        }
      },
      {
        "word": "candle",
        "ipa": "/ˈkændl/",
        "emoji": "🕯️",
        "meaning_cn": "蜡烛",
        "example_en": "Blow the candles.",
        "example_cn": "吹蜡烛。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "蜡烛",
          "options": [
            "巧克力",
            "蛋糕",
            "蜡烛",
            "吹"
          ]
        }
      },
      {
        "word": "blow",
        "ipa": "/bloʊ/",
        "emoji": "💨",
        "meaning_cn": "吹",
        "example_en": "Blow it out.",
        "example_cn": "吹灭它。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "吹",
          "options": [
            "愿望;希望",
            "巧克力",
            "吹",
            "蜡烛"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "birthday",
        "correct_emoji": "🎂",
        "options": [
          "🍫",
          "🎂",
          "🕯️",
          "💨"
        ]
      },
      {
        "audio_word": "cake",
        "correct_emoji": "🍰",
        "options": [
          "🕯️",
          "🌠",
          "🍫",
          "🍰"
        ]
      },
      {
        "audio_word": "chocolate",
        "correct_emoji": "🍫",
        "options": [
          "🍰",
          "🎂",
          "🍫",
          "🌠"
        ]
      },
      {
        "audio_word": "wish",
        "correct_emoji": "🌠",
        "options": [
          "💨",
          "🎂",
          "🌠",
          "🍰"
        ]
      },
      {
        "audio_word": "candle",
        "correct_emoji": "🕯️",
        "options": [
          "🕯️",
          "🍫",
          "💨",
          "🎂"
        ]
      },
      {
        "audio_word": "blow",
        "correct_emoji": "💨",
        "options": [
          "🌠",
          "🍰",
          "💨",
          "🕯️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🎂",
        "correct_word": "birthday",
        "options": [
          "chocolate",
          "birthday",
          "wish",
          "candle"
        ]
      },
      {
        "image_emoji": "🍰",
        "correct_word": "cake",
        "options": [
          "wish",
          "chocolate",
          "cake",
          "birthday"
        ]
      },
      {
        "image_emoji": "🍫",
        "correct_word": "chocolate",
        "options": [
          "candle",
          "chocolate",
          "wish",
          "birthday"
        ]
      },
      {
        "image_emoji": "🌠",
        "correct_word": "wish",
        "options": [
          "cake",
          "candle",
          "wish",
          "blow"
        ]
      },
      {
        "image_emoji": "🕯️",
        "correct_word": "candle",
        "options": [
          "candle",
          "wish",
          "chocolate",
          "birthday"
        ]
      },
      {
        "image_emoji": "💨",
        "correct_word": "blow",
        "options": [
          "chocolate",
          "blow",
          "cake",
          "birthday"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Happy birthday!",
        "cn": "生日快乐!",
        "scene_hint": "祝福",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "生日快乐",
          "options": [
            "出去玩",
            "说再见",
            "生日快乐",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "Wow, a chocolate cake!",
        "cn": "哇,巧克力蛋糕!",
        "scene_hint": "看到礼物",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "哇,巧克力蛋糕",
          "options": [
            "问今天星期几",
            "哇,巧克力蛋糕",
            "打招呼",
            "看电视"
          ]
        }
      },
      {
        "en": "Make a wish!",
        "cn": "许个愿!",
        "scene_hint": "传统",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "许个愿",
          "options": [
            "许个愿",
            "回家吃饭",
            "数数字",
            "做作业"
          ]
        }
      },
      {
        "en": "Blow out the candles!",
        "cn": "吹蜡烛!",
        "scene_hint": "动作",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "吹蜡烛",
          "options": [
            "数数字",
            "感谢别人",
            "吹蜡烛",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "Thank you, everyone!",
        "cn": "谢谢大家!",
        "scene_hint": "感谢",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "谢谢大家",
          "options": [
            "打招呼",
            "祝贺",
            "谢谢大家",
            "出去玩"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ birthday!",
        "cn": "生日快乐!",
        "correct": "Happy",
        "options": [
          "Have",
          "Happy",
          "Big",
          "New"
        ]
      },
      {
        "sentence_with_blank": "Make a ___!",
        "cn": "许个愿!",
        "correct": "wish",
        "options": [
          "wish",
          "cake",
          "song",
          "card"
        ]
      },
      {
        "sentence_with_blank": "I love ___ cake.",
        "cn": "我爱巧克力蛋糕。",
        "correct": "chocolate",
        "options": [
          "chocolate",
          "vanilla",
          "lemon",
          "rice"
        ]
      }
    ]
  },
  "g2_l17": {
    "lesson_id": "g2_l17",
    "lesson_key": "Look at the giraffe! · 二年级第 17 课:看长颈鹿",
    "total_stages": 5,
    "stage1": [
      {
        "word": "zoo",
        "ipa": "/zuː/",
        "emoji": "🦁",
        "meaning_cn": "动物园",
        "example_en": "Go to the zoo.",
        "example_cn": "去动物园。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "动物园",
          "options": [
            "高的",
            "树",
            "动物园",
            "长颈鹿"
          ]
        }
      },
      {
        "word": "giraffe",
        "ipa": "/dʒɪˈræf/",
        "emoji": "🦒",
        "meaning_cn": "长颈鹿",
        "example_en": "Tall giraffe.",
        "example_cn": "高高的长颈鹿。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "长颈鹿",
          "options": [
            "长颈鹿",
            "动物园",
            "叶子(复数)",
            "动物"
          ]
        }
      },
      {
        "word": "tall",
        "ipa": "/tɔːl/",
        "emoji": "📏",
        "meaning_cn": "高的",
        "example_en": "Very tall.",
        "example_cn": "非常高。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "高的",
          "options": [
            "叶子(复数)",
            "动物园",
            "高的",
            "动物"
          ]
        }
      },
      {
        "word": "tree",
        "ipa": "/triː/",
        "emoji": "🌳",
        "meaning_cn": "树",
        "example_en": "Tall trees.",
        "example_cn": "高树。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "树",
          "options": [
            "树",
            "叶子(复数)",
            "动物园",
            "高的"
          ]
        }
      },
      {
        "word": "leaves",
        "ipa": "/liːvz/",
        "emoji": "🍃",
        "meaning_cn": "叶子(复数)",
        "example_en": "Green leaves.",
        "example_cn": "绿叶子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "叶子(复数)",
          "options": [
            "动物园",
            "长颈鹿",
            "树",
            "叶子(复数)"
          ]
        }
      },
      {
        "word": "animal",
        "ipa": "/ˈænɪməl/",
        "emoji": "🐾",
        "meaning_cn": "动物",
        "example_en": "Wild animal.",
        "example_cn": "野生动物。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "动物",
          "options": [
            "动物园",
            "动物",
            "叶子(复数)",
            "树"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "zoo",
        "correct_emoji": "🦁",
        "options": [
          "🌳",
          "🍃",
          "🦁",
          "🦒"
        ]
      },
      {
        "audio_word": "giraffe",
        "correct_emoji": "🦒",
        "options": [
          "🦒",
          "🌳",
          "📏",
          "🦁"
        ]
      },
      {
        "audio_word": "tall",
        "correct_emoji": "📏",
        "options": [
          "🦒",
          "🌳",
          "🍃",
          "📏"
        ]
      },
      {
        "audio_word": "tree",
        "correct_emoji": "🌳",
        "options": [
          "📏",
          "🌳",
          "🦁",
          "🦒"
        ]
      },
      {
        "audio_word": "leaves",
        "correct_emoji": "🍃",
        "options": [
          "🍃",
          "📏",
          "🌳",
          "🦁"
        ]
      },
      {
        "audio_word": "animal",
        "correct_emoji": "🐾",
        "options": [
          "🐾",
          "🦒",
          "🦁",
          "🍃"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🦁",
        "correct_word": "zoo",
        "options": [
          "tree",
          "tall",
          "giraffe",
          "zoo"
        ]
      },
      {
        "image_emoji": "🦒",
        "correct_word": "giraffe",
        "options": [
          "leaves",
          "zoo",
          "giraffe",
          "animal"
        ]
      },
      {
        "image_emoji": "📏",
        "correct_word": "tall",
        "options": [
          "animal",
          "zoo",
          "giraffe",
          "tall"
        ]
      },
      {
        "image_emoji": "🌳",
        "correct_word": "tree",
        "options": [
          "zoo",
          "animal",
          "tree",
          "leaves"
        ]
      },
      {
        "image_emoji": "🍃",
        "correct_word": "leaves",
        "options": [
          "leaves",
          "animal",
          "zoo",
          "tall"
        ]
      },
      {
        "image_emoji": "🐾",
        "correct_word": "animal",
        "options": [
          "animal",
          "tall",
          "zoo",
          "giraffe"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Look! A giraffe!",
        "cn": "看!长颈鹿!",
        "scene_hint": "指认动物",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "看长颈鹿",
          "options": [
            "看长颈鹿",
            "感谢别人",
            "说再见",
            "听音乐"
          ]
        }
      },
      {
        "en": "It's so tall!",
        "cn": "它好高啊!",
        "scene_hint": "描述特征",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "它好高啊",
          "options": [
            "它好高啊",
            "感谢别人",
            "说再见",
            "数数字"
          ]
        }
      },
      {
        "en": "What do giraffes eat?",
        "cn": "长颈鹿吃什么?",
        "scene_hint": "问习性",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "长颈鹿吃什么",
          "options": [
            "玩游戏",
            "打招呼",
            "长颈鹿吃什么",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "They eat leaves.",
        "cn": "它们吃叶子。",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "它们吃叶子",
          "options": [
            "买东西",
            "去学校",
            "它们吃叶子",
            "感谢别人"
          ]
        }
      },
      {
        "en": "I want to be a giraffe!",
        "cn": "我想当长颈鹿!",
        "scene_hint": "想象",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我想当长颈鹿",
          "options": [
            "出去玩",
            "看电视",
            "回家吃饭",
            "我想当长颈鹿"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "A ___ has a long neck.",
        "cn": "长颈鹿脖子长。",
        "correct": "giraffe",
        "options": [
          "cat",
          "giraffe",
          "fish",
          "bird"
        ]
      },
      {
        "sentence_with_blank": "What ___ giraffes eat?",
        "cn": "长颈鹿吃什么?",
        "correct": "do",
        "options": [
          "do",
          "does",
          "is",
          "are"
        ]
      },
      {
        "sentence_with_blank": "Trees have ___.",
        "cn": "树有叶子。",
        "correct": "leaves",
        "options": [
          "water",
          "leaves",
          "rocks",
          "fire"
        ]
      }
    ]
  },
  "g2_l18": {
    "lesson_id": "g2_l18",
    "lesson_key": "My pet rabbit. · 二年级第 18 课:我的宠物兔",
    "total_stages": 5,
    "stage1": [
      {
        "word": "pet",
        "ipa": "/pet/",
        "emoji": "🐾",
        "meaning_cn": "宠物",
        "example_en": "My pet.",
        "example_cn": "我的宠物。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "宠物",
          "options": [
            "白色",
            "宠物",
            "生菜",
            "胡萝卜"
          ]
        }
      },
      {
        "word": "rabbit",
        "ipa": "/ˈræbɪt/",
        "emoji": "🐰",
        "meaning_cn": "兔子",
        "example_en": "Cute rabbit.",
        "example_cn": "可爱的兔子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "兔子",
          "options": [
            "名字",
            "白色",
            "兔子",
            "宠物"
          ]
        }
      },
      {
        "word": "white",
        "ipa": "/waɪt/",
        "emoji": "⬜",
        "meaning_cn": "白色",
        "example_en": "White rabbit.",
        "example_cn": "白兔子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "白色",
          "options": [
            "宠物",
            "名字",
            "兔子",
            "白色"
          ]
        }
      },
      {
        "word": "name",
        "ipa": "/neɪm/",
        "emoji": "🏷️",
        "meaning_cn": "名字",
        "example_en": "Her name.",
        "example_cn": "她的名字。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "名字",
          "options": [
            "名字",
            "兔子",
            "胡萝卜",
            "生菜"
          ]
        }
      },
      {
        "word": "carrot",
        "ipa": "/ˈkærət/",
        "emoji": "🥕",
        "meaning_cn": "胡萝卜",
        "example_en": "Eat carrots.",
        "example_cn": "吃胡萝卜。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "胡萝卜",
          "options": [
            "生菜",
            "宠物",
            "兔子",
            "胡萝卜"
          ]
        }
      },
      {
        "word": "lettuce",
        "ipa": "/ˈletɪs/",
        "emoji": "🥬",
        "meaning_cn": "生菜",
        "example_en": "Green lettuce.",
        "example_cn": "绿生菜。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "生菜",
          "options": [
            "生菜",
            "名字",
            "胡萝卜",
            "兔子"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "pet",
        "correct_emoji": "🐾",
        "options": [
          "🐾",
          "⬜",
          "🏷️",
          "🥬"
        ]
      },
      {
        "audio_word": "rabbit",
        "correct_emoji": "🐰",
        "options": [
          "🐾",
          "🏷️",
          "🥬",
          "🐰"
        ]
      },
      {
        "audio_word": "white",
        "correct_emoji": "⬜",
        "options": [
          "🥬",
          "⬜",
          "🏷️",
          "🐾"
        ]
      },
      {
        "audio_word": "name",
        "correct_emoji": "🏷️",
        "options": [
          "⬜",
          "🐾",
          "🏷️",
          "🥕"
        ]
      },
      {
        "audio_word": "carrot",
        "correct_emoji": "🥕",
        "options": [
          "🏷️",
          "⬜",
          "🥕",
          "🥬"
        ]
      },
      {
        "audio_word": "lettuce",
        "correct_emoji": "🥬",
        "options": [
          "🥬",
          "🏷️",
          "🐾",
          "⬜"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🐾",
        "correct_word": "pet",
        "options": [
          "carrot",
          "pet",
          "name",
          "lettuce"
        ]
      },
      {
        "image_emoji": "🐰",
        "correct_word": "rabbit",
        "options": [
          "name",
          "white",
          "rabbit",
          "pet"
        ]
      },
      {
        "image_emoji": "⬜",
        "correct_word": "white",
        "options": [
          "pet",
          "lettuce",
          "carrot",
          "white"
        ]
      },
      {
        "image_emoji": "🏷️",
        "correct_word": "name",
        "options": [
          "pet",
          "lettuce",
          "name",
          "rabbit"
        ]
      },
      {
        "image_emoji": "🥕",
        "correct_word": "carrot",
        "options": [
          "rabbit",
          "lettuce",
          "name",
          "carrot"
        ]
      },
      {
        "image_emoji": "🥬",
        "correct_word": "lettuce",
        "options": [
          "name",
          "pet",
          "lettuce",
          "carrot"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Do you have a pet?",
        "cn": "你有宠物吗?",
        "scene_hint": "问宠物",
        "quiz": {
          "question": "这句话在做什么?",
          "correct": "你有宠物吗",
          "options": [
            "感谢别人",
            "打招呼",
            "你有宠物吗",
            "听音乐"
          ]
        }
      },
      {
        "en": "Yes, a white rabbit.",
        "cn": "对,一只白兔。",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "对,一只白兔",
          "options": [
            "道歉",
            "问今天星期几",
            "对,一只白兔",
            "去学校"
          ]
        }
      },
      {
        "en": "Her name is Snowy.",
        "cn": "她叫雪雪。",
        "scene_hint": "介绍名字",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她叫雪雪",
          "options": [
            "她叫雪雪",
            "听音乐",
            "祝贺",
            "打招呼"
          ]
        }
      },
      {
        "en": "She loves carrots.",
        "cn": "她爱胡萝卜。",
        "scene_hint": "描述习性",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她爱胡萝卜",
          "options": [
            "问现在几点",
            "她爱胡萝卜",
            "读书",
            "买东西"
          ]
        }
      },
      {
        "en": "Can I come over to see her?",
        "cn": "我能去看她吗?",
        "scene_hint": "请求拜访",
        "quiz": {
          "question": "这句话在做什么?",
          "correct": "我能去看她吗",
          "options": [
            "看电视",
            "做作业",
            "问现在几点",
            "我能去看她吗"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "I have a ___ rabbit.",
        "cn": "我有只白兔。",
        "correct": "white",
        "options": [
          "red",
          "white",
          "blue",
          "green"
        ]
      },
      {
        "sentence_with_blank": "Her ___ is Snowy.",
        "cn": "她叫雪雪。",
        "correct": "name",
        "options": [
          "age",
          "name",
          "color",
          "house"
        ]
      },
      {
        "sentence_with_blank": "Rabbits love ___.",
        "cn": "兔子爱胡萝卜。",
        "correct": "carrots",
        "options": [
          "meat",
          "fish",
          "carrots",
          "candy"
        ]
      }
    ]
  },
  "g2_l19": {
    "lesson_id": "g2_l19",
    "lesson_key": "Two plus three. · 二年级第 19 课:数学课",
    "total_stages": 5,
    "stage1": [
      {
        "word": "math",
        "ipa": "/mæθ/",
        "emoji": "🧮",
        "meaning_cn": "数学",
        "example_en": "I love math.",
        "example_cn": "我爱数学。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "数学",
          "options": [
            "十",
            "星",
            "数学",
            "数字"
          ]
        }
      },
      {
        "word": "plus",
        "ipa": "/plʌs/",
        "emoji": "➕",
        "meaning_cn": "加",
        "example_en": "Two plus two.",
        "example_cn": "二加二。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "加",
          "options": [
            "加",
            "减",
            "数学",
            "星"
          ]
        }
      },
      {
        "word": "minus",
        "ipa": "/ˈmaɪnəs/",
        "emoji": "➖",
        "meaning_cn": "减",
        "example_en": "Five minus two.",
        "example_cn": "五减二。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "减",
          "options": [
            "星",
            "数学",
            "数字",
            "减"
          ]
        }
      },
      {
        "word": "number",
        "ipa": "/ˈnʌmbər/",
        "emoji": "🔢",
        "meaning_cn": "数字",
        "example_en": "Lucky number.",
        "example_cn": "幸运数字。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "数字",
          "options": [
            "十",
            "星",
            "加",
            "数字"
          ]
        }
      },
      {
        "word": "ten",
        "ipa": "/ten/",
        "emoji": "🔟",
        "meaning_cn": "十",
        "example_en": "Number ten.",
        "example_cn": "数字十。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "十",
          "options": [
            "星",
            "数字",
            "十",
            "数学"
          ]
        }
      },
      {
        "word": "star",
        "ipa": "/stɑːr/",
        "emoji": "⭐",
        "meaning_cn": "星",
        "example_en": "A math star.",
        "example_cn": "数学之星。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "星",
          "options": [
            "加",
            "十",
            "星",
            "减"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "math",
        "correct_emoji": "🧮",
        "options": [
          "🧮",
          "🔟",
          "⭐",
          "➕"
        ]
      },
      {
        "audio_word": "plus",
        "correct_emoji": "➕",
        "options": [
          "🧮",
          "➖",
          "🔟",
          "➕"
        ]
      },
      {
        "audio_word": "minus",
        "correct_emoji": "➖",
        "options": [
          "⭐",
          "🔟",
          "➖",
          "🔢"
        ]
      },
      {
        "audio_word": "number",
        "correct_emoji": "🔢",
        "options": [
          "➕",
          "⭐",
          "➖",
          "🔢"
        ]
      },
      {
        "audio_word": "ten",
        "correct_emoji": "🔟",
        "options": [
          "🔟",
          "➖",
          "🔢",
          "⭐"
        ]
      },
      {
        "audio_word": "star",
        "correct_emoji": "⭐",
        "options": [
          "🔟",
          "🧮",
          "⭐",
          "➕"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🧮",
        "correct_word": "math",
        "options": [
          "ten",
          "minus",
          "math",
          "plus"
        ]
      },
      {
        "image_emoji": "➕",
        "correct_word": "plus",
        "options": [
          "minus",
          "star",
          "plus",
          "ten"
        ]
      },
      {
        "image_emoji": "➖",
        "correct_word": "minus",
        "options": [
          "plus",
          "minus",
          "math",
          "number"
        ]
      },
      {
        "image_emoji": "🔢",
        "correct_word": "number",
        "options": [
          "number",
          "math",
          "plus",
          "ten"
        ]
      },
      {
        "image_emoji": "🔟",
        "correct_word": "ten",
        "options": [
          "math",
          "ten",
          "number",
          "star"
        ]
      },
      {
        "image_emoji": "⭐",
        "correct_word": "star",
        "options": [
          "plus",
          "minus",
          "ten",
          "star"
        ]
      }
    ],
    "stage4": [
      {
        "en": "What is two plus three?",
        "cn": "二加三等于几?",
        "scene_hint": "数学问题",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "二加三等于几",
          "options": [
            "感谢别人",
            "二加三等于几",
            "问现在几点",
            "买东西"
          ]
        }
      },
      {
        "en": "It's five!",
        "cn": "是五!",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "是五",
          "options": [
            "是五",
            "回家吃饭",
            "买东西",
            "去学校"
          ]
        }
      },
      {
        "en": "Great job!",
        "cn": "做得好!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "做得好",
          "options": [
            "做得好",
            "回家吃饭",
            "问现在几点",
            "数数字"
          ]
        }
      },
      {
        "en": "Try four plus six.",
        "cn": "试试四加六。",
        "scene_hint": "继续",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "试试四加六",
          "options": [
            "数数字",
            "看电视",
            "拜访朋友",
            "试试四加六"
          ]
        }
      },
      {
        "en": "You're a math star!",
        "cn": "你是数学之星!",
        "scene_hint": "鼓励",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "你是数学之星",
          "options": [
            "做作业",
            "数数字",
            "你是数学之星",
            "睡觉了"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "2 ___ 3 is 5.",
        "cn": "2 加 3 等于 5。",
        "correct": "plus",
        "options": [
          "minus",
          "plus",
          "times",
          "by"
        ]
      },
      {
        "sentence_with_blank": "What ___ 4 plus 6?",
        "cn": "4 加 6 等于几?",
        "correct": "is",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ]
      },
      {
        "sentence_with_blank": "You are a math ___!",
        "cn": "你是数学之星!",
        "correct": "star",
        "options": [
          "man",
          "boy",
          "star",
          "girl"
        ]
      }
    ]
  },
  "g2_l20": {
    "lesson_id": "g2_l20",
    "lesson_key": "Let's draw! · 二年级第 20 课:美术课",
    "total_stages": 5,
    "stage1": [
      {
        "word": "art",
        "ipa": "/ɑːrt/",
        "emoji": "🎨",
        "meaning_cn": "艺术",
        "example_en": "Art class.",
        "example_cn": "美术课。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "艺术",
          "options": [
            "艺术",
            "绿色",
            "紫色",
            "画"
          ]
        }
      },
      {
        "word": "draw",
        "ipa": "/drɔː/",
        "emoji": "✏️",
        "meaning_cn": "画",
        "example_en": "Draw a cat.",
        "example_cn": "画只猫。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "画",
          "options": [
            "绿色",
            "画",
            "有创意的",
            "紫色"
          ]
        }
      },
      {
        "word": "purple",
        "ipa": "/ˈpɜːrpl/",
        "emoji": "🟪",
        "meaning_cn": "紫色",
        "example_en": "Purple flowers.",
        "example_cn": "紫花。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "紫色",
          "options": [
            "紫色",
            "完成的",
            "有创意的",
            "绿色"
          ]
        }
      },
      {
        "word": "green",
        "ipa": "/ɡriːn/",
        "emoji": "🟩",
        "meaning_cn": "绿色",
        "example_en": "Green grass.",
        "example_cn": "绿草。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "绿色",
          "options": [
            "绿色",
            "画",
            "完成的",
            "有创意的"
          ]
        }
      },
      {
        "word": "creative",
        "ipa": "/kriˈeɪtɪv/",
        "emoji": "💡",
        "meaning_cn": "有创意的",
        "example_en": "Very creative.",
        "example_cn": "很有创意。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "有创意的",
          "options": [
            "有创意的",
            "画",
            "完成的",
            "绿色"
          ]
        }
      },
      {
        "word": "finished",
        "ipa": "/ˈfɪnɪʃt/",
        "emoji": "✅",
        "meaning_cn": "完成的",
        "example_en": "I'm finished.",
        "example_cn": "我完成了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "完成的",
          "options": [
            "有创意的",
            "完成的",
            "艺术",
            "紫色"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "art",
        "correct_emoji": "🎨",
        "options": [
          "✅",
          "🎨",
          "🟩",
          "✏️"
        ]
      },
      {
        "audio_word": "draw",
        "correct_emoji": "✏️",
        "options": [
          "✅",
          "💡",
          "🟪",
          "✏️"
        ]
      },
      {
        "audio_word": "purple",
        "correct_emoji": "🟪",
        "options": [
          "🎨",
          "🟪",
          "🟩",
          "💡"
        ]
      },
      {
        "audio_word": "green",
        "correct_emoji": "🟩",
        "options": [
          "🟩",
          "🟪",
          "✅",
          "🎨"
        ]
      },
      {
        "audio_word": "creative",
        "correct_emoji": "💡",
        "options": [
          "✅",
          "💡",
          "🟪",
          "✏️"
        ]
      },
      {
        "audio_word": "finished",
        "correct_emoji": "✅",
        "options": [
          "✅",
          "✏️",
          "🟩",
          "💡"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🎨",
        "correct_word": "art",
        "options": [
          "art",
          "draw",
          "purple",
          "green"
        ]
      },
      {
        "image_emoji": "✏️",
        "correct_word": "draw",
        "options": [
          "art",
          "creative",
          "draw",
          "finished"
        ]
      },
      {
        "image_emoji": "🟪",
        "correct_word": "purple",
        "options": [
          "creative",
          "purple",
          "green",
          "draw"
        ]
      },
      {
        "image_emoji": "🟩",
        "correct_word": "green",
        "options": [
          "draw",
          "art",
          "purple",
          "green"
        ]
      },
      {
        "image_emoji": "💡",
        "correct_word": "creative",
        "options": [
          "creative",
          "finished",
          "purple",
          "art"
        ]
      },
      {
        "image_emoji": "✅",
        "correct_word": "finished",
        "options": [
          "finished",
          "green",
          "purple",
          "art"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Let's draw your favorite animal!",
        "cn": "我们画你最爱的动物!",
        "scene_hint": "宣布任务",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们画你最爱的动物",
          "options": [
            "道歉",
            "问今天星期几",
            "我们画你最爱的动物",
            "出去玩"
          ]
        }
      },
      {
        "en": "I'll draw a purple cat!",
        "cn": "我画一只紫猫!",
        "scene_hint": "宣布选择",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我画一只紫猫",
          "options": [
            "说再见",
            "我画一只紫猫",
            "介绍自己",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "I'm drawing a green dog!",
        "cn": "我画绿色的狗!",
        "scene_hint": "宣布选择",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我画绿色的狗",
          "options": [
            "打招呼",
            "我画绿色的狗",
            "做作业",
            "去学校"
          ]
        }
      },
      {
        "en": "So creative!",
        "cn": "真有创意!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "真有创意",
          "options": [
            "感谢别人",
            "玩游戏",
            "真有创意",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "My picture is done!",
        "cn": "我画完了!",
        "scene_hint": "完成",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我画完了",
          "options": [
            "去学校",
            "祝贺",
            "我画完了",
            "拜访朋友"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "I ___ draw a cat.",
        "cn": "我将画一只猫。",
        "correct": "I'll",
        "options": [
          "am",
          "I'll",
          "is",
          "are"
        ]
      },
      {
        "sentence_with_blank": "I'm ___ a picture.",
        "cn": "我正在画图。",
        "correct": "drawing",
        "options": [
          "draw",
          "drew",
          "drawing",
          "to draw"
        ]
      },
      {
        "sentence_with_blank": "Your art is so ___!",
        "cn": "你的画真有创意!",
        "correct": "creative",
        "options": [
          "bad",
          "creative",
          "old",
          "small"
        ]
      }
    ]
  },
  "g2_l21": {
    "lesson_id": "g2_l21",
    "lesson_key": "How much is this? · 二年级第 21 课:多少钱?",
    "total_stages": 5,
    "stage1": [
      {
        "word": "buy",
        "ipa": "/baɪ/",
        "emoji": "🛒",
        "meaning_cn": "买",
        "example_en": "Buy a book.",
        "example_cn": "买本书。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "买",
          "options": [
            "零钱",
            "价格",
            "便宜的",
            "买"
          ]
        }
      },
      {
        "word": "store",
        "ipa": "/stɔːr/",
        "emoji": "🏪",
        "meaning_cn": "商店",
        "example_en": "Go to the store.",
        "example_cn": "去商店。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "商店",
          "options": [
            "价格",
            "零钱",
            "钱",
            "商店"
          ]
        }
      },
      {
        "word": "price",
        "ipa": "/praɪs/",
        "emoji": "💲",
        "meaning_cn": "价格",
        "example_en": "Good price.",
        "example_cn": "好价格。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "价格",
          "options": [
            "零钱",
            "便宜的",
            "价格",
            "商店"
          ]
        }
      },
      {
        "word": "money",
        "ipa": "/ˈmʌni/",
        "emoji": "💰",
        "meaning_cn": "钱",
        "example_en": "I have money.",
        "example_cn": "我有钱。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "钱",
          "options": [
            "钱",
            "买",
            "价格",
            "零钱"
          ]
        }
      },
      {
        "word": "change",
        "ipa": "/tʃeɪndʒ/",
        "emoji": "💴",
        "meaning_cn": "零钱",
        "example_en": "Your change.",
        "example_cn": "你的零钱。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "零钱",
          "options": [
            "便宜的",
            "零钱",
            "钱",
            "价格"
          ]
        }
      },
      {
        "word": "cheap",
        "ipa": "/tʃiːp/",
        "emoji": "🪙",
        "meaning_cn": "便宜的",
        "example_en": "Cheap toy.",
        "example_cn": "便宜的玩具。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "便宜的",
          "options": [
            "便宜的",
            "商店",
            "零钱",
            "价格"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "buy",
        "correct_emoji": "🛒",
        "options": [
          "💰",
          "🛒",
          "🪙",
          "💴"
        ]
      },
      {
        "audio_word": "store",
        "correct_emoji": "🏪",
        "options": [
          "🛒",
          "🏪",
          "💰",
          "💲"
        ]
      },
      {
        "audio_word": "price",
        "correct_emoji": "💲",
        "options": [
          "💲",
          "🛒",
          "🏪",
          "💴"
        ]
      },
      {
        "audio_word": "money",
        "correct_emoji": "💰",
        "options": [
          "💴",
          "💰",
          "🛒",
          "🏪"
        ]
      },
      {
        "audio_word": "change",
        "correct_emoji": "💴",
        "options": [
          "💴",
          "🛒",
          "💰",
          "🪙"
        ]
      },
      {
        "audio_word": "cheap",
        "correct_emoji": "🪙",
        "options": [
          "💰",
          "💲",
          "💴",
          "🪙"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🛒",
        "correct_word": "buy",
        "options": [
          "buy",
          "change",
          "price",
          "money"
        ]
      },
      {
        "image_emoji": "🏪",
        "correct_word": "store",
        "options": [
          "price",
          "cheap",
          "store",
          "change"
        ]
      },
      {
        "image_emoji": "💲",
        "correct_word": "price",
        "options": [
          "buy",
          "store",
          "price",
          "money"
        ]
      },
      {
        "image_emoji": "💰",
        "correct_word": "money",
        "options": [
          "store",
          "money",
          "change",
          "price"
        ]
      },
      {
        "image_emoji": "💴",
        "correct_word": "change",
        "options": [
          "cheap",
          "change",
          "store",
          "buy"
        ]
      },
      {
        "image_emoji": "🪙",
        "correct_word": "cheap",
        "options": [
          "money",
          "change",
          "store",
          "cheap"
        ]
      }
    ],
    "stage4": [
      {
        "en": "How much is this?",
        "cn": "这个多少钱?",
        "scene_hint": "问价",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "这个多少钱",
          "options": [
            "出去玩",
            "这个多少钱",
            "看电视",
            "说再见"
          ]
        }
      },
      {
        "en": "It's five dollars.",
        "cn": "5 美元。",
        "scene_hint": "回答价钱",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "5 美元",
          "options": [
            "5 美元",
            "做作业",
            "问今天星期几",
            "出去玩"
          ]
        }
      },
      {
        "en": "That's a good price.",
        "cn": "价钱不错。",
        "scene_hint": "评价价钱",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "价钱不错",
          "options": [
            "去学校",
            "拜访朋友",
            "价钱不错",
            "祝贺"
          ]
        }
      },
      {
        "en": "I'll take it!",
        "cn": "我要这个!",
        "scene_hint": "决定购买",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我要这个",
          "options": [
            "说再见",
            "我要这个",
            "读书",
            "道歉"
          ]
        }
      },
      {
        "en": "Here's your change.",
        "cn": "这是你的零钱。",
        "scene_hint": "找零",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "这是你的零钱",
          "options": [
            "玩游戏",
            "这是你的零钱",
            "道歉",
            "看电视"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "How ___ is this?",
        "cn": "这多少钱?",
        "correct": "much",
        "options": [
          "many",
          "much",
          "long",
          "old"
        ]
      },
      {
        "sentence_with_blank": "I'll ___ it!",
        "cn": "我要这个!",
        "correct": "take",
        "options": [
          "take",
          "give",
          "make",
          "see"
        ]
      },
      {
        "sentence_with_blank": "Here's your ___.",
        "cn": "这是你的零钱。",
        "correct": "change",
        "options": [
          "price",
          "change",
          "store",
          "color"
        ]
      }
    ]
  },
  "g2_l22": {
    "lesson_id": "g2_l22",
    "lesson_key": "I'd like a snack. · 二年级第 22 课:买零食",
    "total_stages": 5,
    "stage1": [
      {
        "word": "snack",
        "ipa": "/snæk/",
        "emoji": "🍿",
        "meaning_cn": "零食",
        "example_en": "Have a snack.",
        "example_cn": "吃个零食。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "零食",
          "options": [
            "糖果",
            "零食",
            "饼干",
            "种类"
          ]
        }
      },
      {
        "word": "cookie",
        "ipa": "/ˈkʊki/",
        "emoji": "🍪",
        "meaning_cn": "饼干",
        "example_en": "Chocolate cookie.",
        "example_cn": "巧克力饼干。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "饼干",
          "options": [
            "零食",
            "糖果",
            "饼干",
            "全部"
          ]
        }
      },
      {
        "word": "candy",
        "ipa": "/ˈkændi/",
        "emoji": "🍭",
        "meaning_cn": "糖果",
        "example_en": "Sweet candy.",
        "example_cn": "甜糖果。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "糖果",
          "options": [
            "糖果",
            "种类",
            "饮料;喝",
            "饼干"
          ]
        }
      },
      {
        "word": "drink",
        "ipa": "/drɪŋk/",
        "emoji": "🥤",
        "meaning_cn": "饮料;喝",
        "example_en": "Cold drink.",
        "example_cn": "冷饮。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "饮料;喝",
          "options": [
            "零食",
            "全部",
            "种类",
            "饮料;喝"
          ]
        }
      },
      {
        "word": "kind",
        "ipa": "/kaɪnd/",
        "emoji": "🏷️",
        "meaning_cn": "种类",
        "example_en": "What kind?",
        "example_cn": "什么种类?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "种类",
          "options": [
            "糖果",
            "种类",
            "饼干",
            "饮料;喝"
          ]
        }
      },
      {
        "word": "all",
        "ipa": "/ɔːl/",
        "emoji": "💯",
        "meaning_cn": "全部",
        "example_en": "That's all.",
        "example_cn": "就这些。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "全部",
          "options": [
            "糖果",
            "零食",
            "全部",
            "饮料;喝"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "snack",
        "correct_emoji": "🍿",
        "options": [
          "🍿",
          "🍭",
          "💯",
          "🥤"
        ]
      },
      {
        "audio_word": "cookie",
        "correct_emoji": "🍪",
        "options": [
          "🍪",
          "🍭",
          "🍿",
          "🏷️"
        ]
      },
      {
        "audio_word": "candy",
        "correct_emoji": "🍭",
        "options": [
          "🍿",
          "🏷️",
          "🥤",
          "🍭"
        ]
      },
      {
        "audio_word": "drink",
        "correct_emoji": "🥤",
        "options": [
          "🍪",
          "🥤",
          "💯",
          "🍿"
        ]
      },
      {
        "audio_word": "kind",
        "correct_emoji": "🏷️",
        "options": [
          "🏷️",
          "🍭",
          "💯",
          "🍿"
        ]
      },
      {
        "audio_word": "all",
        "correct_emoji": "💯",
        "options": [
          "🥤",
          "💯",
          "🏷️",
          "🍭"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🍿",
        "correct_word": "snack",
        "options": [
          "snack",
          "drink",
          "candy",
          "cookie"
        ]
      },
      {
        "image_emoji": "🍪",
        "correct_word": "cookie",
        "options": [
          "candy",
          "drink",
          "kind",
          "cookie"
        ]
      },
      {
        "image_emoji": "🍭",
        "correct_word": "candy",
        "options": [
          "snack",
          "cookie",
          "kind",
          "candy"
        ]
      },
      {
        "image_emoji": "🥤",
        "correct_word": "drink",
        "options": [
          "snack",
          "all",
          "kind",
          "drink"
        ]
      },
      {
        "image_emoji": "🏷️",
        "correct_word": "kind",
        "options": [
          "drink",
          "kind",
          "candy",
          "snack"
        ]
      },
      {
        "image_emoji": "💯",
        "correct_word": "all",
        "options": [
          "drink",
          "cookie",
          "snack",
          "all"
        ]
      }
    ],
    "stage4": [
      {
        "en": "I'd like a snack, please.",
        "cn": "我要个零食,谢谢。",
        "scene_hint": "点零食",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我要个零食,谢谢",
          "options": [
            "读书",
            "看电视",
            "我要个零食,谢谢",
            "回家吃饭"
          ]
        }
      },
      {
        "en": "What kind?",
        "cn": "什么样的?",
        "scene_hint": "确认",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "什么样的?",
          "options": [
            "什么样的?",
            "打招呼",
            "介绍自己",
            "问现在几点"
          ]
        }
      },
      {
        "en": "Some chocolate cookies.",
        "cn": "巧克力饼干。",
        "scene_hint": "具体说",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "巧克力饼干",
          "options": [
            "睡觉了",
            "回家吃饭",
            "巧克力饼干",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "Anything else?",
        "cn": "还要别的吗?",
        "scene_hint": "问还要什么",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "还要别的吗?",
          "options": [
            "还要别的吗?",
            "回家吃饭",
            "问今天星期几",
            "祝贺"
          ]
        }
      },
      {
        "en": "No, that's all. Thanks!",
        "cn": "不,就这些。谢谢!",
        "scene_hint": "结束",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "不,就这些。谢谢",
          "options": [
            "玩游戏",
            "不,就这些。谢谢",
            "做作业",
            "回家吃饭"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ like a snack.",
        "cn": "我想要零食。",
        "correct": "I'd",
        "options": [
          "I",
          "I'd",
          "I'll",
          "I'm"
        ]
      },
      {
        "sentence_with_blank": "Anything ___?",
        "cn": "还要别的吗?",
        "correct": "else",
        "options": [
          "else",
          "other",
          "all",
          "and"
        ]
      },
      {
        "sentence_with_blank": "That's ___.",
        "cn": "就这些。",
        "correct": "all",
        "options": [
          "all",
          "every",
          "any",
          "no"
        ]
      }
    ]
  },
  "g2_l23": {
    "lesson_id": "g2_l23",
    "lesson_key": "Spring is here! · 二年级第 23 课:春天来啦",
    "total_stages": 5,
    "stage1": [
      {
        "word": "spring",
        "ipa": "/sprɪŋ/",
        "emoji": "🌸",
        "meaning_cn": "春天",
        "example_en": "Spring is here.",
        "example_cn": "春天来了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "春天",
          "options": [
            "温暖的",
            "开花",
            "唱",
            "春天"
          ]
        }
      },
      {
        "word": "flower",
        "ipa": "/ˈflaʊər/",
        "emoji": "🌷",
        "meaning_cn": "花",
        "example_en": "Pretty flowers.",
        "example_cn": "漂亮的花。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "花",
          "options": [
            "在外面",
            "花",
            "开花",
            "唱"
          ]
        }
      },
      {
        "word": "bloom",
        "ipa": "/bluːm/",
        "emoji": "🌺",
        "meaning_cn": "开花",
        "example_en": "Flowers bloom.",
        "example_cn": "花开。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "开花",
          "options": [
            "温暖的",
            "花",
            "在外面",
            "开花"
          ]
        }
      },
      {
        "word": "sing",
        "ipa": "/sɪŋ/",
        "emoji": "🎤",
        "meaning_cn": "唱",
        "example_en": "Sing a song.",
        "example_cn": "唱歌。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "唱",
          "options": [
            "开花",
            "春天",
            "在外面",
            "唱"
          ]
        }
      },
      {
        "word": "warm",
        "ipa": "/wɔːrm/",
        "emoji": "🔥",
        "meaning_cn": "温暖的",
        "example_en": "Warm day.",
        "example_cn": "温暖的一天。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "温暖的",
          "options": [
            "唱",
            "温暖的",
            "花",
            "开花"
          ]
        }
      },
      {
        "word": "outside",
        "ipa": "/aʊtˈsaɪd/",
        "emoji": "🚪",
        "meaning_cn": "在外面",
        "example_en": "Play outside.",
        "example_cn": "在外面玩。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在外面",
          "options": [
            "春天",
            "唱",
            "温暖的",
            "在外面"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "spring",
        "correct_emoji": "🌸",
        "options": [
          "🌸",
          "🌷",
          "🔥",
          "🚪"
        ]
      },
      {
        "audio_word": "flower",
        "correct_emoji": "🌷",
        "options": [
          "🌺",
          "🚪",
          "🌷",
          "🔥"
        ]
      },
      {
        "audio_word": "bloom",
        "correct_emoji": "🌺",
        "options": [
          "🌷",
          "🔥",
          "🌸",
          "🌺"
        ]
      },
      {
        "audio_word": "sing",
        "correct_emoji": "🎤",
        "options": [
          "🌺",
          "🌷",
          "🔥",
          "🎤"
        ]
      },
      {
        "audio_word": "warm",
        "correct_emoji": "🔥",
        "options": [
          "🌸",
          "🚪",
          "🌷",
          "🔥"
        ]
      },
      {
        "audio_word": "outside",
        "correct_emoji": "🚪",
        "options": [
          "🔥",
          "🌸",
          "🚪",
          "🎤"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🌸",
        "correct_word": "spring",
        "options": [
          "spring",
          "flower",
          "bloom",
          "warm"
        ]
      },
      {
        "image_emoji": "🌷",
        "correct_word": "flower",
        "options": [
          "bloom",
          "flower",
          "spring",
          "sing"
        ]
      },
      {
        "image_emoji": "🌺",
        "correct_word": "bloom",
        "options": [
          "spring",
          "bloom",
          "flower",
          "sing"
        ]
      },
      {
        "image_emoji": "🎤",
        "correct_word": "sing",
        "options": [
          "sing",
          "bloom",
          "spring",
          "flower"
        ]
      },
      {
        "image_emoji": "🔥",
        "correct_word": "warm",
        "options": [
          "sing",
          "warm",
          "bloom",
          "spring"
        ]
      },
      {
        "image_emoji": "🚪",
        "correct_word": "outside",
        "options": [
          "bloom",
          "spring",
          "warm",
          "outside"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Spring is here!",
        "cn": "春天来了!",
        "scene_hint": "宣告",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "春天来了",
          "options": [
            "做作业",
            "介绍自己",
            "说再见",
            "春天来了"
          ]
        }
      },
      {
        "en": "The flowers are blooming.",
        "cn": "花在开。",
        "scene_hint": "描述",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "花在开",
          "options": [
            "去学校",
            "买东西",
            "回家吃饭",
            "花在开"
          ]
        }
      },
      {
        "en": "The birds are singing.",
        "cn": "鸟在唱。",
        "scene_hint": "描述",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "鸟在唱",
          "options": [
            "鸟在唱",
            "做作业",
            "玩游戏",
            "祝贺"
          ]
        }
      },
      {
        "en": "It's warm and sunny.",
        "cn": "温暖又晴朗。",
        "scene_hint": "描述天气",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "温暖又晴朗",
          "options": [
            "听音乐",
            "读书",
            "问现在几点",
            "温暖又晴朗"
          ]
        }
      },
      {
        "en": "Let's go play outside!",
        "cn": "我们去外面玩!",
        "scene_hint": "提议",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们去外面玩",
          "options": [
            "做作业",
            "打招呼",
            "去学校",
            "我们去外面玩"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ is here!",
        "cn": "春天来了!",
        "correct": "Spring",
        "options": [
          "Spring",
          "Winter",
          "Summer",
          "Fall"
        ]
      },
      {
        "sentence_with_blank": "Birds ___ in trees.",
        "cn": "鸟在树上唱。",
        "correct": "are singing",
        "options": [
          "sing",
          "are singing",
          "sang",
          "sung"
        ]
      },
      {
        "sentence_with_blank": "Warm ___ sunny.",
        "cn": "温暖又晴朗。",
        "correct": "and",
        "options": [
          "or",
          "and",
          "but",
          "with"
        ]
      }
    ]
  },
  "g2_l24": {
    "lesson_id": "g2_l24",
    "lesson_key": "Autumn leaves. · 二年级第 24 课:秋叶",
    "total_stages": 5,
    "stage1": [
      {
        "word": "autumn",
        "ipa": "/ˈɔːtəm/",
        "emoji": "🍂",
        "meaning_cn": "秋天",
        "example_en": "Autumn comes.",
        "example_cn": "秋天来了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "秋天",
          "options": [
            "落下",
            "黄色",
            "秋天",
            "橙色;橙子"
          ]
        }
      },
      {
        "word": "leaf",
        "ipa": "/liːf/",
        "emoji": "🍃",
        "meaning_cn": "叶子(单)",
        "example_en": "A green leaf.",
        "example_cn": "一片绿叶。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "叶子(单)",
          "options": [
            "叶子(单)",
            "秋天",
            "收集",
            "橙色;橙子"
          ]
        }
      },
      {
        "word": "fall",
        "ipa": "/fɔːl/",
        "emoji": "⬇️",
        "meaning_cn": "落下",
        "example_en": "Leaves fall.",
        "example_cn": "叶子落下。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "落下",
          "options": [
            "落下",
            "收集",
            "黄色",
            "叶子(单)"
          ]
        }
      },
      {
        "word": "orange",
        "ipa": "/ˈɔːrɪndʒ/",
        "emoji": "🍊",
        "meaning_cn": "橙色;橙子",
        "example_en": "Orange leaves.",
        "example_cn": "橙色的叶子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "橙色;橙子",
          "options": [
            "收集",
            "秋天",
            "叶子(单)",
            "橙色;橙子"
          ]
        }
      },
      {
        "word": "yellow",
        "ipa": "/ˈjeloʊ/",
        "emoji": "🟡",
        "meaning_cn": "黄色",
        "example_en": "Yellow flowers.",
        "example_cn": "黄花。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "黄色",
          "options": [
            "落下",
            "橙色;橙子",
            "叶子(单)",
            "黄色"
          ]
        }
      },
      {
        "word": "collect",
        "ipa": "/kəˈlekt/",
        "emoji": "🧺",
        "meaning_cn": "收集",
        "example_en": "Collect leaves.",
        "example_cn": "收集叶子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "收集",
          "options": [
            "秋天",
            "收集",
            "落下",
            "橙色;橙子"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "autumn",
        "correct_emoji": "🍂",
        "options": [
          "🍂",
          "🟡",
          "🍃",
          "🧺"
        ]
      },
      {
        "audio_word": "leaf",
        "correct_emoji": "🍃",
        "options": [
          "🍃",
          "🟡",
          "🍂",
          "🧺"
        ]
      },
      {
        "audio_word": "fall",
        "correct_emoji": "⬇️",
        "options": [
          "🍃",
          "🧺",
          "🟡",
          "⬇️"
        ]
      },
      {
        "audio_word": "orange",
        "correct_emoji": "🍊",
        "options": [
          "🟡",
          "⬇️",
          "🍃",
          "🍊"
        ]
      },
      {
        "audio_word": "yellow",
        "correct_emoji": "🟡",
        "options": [
          "🟡",
          "🍂",
          "⬇️",
          "🧺"
        ]
      },
      {
        "audio_word": "collect",
        "correct_emoji": "🧺",
        "options": [
          "🍊",
          "🍃",
          "🧺",
          "⬇️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🍂",
        "correct_word": "autumn",
        "options": [
          "leaf",
          "fall",
          "yellow",
          "autumn"
        ]
      },
      {
        "image_emoji": "🍃",
        "correct_word": "leaf",
        "options": [
          "fall",
          "yellow",
          "orange",
          "leaf"
        ]
      },
      {
        "image_emoji": "⬇️",
        "correct_word": "fall",
        "options": [
          "yellow",
          "fall",
          "leaf",
          "collect"
        ]
      },
      {
        "image_emoji": "🍊",
        "correct_word": "orange",
        "options": [
          "autumn",
          "orange",
          "fall",
          "leaf"
        ]
      },
      {
        "image_emoji": "🟡",
        "correct_word": "yellow",
        "options": [
          "leaf",
          "autumn",
          "fall",
          "yellow"
        ]
      },
      {
        "image_emoji": "🧺",
        "correct_word": "collect",
        "options": [
          "yellow",
          "fall",
          "orange",
          "collect"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Look at the autumn leaves!",
        "cn": "看秋叶!",
        "scene_hint": "感叹景色",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "看秋叶",
          "options": [
            "去学校",
            "看秋叶",
            "听音乐",
            "介绍自己"
          ]
        }
      },
      {
        "en": "They're red, yellow, and orange.",
        "cn": "它们红色、黄色、橙色。",
        "scene_hint": "描述颜色",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "它们红色、黄色、橙色",
          "options": [
            "祝贺",
            "出去玩",
            "它们红色、黄色、橙色",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "The leaves are falling.",
        "cn": "叶子在落。",
        "scene_hint": "现象",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "叶子在落",
          "options": [
            "叶子在落",
            "做作业",
            "回家吃饭",
            "说再见"
          ]
        }
      },
      {
        "en": "Let's collect some pretty ones.",
        "cn": "我们捡些漂亮的。",
        "scene_hint": "提议",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我们捡些漂亮的。",
          "options": [
            "问现在几点",
            "道歉",
            "听音乐",
            "我们捡些漂亮的。"
          ]
        }
      },
      {
        "en": "Autumn is beautiful!",
        "cn": "秋天很美!",
        "scene_hint": "感叹",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "秋天很美",
          "options": [
            "出去玩",
            "回家吃饭",
            "睡觉了",
            "秋天很美"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "Autumn ___ are pretty.",
        "cn": "秋叶很美。",
        "correct": "leaves",
        "options": [
          "leaf",
          "leafs",
          "leaves",
          "leafing"
        ]
      },
      {
        "sentence_with_blank": "Leaves ___ in autumn.",
        "cn": "秋天叶子落。",
        "correct": "fall",
        "options": [
          "fly",
          "fall",
          "fell",
          "swim"
        ]
      },
      {
        "sentence_with_blank": "Red, yellow, ___ orange.",
        "cn": "红、黄、橙。",
        "correct": "and",
        "options": [
          "or",
          "and",
          "but",
          "with"
        ]
      }
    ]
  },
  "g2_l25": {
    "lesson_id": "g2_l25",
    "lesson_key": "She has long hair. · 二年级第 25 课:她有长头发",
    "total_stages": 5,
    "stage1": [
      {
        "word": "hair",
        "ipa": "/her/",
        "emoji": "💇",
        "meaning_cn": "头发",
        "example_en": "Long hair.",
        "example_cn": "长头发。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "头发",
          "options": [
            "头发",
            "裙子;连衣裙",
            "棕色",
            "眼睛"
          ]
        }
      },
      {
        "word": "eye",
        "ipa": "/aɪ/",
        "emoji": "👁️",
        "meaning_cn": "眼睛",
        "example_en": "Two eyes.",
        "example_cn": "两只眼睛。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "眼睛",
          "options": [
            "眼睛",
            "棕色",
            "裙子;连衣裙",
            "头发"
          ]
        }
      },
      {
        "word": "long",
        "ipa": "/lɒŋ/",
        "emoji": "📏",
        "meaning_cn": "长的",
        "example_en": "Long hair.",
        "example_cn": "长头发。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "长的",
          "options": [
            "长的",
            "短的",
            "头发",
            "眼睛"
          ]
        }
      },
      {
        "word": "short",
        "ipa": "/ʃɔːrt/",
        "emoji": "🤏",
        "meaning_cn": "短的",
        "example_en": "Short hair.",
        "example_cn": "短头发。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "短的",
          "options": [
            "短的",
            "头发",
            "眼睛",
            "棕色"
          ]
        }
      },
      {
        "word": "brown",
        "ipa": "/braʊn/",
        "emoji": "🟫",
        "meaning_cn": "棕色",
        "example_en": "Brown eyes.",
        "example_cn": "棕色眼睛。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "棕色",
          "options": [
            "短的",
            "裙子;连衣裙",
            "棕色",
            "长的"
          ]
        }
      },
      {
        "word": "dress",
        "ipa": "/dres/",
        "emoji": "👗",
        "meaning_cn": "裙子;连衣裙",
        "example_en": "Pink dress.",
        "example_cn": "粉裙子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "裙子;连衣裙",
          "options": [
            "长的",
            "短的",
            "裙子;连衣裙",
            "头发"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "hair",
        "correct_emoji": "💇",
        "options": [
          "💇",
          "📏",
          "👁️",
          "🤏"
        ]
      },
      {
        "audio_word": "eye",
        "correct_emoji": "👁️",
        "options": [
          "📏",
          "💇",
          "👁️",
          "🟫"
        ]
      },
      {
        "audio_word": "long",
        "correct_emoji": "📏",
        "options": [
          "🤏",
          "👗",
          "📏",
          "💇"
        ]
      },
      {
        "audio_word": "short",
        "correct_emoji": "🤏",
        "options": [
          "🟫",
          "👗",
          "🤏",
          "👁️"
        ]
      },
      {
        "audio_word": "brown",
        "correct_emoji": "🟫",
        "options": [
          "👁️",
          "💇",
          "👗",
          "🟫"
        ]
      },
      {
        "audio_word": "dress",
        "correct_emoji": "👗",
        "options": [
          "👗",
          "🤏",
          "💇",
          "📏"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "💇",
        "correct_word": "hair",
        "options": [
          "short",
          "hair",
          "dress",
          "eye"
        ]
      },
      {
        "image_emoji": "👁️",
        "correct_word": "eye",
        "options": [
          "brown",
          "dress",
          "eye",
          "long"
        ]
      },
      {
        "image_emoji": "📏",
        "correct_word": "long",
        "options": [
          "brown",
          "long",
          "dress",
          "hair"
        ]
      },
      {
        "image_emoji": "🤏",
        "correct_word": "short",
        "options": [
          "hair",
          "short",
          "dress",
          "brown"
        ]
      },
      {
        "image_emoji": "🟫",
        "correct_word": "brown",
        "options": [
          "long",
          "brown",
          "short",
          "eye"
        ]
      },
      {
        "image_emoji": "👗",
        "correct_word": "dress",
        "options": [
          "eye",
          "long",
          "dress",
          "hair"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Look at that girl!",
        "cn": "看那个女孩!",
        "scene_hint": "指认",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "看那个女孩",
          "options": [
            "买东西",
            "读书",
            "问现在几点",
            "看那个女孩"
          ]
        }
      },
      {
        "en": "She has long hair.",
        "cn": "她有长头发。",
        "scene_hint": "描述",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她有长头发",
          "options": [
            "她有长头发",
            "玩游戏",
            "回家吃饭",
            "去学校"
          ]
        }
      },
      {
        "en": "And big brown eyes.",
        "cn": "还有大棕眼睛。",
        "scene_hint": "描述",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "还有大棕眼睛",
          "options": [
            "玩游戏",
            "感谢别人",
            "还有大棕眼睛",
            "去学校"
          ]
        }
      },
      {
        "en": "She's wearing a pink dress.",
        "cn": "她穿粉裙子。",
        "scene_hint": "穿着",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "她穿粉裙子",
          "options": [
            "道歉",
            "看电视",
            "她穿粉裙子",
            "买东西"
          ]
        }
      },
      {
        "en": "She looks happy!",
        "cn": "她看起来开心!",
        "scene_hint": "情绪",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "她看起来开心",
          "options": [
            "她看起来开心",
            "说再见",
            "买东西",
            "道歉"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "She ___ long hair.",
        "cn": "她有长头发。",
        "correct": "has",
        "options": [
          "have",
          "has",
          "is",
          "are"
        ]
      },
      {
        "sentence_with_blank": "Her eyes are ___.",
        "cn": "她眼睛是棕色。",
        "correct": "brown",
        "options": [
          "brown",
          "browns",
          "browning",
          "brownful"
        ]
      },
      {
        "sentence_with_blank": "She looks ___.",
        "cn": "她看起来开心。",
        "correct": "happy",
        "options": [
          "happily",
          "happy",
          "happiness",
          "happier"
        ]
      }
    ]
  },
  "g2_l26": {
    "lesson_id": "g2_l26",
    "lesson_key": "Rainbow colors. · 二年级第 26 课:彩虹的颜色",
    "total_stages": 5,
    "stage1": [
      {
        "word": "rainbow",
        "ipa": "/ˈreɪnboʊ/",
        "emoji": "🌈",
        "meaning_cn": "彩虹",
        "example_en": "Pretty rainbow.",
        "example_cn": "漂亮的彩虹。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "彩虹",
          "options": [
            "七",
            "靛色",
            "在...之后",
            "彩虹"
          ]
        }
      },
      {
        "word": "color",
        "ipa": "/ˈkʌlər/",
        "emoji": "🎨",
        "meaning_cn": "颜色",
        "example_en": "My favorite color.",
        "example_cn": "我最爱的颜色。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "颜色",
          "options": [
            "神奇的",
            "颜色",
            "靛色",
            "彩虹"
          ]
        }
      },
      {
        "word": "seven",
        "ipa": "/ˈsevən/",
        "emoji": "7️⃣",
        "meaning_cn": "七",
        "example_en": "Seven days.",
        "example_cn": "七天。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "七",
          "options": [
            "靛色",
            "颜色",
            "彩虹",
            "七"
          ]
        }
      },
      {
        "word": "indigo",
        "ipa": "/ˈɪndɪɡoʊ/",
        "emoji": "🔵",
        "meaning_cn": "靛色",
        "example_en": "Indigo blue.",
        "example_cn": "靛蓝。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "靛色",
          "options": [
            "颜色",
            "在...之后",
            "靛色",
            "彩虹"
          ]
        }
      },
      {
        "word": "magical",
        "ipa": "/ˈmædʒɪkəl/",
        "emoji": "✨",
        "meaning_cn": "神奇的",
        "example_en": "Magical place.",
        "example_cn": "神奇的地方。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "神奇的",
          "options": [
            "靛色",
            "彩虹",
            "神奇的",
            "颜色"
          ]
        }
      },
      {
        "word": "after",
        "ipa": "/ˈæftər/",
        "emoji": "⏭️",
        "meaning_cn": "在...之后",
        "example_en": "After rain.",
        "example_cn": "雨后。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "在...之后",
          "options": [
            "神奇的",
            "靛色",
            "在...之后",
            "颜色"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "rainbow",
        "correct_emoji": "🌈",
        "options": [
          "✨",
          "🔵",
          "🌈",
          "⏭️"
        ]
      },
      {
        "audio_word": "color",
        "correct_emoji": "🎨",
        "options": [
          "🌈",
          "🔵",
          "🎨",
          "⏭️"
        ]
      },
      {
        "audio_word": "seven",
        "correct_emoji": "7️⃣",
        "options": [
          "🎨",
          "7️⃣",
          "🔵",
          "🌈"
        ]
      },
      {
        "audio_word": "indigo",
        "correct_emoji": "🔵",
        "options": [
          "✨",
          "🔵",
          "⏭️",
          "🌈"
        ]
      },
      {
        "audio_word": "magical",
        "correct_emoji": "✨",
        "options": [
          "🎨",
          "🔵",
          "✨",
          "🌈"
        ]
      },
      {
        "audio_word": "after",
        "correct_emoji": "⏭️",
        "options": [
          "⏭️",
          "🎨",
          "✨",
          "🔵"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🌈",
        "correct_word": "rainbow",
        "options": [
          "after",
          "indigo",
          "color",
          "rainbow"
        ]
      },
      {
        "image_emoji": "🎨",
        "correct_word": "color",
        "options": [
          "magical",
          "rainbow",
          "after",
          "color"
        ]
      },
      {
        "image_emoji": "7️⃣",
        "correct_word": "seven",
        "options": [
          "magical",
          "rainbow",
          "seven",
          "color"
        ]
      },
      {
        "image_emoji": "🔵",
        "correct_word": "indigo",
        "options": [
          "after",
          "rainbow",
          "indigo",
          "color"
        ]
      },
      {
        "image_emoji": "✨",
        "correct_word": "magical",
        "options": [
          "magical",
          "seven",
          "rainbow",
          "color"
        ]
      },
      {
        "image_emoji": "⏭️",
        "correct_word": "after",
        "options": [
          "after",
          "magical",
          "rainbow",
          "indigo"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Look at the rainbow!",
        "cn": "看彩虹!",
        "scene_hint": "感叹",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "看彩虹",
          "options": [
            "看彩虹",
            "说再见",
            "去学校",
            "出去玩"
          ]
        }
      },
      {
        "en": "It has seven colors.",
        "cn": "它有七种颜色。",
        "scene_hint": "数量",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "它有七种颜色",
          "options": [
            "听音乐",
            "做作业",
            "祝贺",
            "它有七种颜色"
          ]
        }
      },
      {
        "en": "Red, orange, yellow, green...",
        "cn": "红、橙、黄、绿...",
        "scene_hint": "列举",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "红、橙、黄、绿...",
          "options": [
            "问现在几点",
            "红、橙、黄、绿...",
            "读书",
            "感谢别人"
          ]
        }
      },
      {
        "en": "Blue, indigo, and purple!",
        "cn": "蓝、靛、紫!",
        "scene_hint": "继续列举",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "蓝、靛、紫",
          "options": [
            "蓝、靛、紫",
            "感谢别人",
            "说再见",
            "买东西"
          ]
        }
      },
      {
        "en": "Rainbows are magical.",
        "cn": "彩虹是神奇的。",
        "scene_hint": "感叹",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "彩虹是神奇的",
          "options": [
            "数数字",
            "道歉",
            "彩虹是神奇的",
            "做作业"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "Rainbow ___ seven colors.",
        "cn": "彩虹有七色。",
        "correct": "has",
        "options": [
          "have",
          "has",
          "is",
          "are"
        ]
      },
      {
        "sentence_with_blank": "Red, orange, ___.",
        "cn": "红、橙、黄。",
        "correct": "yellow",
        "options": [
          "yellow",
          "white",
          "black",
          "brown"
        ]
      },
      {
        "sentence_with_blank": "Rainbows ___ magical.",
        "cn": "彩虹神奇。",
        "correct": "are",
        "options": [
          "is",
          "are",
          "am",
          "be"
        ]
      }
    ]
  },
  "g2_l27": {
    "lesson_id": "g2_l27",
    "lesson_key": "How do you feel? · 二年级第 27 课:你感觉怎样?",
    "total_stages": 5,
    "stage1": [
      {
        "word": "feel",
        "ipa": "/fiːl/",
        "emoji": "💭",
        "meaning_cn": "感觉",
        "example_en": "How do you feel?",
        "example_cn": "你怎么样?",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "感觉",
          "options": [
            "开心",
            "难过",
            "感觉",
            "害怕"
          ]
        }
      },
      {
        "word": "happy",
        "ipa": "/ˈhæpi/",
        "emoji": "😊",
        "meaning_cn": "开心",
        "example_en": "I'm happy.",
        "example_cn": "我开心。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "开心",
          "options": [
            "害怕",
            "感觉",
            "难过",
            "开心"
          ]
        }
      },
      {
        "word": "sad",
        "ipa": "/sæd/",
        "emoji": "😢",
        "meaning_cn": "难过",
        "example_en": "Don't be sad.",
        "example_cn": "别难过。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "难过",
          "options": [
            "难过",
            "累的",
            "开心",
            "生气"
          ]
        }
      },
      {
        "word": "tired",
        "ipa": "/ˈtaɪərd/",
        "emoji": "😴",
        "meaning_cn": "累的",
        "example_en": "I'm tired.",
        "example_cn": "我累了。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "累的",
          "options": [
            "累的",
            "难过",
            "感觉",
            "生气"
          ]
        }
      },
      {
        "word": "angry",
        "ipa": "/ˈæŋɡri/",
        "emoji": "😠",
        "meaning_cn": "生气",
        "example_en": "Don't be angry.",
        "example_cn": "别生气。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "生气",
          "options": [
            "难过",
            "害怕",
            "生气",
            "开心"
          ]
        }
      },
      {
        "word": "scared",
        "ipa": "/skerd/",
        "emoji": "😨",
        "meaning_cn": "害怕",
        "example_en": "I'm scared.",
        "example_cn": "我害怕。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "害怕",
          "options": [
            "生气",
            "害怕",
            "累的",
            "感觉"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "feel",
        "correct_emoji": "💭",
        "options": [
          "💭",
          "😴",
          "😨",
          "😢"
        ]
      },
      {
        "audio_word": "happy",
        "correct_emoji": "😊",
        "options": [
          "😠",
          "😢",
          "😊",
          "😴"
        ]
      },
      {
        "audio_word": "sad",
        "correct_emoji": "😢",
        "options": [
          "😊",
          "😴",
          "😢",
          "😨"
        ]
      },
      {
        "audio_word": "tired",
        "correct_emoji": "😴",
        "options": [
          "😴",
          "💭",
          "😊",
          "😨"
        ]
      },
      {
        "audio_word": "angry",
        "correct_emoji": "😠",
        "options": [
          "😠",
          "💭",
          "😨",
          "😴"
        ]
      },
      {
        "audio_word": "scared",
        "correct_emoji": "😨",
        "options": [
          "😨",
          "💭",
          "😢",
          "😴"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "💭",
        "correct_word": "feel",
        "options": [
          "tired",
          "feel",
          "scared",
          "angry"
        ]
      },
      {
        "image_emoji": "😊",
        "correct_word": "happy",
        "options": [
          "happy",
          "sad",
          "angry",
          "feel"
        ]
      },
      {
        "image_emoji": "😢",
        "correct_word": "sad",
        "options": [
          "tired",
          "feel",
          "sad",
          "scared"
        ]
      },
      {
        "image_emoji": "😴",
        "correct_word": "tired",
        "options": [
          "scared",
          "angry",
          "feel",
          "tired"
        ]
      },
      {
        "image_emoji": "😠",
        "correct_word": "angry",
        "options": [
          "feel",
          "tired",
          "happy",
          "angry"
        ]
      },
      {
        "image_emoji": "😨",
        "correct_word": "scared",
        "options": [
          "scared",
          "tired",
          "sad",
          "happy"
        ]
      }
    ],
    "stage4": [
      {
        "en": "How do you feel today?",
        "cn": "你今天感觉怎样?",
        "scene_hint": "问感受",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "你今天感觉怎样",
          "options": [
            "你今天感觉怎样",
            "做作业",
            "问今天星期几",
            "介绍自己"
          ]
        }
      },
      {
        "en": "I feel happy!",
        "cn": "我感觉开心!",
        "scene_hint": "回答",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我感觉开心",
          "options": [
            "感谢别人",
            "我感觉开心",
            "去学校",
            "数数字"
          ]
        }
      },
      {
        "en": "Why are you sad?",
        "cn": "你为什么难过?",
        "scene_hint": "问原因",
        "quiz": {
          "question": "这句话在问什么?",
          "correct": "你为什么难过",
          "options": [
            "问现在几点",
            "看电视",
            "听音乐",
            "你为什么难过"
          ]
        }
      },
      {
        "en": "I miss my friend.",
        "cn": "我想朋友。",
        "scene_hint": "解释",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "我想朋友",
          "options": [
            "睡觉了",
            "我想朋友",
            "道歉",
            "去学校"
          ]
        }
      },
      {
        "en": "Cheer up! Everything will be OK.",
        "cn": "振作!一切会好。",
        "scene_hint": "安慰",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "振作一切会好。",
          "options": [
            "睡觉了",
            "拜访朋友",
            "听音乐",
            "振作一切会好。"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "I ___ happy.",
        "cn": "我开心。",
        "correct": "feel",
        "options": [
          "feels",
          "feel",
          "feeling",
          "felt"
        ]
      },
      {
        "sentence_with_blank": "Don't be ___.",
        "cn": "别难过。",
        "correct": "sad",
        "options": [
          "sad",
          "sads",
          "sadly",
          "sadder"
        ]
      },
      {
        "sentence_with_blank": "Why ___ you angry?",
        "cn": "你为什么生气?",
        "correct": "are",
        "options": [
          "am",
          "is",
          "are",
          "be"
        ]
      }
    ]
  },
  "g2_l28": {
    "lesson_id": "g2_l28",
    "lesson_key": "Counting to 100. · 二年级第 28 课:数到 100",
    "total_stages": 5,
    "stage1": [
      {
        "word": "count",
        "ipa": "/kaʊnt/",
        "emoji": "🔢",
        "meaning_cn": "数",
        "example_en": "Count to 10.",
        "example_cn": "数到十。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "数",
          "options": [
            "五十",
            "数",
            "三十",
            "一百"
          ]
        }
      },
      {
        "word": "twenty",
        "ipa": "/ˈtwenti/",
        "emoji": "2️⃣0️⃣",
        "meaning_cn": "二十",
        "example_en": "Twenty fingers.",
        "example_cn": "二十个手指。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "二十",
          "options": [
            "二十",
            "三十",
            "一百",
            "五十"
          ]
        }
      },
      {
        "word": "thirty",
        "ipa": "/ˈθɜːrti/",
        "emoji": "3️⃣0️⃣",
        "meaning_cn": "三十",
        "example_en": "Thirty days.",
        "example_cn": "三十天。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "三十",
          "options": [
            "数字",
            "三十",
            "一百",
            "二十"
          ]
        }
      },
      {
        "word": "fifty",
        "ipa": "/ˈfɪfti/",
        "emoji": "5️⃣0️⃣",
        "meaning_cn": "五十",
        "example_en": "Fifty cents.",
        "example_cn": "五十分。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "五十",
          "options": [
            "一百",
            "五十",
            "三十",
            "数字"
          ]
        }
      },
      {
        "word": "hundred",
        "ipa": "/ˈhʌndrəd/",
        "emoji": "💯",
        "meaning_cn": "一百",
        "example_en": "One hundred.",
        "example_cn": "一百。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "一百",
          "options": [
            "五十",
            "一百",
            "数",
            "三十"
          ]
        }
      },
      {
        "word": "number",
        "ipa": "/ˈnʌmbər/",
        "emoji": "🔢",
        "meaning_cn": "数字",
        "example_en": "Big number.",
        "example_cn": "大数字。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "数字",
          "options": [
            "数字",
            "五十",
            "二十",
            "数"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "count",
        "correct_emoji": "🔢",
        "options": [
          "2️⃣0️⃣",
          "5️⃣0️⃣",
          "🔢",
          "💯"
        ]
      },
      {
        "audio_word": "twenty",
        "correct_emoji": "2️⃣0️⃣",
        "options": [
          "🔢",
          "2️⃣0️⃣",
          "5️⃣0️⃣",
          "💯"
        ]
      },
      {
        "audio_word": "thirty",
        "correct_emoji": "3️⃣0️⃣",
        "options": [
          "3️⃣0️⃣",
          "5️⃣0️⃣",
          "🔢",
          "💯"
        ]
      },
      {
        "audio_word": "fifty",
        "correct_emoji": "5️⃣0️⃣",
        "options": [
          "💯",
          "5️⃣0️⃣",
          "🔢",
          "3️⃣0️⃣"
        ]
      },
      {
        "audio_word": "hundred",
        "correct_emoji": "💯",
        "options": [
          "3️⃣0️⃣",
          "5️⃣0️⃣",
          "💯",
          "2️⃣0️⃣"
        ]
      },
      {
        "audio_word": "number",
        "correct_emoji": "🔢",
        "options": [
          "🔢",
          "5️⃣0️⃣",
          "3️⃣0️⃣",
          "💯"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🔢",
        "correct_word": "count",
        "options": [
          "number",
          "count",
          "fifty",
          "thirty"
        ]
      },
      {
        "image_emoji": "2️⃣0️⃣",
        "correct_word": "twenty",
        "options": [
          "twenty",
          "count",
          "thirty",
          "fifty"
        ]
      },
      {
        "image_emoji": "3️⃣0️⃣",
        "correct_word": "thirty",
        "options": [
          "hundred",
          "thirty",
          "fifty",
          "number"
        ]
      },
      {
        "image_emoji": "5️⃣0️⃣",
        "correct_word": "fifty",
        "options": [
          "count",
          "thirty",
          "hundred",
          "fifty"
        ]
      },
      {
        "image_emoji": "💯",
        "correct_word": "hundred",
        "options": [
          "hundred",
          "number",
          "count",
          "thirty"
        ]
      },
      {
        "image_emoji": "🔢",
        "correct_word": "number",
        "options": [
          "count",
          "hundred",
          "number",
          "fifty"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Can you count to 100?",
        "cn": "你能数到 100 吗?",
        "scene_hint": "挑战",
        "quiz": {
          "question": "这句话在做什么?",
          "correct": "你能数到 100 吗",
          "options": [
            "道歉",
            "你能数到 100 吗",
            "出去玩",
            "拜访朋友"
          ]
        }
      },
      {
        "en": "Sure! Ten, twenty, thirty...",
        "cn": "当然!十、二十、三十...",
        "scene_hint": "数数",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "当然十、二十、三十...",
          "options": [
            "数数字",
            "当然十、二十、三十...",
            "玩游戏",
            "问现在几点"
          ]
        }
      },
      {
        "en": "Forty, fifty, sixty...",
        "cn": "四十、五十、六十...",
        "scene_hint": "继续",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "四十、五十、六十...",
          "options": [
            "听音乐",
            "出去玩",
            "四十、五十、六十...",
            "介绍自己"
          ]
        }
      },
      {
        "en": "Seventy, eighty, ninety, one hundred!",
        "cn": "七十、八十、九十、一百!",
        "scene_hint": "完成",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "七十、八十、九十、一百",
          "options": [
            "七十、八十、九十、一百",
            "数数字",
            "问现在几点",
            "回家吃饭"
          ]
        }
      },
      {
        "en": "Great counting!",
        "cn": "数得好!",
        "scene_hint": "称赞",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "数得好",
          "options": [
            "买东西",
            "拜访朋友",
            "数得好",
            "数数字"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "Count ___ ten.",
        "cn": "数到十。",
        "correct": "to",
        "options": [
          "to",
          "for",
          "at",
          "of"
        ]
      },
      {
        "sentence_with_blank": "10 plus 10 is ___.",
        "cn": "10 加 10 是 20。",
        "correct": "twenty",
        "options": [
          "fifteen",
          "twenty",
          "thirty",
          "ten"
        ]
      },
      {
        "sentence_with_blank": "One ___ = 100.",
        "cn": "一百 = 100。",
        "correct": "hundred",
        "options": [
          "hundred",
          "thousand",
          "fifty",
          "ten"
        ]
      }
    ]
  },
  "g2_l29": {
    "lesson_id": "g2_l29",
    "lesson_key": "Merry Christmas! · 二年级第 29 课:圣诞快乐",
    "total_stages": 5,
    "stage1": [
      {
        "word": "Christmas",
        "ipa": "/ˈkrɪsməs/",
        "emoji": "🎄",
        "meaning_cn": "圣诞节",
        "example_en": "Merry Christmas.",
        "example_cn": "圣诞快乐。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "圣诞节",
          "options": [
            "打开",
            "圣诞老人",
            "圣诞节",
            "礼物"
          ]
        }
      },
      {
        "word": "merry",
        "ipa": "/ˈmeri/",
        "emoji": "🥳",
        "meaning_cn": "快乐的",
        "example_en": "Merry holiday.",
        "example_cn": "快乐节日。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "快乐的",
          "options": [
            "圣诞老人",
            "圣诞节",
            "礼物",
            "快乐的"
          ]
        }
      },
      {
        "word": "gift",
        "ipa": "/ɡɪft/",
        "emoji": "🎁",
        "meaning_cn": "礼物",
        "example_en": "A nice gift.",
        "example_cn": "一个好礼物。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "礼物",
          "options": [
            "打开",
            "圣诞老人",
            "礼物",
            "快乐的"
          ]
        }
      },
      {
        "word": "open",
        "ipa": "/ˈoʊpən/",
        "emoji": "📦",
        "meaning_cn": "打开",
        "example_en": "Open the box.",
        "example_cn": "打开盒子。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "打开",
          "options": [
            "礼物",
            "圣诞老人",
            "圣诞节",
            "打开"
          ]
        }
      },
      {
        "word": "tree",
        "ipa": "/triː/",
        "emoji": "🌳",
        "meaning_cn": "树",
        "example_en": "Christmas tree.",
        "example_cn": "圣诞树。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "树",
          "options": [
            "圣诞老人",
            "树",
            "礼物",
            "打开"
          ]
        }
      },
      {
        "word": "Santa",
        "ipa": "/ˈsæntə/",
        "emoji": "🎅",
        "meaning_cn": "圣诞老人",
        "example_en": "Santa Claus.",
        "example_cn": "圣诞老人。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "圣诞老人",
          "options": [
            "打开",
            "快乐的",
            "圣诞老人",
            "礼物"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "Christmas",
        "correct_emoji": "🎄",
        "options": [
          "📦",
          "🌳",
          "🎄",
          "🥳"
        ]
      },
      {
        "audio_word": "merry",
        "correct_emoji": "🥳",
        "options": [
          "📦",
          "🥳",
          "🌳",
          "🎅"
        ]
      },
      {
        "audio_word": "gift",
        "correct_emoji": "🎁",
        "options": [
          "🎄",
          "📦",
          "🎅",
          "🎁"
        ]
      },
      {
        "audio_word": "open",
        "correct_emoji": "📦",
        "options": [
          "🎁",
          "🎄",
          "🥳",
          "📦"
        ]
      },
      {
        "audio_word": "tree",
        "correct_emoji": "🌳",
        "options": [
          "🎁",
          "🌳",
          "🎄",
          "🥳"
        ]
      },
      {
        "audio_word": "Santa",
        "correct_emoji": "🎅",
        "options": [
          "🌳",
          "🎅",
          "🥳",
          "📦"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🎄",
        "correct_word": "Christmas",
        "options": [
          "open",
          "Christmas",
          "tree",
          "Santa"
        ]
      },
      {
        "image_emoji": "🥳",
        "correct_word": "merry",
        "options": [
          "Christmas",
          "Santa",
          "gift",
          "merry"
        ]
      },
      {
        "image_emoji": "🎁",
        "correct_word": "gift",
        "options": [
          "gift",
          "Santa",
          "tree",
          "merry"
        ]
      },
      {
        "image_emoji": "📦",
        "correct_word": "open",
        "options": [
          "merry",
          "gift",
          "open",
          "Christmas"
        ]
      },
      {
        "image_emoji": "🌳",
        "correct_word": "tree",
        "options": [
          "gift",
          "Christmas",
          "merry",
          "tree"
        ]
      },
      {
        "image_emoji": "🎅",
        "correct_word": "Santa",
        "options": [
          "Christmas",
          "tree",
          "open",
          "Santa"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Merry Christmas!",
        "cn": "圣诞快乐!",
        "scene_hint": "祝福",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "圣诞快乐",
          "options": [
            "圣诞快乐",
            "听音乐",
            "问今天星期几",
            "做作业"
          ]
        }
      },
      {
        "en": "This is for you.",
        "cn": "这是给你的。",
        "scene_hint": "送礼",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "这是给你的",
          "options": [
            "说再见",
            "问今天星期几",
            "这是给你的",
            "出去玩"
          ]
        }
      },
      {
        "en": "Thank you so much!",
        "cn": "非常感谢!",
        "scene_hint": "感谢",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "非常感谢",
          "options": [
            "读书",
            "玩游戏",
            "拜访朋友",
            "非常感谢"
          ]
        }
      },
      {
        "en": "Open it and see!",
        "cn": "打开看看!",
        "scene_hint": "邀请",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "打开看看",
          "options": [
            "打开看看",
            "去学校",
            "介绍自己",
            "回家吃饭"
          ]
        }
      },
      {
        "en": "I love it!",
        "cn": "我超喜欢!",
        "scene_hint": "高兴",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我超喜欢",
          "options": [
            "问现在几点",
            "我超喜欢",
            "祝贺",
            "听音乐"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ Christmas!",
        "cn": "圣诞快乐!",
        "correct": "Merry",
        "options": [
          "Happy",
          "Merry",
          "Good",
          "Big"
        ]
      },
      {
        "sentence_with_blank": "This is ___ you.",
        "cn": "这是给你的。",
        "correct": "for",
        "options": [
          "for",
          "to",
          "of",
          "at"
        ]
      },
      {
        "sentence_with_blank": "I ___ it!",
        "cn": "我超爱!",
        "correct": "love",
        "options": [
          "like",
          "love",
          "miss",
          "see"
        ]
      }
    ]
  },
  "g2_l30": {
    "lesson_id": "g2_l30",
    "lesson_key": "Happy Chinese New Year! · 二年级第 30 课:春节快乐",
    "total_stages": 5,
    "stage1": [
      {
        "word": "new",
        "ipa": "/njuː/",
        "emoji": "🆕",
        "meaning_cn": "新的",
        "example_en": "New year.",
        "example_cn": "新年。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "新的",
          "options": [
            "新的",
            "幸运的",
            "年",
            "红色"
          ]
        }
      },
      {
        "word": "year",
        "ipa": "/jɪr/",
        "emoji": "🗓️",
        "meaning_cn": "年",
        "example_en": "Happy year.",
        "example_cn": "快乐的一年。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "年",
          "options": [
            "信封",
            "家",
            "年",
            "幸运的"
          ]
        }
      },
      {
        "word": "red",
        "ipa": "/red/",
        "emoji": "🟥",
        "meaning_cn": "红色",
        "example_en": "Red envelope.",
        "example_cn": "红包。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "红色",
          "options": [
            "红色",
            "新的",
            "年",
            "家"
          ]
        }
      },
      {
        "word": "envelope",
        "ipa": "/ˈenvəloʊp/",
        "emoji": "🧧",
        "meaning_cn": "信封",
        "example_en": "Red envelope.",
        "example_cn": "红包。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "信封",
          "options": [
            "幸运的",
            "信封",
            "家",
            "新的"
          ]
        }
      },
      {
        "word": "lucky",
        "ipa": "/ˈlʌki/",
        "emoji": "🍀",
        "meaning_cn": "幸运的",
        "example_en": "Lucky money.",
        "example_cn": "幸运钱。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "幸运的",
          "options": [
            "家",
            "信封",
            "年",
            "幸运的"
          ]
        }
      },
      {
        "word": "family",
        "ipa": "/ˈfæməli/",
        "emoji": "👨‍👩‍👧‍👦",
        "meaning_cn": "家",
        "example_en": "My family.",
        "example_cn": "我的家。",
        "quiz": {
          "question": "这个词什么意思?",
          "correct": "家",
          "options": [
            "新的",
            "年",
            "家",
            "幸运的"
          ]
        }
      }
    ],
    "stage2": [
      {
        "audio_word": "new",
        "correct_emoji": "🆕",
        "options": [
          "🆕",
          "🗓️",
          "🧧",
          "🟥"
        ]
      },
      {
        "audio_word": "year",
        "correct_emoji": "🗓️",
        "options": [
          "👨‍👩‍👧‍👦",
          "🟥",
          "🍀",
          "🗓️"
        ]
      },
      {
        "audio_word": "red",
        "correct_emoji": "🟥",
        "options": [
          "👨‍👩‍👧‍👦",
          "🧧",
          "🟥",
          "🆕"
        ]
      },
      {
        "audio_word": "envelope",
        "correct_emoji": "🧧",
        "options": [
          "🍀",
          "👨‍👩‍👧‍👦",
          "🧧",
          "🟥"
        ]
      },
      {
        "audio_word": "lucky",
        "correct_emoji": "🍀",
        "options": [
          "👨‍👩‍👧‍👦",
          "🧧",
          "🍀",
          "🆕"
        ]
      },
      {
        "audio_word": "family",
        "correct_emoji": "👨‍👩‍👧‍👦",
        "options": [
          "👨‍👩‍👧‍👦",
          "🆕",
          "🍀",
          "🗓️"
        ]
      }
    ],
    "stage3": [
      {
        "image_emoji": "🆕",
        "correct_word": "new",
        "options": [
          "lucky",
          "year",
          "envelope",
          "new"
        ]
      },
      {
        "image_emoji": "🗓️",
        "correct_word": "year",
        "options": [
          "new",
          "lucky",
          "envelope",
          "year"
        ]
      },
      {
        "image_emoji": "🟥",
        "correct_word": "red",
        "options": [
          "red",
          "year",
          "family",
          "envelope"
        ]
      },
      {
        "image_emoji": "🧧",
        "correct_word": "envelope",
        "options": [
          "envelope",
          "new",
          "lucky",
          "year"
        ]
      },
      {
        "image_emoji": "🍀",
        "correct_word": "lucky",
        "options": [
          "red",
          "new",
          "envelope",
          "lucky"
        ]
      },
      {
        "image_emoji": "👨‍👩‍👧‍👦",
        "correct_word": "family",
        "options": [
          "family",
          "new",
          "year",
          "red"
        ]
      }
    ],
    "stage4": [
      {
        "en": "Happy Chinese New Year!",
        "cn": "春节快乐!",
        "scene_hint": "祝福",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "春节快乐",
          "options": [
            "说再见",
            "问今天星期几",
            "春节快乐",
            "去学校"
          ]
        }
      },
      {
        "en": "I love New Year!",
        "cn": "我爱新年!",
        "scene_hint": "表达",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "我爱新年",
          "options": [
            "听音乐",
            "睡觉了",
            "我爱新年",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "Here's a red envelope.",
        "cn": "给你红包。",
        "scene_hint": "送红包",
        "quiz": {
          "question": "这句话在说什么?",
          "correct": "给你红包",
          "options": [
            "祝贺",
            "睡觉了",
            "给你红包",
            "出去玩"
          ]
        }
      },
      {
        "en": "Thank you, Grandma!",
        "cn": "谢谢奶奶!",
        "scene_hint": "感谢",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "谢谢奶奶",
          "options": [
            "道歉",
            "谢谢奶奶",
            "说再见",
            "问今天星期几"
          ]
        }
      },
      {
        "en": "May you have a great year!",
        "cn": "愿你有个好年!",
        "scene_hint": "祝愿",
        "quiz": {
          "question": "这句话在表达什么?",
          "correct": "愿你有个好年",
          "options": [
            "打招呼",
            "数数字",
            "介绍自己",
            "愿你有个好年"
          ]
        }
      }
    ],
    "stage5": [
      {
        "sentence_with_blank": "___ New Year!",
        "cn": "新年快乐!",
        "correct": "Happy",
        "options": [
          "Merry",
          "Happy",
          "Good",
          "Big"
        ]
      },
      {
        "sentence_with_blank": "Here's a ___ envelope.",
        "cn": "这是红包。",
        "correct": "red",
        "options": [
          "red",
          "blue",
          "green",
          "yellow"
        ]
      },
      {
        "sentence_with_blank": "May you ___ happy.",
        "cn": "祝你快乐。",
        "correct": "be",
        "options": [
          "am",
          "be",
          "is",
          "are"
        ]
      }
    ]
  }
};


/** 检查 lesson_id 是否有 stages 数据 */
export function hasStagesData(lessonId: string): boolean {
  return lessonId in G2_ALL_LESSON_STAGES;
}

/** 通过 lesson_key 找 stages */
export function getStagesByKey(lessonKey: string): LessonStages | null {
  for (const lid in G2_ALL_LESSON_STAGES) {
    if (G2_ALL_LESSON_STAGES[lid].lesson_key === lessonKey) {
      return G2_ALL_LESSON_STAGES[lid];
    }
  }
  return null;
}

/** lesson_key → lesson_id 映射 */
export const LESSON_KEY_TO_ID: Record<string, string> = {
  "How's the weather today? · 二年级第 1 课:今天天气怎样": "g2_l01",
  "It's raining outside. · 二年级第 2 课:外面在下雨": "g2_l02",
  "What time is it? · 二年级第 3 课:几点了?": "g2_l03",
  "What day is today? · 二年级第 4 课:今天星期几": "g2_l04",
  "What are you wearing? · 二年级第 5 课:你穿什么?": "g2_l05",
  "Welcome to my room. · 二年级第 6 课:欢迎来我房间": "g2_l06",
  "What's your hobby? · 二年级第 7 课:你的爱好是什么?": "g2_l07",
  "Let's play soccer! · 二年级第 8 课:一起踢足球": "g2_l08",
  "My mom is a doctor. · 二年级第 9 课:我妈妈是医生": "g2_l09",
  "Let's take the bus. · 二年级第 10 课:我们坐公交": "g2_l10",
  "Hello, Grandma! · 二年级第 11 课:打电话给奶奶": "g2_l11",
  "What's wrong? · 二年级第 12 课:去看医生": "g2_l12",
  "Can I help you? · 二年级第 13 课:帮妈妈做家务": "g2_l13",
  "I have a little brother. · 二年级第 14 课:我有个弟弟": "g2_l14",
  "What's for lunch? · 二年级第 15 课:午餐吃什么": "g2_l15",
  "Happy birthday! · 二年级第 16 课:生日快乐": "g2_l16",
  "Look at the giraffe! · 二年级第 17 课:看长颈鹿": "g2_l17",
  "My pet rabbit. · 二年级第 18 课:我的宠物兔": "g2_l18",
  "Two plus three. · 二年级第 19 课:数学课": "g2_l19",
  "Let's draw! · 二年级第 20 课:美术课": "g2_l20",
  "How much is this? · 二年级第 21 课:多少钱?": "g2_l21",
  "I'd like a snack. · 二年级第 22 课:买零食": "g2_l22",
  "Spring is here! · 二年级第 23 课:春天来啦": "g2_l23",
  "Autumn leaves. · 二年级第 24 课:秋叶": "g2_l24",
  "She has long hair. · 二年级第 25 课:她有长头发": "g2_l25",
  "Rainbow colors. · 二年级第 26 课:彩虹的颜色": "g2_l26",
  "How do you feel? · 二年级第 27 课:你感觉怎样?": "g2_l27",
  "Counting to 100. · 二年级第 28 课:数到 100": "g2_l28",
  "Merry Christmas! · 二年级第 29 课:圣诞快乐": "g2_l29",
  "Happy Chinese New Year! · 二年级第 30 课:春节快乐": "g2_l30",
};
