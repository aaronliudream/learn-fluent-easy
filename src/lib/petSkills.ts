/**
 * 知识点 → 宠物技能 进度推进
 *
 * 【已下线 · no-op】宠物养成展示层全站下线后,本函数停止写 pet_skill_bindings,
 * 避免库里继续积累永不展示的死数据。保留签名与全部调用点(8 个刷题页原样),
 * 回归风险为零;将来若恢复宠物系统,恢复本函数体即可。DB 表/RPC 留壳不清不删。
 *
 * @param skillCode pet_skill_bindings.skill_code
 * @param delta 进度增量（默认 1）
 */
export async function bumpPetSkill(skillCode: string, delta = 1) {
  // no-op(宠物养成下线);保留签名,调用点原样。
  void skillCode; void delta;
}
