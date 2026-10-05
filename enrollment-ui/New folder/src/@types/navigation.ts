import { NavigationType } from "@/constants/app";

export interface NavigationTree {
  id: string;
  type: NavigationType;
  path?: string;
  title?: string;
  transKey?: string;
  icon?: string;
  childs?: NavigationTree[];
  roles?: any[]
  permission?: string
  /** When true, hide from sidebar/menus without removing the nav entry or route. */
  hidden?: boolean
}
