# 枞树 · 点词词典冷词卡 — 待审(81 张)

> **CC 子代理手写**(不走 AI 边缘,零配额)。只补全局 read-v1 词典里**还没有**的冷词(书中出现·频次≥2·已滤专名)。判据:太基础的初中词已跳过;每张卡英式音标+书中义+新造例句。
> 产物:`SQLAA/library-dict-fir-tree.sql`(81 张,幂等 upsert,**未跑**)。审:①该不该收(太基础/专名漏网)②释义贴不贴书中义③音标④例句。

## 自查基线
| 项 | 结果 |
|---|---|
| 缺 ipa/pos/gloss/例句 | **0**(生成器硬卡) |
| 跨批重复 normalized | 去重 0 |
| 子代理判为太基础/专名而跳过 | 0 词 |

## 词卡清单(81 张)
| 词 | 音标 | 词性 | 释义(书中义) | 英语释义(gloss_en) | sense_key | 例句(新造) | 例句中译 |
|---|---|---|---|---|---|---|---|
| **beheld** | /bɪˈhɛld/ | v. | 看见、注视(behold 的过去式,古旧书面语) | saw; gazed at (archaic past of behold) | behold | From the hill she beheld the whole city below. | 从山上,她望见了下面整座城市。 |
| **tinsel** | /ˈtɪnsəl/ | n. | (装饰用的)闪亮金属箔片、亮丝 | thin shiny strips used for decoration | tinsel | Silver tinsel sparkled all over the shop window. | 银色的亮丝在橱窗上到处闪光。 |
| **larder** | /ˈlɑːrdər/ | n. | 食品储藏室 | a cool room or cupboard for storing food | larder | She kept cheese and cold meat in the larder. | 她把奶酪和冷肉放在食品储藏室里。 |
| **magnificence** | /mæɡˈnɪfəsəns/ | n. | 壮丽、宏伟、豪华 | great splendor or grandeur | magnificence | The visitors gasped at the magnificence of the hall. | 客人们为大厅的豪华惊叹不已。 |
| **balustrade** | /ˈbæləstreɪd/ | n. | (阳台或楼梯边的)栏杆 | a railing along a balcony or staircase | balustrade | He leaned on the marble balustrade and looked down. | 他靠在大理石栏杆上往下看。 |
| **moveth** | /ˈmuːvəθ/ | v. | 动、涌动(move 的古旧第三人称形式) | moves (archaic third-person form of move) | move | The wind moveth over the still water. | 风在静静的水面上吹动。 |
| **wherefore** | /ˈwɛrfɔːr/ | adv. | 为什么、为何(古旧) | why; for what reason (archaic) | wherefore | Wherefore do you weep on such a happy day? | 这样喜庆的日子,你为什么哭呢? |
| **tis** | /tɪz/ | cont. | 'tis:它是、现在是('it is' 的古旧缩略) | it is (archaic contraction of "it is") | it-is | 'Tis a cold and lonely night out here. | 外面是个又冷又孤单的夜晚。 |
| **sugarplums** | /ˈʃʊɡərplʌmz/ | n. | (旧时的)圆形水果糖、蜜饯糖果 | small round sweets or candied treats | sugarplum | The children were given sugarplums after supper. | 晚饭后,孩子们分到了一些水果糖。 |
| **pith** | /pɪθ/ | n. | (树干、茎的)木髓、中心软心 | the soft spongy core at the center of a stem | pith | A soft pith runs down the middle of the twig. | 一条柔软的木髓穿过细枝的正中。 |
| **pines** | /paɪnz/ | n. | 松树(pine 的复数) | pine trees | pine | Tall pines lined both banks of the river. | 高大的松树排列在河的两岸。 |
| **pitcher** | /ˈpɪtʃər/ | n. | (有柄有倾口的)大水罐、大壶 | a large jug with a handle and a lip | pitcher | She poured milk from a heavy clay pitcher. | 她从一只沉甸甸的陶罐里倒出牛奶。 |
| **tapers** | /ˈteɪpərz/ | n. | 细蜡烛 | thin candles | taper | She lit two small tapers on the birthday cake. | 她点燃了生日蛋糕上的两根细蜡烛。 |
| **eve** | /iːv/ | n. | 前夜 | the evening or day before an event | eve | We wrapped the gifts on Christmas eve. | 我们在圣诞前夜包好了礼物。 |
| **sparrows** | /ˈspɛroʊz/ | n. | 麻雀 | small brown birds | sparrow | Two sparrows hopped along the garden fence. | 两只麻雀沿着花园的篱笆蹦跳。 |
| **stork** | /stɔːrk/ | n. | 鹳 | a tall long-legged wading bird | stork | A stork built its nest on top of the old chimney. | 一只鹳在旧烟囱顶上筑了巢。 |
| **sunbeams** | /ˈsʌnbiːmz/ | n. | 阳光光束 | rays of sunlight | sunbeam | Bright sunbeams shone through the kitchen window. | 明亮的阳光透过厨房的窗户照进来。 |
| **adjoined** | /əˈdʒɔɪnd/ | v. | 毗邻;紧挨着 | was next to or bordered on | adjoin | The kitchen adjoined a small dining room. | 厨房紧挨着一间小餐厅。 |
| **amidst** | /əˈmɪdst/ | prep. | 在……之中(书面) | in the middle of | amidst | The cottage stood amidst tall green trees. | 那座小屋坐落在高大的绿树之中。 |
| **anymore** | /ˌɛniˈmɔːr/ | adv. | 不再;再也 | any longer | anymore | He does not live in this town anymore. | 他不再住在这个镇上了。 |
| **autumn** | /ˈɔːtəm/ | n. | 秋天 | the season between summer and winter | autumn | The leaves turn red and gold in autumn. | 秋天树叶变红变金黄。 |
| **await** | /əˈweɪt/ | v. | 等待(正式) | to wait for | await | The children await their teacher by the door. | 孩子们在门边等待老师。 |
| **bawl** | /bɔːl/ | v. | 大喊;大声哭叫 | to shout or cry loudly | bawl | The baby began to bawl when the music stopped. | 音乐一停,婴儿就开始大声哭叫。 |
| **bawling** | /ˈbɔːlɪŋ/ | n. | 大喊大叫;号哭 | loud shouting or crying | bawl | The bawling of the crowd filled the whole street. | 人群的大喊大叫响彻整条街。 |
| **berries** | /ˈbɛriz/ | n. | 浆果 | small round fruits | berry | We picked a basket of ripe berries in the woods. | 我们在树林里摘了一篮成熟的浆果。 |
| **bewildered** | /bɪˈwɪldərd/ | adj. | 困惑的;不知所措的 | confused and puzzled | bewilder | The lost tourist looked bewildered by the busy streets. | 迷路的游客被繁忙的街道弄得不知所措。 |
| **birch** | /bɜːrtʃ/ | n. | 桦树 | a tree with smooth white bark | birch | A slender birch grew beside the quiet pond. | 一棵纤细的桦树长在静静的池塘边。 |
| **blossom** | /ˈblɑːsəm/ | n. | 花;花朵 | flowers on a tree or plant | blossom | The apple tree was covered in white blossom. | 苹果树上开满了白色的花。 |
| **cart** | /kɑːrt/ | n. | (马拉的)车 | a horse-drawn wagon | cart | The farmer loaded hay onto the wooden cart. | 农夫把干草装上了木车。 |
| **congratulate** | /kənˈɡrætʃəleɪt/ | v. | 祝贺;道贺 | to offer good wishes for success | congratulate | I want to congratulate you on your new job. | 我想祝贺你找到新工作。 |
| **decorated** | /ˈdɛkəreɪtɪd/ | v. | 装饰;点缀 | adorned with pretty things | decorate | They decorated the hall with balloons and lights. | 他们用气球和彩灯装饰了大厅。 |
| **departure** | /dɪˈpɑːrtʃər/ | n. | 离开;出发 | the act of leaving | departure | His sudden departure surprised all of us. | 他突然的离开让我们都很吃惊。 |
| **destined** | /ˈdɛstɪnd/ | adj. | 注定的;命中注定要……的 | fated or meant for something | destine | She felt she was destined to become a singer. | 她觉得自己注定要成为一名歌手。 |
| **dolls** | /dɑːlz/ | n. | 玩偶；娃娃 | small toy figures shaped like people | doll | The little girl lined up her dolls on the bed. | 小女孩把她的娃娃排在床上。 |
| **exultingly** | /ɪɡˈzʌltɪŋli/ | adv. | 欢欣鼓舞地；得意洋洋地 | in a joyful and triumphant way | exultingly | He raised his arms exultingly when his team scored. | 他的队伍得分时，他欢欣鼓舞地举起了双臂。 |
| **famously** | /ˈfeɪməsli/ | adv. | 极好地；出色地(古旧) | very well; splendidly | famously | The old stove burned famously all through the cold night. | 那台旧火炉在整个寒夜里烧得旺极了。 |
| **fig** | /fɪɡ/ | n. | 无花果 | a soft sweet fruit with many small seeds | fig | She picked a ripe fig from the tree and ate it. | 她从树上摘了一个熟透的无花果吃了。 |
| **firs** | /fɜːrz/ | n. | 枞树；冷杉树 | evergreen cone-bearing trees | fir | Tall firs covered the slopes of the mountain. | 高大的枞树覆盖着山坡。 |
| **freshness** | /ˈfrɛʃnəs/ | n. | 新鲜；清新 | the quality of being fresh and new | freshness | I love the freshness of the air after the rain. | 我喜欢雨后空气的清新。 |
| **gardener's** | /ˈɡɑːrdnərz/ | n. | 园丁的 | belonging to the gardener | gardener | The gardener's tools were kept in a small wooden shed. | 园丁的工具放在一间小木棚里。 |
| **gingerbread** | /ˈdʒɪndʒərbrɛd/ | n. | 姜饼 | a sweet cake or cookie flavored with ginger | gingerbread | We baked gingerbread shaped like little stars for the party. | 我们为聚会烤了小星星形状的姜饼。 |
| **housemaid** | /ˈhaʊsmeɪd/ | n. | 女仆；女佣 | a female servant who cleans a house | housemaid | The housemaid swept the floors early every morning. | 女仆每天清晨都打扫地板。 |
| **incomparably** | /ɪnˈkɑːmpərəbli/ | adv. | 无与伦比地 | in a way beyond comparison | incomparably | The view from the peak was incomparably beautiful. | 山顶的景色美得无与伦比。 |
| **lean** | /liːn/ | adj. | 瘦的；不肥的 | thin and having little fat | lean | The lean cat squeezed through the narrow gap in the fence. | 那只瘦猫从篱笆的窄缝里挤了过去。 |
| **lindens** | /ˈlɪndənz/ | n. | 椴树；菩提树 | shade trees with heart-shaped leaves and fragrant flowers | linden | The lindens along the street smelled sweet in summer. | 夏天街道两旁的椴树散发着甜香。 |
| **livery** | /ˈlɪvəri/ | n. | 号衣；仆役制服 | a special uniform worn by servants | livery | The footmen wore green livery with shiny gold buttons. | 仆役们穿着带亮金纽扣的绿色号衣。 |
| **majestically** | /məˈdʒɛstɪkli/ | adv. | 威严地；庄严地 | in a grand and dignified way | majestically | The eagle rose majestically above the tall cliffs. | 雄鹰威严地飞升到高高的悬崖之上。 |
| **nets** | /nɛts/ | n. | 小网兜；网袋 | small bags made of loosely woven material | net | They hung little nets of candy on the branches. | 他们在树枝上挂了装糖果的小网兜。 |
| **odorous** | /ˈoʊdərəs/ | adj. | 芳香的；散发香气的 | having a sweet and pleasant smell | odorous | Odorous blossoms filled the whole garden with perfume. | 芳香的花朵让整个花园弥漫着香气。 |
| **ornament** | /ˈɔːrnəmɛnt/ | v. | 装饰；点缀 | to decorate something to make it prettier | ornament | They ornament the hall with ribbons before every wedding. | 每次婚礼前他们都用彩带装饰大厅。 |
| **ornamented** | /ˈɔːrnəmɛntɪd/ | v. | 装饰了的；点缀了的 | decorated to look more beautiful | ornament | The cake was ornamented with tiny sugar flowers. | 蛋糕上点缀着小小的糖花。 |
| **ornaments** | /ˈɔːrnəmənts/ | n. | 装饰品；饰物 | pretty objects used to decorate something | ornament | We hung shiny ornaments all over the Christmas tree. | 我们在圣诞树上挂满了闪亮的装饰品。 |
| **porcelain** | /ˈpɔːrsəlɪn/ | n. | 瓷；瓷器 | fine white china used for cups and dishes | porcelain | Grandmother kept her best porcelain in a glass cabinet. | 祖母把她最好的瓷器收在玻璃柜里。 |
| **portraits** | /ˈpɔːrtrəts/ | n. | 肖像画；画像 | painted pictures of people | portrait | Old family portraits hung along the staircase wall. | 楼梯墙上挂着古老的家族肖像画。 |
| **recognised** | /ˈrɛkəɡnaɪzd/ | v. (past participle) | 认出、辨认出 | identified as something known before | recognize | I had not seen her in years, and I barely recognised her at the door. | 我好多年没见她了,在门口几乎没认出她来。 |
| **retain** | /rɪˈteɪn/ | v. | 保留、留住 | to keep and not lose or give up | retain | These plants retain their green leaves all through the winter. | 这些植物整个冬天都保留着绿叶。 |
| **retained** | /rɪˈteɪnd/ | v. (past) | 保留了、留住了 | kept and did not lose | retain | The old house retained its original wooden doors. | 那座老房子保留了它原来的木门。 |
| **reverie** | /ˈrɛvəri/ | n. | 遐想、出神的白日梦 | a state of pleasant dreamy thought | reverie | She sat by the window, lost in reverie about summer days. | 她坐在窗边,沉浸在对夏日的遐想中。 |
| **shelves** | /ʃɛlvz/ | n. (plural) | 架子、搁板 | flat boards for holding or storing things | shelf | The kitchen shelves were full of jars and bottles. | 厨房的架子上摆满了罐子和瓶子。 |
| **shine** | /ʃaɪn/ | v. | 发光、闪耀 | to give off bright light | shine | The new lamp will shine brightly in the dark room. | 这盏新灯会在昏暗的房间里明亮地闪耀。 |
| **shines** | /ʃaɪnz/ | v. (3rd person singular) | 发光、照耀(第三人称单数) | gives off bright light | shine | The sun shines over the hills every morning. | 每天早晨太阳都照耀着群山。 |
| **sleek** | /sliːk/ | adj. | 光滑柔亮的 | smooth, glossy and neat | sleek | The cat had a sleek black coat that shone in the light. | 那只猫有一身光滑发亮的黑毛,在灯光下闪闪发光。 |
| **snuffed** | /snʌft/ | v. (past) | 嗅、用鼻子探闻 | sniffed and nosed about at something | snuff | The dog snuffed around the bushes looking for a scent. | 那只狗在灌木丛周围嗅来嗅去,寻找气味。 |
| **splendidly** | /ˈsplɛndɪdli/ | adv. | 壮丽地、极好地 | in a magnificent or grand way | splendidly | The fireworks lit up the sky splendidly on New Year's Eve. | 除夕夜的烟花壮丽地照亮了天空。 |
| **stateliness** | /ˈsteɪtlinəs/ | n. | 庄严、威严高贵 | dignified and impressive grandeur | stateliness | The old oak stood with great stateliness at the garden's edge. | 那棵老橡树庄严高贵地矗立在花园边缘。 |
| **storks** | /stɔːrks/ | n. (plural) | 鹳(大型涉禽) | large long-legged wading birds | stork | Two storks built their nest on top of the tall chimney. | 两只鹳在高高的烟囱顶上筑了巢。 |
| **strawberries** | /ˈstrɔːbɛriz/ | n. (plural) | 草莓 | small sweet red fruits | strawberry | We picked fresh strawberries in the field all afternoon. | 我们整个下午都在田里采摘新鲜的草莓。 |
| **sunbeam** | /ˈsʌnbiːm/ | n. | 一束阳光 | a ray of sunlight | sunbeam | A warm sunbeam came through the window onto the floor. | 一束温暖的阳光透过窗户照在地板上。 |
| **that's** | /ðæts/ | cont. | 那是、就是('that is' 的缩略) | short form of 'that is' | that-is | That's my favorite book on the whole shelf. | 那就是整个书架上我最喜欢的书。 |
| **there's** | /ðɛrz/ | cont. | 有、那里有('there is' 的缩略) | short form of 'there is' | there-is | There's a little bird singing in the garden. | 花园里有一只小鸟在歌唱。 |
| **unloaded** | /ʌnˈloʊdɪd/ | v. (past participle) | 卸下(从车上) | taken off a cart or vehicle | unload | The boxes were unloaded from the truck into the yard. | 箱子从卡车上被卸到院子里。 |
| **vases** | /ˈveɪsɪz/ | n. (plural) | 花瓶、装饰瓶 | decorative jars for flowers or display | vase | Two tall vases stood on either side of the fireplace. | 两只高高的花瓶立在壁炉两侧。 |
| **what's** | /wʌts/ | cont. | 是什么('what is' 的缩略) | short form of 'what is' | what-is | What's inside that big wooden box? | 那个大木箱里面是什么? |
| **windowpanes** | /ˈwɪndoʊpeɪnz/ | n. (plural) | 窗玻璃 | the glass panes set in a window | windowpane | Rain tapped softly against the windowpanes all night. | 整夜细雨轻轻地敲打着窗玻璃。 |
| **christmas** | /ˈkrɪsməs/ | 专名 | 圣诞节(12月25日的西方节日) | the Christian holiday on December 25 | christmas | We put up a tree every Christmas. | 每年圣诞节我们都会摆一棵圣诞树。 |
| **chinese** | /ˌtʃaɪˈniz/ | adj. | 中国的;中国瓷的(这里指中国瓷花瓶) | of or from China | chinese | She bought a beautiful Chinese vase at the shop. | 她在店里买了一只漂亮的中国瓷花瓶。 |
| **sunday** | /ˈsʌndeɪ/ | 专名 | 星期日;礼拜天 | the first day of the week, after Saturday | sunday | On Sunday we like to sleep late. | 星期天我们喜欢睡懒觉。 |
| **humpy** | /ˈhʌmpi/ | 专名 | 洪普迪-邓普迪(故事里虚构的人物,滚下楼梯却当上国王娶了公主) | invented fairy-tale figure who fell downstairs yet became king | humpy-dumpy | The children begged for the tale of Humpy-Dumpy again. | 孩子们又央求讲洪普迪-邓普迪的故事。 |
| **dumpy** | /ˈdʌmpi/ | 专名 | 洪普迪-邓普迪(故事里虚构的人物,滚下楼梯却当上国王娶了公主) | invented fairy-tale figure who fell downstairs yet became king | humpy-dumpy | In the story, Humpy-Dumpy married the princess at last. | 在故事里,洪普迪-邓普迪最后娶了公主。 |
| **ivedy** | /ˈaɪvədi/ | 专名 | 伊威迪-阿威迪(故事里虚构的名字,孩子们想听的另一个故事) | invented nonsense name of another tale the children wanted | ivedy-avedy | Some kids shouted for the story of Ivedy-Avedy instead. | 有些孩子却嚷着要听伊威迪-阿威迪的故事。 |
| **avedy** | /ˈeɪvədi/ | 专名 | 伊威迪-阿威迪(故事里虚构的名字,孩子们想听的另一个故事) | invented nonsense name of another tale the children wanted | ivedy-avedy | Nobody knew how the tale of Ivedy-Avedy ended. | 谁也不知道伊威迪-阿威迪的故事结局如何。 |

## 请你审 / 定
1. 边界:有没有太基础该踢的?有没有专名漏网?
2. 释义:贴书里的义没?音标准没?例句简单没、没抄书没?
3. 审过 → Aaron 跑 `SQLAA/library-dict-fir-tree.sql`(幂等,无需重部署 edge)→ 书里点这些词秒出卡带音标。

> 边界:只产文件+SQL(Aaron 跑);未落库、未动读路径/收藏。绝不写那三张词汇表。
