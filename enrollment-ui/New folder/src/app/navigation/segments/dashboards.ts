import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";
import dashboardsNavigation from "./dashboards.navigation.json";

export const dashboards: NavigationTree = {
  ...baseNavigationObj["/"],
  type: "root",
  childs: dashboardsNavigation as NavigationTree[],
};
