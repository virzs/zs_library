import { Extension } from "@tiptap/core";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from "@tiptap/pm/state";
import { Fragment, Slice, Node } from "@tiptap/pm/model";
import { EditorView } from "@tiptap/pm/view";
import { serializeForClipboard } from "./clipboard-serializer";

export interface GlobalDragHandleOptions {
  /**
   * The width of the drag handle
   */
  dragHandleWidth: number;

  /**
   * The treshold for scrolling
   */
  scrollTreshold: number;

  /*
   * The css selector to query for the drag handle. (eg: '.custom-handle').
   * If handle element is found, that element will be used as drag handle. If not, a default handle will be created
   */
  dragHandleSelector?: string;

  /**
   * Tags to be excluded for drag handle
   */
  excludedTags: string[];

  /**
   * Custom nodes to be included for drag handle
   */
  customNodes: string[];
}
function absoluteRect(node: Element) {
  const data = node.getBoundingClientRect();
  const modal = node.closest('[role="dialog"]');
  const editor = node.closest(".ProseMirror");
  const editorRect = editor?.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (modal && window.getComputedStyle(modal).transform !== "none") {
    const modalRect = modal.getBoundingClientRect();
    return {
      top: data.top - modalRect.top + scrollTop,
      left: data.left - modalRect.left + scrollLeft,
      width: data.width,
    };
  }

  return {
    top: editorRect ? data.top - editorRect.top : data.top + scrollTop,
    left: editorRect ? data.left - editorRect.left : data.left + scrollLeft,
    width: data.width,
  };
}

function nodeDOMAtCoords(
  coords: { x: number; y: number },
  options: GlobalDragHandleOptions
) {
  const selectors = [
    "li",
    "p:not(:first-child)",
    "pre",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    ...options.customNodes.map((node) => `[data-type=${node}]`),
  ].join(", ");
  return document
    .elementsFromPoint(coords.x, coords.y)
    .find(
      (elem: Element) =>
        elem.parentElement?.matches?.(".ProseMirror") || elem.matches(selectors)
    );
}
function nodePosAtDOM(
  node: Element,
  view: EditorView,
  options: GlobalDragHandleOptions
) {
  const boundingRect = node.getBoundingClientRect();

  return view.posAtCoords({
    left: boundingRect.left + 50 + options.dragHandleWidth,
    top: boundingRect.top + 1,
  })?.inside;
}

function calcNodePos(pos: number, view: EditorView) {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth > 1) return $pos.before($pos.depth);
  return pos;
}

