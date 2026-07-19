-- ============================================================================
-- 图书馆插图 · 绿野仙踪 第 11–20 章(共 10 章 × 6 张 = 60 张独立高清水彩,Gemini)
-- 单文件单事务:每章①退休旧 Denslow 章首图(精确路径,position 挪负数隔离,幂等)②导入 6 张。
-- position = 【章内段号 1-based】(见 DECISIONS.md);逐图对号第几段,6 张顺情节铺开、互异。
-- 全图降采样(宽≤1000px, JPEG q82)已传桶 library-illustrations/wizard-of-oz/。ON CONFLICT 幂等。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, li.chapter_idx,
       count(*) AS rows, count(*) FILTER (WHERE li.is_published) AS published
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx BETWEEN 11 AND 20
 GROUP BY li.chapter_idx ORDER BY li.chapter_idx;

-- ---------- 第 11 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=11
   AND li.image_path = 'wizard-of-oz/ch11-oz-the-head.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 14, 'wizard-of-oz/ch11-green-bedroom.jpg', '', 'Dorothy sits on a green canopy bed holding little black Toto in a grand emerald bedroom with a glowing fountain.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 26, 'wizard-of-oz/ch11-giant-head.jpg', '', 'Dorothy and Toto stand before a huge floating bald green head above an empty jeweled throne.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 54, 'wizard-of-oz/ch11-lovely-lady.jpg', '', 'The straw Scarecrow bows before a beautiful winged lady seated on a green marble throne.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 69, 'wizard-of-oz/ch11-terrible-beast.jpg', '', 'The Tin Woodman stands facing a huge shaggy furry beast in the green marble throne room.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 80, 'wizard-of-oz/ch11-ball-of-fire.jpg', '', 'The Cowardly Lion cowers before a blazing ball of fire hovering above the emerald throne.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 11, 88, 'wizard-of-oz/ch11-friends-gather.jpg', '', 'The Lion, Dorothy, Toto, the Scarecrow, and the Tin Woodman sit together looking sad in a green room.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 12 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=12
   AND li.image_path = 'wizard-of-oz/ch12-witch-monkey.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 11, 'wizard-of-oz/ch12-witch-watching.jpg', '', 'An old witch in a golden pointed cap leans on her castle wall, holding an umbrella and peering out over the yellow hills with one eye.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 19, 'wizard-of-oz/ch12-woodman-wolves.jpg', '', 'The Tin Woodman raises his shiny axe to meet a charging pack of gray wolves while Dorothy, the Scarecrow, and the Lion stand behind him in the tall grass.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 27, 'wizard-of-oz/ch12-scarecrow-crows.jpg', '', 'The Scarecrow stands on the road with his arms stretched wide as a huge flock of black crows swoops toward him across the yellow sky.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 49, 'wizard-of-oz/ch12-monkeys-flying.jpg', '', 'Winged Monkeys fly the Scarecrow, Tin Woodman, Dorothy with Toto, and the Lion high through the air above the golden towers of a city.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 60, 'wizard-of-oz/ch12-dorothy-scrubbing.jpg', '', 'Dorothy kneels scrubbing the stone kitchen floor while the old witch leans over her with an umbrella and the caged Lion watches through an archway.', '', 1000, 558, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 12, 77, 'wizard-of-oz/ch12-witch-melting.jpg', '', 'Dorothy holds an empty wooden bucket as the drenched witch shrinks and melts into a brown puddle on the kitchen floor, her golden cap fallen beside her.', '', 1000, 558, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 13 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=13
   AND li.image_path = 'wizard-of-oz/ch13-tinsmiths.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 2, 'wizard-of-oz/ch13-winkies-rejoice.jpg', '', 'Dorothy and Toto stand in the yellow castle courtyard as the joyful yellow Winkies toss their hats into the air to celebrate their freedom.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 7, 'wizard-of-oz/ch13-carry-woodman.jpg', '', 'Four yellow Winkies carry the battered Tin Woodman on a stretcher across the yellow hills while Dorothy and Toto walk sadly beside them.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 11, 'wizard-of-oz/ch13-mending-woodman.jpg', '', 'Yellow-clad tinsmiths hammer and polish the smiling Tin Woodman back into shape beside a glowing forge in the castle workshop.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 19, 'wizard-of-oz/ch13-restuff-scarecrow.jpg', '', 'Blue-dressed Winkies stuff the floppy Scarecrow with fresh straw while a delighted Dorothy claps her hands nearby.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 26, 'wizard-of-oz/ch13-winkies-farewell.jpg', '', 'A row of yellow Winkies kneels fondly before the Tin Woodman to say good-bye as Dorothy watches under a bright sky.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 13, 28, 'wizard-of-oz/ch13-golden-cap.jpg', '', 'Dorothy lifts the jeweled Golden Cap from the Witch''s cupboard while Toto looks up at her from the stone floor.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 14 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=14
   AND li.image_path = 'wizard-of-oz/ch14-winged-monkeys.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 20, 'wizard-of-oz/ch14-saying-charm.jpg', '', 'Wearing the jeweled Golden Cap, Dorothy balances on one foot and raises her hand while the Scarecrow, Tin Woodman, Lion, and Toto watch on the yellow road.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 25, 'wizard-of-oz/ch14-king-bows.jpg', '', 'The crowned Winged Monkey King kneels and bows low before Dorothy, who holds the Golden Cap in her arms as more monkeys fly through the sky behind them.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 27, 'wizard-of-oz/ch14-flight-to-city.jpg', '', 'Dorothy, Toto, the Scarecrow, the Tin Woodman, and the Lion ride on the backs of Winged Monkeys, flying high over green fields toward the distant Emerald City.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 33, 'wizard-of-oz/ch14-king-tells-story.jpg', '', 'The winged Monkey King sits on a rock and gestures as Dorothy rests her chin in her hand and listens, with other monkeys gathered around on the grassy hilltop.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 35, 'wizard-of-oz/ch14-quelala-river.jpg', '', 'Three laughing Winged Monkeys tip the finely dressed prince Quelala headfirst into a garden river while the angry princess Gayelette scowls in her purple robe.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 14, 41, 'wizard-of-oz/ch14-emerald-city-gate.jpg', '', 'The four friends and Toto stand before the sparkling green gates of the Emerald City as the Winged Monkeys fly away into the sky above them.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 15 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=15
   AND li.image_path = 'wizard-of-oz/ch15-humbug.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 2, 'wizard-of-oz/ch15-guardian-gate.jpg', '', 'The green-bearded Guardian of the Gates stares in surprise at Dorothy, the Scarecrow, the Tin Woodman, and the Lion in a shining green hall.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 16, 'wizard-of-oz/ch15-empty-throne.jpg', '', 'Dorothy and her friends with Toto stand in a vast green marble hall gazing at a tall empty throne with no wizard in sight.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 17, 'wizard-of-oz/ch15-voice-dome.jpg', '', 'Dorothy and her companions look up in wonder toward the top of the green throne room as a mysterious voice speaks.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 33, 'wizard-of-oz/ch15-toppled-screen.jpg', '', 'The Lion roars and little Toto races away as a tall folding screen tips over in the green throne room.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 34, 'wizard-of-oz/ch15-humbug-revealed.jpg', '', 'A small bald old man clutching a brass horn stands exposed behind the fallen screen while the startled friends stare at him.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 15, 60, 'wizard-of-oz/ch15-wizard-tricks.jpg', '', 'The little old wizard sits and explains himself to a stern Dorothy, with a giant papier-mache head, fairy wings, and a star-covered robe scattered on the floor.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 16 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=16
   AND li.image_path = 'wizard-of-oz/ch16-brains.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 10, 'wizard-of-oz/ch16-bran-brains.jpg', '', 'The little old wizard pours bran mixed with pins and needles into the Scarecrow''s empty burlap head.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 11, 'wizard-of-oz/ch16-head-refastened.jpg', '', 'The old wizard fastens the pin-covered head back onto the seated Scarecrow.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 23, 'wizard-of-oz/ch16-heart-shown.jpg', '', 'The wizard holds up a pretty red silk heart while the Tin Woodman clasps his hands in delight.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 25, 'wizard-of-oz/ch16-heart-placed.jpg', '', 'The wizard tucks the red heart into the square hole cut in the Tin Woodman''s chest.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 38, 'wizard-of-oz/ch16-courage-drink.jpg', '', 'The wizard pours green liquid into a dish as the Cowardly Lion laps it up with his tongue.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 16, 40, 'wizard-of-oz/ch16-friends-reunited.jpg', '', 'The Scarecrow, Tin Woodman, Lion, and Dorothy stand together on the yellow brick road with the Emerald City behind them.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 17 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=17
   AND li.image_path = 'wizard-of-oz/ch17-balloon.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 17, 'wizard-of-oz/ch17-sewing-silk.jpg', '', 'An old man and a girl in a blue checkered dress sit on the floor sewing long strips of green silk together.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 21, 'wizard-of-oz/ch17-inflating-balloon.jpg', '', 'A big green balloon swells over a blazing fire beside a wicker basket in the courtyard of the green palace.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 26, 'wizard-of-oz/ch17-chasing-toto.jpg', '', 'The girl races down the yellow brick road after her little black dog, who is chasing a small gray kitten.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 27, 'wizard-of-oz/ch17-reaching-for-dorothy.jpg', '', 'The old wizard leans out of the balloon basket, stretching his hand toward a running girl in a checkered dress.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 30, 'wizard-of-oz/ch17-rising-over-crowd.jpg', '', 'The green balloon floats up above a huge crowd of people gathered in the Emerald City.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 17, 31, 'wizard-of-oz/ch17-farewell-sky.jpg', '', 'A girl holding her dog watches from a hilltop as the tiny green balloon drifts far away into the wide sky.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 18 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=18
   AND li.image_path = 'wizard-of-oz/ch18-scarecrow-throne.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 1, 'wizard-of-oz/ch18-friends-mourn.jpg', '', 'Dorothy sits on the floor wiping away tears with Toto in her lap, while the Scarecrow, the Tin Woodman, and the Lion sit sadly beside her.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 5, 'wizard-of-oz/ch18-scarecrow-ruler.jpg', '', 'The Scarecrow wearing a golden crown sits proudly on the green jeweled throne while green-robed people bow before him.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 16, 'wizard-of-oz/ch18-calling-monkeys.jpg', '', 'Dorothy stands on a green rooftop wearing the Golden Cap and raises her hand as many Winged Monkeys fly toward her over the Emerald City.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 21, 'wizard-of-oz/ch18-monkey-king-leaves.jpg', '', 'The Winged Monkey King spreads his great wings and flies off above the Emerald City as Dorothy watches, holding the Golden Cap.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 30, 'wizard-of-oz/ch18-green-soldier.jpg', '', 'The green-whiskered soldier points into the distance as he gives advice to Dorothy, who looks up at him hopefully.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 18, 47, 'wizard-of-oz/ch18-leaving-city.jpg', '', 'Dorothy, the Tin Woodman, the Lion, and Toto walk out through the green gate onto the yellow brick road while the crowned Scarecrow waves goodbye from the wall.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 19 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=19
   AND li.image_path = 'wizard-of-oz/ch19-fighting-trees.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 7, 'wizard-of-oz/ch19-journey-south.jpg', '', 'Dorothy, the Tin Woodman, the Scarecrow, and the Lion stroll happily along the yellow brick road through sunny green fields toward the south.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 15, 'wizard-of-oz/ch19-thick-wood-edge.jpg', '', 'The four friends stop at the edge of a gloomy forest of huge gnarled trees while the Lion sits and studies the way ahead.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 16, 'wizard-of-oz/ch19-scarecrow-tossed.jpg', '', 'A tree branch grabs the Scarecrow and flings him through the air in a shower of straw while Dorothy, the Tin Woodman, and the Lion gasp in alarm.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 21, 'wizard-of-oz/ch19-menacing-trees.jpg', '', 'The travelers walk warily down a narrow forest path lined by tall trees with angry scowling faces glaring down at them.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 22, 'wizard-of-oz/ch19-woodman-chops-tree.jpg', '', 'The Tin Woodman swings his axe and cuts through a reaching tree branch, sending splinters and sparks flying.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 19, 25, 'wizard-of-oz/ch19-high-white-wall.jpg', '', 'At the far edge of the wood the four companions stand before a tall smooth white wall as Dorothy presses her hands against it.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

