# Junior text-layer quality audit

- **File**: `junior_7A_8A_9_textlayer.csv`
- **Rows**: 1360

## Count by volume

| volume | count |
|--------|------:|
| 7A | 397 |
| 8A | 402 |
| 9 | 561 |

## Issue summary

| issue | count |
|-------|------:|
| ipa_junk | 0 |
| page_in_meaning | 0 |
| english_in_meaning | 0 |
| empty_pos_long_word | 12 |
| short_meaning | 55 |
| generic_source_page | 1360 |

## Samples (up to 15 per issue)


### generic_source_page

| word_id | word | meaning_cn |
|---------|------|------------|
| jr-7A-SU1-0001 | afternoon | 下午 |
| jr-7A-SU1-0002 | Alice | 艾丽斯（女名） |
| jr-7A-SU1-0003 | am | 是 |
| jr-7A-SU1-0004 | are | 是 |
| jr-7A-SU1-0005 | BBC | 英国广播公司 |
| jr-7A-SU1-0006 | Bob | 鲍勃（男名） |
| jr-7A-SU1-0007 | CD | 光盘；激光唱片 |
| jr-7A-SU1-0008 | Cindy | 辛迪（女名） |
| jr-7A-SU1-0009 | Dale | 戴尔（男名） |
| jr-7A-SU1-0010 | Eric | 埃里克（男名） |
| jr-7A-SU1-0011 | evening | 晚上；傍晚 |
| jr-7A-SU1-0012 | fine | 健康的；美好的 |
| jr-7A-SU1-0013 | Frank | 弗兰克（男名） |
| jr-7A-SU1-0014 | good | 好的 |
| jr-7A-SU1-0015 | Grace | 格雷丝（女名） |

### short_meaning

| word_id | word | meaning_cn |
|---------|------|------------|
| jr-7A-SU1-0003 | am | 是 |
| jr-7A-SU1-0004 | are | 是 |
| jr-7A-SU1-0021 | I | 我 |
| jr-7A-SU2-0005 | is | 是 |
| jr-7A-SU2-0006 | it | 它 |
| jr-7A-U1-0005 | eight | 八 |
| jr-7A-U1-0007 | five | 五 |
| jr-7A-U1-0008 | four | 四 |
| jr-7A-U1-0012 | he | 他 |
| jr-7A-U1-0028 | nine | 九 |
| jr-7A-U1-0032 | one | 一 |
| jr-7A-U1-0035 | seven | 七 |
| jr-7A-U1-0036 | she | 她 |
| jr-7A-U1-0037 | six | 六 |
| jr-7A-U1-0040 | three | 三 |

### empty_pos_long_word

| word_id | word | meaning_cn |
|---------|------|------------|
| jr-8A-U1-0023 | Huangguoshu Waterfall | 黄果树瀑布（贵州） |
| jr-8A-U1-0049 | （pl. yourselves | ）；你自己；您自己 |
| jr-8A-U2-0003 | American Teenager | 美国青少年；（文中为虚构的；杂志名称） |
| jr-8A-U4-0002 | American Idol | 美国偶像；（文中为电视节目名称） |
| jr-8A-U5-0037 | Steamboat Willie | 迪斯尼公司制作的全球第一部；有声动画片；威利号汽船 |
| jr-8A-U5-0039 | the Hollywood Walk of Fame | 好莱坞星光大道（美国） |
| jr-9-U1-0001 | /greI@m/ Bell | 亚历山大·；格雷厄姆·；贝尔 |
| jr-9-U12-0012 | burnt; burned | )；着火；燃烧 |
| jr-9-U2-0001 | A Christmas Carol | 圣诞欢歌；（小说名） |
| jr-9-U5-0044 | San Francisco | 圣弗朗西斯科；（旧金山，美国城市） |
| jr-9-U8-0016 | J. K. Rowling | 罗琳；（英国作家） |
| jr-9-U9-0015 | March of the Penguins | 帝企鹅日记；（电影名） |

## Manual review checklist

- [ ] Compare 7A unit counts against 人教版 7A Appendix
- [ ] Spot-check 8A/9 multi-sense entries (semicolon glosses)
- [ ] Replace generic `source_page` with textbook page refs when PDFs re-processed

