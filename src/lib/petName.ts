/**
 * 宠物昵称按当前语言显示。数据库存的是用户领养时的原始字符串
 * （通常是中文默认名），这里在非中文界面下回退到英文默认名。
 */
export const DEFAULT_PET_NAMES: Record<string, { zh: string; en: string }> = {
  lumi_spark: { zh: "绿芽精灵", en: "Sprout Spirit" },
  fire_fox: { zh: "火焰狐", en: "Fire Fox" },
  rainbow_whale: { zh: "彩虹鲸", en: "Rainbow Whale" },
};

export function displayPetName(
  pet: { nickname: string; species_id: string },
  lang: string,
): string {
  const defaults = DEFAULT_PET_NAMES[pet.species_id];
  if (!defaults) return pet.nickname;
  const isZh = lang === "zh" || lang === "zh-TW";
  if (!isZh && pet.nickname === defaults.zh) return defaults.en;
  if (isZh && pet.nickname === defaults.en) return defaults.zh;
  return pet.nickname;
}

export function defaultPetNameForLang(speciesId: string, lang: string): string {
  const defaults = DEFAULT_PET_NAMES[speciesId];
  if (!defaults) return "";
  return lang === "zh" || lang === "zh-TW" ? defaults.zh : defaults.en;
}