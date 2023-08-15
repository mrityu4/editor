import folder from "./assets/folder.svg";
import arrow from "./assets/arrow.svg";
import jsIcon from "./assets/js.svg";
import React from "react";
import { useEditorContext } from "./App";

type file = {
  name: string;
  path: string;
  type: "blob";
  url: URL;
  sha: string;
};

type Folder = {
  name: string;
  path: string;
  type: "tree";
  url: URL;
  sha: string;
  children: (Folder | file)[];
};
type editorContextType = {
  setSelectedFile: React.Dispatch<React.SetStateAction<file | undefined>>;
};

function RenderDirectory({ tree }: { tree: Folder | file }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const editorContext = useEditorContext();
  const { handleSelectedFileChange } = editorContext;

  if (tree.type === "tree") {
    return (
      <React.Fragment key={tree.sha}>
        <span
          key={`${tree.sha}-span`}
          className="flex items-center cursor-pointer hover:bg-gray-600"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <img
            key={`${tree.sha}-arrow-icon`}
            src={arrow}
            className={isExpanded ? "rotate-90 h-6" : "h-6"}
            alt="folder-icon"
          />
          <img
            key={`${tree.sha}-folder-icon`}
            src={folder}
            alt="folder-icon"
            className="h-6 mr-1"
          />
          {tree.name}
        </span>
        <div style={{ paddingLeft: "14px" }} key={`${tree.sha}-div`}>
          {isExpanded && tree.children.map((t) => <RenderDirectory tree={t} />)}
        </div>
      </React.Fragment>
    );
  } else {
    const extension = tree.name.split(".").at(-1)?.slice(0, 2).toUpperCase();
    return (
      <div
        key={tree.sha}
        className="flex cursor-pointer items-center hover:bg-gray-600"
        onClick={() => handleSelectedFileChange(tree)}
      >
        <div className="flex font-semibold items-center justify-center capitalize h-4 w-4 font-mono rounded bg-blue-200 text-gray-800 text-10 mr-1">
          {extension}
        </div>
        {tree.name}
      </div>
    );
  }
}
export default RenderDirectory;
