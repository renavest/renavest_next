import { Advisor } from "@/src/shared/types";
export interface AdvisorPopoverProps {
  advisor: Advisor | null;
  isOpen: boolean;
  position: string;
  onClose: () => void;
}
