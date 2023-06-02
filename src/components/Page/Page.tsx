import React, { useEffect } from "react";
import Input from "../input/input";
import { storePageBlocks, getPageBlocks } from "../../store";
import { colors, wframes } from "../../assets/constants/contants";
import BlockComponent from "../Block/Block";
type Block = {
  name: string;
  key: string;
  color: typeof colors[number];
  wframe: keyof typeof wframes | undefined;
};
type Blocks = Block[];

function Page({
  pagekey,
  name,
  parentKey,
  updatePage,
  onPageAdd,
  collapsed,
  toggleCollapse,
  hasChild,
}: {
  pagekey: string;
  name: string;
  parentKey: string;
  collapsed: Boolean;
  hasChild: Boolean;
  updatePage: (newName: string, key: string) => void;
  onPageAdd: (parentKey: string) => void;
  toggleCollapse: () => void;
}) {
  if (!pagekey) return null;
  const [blocks, setBlocks] = React.useState<Blocks>();
  console.log(pagekey, collapsed);
  React.useEffect(() => {
    const readPageBlocks = async () => {
      const storedPageBlocks = await getPageBlocks(pagekey);
      console.log(storedPageBlocks);
      if (storedPageBlocks) setBlocks(storedPageBlocks?.blocks);
    };
    readPageBlocks();
  }, []);

  const onBlockAdd = () => {
    const newBlock: Block = {
      name: "",
      key: crypto.randomUUID(),
      color: "blue",
      wframe: "img1",
    };
    let pageBlocks: Blocks = [];
    if (blocks?.length) {
      pageBlocks = [...blocks];
    }
    pageBlocks.push(newBlock);

    storePageBlocks({
      key: pagekey,
      blocks: pageBlocks,
    });
    setBlocks(pageBlocks);
  };

  const onBlockChange = (modifiedBlock: Block) => {
    if (blocks?.length) {
      const index = blocks.findIndex((item) => item.key === modifiedBlock.key);
      if (index !== -1) {
        const newBlocks = [
          ...blocks.slice(0, index),
          modifiedBlock,
          ...blocks.slice(index + 1),
        ];
        storePageBlocks({
          key: pagekey,
          blocks: newBlocks,
        });
        setBlocks(newBlocks);
      }
    }
  };

  const deleteBlock = (key: string) => {
    if (blocks?.length) {
      const newBlocks = blocks.filter((b) => b.key !== key);
      storePageBlocks({
        key: pagekey,
        blocks: newBlocks,
      });
      setBlocks(newBlocks);
    }
  };

  const duplicateBlock = (key: string) => {
    if (blocks?.length) {
      const index = blocks.findIndex((b) => b.key === key);
      if (index !== -1) {
        const newBlock: Block = {
          ...blocks[index],
          key: crypto.randomUUID(),
        };

        const newBlocks = [
          ...blocks.slice(0, index + 1),
          newBlock,
          ...blocks.slice(index + 1),
        ];

        storePageBlocks({
          key: pagekey,
          blocks: newBlocks,
        });
        setBlocks(newBlocks);
      }
    }
  };
  return (
    <div className="relative mx-auto border-2 border-teal-600 rounded-lg w-28">
      <Input
        defaultValue={name}
        onChange={(newName) => updatePage(newName, pagekey)}
      />
      {blocks?.map((b) => (
        <BlockComponent
          key={b.key}
          onBlockAdd={onBlockAdd}
          data={b}
          duplicateBlock={duplicateBlock}
          deleteBlock={deleteBlock}
          onBlockChange={onBlockChange}
        />
      ))}
      {!blocks && <button onClick={onBlockAdd}>Add Block</button>}
      {pagekey !== "homepage" && (
        <button
          style={{
            position: "absolute",
            right: -12,
            top: 15,
            backgroundColor: "darkgray",
          }}
          onClick={() => onPageAdd(parentKey)}
        >
          +
        </button>
      )}
      {hasChild && (
        <button
          style={{
            position: "absolute",
            left: -9,
            bottom: -12,
            backgroundColor: "darkgray",
            transform: collapsed ? "rotateX(0deg)" : "rotateX(180deg)",
          }}
          onClick={toggleCollapse}
        >
          V
        </button>
      )}
      <button
        style={{
          position: "absolute",
          left: "47%",
          bottom: -12,
          backgroundColor: "darkgray",
        }}
        onClick={() => onPageAdd(pagekey)}
      >
        +
      </button>
    </div>
  );
}

export default Page;
