// src/components/shared/RoleSwitcher.tsx
import { useState } from "react";
import { UserRole } from "@/hooks/useUserRole";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export function RoleSwitcher({ currentRole, onRoleChange, className }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || "checker");

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    onRoleChange(role);
  };

  return (
    <div className={`flex items-center gap-4 rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 shadow-md dark:from-dark-800 dark:to-dark-700 dark:border-dark-600 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Role:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRoleChange("maker")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
              selectedRole === "maker"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 ring-offset-2"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-gray-400 dark:hover:bg-dark-500"
            }`}
          >
            {selectedRole === "maker" && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
            )}
            <span className="text-sm font-semibold">Maker</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("checker")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
              selectedRole === "checker"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/50 ring-2 ring-green-400 ring-offset-2"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-gray-400 dark:hover:bg-dark-500"
            }`}
          >
            {selectedRole === "checker" && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
            )}
            <span className="text-sm font-semibold">Checker</span>
          </button>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {selectedRole === "maker" 
            ? "View & Comment Only" 
            : "Full Access - Edit, Delete, Add, Upload & Comment"}
        </span>
      </div>
    </div>
  );
}

