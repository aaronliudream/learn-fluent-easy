import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * 知识点 → 宠物技能 进度推进
 * @param skillCode pet_skill_bindings.skill_code
 * @param delta 进度增量（默认 1）
 */
export async function bumpPetSkill(skillCode: string, delta = 1) {
  try {
    const { data, error } = await (supabase as any).rpc("bump_pet_skill", { _skill_code: skillCode, _delta: delta });
    if (error) { console.warn("[petSkills] failed", error); return; }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.unlocked) {
      toast.success(`✨ 宠物解锁新技能！`, { description: `已达成 ${row.threshold} 次掌握目标` });
    }
  } catch (e) { console.warn("[petSkills] exception", e); }
}