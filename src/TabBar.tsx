import React, { useState } from "react";
import { useKeyValueStore } from "./store";
import { useEditorContext } from "./App";

const Tab = ({
  active = false,
  title,
  onDragStart,
  onDragOver,
  onDrop,
  setActiveTab,
  closeTab,
}: {
  active: Boolean;
  title: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setActiveTab: () => void;
  closeTab: () => void;
}) => {
  console.log(active);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center p-1 mx-1 cursor-pointer"
      style={{ backgroundColor: active ? "#282c34" : "#242424" }}
    >
      <div onClick={setActiveTab} className="mx-1 tab-title">
        {title}
      </div>
      <button onClick={closeTab}>X</button>
    </div>
  );
};

const Tabs = () => {
  const { selectedFile, handleSelectedFileChange } = useEditorContext();
  const addTab = useKeyValueStore((state) => state.addTab);

  const deleteTab = useKeyValueStore((state) => state.deleteTab);
  const getTabs = useKeyValueStore((state) => state.getTabs);
  const [tabOrder, setTabOrder] = useState<string[]>([]);

  React.useEffect(() => {
    if (selectedFile?.sha && !tabOrder.includes(selectedFile.sha)) {
      addTab(selectedFile?.sha, selectedFile);
      console.log("inside selectedfile useeffect");
      setTabOrder([...tabOrder, selectedFile?.sha]);
    }
  }, [selectedFile]);

  React.useEffect(() => {
    console.log(tabOrder);
  }, [tabOrder]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: string
  ) => {
    e.dataTransfer.setData("tabIndex", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: string
  ) => {
    const draggedIndex = tabOrder.indexOf(e.dataTransfer.getData("tabIndex"));
    const newTabOrder = [...tabOrder];
    if (tabOrder.indexOf(targetIndex) !== -1) {
      newTabOrder.splice(
        tabOrder.indexOf(targetIndex),
        0,
        newTabOrder.splice(draggedIndex, 1)[0]
      );
      console.log("handledrop", newTabOrder);
      setTabOrder(newTabOrder);
    }
  };

  const handleTabClose = (sha: string) => {
    const newTabOrder = tabOrder.filter((tab) => tab !== sha);
    console.log("close", newTabOrder);
    const closedTabIndex = tabOrder.indexOf(sha);
    if (tabOrder.length > 1) {
      if (closedTabIndex !== 0)
        handleSelectedFileChange(tabs[tabOrder[closedTabIndex - 1]]);
      else if (closedTabIndex === 0)
        handleSelectedFileChange(tabs[tabOrder[closedTabIndex + 1]]);
    } else handleSelectedFileChange(undefined);
    setTabOrder(newTabOrder);
    // deleteTab(sha);
  };

  const tabs = getTabs();
  return (
    <div className="flex">
      {tabOrder.map((sha) => (
        <Tab
          active={sha === selectedFile?.sha}
          key={sha}
          title={tabs[sha].name}
          onDragStart={(e) => handleDragStart(e, sha)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, sha)}
          setActiveTab={() => handleSelectedFileChange(tabs[sha])}
          closeTab={() => handleTabClose(sha)}
        />
      ))}
    </div>
  );
};

export default Tabs;
