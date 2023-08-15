import React from "react";
import { makeTree } from "./utils";
import RenderDirectory from "./Tree";
import CodeMirror from "@uiw/react-codemirror";
import { useKeyValueStore } from "./store";
import { languages } from "@codemirror/language-data";
import {
  javascript,
  javascriptLanguage,
  scopeCompletionSource,
} from "@codemirror/lang-javascript";
import Tabs from "./TabBar";
import Modal from "./Modal";
import "./backdrop.css";

const tabs = [
  { title: "Tab 1", content: "This is Tab 1 content" },
  { title: "Tab 2", content: "This is Tab 2 content" },
  { title: "Tab 3", content: "This is Tab 3 content" },
];

type file = {
  name: string;
  path: string;
  type: "blob";
  url: URL;
  sha: string;
  extensionName?: string;
};

type Folder = {
  name: string;
  path: string;
  type: "tree";
  url: URL;
  sha: string;
  children: (Folder | file)[];
};

type Directory = {
  url: string;
  sha: string;
  children: Folder;
  truncated: Boolean;
} | null;
type editorContextType = {
  handleSelectedFileChange: (f: file | undefined) => void;
  selectedFile: file | undefined;
};
const minLeftPanelWidth = 250;

const EditorContext = React.createContext<editorContextType>({
  handleSelectedFileChange: () => {},
  selectedFile: undefined,
});

export function useEditorContext() {
  const context = React.useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorContext must be used within a <Accordion />");
  }
  return context;
}

function App() {
  const [width, setWidth] = React.useState(minLeftPanelWidth);
  const [isResizing, setIsResizing] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [directory, setDirectory] = React.useState<Directory>(null);
  const [selectedFile, setSelectedFile] = React.useState<file | undefined>();
  const getFile = useKeyValueStore((state) => state.getFile);
  const setFile = useKeyValueStore((state) => state.setFile);
  const getExtensions = useKeyValueStore((state) => state.getExtensions);
  const setExtensions = useKeyValueStore((state) => state.setExtensions);
  const [loading, setLoading] = React.useState(true);
  const [showSelectRepoModal, setShowSelectRepoModal] = React.useState(false);
  // const [css, setCss] = React.useState<"loading" | "loaded" | "notRequired">(
  //   "notRequired"
  // );
  // console.log(directory);
  async function fetchExtension(extensionObj: any) {
    const response = await extensionObj.loadFunc();
    console.log(response?.extension);
    if (extensionObj) setExtensions(extensionObj.name, response?.extension);
  }

  const handleSelectedFileChange = (f: file | undefined) => {
    if (f) {
      const fileType = f?.name.split(".").at(-1);
      if (fileType) {
        const extensionObj = languages.find(({ extensions }) =>
          extensions.includes(fileType)
        );
        if (extensionObj) {
          setSelectedFile({ ...f, extensionName: extensionObj.name });
          if (getExtensions(extensionObj.name) === undefined)
            fetchExtension(extensionObj);
        } else setSelectedFile(f);
      } else setSelectedFile(f);
    } else setSelectedFile(undefined);
  };

  React.useEffect(() => {
    if (selectedFile?.sha !== undefined) {
      if (getFile(selectedFile?.sha as string) === undefined) {
        setLoading(true);
        fetch(selectedFile?.url as URL)
          .then((response) => response.json())
          .then(({ content }) => {
            setFile(
              selectedFile?.sha,
              decodeURIComponent(encodeURIComponent(window.atob(content)))
            );
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  }, [selectedFile]);

  const onChange = React.useCallback((value: string) => {
    console.log("value:", value);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return;
    const newWidth = e.clientX;
    if (newWidth > minLeftPanelWidth) setWidth(newWidth);
    else return;
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };
  const handleEditorChange = (value: string) => {
    console.log("Editor content:", value);
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const fetchRepoStructure = ({
    user,
    repoName,
    branch,
  }: {
    user: string;
    repoName: string;
    branch: string;
  }) => {
    fetch(
      `https://api.github.com/repos/${user}/${repoName}/git/trees/${branch}?recursive=1`
    )
      .then((response) => response.json())
      .then(({ tree, url, sha, truncated }) => {
        setDirectory({
          sha,
          url,
          children: makeTree(tree, repoName),
          truncated,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const openSelectRepoModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowSelectRepoModal(true);
  };

  return (
    <EditorContext.Provider value={{ handleSelectedFileChange, selectedFile }}>
      <div className="flex">
        <div ref={panelRef} style={{ width: width + 10, position: "relative" }}>
          <div className="top-0 left-0 h-screen truncate  select-none">
            <div className="h-12">
              <button onClick={openSelectRepoModal}>Open...</button>
              {/* <button onClick={() => setCss("loading")}>CSS...</button> */}
            </div>
            {Boolean(directory) ? (
              <RenderDirectory tree={directory?.children as Folder} />
            ) : null}
          </div>
          <div
            style={{ left: `${width}px` }}
            className="absolute top-0 w-2 h-screen cursor-col-resize bg-indigo-50"
            onMouseDown={handleMouseDown}
          ></div>
        </div>
        <div>
          <Tabs />

          <CodeMirror
            value={!loading ? getFile(selectedFile?.sha as string) : undefined}
            height="97vh"
            width="83dvw"
            theme="dark"
            extensions={
              selectedFile?.extensionName
                ? getExtensions(selectedFile?.extensionName) || []
                : []
              //    [
              //       javascript({ jsx: true }),
              //       javascriptLanguage.data.of({
              //         autocomplete: scopeCompletionSource(globalThis),
              //       }),
              //     ]
            }
            onChange={onChange}
          />
        </div>
      </div>
      <Modal
        open={showSelectRepoModal}
        closeModal={() => setShowSelectRepoModal(false)}
        fetchRepoStructure={fetchRepoStructure}
      />
    </EditorContext.Provider>
  );
}
export default App;

// If truncated is true, the number of items in the tree array exceeded our maximum limit.
// If you need to fetch more items, you can clone the repository and iterate over the Git data locally.
