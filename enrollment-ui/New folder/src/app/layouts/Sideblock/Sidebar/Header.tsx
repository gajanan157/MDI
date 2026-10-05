import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { Button } from "@/components/ui";
import { use920Breakpoint } from "@/hooks/use920Breakpoint";

export function Header() {
  const { close } = useSidebarContext();
  const is920AndDown = use920Breakpoint();

  return (
    <>
      <header className="relative flex h-[61px] shrink-0 items-center justify-end ltr:pr-3 ltr:pl-6 rtl:pr-6 rtl:pl-3">
        {/* Close button - only show on mobile/tablet (<= 920px) */}
        {is920AndDown && (
          <div>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="relative -top-2.5 size-6 rounded-full"
            >
              <XMarkIcon className="size-5 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </header>
    </>
  );
}
