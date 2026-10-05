import React from "react";

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  errormsg?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  className = "",
  errormsg = "",
}) => {
  return (
    <h3
      className={`sub_section_title mb-2 flex items-center gap-2 text-xl font-semibold text-gray-700 ${className}`}
    >
      {icon && <span className="icon">{icon}</span>}
      {title}
      {errormsg&& <span>({errormsg})</span> }
    </h3>
  );
};

export default SectionTitle;
