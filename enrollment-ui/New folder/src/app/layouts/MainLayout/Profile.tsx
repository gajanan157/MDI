// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarDot, Button } from "@/components/ui";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";

export function Profile() {
  const { logout, userInfo } = useKeycloak();
  const user = {
    fullName: userInfo?.name ?? "",
  };

  const handleLogout = () => {
    logout();
  };
  // Generate 2-letter initials from name
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n: any) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  return (
    <Popover className="relative">
      {/* <div
        className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold"
        role="button"
      >
        {initials}
      </div> */}
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
        alt={user.fullName}
        indicator={
          <AvatarDot color="success" className="ltr:right-0 rtl:left-0" />
        }
        className="cursor-pointer"
      >
        {initials}
      </PopoverButton>
      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          <>
            <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
          
              <div className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                {initials}
              </div>
              <div>
               
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium text-gray-800 dark:text-gray-100">
                    {user.fullName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col pt-2 pb-5">
          
              <Button onClick={handleLogout} className="w-full gap-2">
                <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                <span>Logout</span>
              </Button>
            </div>
          </>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