export function DragHandlePlugin(
  options: GlobalDragHandleOptions & { pluginKey: string }
) {
  let listType = "";
  let isNodeSelected = false; // 添加标记，表示当前是否有节点被选中

  function handleDragStart(event: DragEvent, view: EditorView) {
    view.focus();

    if (!event.dataTransfer) return;

    const node = nodeDOMAtCoords(
      {
        x: event.clientX + 50 + options.dragHandleWidth,
        y: event.clientY,
      },
      options
    );

    if (!(node instanceof Element)) return;

    let draggedNodePos = nodePosAtDOM(node, view, options);
    if (draggedNodePos == null || draggedNodePos < 0) return;
    draggedNodePos = calcNodePos(draggedNodePos, view);

    const { from, to } = view.state.selection;
    const diff = from - to;

    const fromSelectionPos = calcNodePos(from, view);
    let differentNodeSelected = false;

    const nodePos = view.state.doc.resolve(fromSelectionPos);

    // Check if nodePos points to the top level node
    if (nodePos.node().type.name === "doc") differentNodeSelected = true;
    else {
      const nodeSelection = NodeSelection.create(
        view.state.doc,
        nodePos.before()
      );

      // Check if the node where the drag event started is part of the current selection
      differentNodeSelected = !(
        draggedNodePos + 1 >= nodeSelection.$from.pos &&
        draggedNodePos <= nodeSelection.$to.pos
      );
    }
    let selection = view.state.selection;
    if (
      !differentNodeSelected &&
      diff !== 0 &&
      !(view.state.selection instanceof NodeSelection)
    ) {
      const endSelection = NodeSelection.create(view.state.doc, to - 1);
      selection = TextSelection.create(
        view.state.doc,
        draggedNodePos,
        endSelection.$to.pos
      );
    } else {
      selection = NodeSelection.create(view.state.doc, draggedNodePos);

      // if inline node is selected, e.g mention -> go to the parent node to select the whole node
      // if table row is selected, go to the parent node to select the whole node
      if (
        (selection as NodeSelection).node.type.isInline ||
        (selection as NodeSelection).node.type.name === "tableRow"
      ) {
        const $pos = view.state.doc.resolve(selection.from);
        selection = NodeSelection.create(view.state.doc, $pos.before());
      }
    }
    view.dispatch(view.state.tr.setSelection(selection));

    // If the selected node is a list item, we need to save the type of the wrapping list e.g. OL or UL
    if (
      view.state.selection instanceof NodeSelection &&
      view.state.selection.node.type.name === "listItem"
    ) {
      listType = node.parentElement!.tagName;
    }

    const slice = view.state.selection.content();
    const { dom, text } = serializeForClipboard(view, slice);

    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/html", dom.innerHTML);
    event.dataTransfer.setData("text/plain", text);
    event.dataTransfer.effectAllowed = "copyMove";

    event.dataTransfer.setDragImage(node, 0, 0);

    view.dragging = { slice, move: event.ctrlKey };
  }

  let dragHandleElement: HTMLElement | null = null;

  function hideDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.add("hide");
    }
  }

  function showDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.remove("hide");
    }
  }

  // 选中节点的函数
  function selectNode(view: EditorView, nodePos: number) {
    const pos = calcNodePos(nodePos, view);
    const nodeSelection = NodeSelection.create(view.state.doc, pos);
    view.dispatch(view.state.tr.setSelection(nodeSelection));
    view.focus();
    isNodeSelected = true; // 设置节点已被选中
  }

  // 更新拖拽按钮可见性的函数
  function updateHandleVisibility(view: EditorView) {
    const selection = view.state.selection;

    // 更新节点选中状态
    isNodeSelected = selection instanceof NodeSelection;

    // 检查当前选中的节点是否仍然存在
    if (isNodeSelected && dragHandleElement?.dataset.nodePos) {
      const selectedNodePos = parseInt(dragHandleElement.dataset.nodePos, 10);
      try {
        // 尝试解析该位置，如果节点已被删除将抛出错误
        const $pos = view.state.doc.resolve(selectedNodePos);
        // 检查解析出的位置是否有效，以及该位置是否仍然有节点
        const isValidPos =
          $pos && $pos.parent && $pos.parent.type.name !== "doc";
        if (!isValidPos) {
          isNodeSelected = false;
          hideDragHandle();
        }
      } catch {
        // 位置无效，节点可能已被删除
        isNodeSelected = false;
        hideDragHandle();
      }
    }

    // 如果有节点被选中且拖拽按钮可见，则不隐藏拖拽按钮
    if (
      isNodeSelected &&
      dragHandleElement &&
      !dragHandleElement.classList.contains("hide")
    ) {
      showDragHandle();
    } else if (!isNodeSelected) {
      hideDragHandle();
    }
  }

  function hideHandleOnEditorOut(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;

    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget) {
      if (!isNodeSelected) {
        // 如果没有节点被选中，才隐藏拖拽按钮
        hideDragHandle();
      }
      return;
    }

    // 检查relatedTarget是否是drag-handle本身或其子元素
    const isDragHandle =
      relatedTarget.closest(".drag-handle") ||
      relatedTarget.classList.contains("drag-handle");

    // 检查是否在编辑器内部
    const isInsideEditor =
      relatedTarget.closest(".tiptap") ||
      relatedTarget.classList.contains("tiptap");

    if (!isDragHandle && !isInsideEditor && !isNodeSelected) {
      hideDragHandle();
    }
  }

  return new Plugin({
    key: new PluginKey(options.pluginKey),
    view: (view) => {
      const handleBySelector = options.dragHandleSelector
        ? document.querySelector<HTMLElement>(options.dragHandleSelector)
        : null;
      dragHandleElement = handleBySelector ?? document.createElement("div");
      dragHandleElement.draggable = true;
      dragHandleElement.dataset.dragHandle = "";
      dragHandleElement.classList.add("drag-handle");

      function onDragHandleDragStart(e: DragEvent) {
        handleDragStart(e, view);
      }

      dragHandleElement.addEventListener("dragstart", onDragHandleDragStart);

      // 点击拖拽按钮时选中对应的块
      function onDragHandleClick(e: MouseEvent) {
        if (!handleBySelector) {
          e.preventDefault();
          e.stopPropagation();
        }

        const nodePos = dragHandleElement?.dataset.nodePos;
        if (nodePos) {
          selectNode(view, parseInt(nodePos, 10));
        }
      }

      dragHandleElement.addEventListener("click", onDragHandleClick);

      function onDragHandleDrag(e: DragEvent) {
        hideDragHandle();
        const scrollY = window.scrollY;
        if (e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY - 30, behavior: "smooth" });
        } else if (window.innerHeight - e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY + 30, behavior: "smooth" });
        }
      }

      dragHandleElement.addEventListener("drag", onDragHandleDrag);

      hideDragHandle();

      if (!handleBySelector) {
        view?.dom?.parentElement?.appendChild(dragHandleElement);
      }
      view?.dom?.parentElement?.addEventListener(
        "mouseout",
        hideHandleOnEditorOut
      );

      return {
        destroy: () => {
          if (!handleBySelector) {
            dragHandleElement?.remove?.();
          }
          dragHandleElement?.removeEventListener("drag", onDragHandleDrag);
          dragHandleElement?.removeEventListener(
            "dragstart",
            onDragHandleDragStart
          );
          dragHandleElement?.removeEventListener("click", onDragHandleClick);
          dragHandleElement = null;
          view?.dom?.parentElement?.removeEventListener(
            "mouseout",
            hideHandleOnEditorOut
          );
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, event) => {
          if (!view.editable) {
            return;
          }

          const node = nodeDOMAtCoords(
            {
              x: event.clientX + 50 + options.dragHandleWidth,
              y: event.clientY,
            },
            options
          );

          const notDragging = node?.closest(".not-draggable");
          const excludedTagList = options.excludedTags
            .concat(["ol", "ul"])
            .join(", ");

          if (
            !(node instanceof Element) ||
            node.matches(excludedTagList) ||
            notDragging
          ) {
            if (!isNodeSelected) {
              // 如果没有节点被选中，才隐藏拖拽按钮
              hideDragHandle();
            }
            return;
          }

          // 获取节点位置
          const nodePos = nodePosAtDOM(node, view, options);
          if (nodePos != null && nodePos >= 0) {
            dragHandleElement!.dataset.nodePos = String(
              calcNodePos(nodePos, view)
            );
          }

          const compStyle = window.getComputedStyle(node);
          const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
          const lineHeight = isNaN(parsedLineHeight)
            ? parseInt(compStyle.fontSize) * 1.2
            : parsedLineHeight;
          const paddingTop = parseInt(compStyle.paddingTop, 10);

          const rect = absoluteRect(node);

          rect.top += (lineHeight - 24) / 2;
          rect.top += paddingTop;
          // Li markers
          if (node.matches("ul:not([data-type=taskList]) li, ol li")) {
            rect.left -= options.dragHandleWidth - 28;
          }
          rect.width = options.dragHandleWidth;
          if (!dragHandleElement) return;

          dragHandleElement.style.position = "absolute";
          dragHandleElement.style.left = `${rect.left - rect.width}px`;
          dragHandleElement.style.top = `${rect.top}px`;
          showDragHandle();
        },
        keydown: () => {
          if (!isNodeSelected) {
            // 如果没有节点被选中，才隐藏拖拽按钮
            hideDragHandle();
          }
        },
        mousewheel: () => {
          if (!isNodeSelected) {
            // 如果没有节点被选中，才隐藏拖拽按钮
            hideDragHandle();
          }
        },
        // 在选择状态变化时更新拖拽按钮的状态
        selectionChange: (view) => {
          updateHandleVisibility(view);
        },
        // dragging class is used for CSS
        dragstart: (view) => {
          view.dom.classList.add("dragging");
        },
        drop: (view, event) => {
          view.dom.classList.remove("dragging");
          hideDragHandle();
          let droppedNode: Node | null = null;
          const dropPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!dropPos) return;

          if (view.state.selection instanceof NodeSelection) {
            droppedNode = view.state.selection.node;
          }
          if (!droppedNode) return;

          const resolvedPos = view.state.doc.resolve(dropPos.pos);

          const isDroppedInsideList =
            resolvedPos.parent.type.name === "listItem";

          // If the selected node is a list item and is not dropped inside a list, we need to wrap it inside <ol> tag otherwise ol list items will be transformed into ul list item when dropped
          if (
            view.state.selection instanceof NodeSelection &&
            view.state.selection.node.type.name === "listItem" &&
            !isDroppedInsideList &&
            listType == "OL"
          ) {
            const newList = view.state.schema.nodes.orderedList?.createAndFill(
              null,
              droppedNode
            );
            const slice = new Slice(Fragment.from(newList), 0, 0);
            view.dragging = { slice, move: event.ctrlKey };
          }
        },
        dragend: (view) => {
          view.dom.classList.remove("dragging");
        },
      },
    },
    // 简化对文档变化的监听
    state: {
      init() {
        return {};
      },
      apply(tr, value, _oldState, newState) {
        // 只在文档变化时检查当前选中的块是否存在
        if (
          tr.docChanged &&
          dragHandleElement &&
          dragHandleElement.dataset.nodePos
        ) {
          const nodePos = parseInt(dragHandleElement.dataset.nodePos, 10);
          try {
            // 尝试解析该位置，如果节点已被删除将抛出错误
            const $pos = newState.doc.resolve(nodePos);
            // 如果该位置已不再有效，则隐藏拖拽图标
            if (!$pos || $pos.parent.type.name === "doc") {
              isNodeSelected = false;
              hideDragHandle();
            }
          } catch {
            // 位置无效，节点已被删除
            isNodeSelected = false;
            hideDragHandle();
          }
        }
        return value;
      },
    },
  });
}

const GlobalDragHandle = Extension.create({
  name: "globalDragHandle",

  addOptions() {
    return {
      dragHandleWidth: 20,
      scrollTreshold: 100,
      excludedTags: [],
      customNodes: [],
    };
  },

  addProseMirrorPlugins() {
    return [
      DragHandlePlugin({
        pluginKey: "globalDragHandle",
        dragHandleWidth: this.options.dragHandleWidth,
        scrollTreshold: this.options.scrollTreshold,
        dragHandleSelector: this.options.dragHandleSelector,
        excludedTags: this.options.excludedTags,
        customNodes: this.options.customNodes,
      }),
    ];
  },
});

export default GlobalDragHandle;
