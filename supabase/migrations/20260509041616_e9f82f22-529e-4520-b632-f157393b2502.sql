-- Clean function/stopwords from vocab tables.
-- These are grammar items, not exam-tested vocabulary.
-- Junior keeps be-verbs (am/is/are/was/were/be) as anchors; gaokao removes them too.

WITH stop_common AS (
  SELECT unnest(ARRAY[
    'a','an','the',
    'i','you','he','she','it','we','they',
    'me','him','her','us','them',
    'my','your','his','its','our','their',
    'of','to','in','on','at','by','for','with','from','as',
    'and','or','but','so','if',
    'that','this','these','those',
    'do','does','did','have','has','had'
  ]) AS w
),
stop_gaokao AS (
  SELECT w FROM stop_common
  UNION SELECT unnest(ARRAY['am','is','are','was','were','be','been','being'])
)
DELETE FROM gaokao_vocab WHERE LOWER(word) IN (SELECT w FROM stop_gaokao);

DELETE FROM junior_vocab WHERE LOWER(word) IN (
  'a','an','the',
  'i','you','he','she','it','we','they',
  'me','him','her','us','them',
  'my','your','his','its','our','their',
  'of','to','in','on','at','by','for','with','from','as',
  'and','or','but','so','if',
  'that','this','these','those',
  'do','does','did','have','has','had'
);