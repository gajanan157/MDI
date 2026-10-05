import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

// Define props interface
interface AddButtonProps {
  label: string;
  path: string;
  title: string;
  className?: string; 
}

const AddButton: React.FC<AddButtonProps> = ({ label, path, className,title }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex justify-start h-8  text-[11px]  ${className ?? ""}`} title={title}>
      <Button color="primary"  onClick={() => navigate(path)}>
        {label}
      </Button>
    </div>
  );
};

export default AddButton;