-- ---------- 第 20 章 ----------
UPDATE public.library_illustrations li
   SET is_published=false, position = li.position - 1000
  FROM public.library_books b
 WHERE b.id=li.book_id AND b.book_key='wizard-of-oz' AND li.chapter_idx=20
   AND li.image_path = 'wizard-of-oz/ch20-china-country.jpg' AND li.position >= 0;

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 9, 'wizard-of-oz/ch20-climb-wall.jpg', '', 'Dorothy, the Scarecrow, the Lion, and the Tin Woodman climb a wooden ladder up the side of a giant white china wall.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 10, 'wizard-of-oz/ch20-china-view.jpg', '', 'Dorothy and a furry companion look down from the wall at a wide land of tiny blue-and-white china houses, people, and cows.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 17, 'wizard-of-oz/ch20-broken-cow.jpg', '', 'Dorothy kneels and stares at a little china cow with its broken leg lying on the ground beside an angry china milkmaid.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 24, 'wizard-of-oz/ch20-chase-princess.jpg', '', 'Dorothy stretches out her hand toward a tiny china princess in a flowered gown who runs away across the smooth white floor.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 36, 'wizard-of-oz/ch20-clown-headstand.jpg', '', 'A laughing Dorothy watches a cracked china clown balance upside down on his head.', '', 1000, 559, true),
  ((SELECT id FROM public.library_books WHERE book_key='wizard-of-oz'), 20, 43, 'wizard-of-oz/ch20-lion-church.jpg', '', 'The great Lion leaps over the wall and his swishing tail knocks a little blue-and-white china church into pieces as Dorothy gasps.', '', 1000, 559, true)
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path=EXCLUDED.image_path, caption=EXCLUDED.caption, alt_text=EXCLUDED.alt_text,
  credit=EXCLUDED.credit, width=EXCLUDED.width, height=EXCLUDED.height, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, li.chapter_idx,
       count(*) AS rows,
       count(*) FILTER (WHERE li.is_published) AS published,
       count(*) FILTER (WHERE NOT li.is_published) AS retired
  FROM public.library_illustrations li JOIN public.library_books b ON b.id=li.book_id
 WHERE b.book_key='wizard-of-oz' AND li.chapter_idx BETWEEN 11 AND 20
 GROUP BY li.chapter_idx ORDER BY li.chapter_idx;

COMMIT;
