import { StageModuleCard } from "@/components/stage/StageModuleCard";
import { JUNIOR_ARTWORK } from "@/components/stage/stageArtwork";

export type JuniorModuleIcon = keyof typeof JUNIOR_ARTWORK;

type Props = {
  title: string;
  subtitle: string;
  description: string;
  icon: JuniorModuleIcon;
  progress?: number;
  to: string;
  className?: string;
};

export function JuniorModuleCard(props: Omit<Props, "icon"> & { icon: JuniorModuleIcon }) {
  const { icon, ...rest } = props;
  return <StageModuleCard artwork={JUNIOR_ARTWORK[icon]} {...rest} />;
}
