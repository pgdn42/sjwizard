import React, { useId } from "react";

type FloatingLabelProps = {
  label: string;
  className?: string;
  // This accepts a single React element, which can be an input, select, etc.
  children: React.ReactElement<
    React.InputHTMLAttributes<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  >;
};

export function FloatingLabel({
  label,
  className,
  children,
}: FloatingLabelProps) {
  const id = useId();

  // Clone the child (the input/select/textarea) to add the necessary props
  const child = React.cloneElement(children, {
    id: id,
    placeholder: " ", // A space is required for the :placeholder-shown selector
    className: `${children.props.className || ""} input`, // Add our 'input' class
  });

  return (
    <div className={`floating-label-container ${className || ""}`}>
      {child}
      <label htmlFor={id} className="label">
        {label}
      </label>
    </div>
  );
}
