// scripts/enrichPrimaryVocab.mjs
// 一次性数据迁移：给 3/5/6 年级词汇补「英式音标 + 贴切 emoji」。
// 只更新 vocabulary[].emoji（覆盖，因旧值多为占位/错误）并在缺省时补 phonetic（插在 emoji 后）。
// 绝不改 en / cn / 其它字段。幂等：可重复运行。
// 用法（项目根目录）：node scripts/enrichPrimaryVocab.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ENRICH = {
  "afraid": {
    "emoji": "😨",
    "phonetic": "/əˈfreɪd/"
  },
  "ago": {
    "emoji": "⏪",
    "phonetic": "/əˈɡəʊ/"
  },
  "angry": {
    "emoji": "😠",
    "phonetic": "/ˈæŋɡri/"
  },
  "apple": {
    "emoji": "🍎",
    "phonetic": "/ˈæpl/"
  },
  "April": {
    "emoji": "📅",
    "phonetic": "/ˈeɪprəl/"
  },
  "arm": {
    "emoji": "💪",
    "phonetic": "/ɑːm/"
  },
  "ate": {
    "emoji": "🍽️",
    "phonetic": "/et/"
  },
  "August": {
    "emoji": "📅",
    "phonetic": "/ˈɔːɡəst/"
  },
  "autumn": {
    "emoji": "🍂",
    "phonetic": "/ˈɔːtəm/"
  },
  "badminton": {
    "emoji": "🏸",
    "phonetic": "/ˈbædmɪntən/"
  },
  "bag": {
    "emoji": "🎒",
    "phonetic": "/bæɡ/"
  },
  "ball": {
    "emoji": "⚽",
    "phonetic": "/bɔːl/"
  },
  "banana": {
    "emoji": "🍌",
    "phonetic": "/bəˈnɑːnə/"
  },
  "bear": {
    "emoji": "🐻",
    "phonetic": "/beə/"
  },
  "big": {
    "emoji": "🐘",
    "phonetic": "/bɪɡ/"
  },
  "bigger": {
    "emoji": "🔺",
    "phonetic": "/ˈbɪɡə/"
  },
  "bike": {
    "emoji": "🚲",
    "phonetic": "/baɪk/"
  },
  "bird": {
    "emoji": "🐦",
    "phonetic": "/bɜːd/"
  },
  "black": {
    "emoji": "⚫",
    "phonetic": "/blæk/"
  },
  "blue": {
    "emoji": "🔵",
    "phonetic": "/bluː/"
  },
  "book": {
    "emoji": "📖",
    "phonetic": "/bʊk/"
  },
  "bookstore": {
    "emoji": "📚",
    "phonetic": "/ˈbʊkstɔː/"
  },
  "bottle": {
    "emoji": "🍼",
    "phonetic": "/ˈbɒtl/"
  },
  "bread": {
    "emoji": "🍞",
    "phonetic": "/bred/"
  },
  "bridge": {
    "emoji": "🌉",
    "phonetic": "/brɪdʒ/"
  },
  "brother": {
    "emoji": "👦",
    "phonetic": "/ˈbrʌðə/"
  },
  "brown": {
    "emoji": "🟤",
    "phonetic": "/braʊn/"
  },
  "building": {
    "emoji": "🏢",
    "phonetic": "/ˈbɪldɪŋ/"
  },
  "bus": {
    "emoji": "🚌",
    "phonetic": "/bʌs/"
  },
  "businessman": {
    "emoji": "💼",
    "phonetic": "/ˈbɪznəsmæn/"
  },
  "buy": {
    "emoji": "🛒",
    "phonetic": "/baɪ/"
  },
  "by": {
    "emoji": "🚗",
    "phonetic": "/baɪ/"
  },
  "cake": {
    "emoji": "🎂",
    "phonetic": "/keɪk/"
  },
  "camp": {
    "emoji": "⛺",
    "phonetic": "/kæmp/"
  },
  "Canada": {
    "emoji": "🇨🇦",
    "phonetic": "/ˈkænədə/"
  },
  "Canberra": {
    "emoji": "🏛️",
    "phonetic": "/ˈkænbərə/"
  },
  "cap": {
    "emoji": "🧢",
    "phonetic": "/kæp/"
  },
  "car": {
    "emoji": "🚗",
    "phonetic": "/kɑː/"
  },
  "cat": {
    "emoji": "🐱",
    "phonetic": "/kæt/"
  },
  "chair": {
    "emoji": "🪑",
    "phonetic": "/tʃeə/"
  },
  "China": {
    "emoji": "🇨🇳",
    "phonetic": "/ˈtʃaɪnə/"
  },
  "cinema": {
    "emoji": "🎬",
    "phonetic": "/ˈsɪnəmə/"
  },
  "clean my room": {
    "emoji": "🧹"
  },
  "cleaned": {
    "emoji": "🧹",
    "phonetic": "/kliːnd/"
  },
  "climbing": {
    "emoji": "🧗",
    "phonetic": "/ˈklaɪmɪŋ/"
  },
  "clock": {
    "emoji": "🕐",
    "phonetic": "/klɒk/"
  },
  "crayon": {
    "emoji": "🖍️",
    "phonetic": "/ˈkreɪən/"
  },
  "crossing": {
    "emoji": "🚦",
    "phonetic": "/ˈkrɒsɪŋ/"
  },
  "cycling": {
    "emoji": "🚴",
    "phonetic": "/ˈsaɪklɪŋ/"
  },
  "dad": {
    "emoji": "👨",
    "phonetic": "/dæd/"
  },
  "dance": {
    "emoji": "💃",
    "phonetic": "/dɑːns/"
  },
  "delicious": {
    "emoji": "😋",
    "phonetic": "/dɪˈlɪʃəs/"
  },
  "desk": {
    "emoji": "📝",
    "phonetic": "/desk/"
  },
  "dining hall": {
    "emoji": "🍽️",
    "phonetic": "/ˈdaɪnɪŋ hɔːl/"
  },
  "do kung fu": {
    "emoji": "🥋"
  },
  "do morning exercises": {
    "emoji": "🤸"
  },
  "dog": {
    "emoji": "🐶",
    "phonetic": "/dɒɡ/"
  },
  "doing morning exercises": {
    "emoji": "🤸"
  },
  "draw": {
    "emoji": "🎨",
    "phonetic": "/drɔː/"
  },
  "duck": {
    "emoji": "🦆",
    "phonetic": "/dʌk/"
  },
  "ear": {
    "emoji": "👂",
    "phonetic": "/ɪə/"
  },
  "eat breakfast": {
    "emoji": "🍳"
  },
  "eat dinner": {
    "emoji": "🍽️"
  },
  "eating": {
    "emoji": "😋",
    "phonetic": "/ˈiːtɪŋ/"
  },
  "eating lunch": {
    "emoji": "🍱"
  },
  "egg": {
    "emoji": "🥚",
    "phonetic": "/eɡ/"
  },
  "eight": {
    "emoji": "8️⃣",
    "phonetic": "/eɪt/"
  },
  "eighteen": {
    "emoji": "🔢",
    "phonetic": "/ˌeɪˈtiːn/"
  },
  "elephant": {
    "emoji": "🐘",
    "phonetic": "/ˈelɪfənt/"
  },
  "eleven": {
    "emoji": "🔢",
    "phonetic": "/ɪˈlevn/"
  },
  "eraser": {
    "emoji": "🧽",
    "phonetic": "/ɪˈreɪzə/"
  },
  "evening": {
    "emoji": "🌆",
    "phonetic": "/ˈiːvnɪŋ/"
  },
  "exercise": {
    "emoji": "🏃",
    "phonetic": "/ˈeksəsaɪz/"
  },
  "eye": {
    "emoji": "👁️",
    "phonetic": "/aɪ/"
  },
  "face": {
    "emoji": "😊",
    "phonetic": "/feɪs/"
  },
  "factory": {
    "emoji": "🏭",
    "phonetic": "/ˈfæktri/"
  },
  "fat": {
    "emoji": "🐷",
    "phonetic": "/fæt/"
  },
  "father": {
    "emoji": "👨",
    "phonetic": "/ˈfɑːðə/"
  },
  "February": {
    "emoji": "📅",
    "phonetic": "/ˈfebruəri/"
  },
  "fifteen": {
    "emoji": "🔢",
    "phonetic": "/ˌfɪfˈtiːn/"
  },
  "fifth": {
    "emoji": "5️⃣",
    "phonetic": "/fɪfθ/"
  },
  "film": {
    "emoji": "🎬",
    "phonetic": "/fɪlm/"
  },
  "first": {
    "emoji": "🥇",
    "phonetic": "/fɜːst/"
  },
  "fish": {
    "emoji": "🐟",
    "phonetic": "/fɪʃ/"
  },
  "fisherman": {
    "emoji": "🎣",
    "phonetic": "/ˈfɪʃəmən/"
  },
  "five": {
    "emoji": "5️⃣",
    "phonetic": "/faɪv/"
  },
  "forest": {
    "emoji": "🌲",
    "phonetic": "/ˈfɒrɪst/"
  },
  "four": {
    "emoji": "4️⃣",
    "phonetic": "/fɔː/"
  },
  "fourteen": {
    "emoji": "🔢",
    "phonetic": "/ˌfɔːˈtiːn/"
  },
  "fourth": {
    "emoji": "4️⃣",
    "phonetic": "/fɔːθ/"
  },
  "fresh": {
    "emoji": "🥬",
    "phonetic": "/freʃ/"
  },
  "Friday": {
    "emoji": "📅",
    "phonetic": "/ˈfraɪdeɪ/"
  },
  "front": {
    "emoji": "⬆️",
    "phonetic": "/frʌnt/"
  },
  "funny": {
    "emoji": "😄",
    "phonetic": "/ˈfʌni/"
  },
  "giraffe": {
    "emoji": "🦒",
    "phonetic": "/dʒəˈrɑːf/"
  },
  "go cycling": {
    "emoji": "🚴"
  },
  "go for a walk": {
    "emoji": "🚶"
  },
  "go on a picnic": {
    "emoji": "🧺"
  },
  "grandmother": {
    "emoji": "👵",
    "phonetic": "/ˈɡrænmʌðə/"
  },
  "grape": {
    "emoji": "🍇",
    "phonetic": "/ɡreɪp/"
  },
  "grass": {
    "emoji": "🌱",
    "phonetic": "/ɡrɑːs/"
  },
  "green": {
    "emoji": "🟢",
    "phonetic": "/ɡriːn/"
  },
  "gym": {
    "emoji": "🏋️",
    "phonetic": "/dʒɪm/"
  },
  "had": {
    "emoji": "🤒",
    "phonetic": "/hæd/"
  },
  "had a cold": {
    "emoji": "🤧"
  },
  "hamburger": {
    "emoji": "🍔",
    "phonetic": "/ˈhæmbɜːɡə/"
  },
  "hand": {
    "emoji": "✋",
    "phonetic": "/hænd/"
  },
  "happy": {
    "emoji": "😀",
    "phonetic": "/ˈhæpi/"
  },
  "hard-working": {
    "emoji": "💪",
    "phonetic": "/ˌhɑːdˈwɜːkɪŋ/"
  },
  "have … class": {
    "emoji": "🏫"
  },
  "having … class": {
    "emoji": "🏫"
  },
  "he": {
    "emoji": "👦",
    "phonetic": "/hiː/"
  },
  "head": {
    "emoji": "👤",
    "phonetic": "/hed/"
  },
  "healthy": {
    "emoji": "💚",
    "phonetic": "/ˈhelθi/"
  },
  "heavier": {
    "emoji": "🏋️",
    "phonetic": "/ˈheviə/"
  },
  "helpful": {
    "emoji": "🤝",
    "phonetic": "/ˈhelpfl/"
  },
  "hers": {
    "emoji": "👧",
    "phonetic": "/hɜːz/"
  },
  "hiking": {
    "emoji": "🥾",
    "phonetic": "/ˈhaɪkɪŋ/"
  },
  "hill": {
    "emoji": "⛰️",
    "phonetic": "/hɪl/"
  },
  "his": {
    "emoji": "👦",
    "phonetic": "/hɪz/"
  },
  "hobby": {
    "emoji": "🎨",
    "phonetic": "/ˈhɒbi/"
  },
  "hospital": {
    "emoji": "🏥",
    "phonetic": "/ˈhɒspɪtl/"
  },
  "hurt": {
    "emoji": "🤕",
    "phonetic": "/hɜːt/"
  },
  "ice cream": {
    "emoji": "🍦",
    "phonetic": "/ˈaɪs kriːm/"
  },
  "ice-skate": {
    "emoji": "⛸️",
    "phonetic": "/ˈaɪs skeɪt/"
  },
  "idea": {
    "emoji": "💡",
    "phonetic": "/aɪˈdɪə/"
  },
  "in": {
    "emoji": "📥",
    "phonetic": "/ɪn/"
  },
  "in front of": {
    "emoji": "↔️"
  },
  "January": {
    "emoji": "📅",
    "phonetic": "/ˈdʒænjuəri/"
  },
  "jasmine": {
    "emoji": "🌼",
    "phonetic": "/ˈdʒæzmɪn/"
  },
  "juice": {
    "emoji": "🧃",
    "phonetic": "/dʒuːs/"
  },
  "July": {
    "emoji": "📅",
    "phonetic": "/dʒuˈlaɪ/"
  },
  "June": {
    "emoji": "📅",
    "phonetic": "/dʒuːn/"
  },
  "keep": {
    "emoji": "🤲",
    "phonetic": "/kiːp/"
  },
  "keep to the right": {
    "emoji": "➡️"
  },
  "keep your desk clean": {
    "emoji": "🧹"
  },
  "kind": {
    "emoji": "😇",
    "phonetic": "/kaɪnd/"
  },
  "kung fu": {
    "emoji": "🥋",
    "phonetic": "/ˌkʌŋ ˈfuː/"
  },
  "lake": {
    "emoji": "🏞️",
    "phonetic": "/leɪk/"
  },
  "listening to music": {
    "emoji": "🎧"
  },
  "long": {
    "emoji": "📏",
    "phonetic": "/lɒŋ/"
  },
  "longer": {
    "emoji": "📏",
    "phonetic": "/ˈlɒŋɡə/"
  },
  "man": {
    "emoji": "👨",
    "phonetic": "/mæn/"
  },
  "March": {
    "emoji": "📅",
    "phonetic": "/mɑːtʃ/"
  },
  "May": {
    "emoji": "📅",
    "phonetic": "/meɪ/"
  },
  "milk": {
    "emoji": "🥛",
    "phonetic": "/mɪlk/"
  },
  "mine": {
    "emoji": "🙋",
    "phonetic": "/maɪn/"
  },
  "Monday": {
    "emoji": "📅",
    "phonetic": "/ˈmʌndeɪ/"
  },
  "monkey": {
    "emoji": "🐒",
    "phonetic": "/ˈmʌŋki/"
  },
  "more": {
    "emoji": "➕",
    "phonetic": "/mɔː/"
  },
  "mother": {
    "emoji": "👩",
    "phonetic": "/ˈmʌðə/"
  },
  "mountain": {
    "emoji": "⛰️",
    "phonetic": "/ˈmaʊntən/"
  },
  "mouth": {
    "emoji": "👄",
    "phonetic": "/maʊθ/"
  },
  "museum": {
    "emoji": "🏛️",
    "phonetic": "/mjuˈziːəm/"
  },
  "nose": {
    "emoji": "👃",
    "phonetic": "/nəʊz/"
  },
  "old": {
    "emoji": "👴",
    "phonetic": "/əʊld/"
  },
  "older": {
    "emoji": "👴",
    "phonetic": "/ˈəʊldə/"
  },
  "on": {
    "emoji": "🔛",
    "phonetic": "/ɒn/"
  },
  "on foot": {
    "emoji": "🚶",
    "phonetic": "/ɒn ˈfʊt/"
  },
  "one": {
    "emoji": "1️⃣",
    "phonetic": "/wʌn/"
  },
  "orange": {
    "emoji": "🟠",
    "phonetic": "/ˈɒrɪndʒ/"
  },
  "ours": {
    "emoji": "👨‍👩‍👧",
    "phonetic": "/ˈaʊəz/"
  },
  "pear": {
    "emoji": "🍐",
    "phonetic": "/peə/"
  },
  "pen": {
    "emoji": "🖊️",
    "phonetic": "/pen/"
  },
  "pen pal": {
    "emoji": "✉️",
    "phonetic": "/ˈpen pæl/"
  },
  "pencil": {
    "emoji": "✏️",
    "phonetic": "/ˈpensl/"
  },
  "pencil box": {
    "emoji": "🖊️",
    "phonetic": "/ˈpensl bɒks/"
  },
  "photo": {
    "emoji": "📷",
    "phonetic": "/ˈfəʊtəʊ/"
  },
  "pick": {
    "emoji": "🤏",
    "phonetic": "/pɪk/"
  },
  "picnic": {
    "emoji": "🧺",
    "phonetic": "/ˈpɪknɪk/"
  },
  "pig": {
    "emoji": "🐷",
    "phonetic": "/pɪɡ/"
  },
  "pilot": {
    "emoji": "👨‍✈️",
    "phonetic": "/ˈpaɪlət/"
  },
  "plane": {
    "emoji": "✈️",
    "phonetic": "/pleɪn/"
  },
  "plant": {
    "emoji": "🌱",
    "phonetic": "/plɑːnt/"
  },
  "play sports": {
    "emoji": "⚽"
  },
  "play the pipa": {
    "emoji": "🪕"
  },
  "police officer": {
    "emoji": "👮",
    "phonetic": "/pəˈliːs ˈɒfɪsə/"
  },
  "polite": {
    "emoji": "🙇",
    "phonetic": "/pəˈlaɪt/"
  },
  "post office": {
    "emoji": "🏤",
    "phonetic": "/ˈpəʊst ɒfɪs/"
  },
  "postman": {
    "emoji": "📮",
    "phonetic": "/ˈpəʊstmən/"
  },
  "pupil": {
    "emoji": "🧑‍🎓",
    "phonetic": "/ˈpjuːpl/"
  },
  "puzzle": {
    "emoji": "🧩",
    "phonetic": "/ˈpʌzl/"
  },
  "read": {
    "emoji": "📖",
    "phonetic": "/riːd/"
  },
  "reading a book": {
    "emoji": "📖"
  },
  "red": {
    "emoji": "🔴",
    "phonetic": "/red/"
  },
  "rice": {
    "emoji": "🍚",
    "phonetic": "/raɪs/"
  },
  "river": {
    "emoji": "🏞️",
    "phonetic": "/ˈrɪvə/"
  },
  "rode": {
    "emoji": "🐎",
    "phonetic": "/rəʊd/"
  },
  "ruler": {
    "emoji": "📏",
    "phonetic": "/ˈruːlə/"
  },
  "sad": {
    "emoji": "😢",
    "phonetic": "/sæd/"
  },
  "salad": {
    "emoji": "🥗",
    "phonetic": "/ˈsæləd/"
  },
  "sandwich": {
    "emoji": "🥪",
    "phonetic": "/ˈsænwɪdʒ/"
  },
  "Saturday": {
    "emoji": "📅",
    "phonetic": "/ˈsætədeɪ/"
  },
  "science": {
    "emoji": "🔬",
    "phonetic": "/ˈsaɪəns/"
  },
  "scientist": {
    "emoji": "👨‍🔬",
    "phonetic": "/ˈsaɪəntɪst/"
  },
  "season": {
    "emoji": "🍂",
    "phonetic": "/ˈsiːzn/"
  },
  "second": {
    "emoji": "🥈",
    "phonetic": "/ˈsekənd/"
  },
  "see a doctor": {
    "emoji": "🩺"
  },
  "see a film": {
    "emoji": "🎬"
  },
  "seven": {
    "emoji": "7️⃣",
    "phonetic": "/ˈsevn/"
  },
  "seventeen": {
    "emoji": "🔢",
    "phonetic": "/ˌsevnˈtiːn/"
  },
  "she": {
    "emoji": "👧",
    "phonetic": "/ʃiː/"
  },
  "ship": {
    "emoji": "🚢",
    "phonetic": "/ʃɪp/"
  },
  "short": {
    "emoji": "📏",
    "phonetic": "/ʃɔːt/"
  },
  "shorter": {
    "emoji": "📏",
    "phonetic": "/ˈʃɔːtə/"
  },
  "sing": {
    "emoji": "🎤",
    "phonetic": "/sɪŋ/"
  },
  "sing English songs": {
    "emoji": "🎶"
  },
  "sister": {
    "emoji": "👧",
    "phonetic": "/ˈsɪstə/"
  },
  "six": {
    "emoji": "6️⃣",
    "phonetic": "/sɪks/"
  },
  "sixteen": {
    "emoji": "🔢",
    "phonetic": "/ˌsɪksˈtiːn/"
  },
  "slept": {
    "emoji": "😴",
    "phonetic": "/slept/"
  },
  "small": {
    "emoji": "🐜",
    "phonetic": "/smɔːl/"
  },
  "song": {
    "emoji": "🎵",
    "phonetic": "/sɒŋ/"
  },
  "spring": {
    "emoji": "🌸",
    "phonetic": "/sprɪŋ/"
  },
  "stayed": {
    "emoji": "🏠",
    "phonetic": "/steɪd/"
  },
  "strawberry": {
    "emoji": "🍓",
    "phonetic": "/ˈstrɔːbəri/"
  },
  "strict": {
    "emoji": "😠",
    "phonetic": "/strɪkt/"
  },
  "student": {
    "emoji": "🧑‍🎓",
    "phonetic": "/ˈstjuːdnt/"
  },
  "studies": {
    "emoji": "📚",
    "phonetic": "/ˈstʌdiz/"
  },
  "subway": {
    "emoji": "🚇",
    "phonetic": "/ˈsʌbweɪ/"
  },
  "summer": {
    "emoji": "☀️",
    "phonetic": "/ˈsʌmə/"
  },
  "Sunday": {
    "emoji": "📅",
    "phonetic": "/ˈsʌndeɪ/"
  },
  "supermarket": {
    "emoji": "🛒",
    "phonetic": "/ˈsuːpəmɑːkɪt/"
  },
  "take a trip": {
    "emoji": "🧳"
  },
  "tall": {
    "emoji": "📏",
    "phonetic": "/tɔːl/"
  },
  "taller": {
    "emoji": "📏",
    "phonetic": "/ˈtɔːlə/"
  },
  "taxi": {
    "emoji": "🚕",
    "phonetic": "/ˈtæksi/"
  },
  "tea": {
    "emoji": "🍵",
    "phonetic": "/tiː/"
  },
  "theirs": {
    "emoji": "👨‍👩‍👧‍👦",
    "phonetic": "/ðeəz/"
  },
  "thin": {
    "emoji": "📏",
    "phonetic": "/θɪn/"
  },
  "thinner": {
    "emoji": "📏",
    "phonetic": "/ˈθɪnə/"
  },
  "third": {
    "emoji": "🥉",
    "phonetic": "/θɜːd/"
  },
  "thirteen": {
    "emoji": "🔢",
    "phonetic": "/ˌθɜːˈtiːn/"
  },
  "three": {
    "emoji": "3️⃣",
    "phonetic": "/θriː/"
  },
  "Thursday": {
    "emoji": "📅",
    "phonetic": "/ˈθɜːzdeɪ/"
  },
  "tonight": {
    "emoji": "🌙",
    "phonetic": "/təˈnaɪt/"
  },
  "train": {
    "emoji": "🚆",
    "phonetic": "/treɪn/"
  },
  "tree": {
    "emoji": "🌳",
    "phonetic": "/triː/"
  },
  "trip": {
    "emoji": "🧳",
    "phonetic": "/trɪp/"
  },
  "Tuesday": {
    "emoji": "📅",
    "phonetic": "/ˈtjuːzdeɪ/"
  },
  "twelfth": {
    "emoji": "🔢",
    "phonetic": "/twelfθ/"
  },
  "twelve": {
    "emoji": "🔢",
    "phonetic": "/twelv/"
  },
  "twentieth": {
    "emoji": "🔢",
    "phonetic": "/ˈtwentiəθ/"
  },
  "twenty-first": {
    "emoji": "🔢",
    "phonetic": "/ˌtwentiˈfɜːst/"
  },
  "two": {
    "emoji": "2️⃣",
    "phonetic": "/tuː/"
  },
  "UK": {
    "emoji": "🇬🇧",
    "phonetic": "/ˌjuːˈkeɪ/"
  },
  "under": {
    "emoji": "⬇️",
    "phonetic": "/ˈʌndə/"
  },
  "USA": {
    "emoji": "🇺🇸",
    "phonetic": "/ˌjuːesˈeɪ/"
  },
  "visit": {
    "emoji": "🚪",
    "phonetic": "/ˈvɪzɪt/"
  },
  "washed": {
    "emoji": "🧼",
    "phonetic": "/wɒʃt/"
  },
  "watched": {
    "emoji": "👀",
    "phonetic": "/wɒtʃt/"
  },
  "water": {
    "emoji": "💧",
    "phonetic": "/ˈwɔːtə/"
  },
  "water bottle": {
    "emoji": "🍶",
    "phonetic": "/ˈwɔːtə bɒtl/"
  },
  "watermelon": {
    "emoji": "🍉",
    "phonetic": "/ˈwɔːtəmelən/"
  },
  "wear": {
    "emoji": "👕",
    "phonetic": "/weə/"
  },
  "Wednesday": {
    "emoji": "📅",
    "phonetic": "/ˈwenzdeɪ/"
  },
  "weekend": {
    "emoji": "📆",
    "phonetic": "/ˌwiːkˈend/"
  },
  "went": {
    "emoji": "🚶",
    "phonetic": "/went/"
  },
  "went camping": {
    "emoji": "⛺"
  },
  "went fishing": {
    "emoji": "🎣"
  },
  "white": {
    "emoji": "⚪",
    "phonetic": "/waɪt/"
  },
  "winter": {
    "emoji": "❄️",
    "phonetic": "/ˈwɪntə/"
  },
  "woman": {
    "emoji": "👩",
    "phonetic": "/ˈwʊmən/"
  },
  "worker": {
    "emoji": "👷",
    "phonetic": "/ˈwɜːkə/"
  },
  "worried": {
    "emoji": "😟",
    "phonetic": "/ˈwʌrid/"
  },
  "yellow": {
    "emoji": "🟡",
    "phonetic": "/ˈjeləʊ/"
  },
  "turn": {
    "emoji": "↩️",
    "phonetic": "/tɜːn/"
  },
  "young": {
    "emoji": "🧒",
    "phonetic": "/jʌŋ/"
  },
  "younger": {
    "emoji": "🧒",
    "phonetic": "/ˈjʌŋɡə/"
  },
  "yours": {
    "emoji": "🫵",
    "phonetic": "/jɔːz/"
  }
};

