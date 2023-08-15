import React, { useEffect } from "react";
export default function Modal({
  open,
  closeModal,
  fetchRepoStructure,
}: {
  open: boolean;
  closeModal: () => void;
  fetchRepoStructure: (params: {
    user: string;
    repoName: string;
    branch: string;
  }) => void;
}) {
  const modalRef = React.useRef<HTMLDialogElement | null>(null);
  const displayRef = React.useRef<HTMLDivElement | null>(null);
  const openRef = React.useRef<Boolean>(false);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        displayRef.current &&
        !displayRef.current.contains(event.target as Node) &&
        openRef.current
      ) {
        modalRef.current?.close();
        closeModal();
      }
    }
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  React.useEffect(() => {
    openRef.current = open;
    if (open === true) {
      modalRef.current?.showModal();
    } else if (open === false) {
      modalRef.current?.close();
    }
  }, [open]);

  const getFieldsfromLink = ():
    | { user: string; repoName: string; branch: string }
    | undefined => {
    const link = (document.getElementById("repoLink") as HTMLInputElement)
      ?.value;
    // debugger;
    if (!link) return;
    const githubIndex = link.indexOf("github");
    if (githubIndex === -1) return;
    const splitLink = link.slice(githubIndex).split("/");
    const user = splitLink[1];
    const repoName = splitLink[2];
    const branch = splitLink?.[4] ?? "main";
    return { user, repoName, branch };
  };

  const fetchRepo = () => {
    const fields = getFieldsfromLink();
    console.log(fields);
    if (fields) {
      fetchRepoStructure(fields);
      closeModal();
    }
  };

  return (
    <dialog
      // open={open ? "open" : false}
      ref={modalRef}
      className="bg-transparent custom_backdrop inset-0"
    >
      <div
        ref={displayRef}
        className="w-80 h-40 mx-auto border rounded-xl flex flex-col justify-around p-2"
      >
        <div className="flex justify-center">
          <label htmlFor="repoLink">Repo link : &nbsp;</label>
          <input type="text" className="border" name="repoLink" id="repoLink" />
        </div>
        <div className="flex justify-center">
          <button
            className="w-24 h-9 px-4 py-2 border flex items-center justify-center text-white bg-black rounded-md shadow hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-300"
            onClick={fetchRepo}
          >
            Open
          </button>
        </div>
      </div>
    </dialog>
  );
}
