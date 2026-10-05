import { components, type GroupBase, type MenuListProps } from "react-select";

type DiscountCategoryOption = { label: string; value: string };

export function DiscountCategoryMenuList(
  props: MenuListProps<DiscountCategoryOption, true, GroupBase<DiscountCategoryOption>>,
) {
  return (
    <components.MenuList {...props}>
      <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-4 [&>div]:min-w-0">
        {props.children}
      </div>
    </components.MenuList>
  );
}