const FILES = ["grade3", "grade5", "grade6"].map(
  (g) => resolve("src/data/primaryHub", `${g}.json`)
);

let items = 0, emojiChanged = 0, phonAdded = 0, enCnTouched = 0, missing = new Set();

for (const file of FILES) {
  const raw = readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  const root = Object.values(data)[0]; // { grade3: {...} } 取内层
  for (const sem of Object.values(root.semesters)) {
    for (const unit of sem.units ?? []) {
      unit.vocabulary = (unit.vocabulary ?? []).map((v) => {
        items++;
        const hit = ENRICH[v.en];
        if (!hit) { missing.add(v.en); return v; }
        const oldEn = v.en, oldCn = v.cn, oldEmoji = v.emoji;
        // 保留键顺序：在 emoji 后插入 phonetic
        const nv = {};
        for (const k of Object.keys(v)) {
          nv[k] = v[k];
          if (k === "emoji") {
            nv.emoji = hit.emoji;
            if (hit.phonetic && v.phonetic == null) nv.phonetic = hit.phonetic;
          }
        }
        if (hit.phonetic && v.phonetic != null) nv.phonetic = hit.phonetic; // 已存在则原地覆盖
        if (nv.en !== oldEn || nv.cn !== oldCn) enCnTouched++;
        if (nv.emoji !== oldEmoji) emojiChanged++;
        if (nv.phonetic != null && v.phonetic == null) phonAdded++;
        return nv;
      });
    }
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("written:", file);
}

console.log("---- 统计 ----");
console.log("词条总数:", items);
console.log("emoji 改进:", emojiChanged);
console.log("phonetic 新增:", phonAdded);
console.log("en/cn 被动过(必须为 0):", enCnTouched);
if (missing.size) console.log("⚠️ 映射缺失的词(将保持原样):", [...missing]);
if (enCnTouched !== 0) { console.error("❌ en/cn 被改动，已中止预期之外的修改，请回滚检查！"); process.exit(1); }
