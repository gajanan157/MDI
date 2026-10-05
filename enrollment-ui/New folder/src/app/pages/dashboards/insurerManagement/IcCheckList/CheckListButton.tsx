interface CheckListButtonProps {
  onClick: () => void;
  label: string;
  bgColor?: string;
  textColor?: string;
  activeBgColor?: string;
  activeTextColor?: string;
  isActive?: boolean;
  size?: string;
  className?: string;
  isSearch?: boolean;
  disabled?: boolean;
  variant?: "solid" | "link";
  showChatIcon?: boolean;
  chatIconColor?: string;
}
import { ChatBubbleLeftRightIcon,MagnifyingGlassIcon } from "@heroicons/react/24/outline";


const CheckListButton: React.FC<CheckListButtonProps> = ({
  onClick,
  label,
  bgColor = "bg-gray-200",
  textColor = "text-gray-800",
  activeBgColor = "bg-gray-600",
  activeTextColor = "text-white",
  isActive = false,
  isSearch = false,
  size = "text-xs",
  className = "",
  variant = "solid",
  disabled = false,
  showChatIcon = false,
  chatIconColor = "text-blue-500",
}) => {
  if (variant === "link") {
    return (
      <button
        onClick={onClick}
        className={`text-blue-600 underline ${size} cursor-pointer ${className}`}>
        {label}
      </button>
    );
  }
  const finalBg = isActive ? activeBgColor : bgColor;
  const finalText = isActive ? activeTextColor : textColor;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded cursor-pointer ${size} ${finalBg} ${finalText} ${className}`}>
      {isSearch && (
          <MagnifyingGlassIcon className="h-3.5 w-3.5" />)}
            {showChatIcon && (
        <ChatBubbleLeftRightIcon className={`h-4 w-4 ${chatIconColor}`} />
      )}
      {label}
    </button>
  );
};
export default CheckListButton;
