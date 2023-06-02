import React from "react";

function Input({
  defaultValue,
  onChange,
  disabled = false,
}: {
  defaultValue: string;
  onChange: (newName: string) => void;
  disabled?: boolean;
}) {
  const editableDivRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (editableDivRef.current) {
      editableDivRef.current.textContent = defaultValue;
    }
  }, [editableDivRef]);
  return (
    <div>
      <div
        ref={editableDivRef}
        contentEditable={!disabled}
        defaultValue={defaultValue}
        className="text-justify w-full break-all bg-transparent border-none selection:backdrop-brightness-110 focus-visible:outline-none focus-visible:border-none"
        onBlur={(e) => onChange(e.target.textContent || "")}
      />
    </div>
  );
}

export default Input;
