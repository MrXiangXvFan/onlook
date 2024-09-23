import t from "@babel/types";
import { DATA_ONLOOK_ID } from "./constants";
import { compress, isReactFragment } from "./helpers";
import type { TemplateNode, TemplateTag } from "./model";

export default function babelPluginOnlook({ root = process.cwd() }): any {
  const componentStack: string[] = [];
  return {
    visitor: {
      FunctionDeclaration: {
        enter(path: any) {
          const componentName = path.node.id.name;
          componentStack.push(componentName);
        },
        exit(path: any) {
          componentStack.pop();
        },
      },
      ClassDeclaration: {
        enter(path: any) {
          const componentName = path.node.id.name;
          componentStack.push(componentName);
        },
        exit(path: any) {
          componentStack.pop();
        },
      },
      VariableDeclaration: {
        enter(path: any) {
          const componentName = path.node.declarations[0].id.name;
          componentStack.push(componentName);
        },
        exit(path: any) {
          componentStack.pop();
        },
      },
      JSXElement(path: any, state: any) {
        console.log(path, "pathpathJSXElement");
        console.log(JSON.stringify(state), "statestatestatestateJSXElement");
        const filename = state.file.opts.filename;
        const nodeModulesPath = `${root}/node_modules`;

        // Ignore node_modules
        if (filename.startsWith(nodeModulesPath)) {
          return;
        }

        // Ignore React fragment
        if (isReactFragment(path.node.openingElement)) {
          return;
        }

        // Ensure `loc` exists before accessing its properties
        if (
          !path.node.openingElement.loc ||
          !path.node.openingElement.loc.start ||
          !path.node.openingElement.loc.end
        ) {
          return;
        }

        const attributeValue = getTemplateNode(path, filename, componentStack);
        alert("")
        // Create the custom attribute
        //构造属性节点  数值名为DATA_ONLOOK_ID，属性值为attributeValue这个返回的内容
        console.log("构造节点属性");
        const onlookAttribute = t.jSXAttribute(
          t.jSXIdentifier(DATA_ONLOOK_ID),
          t.stringLiteral(attributeValue)
        );

        //记得恢复！！！
        // Append the attribute to the element
        path.node.openingElement.attributes.push(onlookAttribute);
      },
    },
  };
}

function getTemplateNode(
  path: any,
  filename: string,
  componentStack: string[]
): string {
  const startTag: TemplateTag = getTemplateTag(path.node.openingElement);
  const endTag: TemplateTag | undefined = path.node.closingElement
    ? getTemplateTag(path.node.closingElement)
    : undefined;
  const componentName =
    componentStack.length > 0
      ? componentStack[componentStack.length - 1]
      : undefined;
  const domNode: TemplateNode = {
    path: filename,
    startTag,
    endTag,
    component: componentName,
  };
  return compress(domNode);
}

function getTemplateTag(element: any): TemplateTag {
  return {
    start: {
      line: element.loc.start.line,
      column: element.loc.start.column + 1,
    },
    end: {
      line: element.loc.end.line,
      column: element.loc.end.column,
    },
  };
}
