import React from "react";

type TreeNode = {
  path: string;
  url: URL;
  sha: string;
  type: "blob" | "tree";
};

type file = {
  name: string;
  path: string;
  url: URL;
  sha: string;
  type: "blob";
};

type Folder = {
  name: string;
  path: string;
  url: URL;
  sha: string;
  type: "tree";
  children: (Folder | file)[];
};

export const makeTree = (tree: TreeNode[] = [], repoName: string): Folder => {
  const root: Folder = {
    name: repoName,
    path: "placeholder",
    type: "tree",
    url: "placeholder" as unknown as URL,
    sha: "placeHolder",
    children: [],
  };
  tree.forEach(({ path, type, sha, url }) => {
    const breadCrumbs = path.split("/");
    let currentPath: Folder = root;
    breadCrumbs.forEach((bread: string, idx: number) => {
      //last crumb
      if (idx === breadCrumbs.length - 1) {
        const node = {
          name: bread,
          path,
          url,
          sha,
          type,
        };
        if (type === "tree") (node as Folder).children = [];
        currentPath.children.push(node as file | Folder);
      } else {
        let ancestor = currentPath.children.find(
          (child): child is Folder =>
            child.name === bread && child.type === "tree"
        );

        if (!ancestor) {
          ancestor = {
            name: bread,
            path: "placeholder",
            type: "tree",
            url: "placeholder" as unknown as URL,
            sha: "placeHolder",
            children: [],
          };
          currentPath.children.push(ancestor);
        }

        currentPath = ancestor;
      }
    });
  });
  return root;
};
// {
//     "path": "src/assets/folder.svg",
//     "mode": "100644",
//     "type": "blob",
//     "sha": "0e71f4be9fc92794682c9126cbdc76b46d4ae43d",
//     "size": 1194,
//     "url": "https://api.github.com/repos/mrityu4/directory-struct/git/blobs/0e71f4be9fc92794682c9126cbdc76b46d4ae43d"
// },
