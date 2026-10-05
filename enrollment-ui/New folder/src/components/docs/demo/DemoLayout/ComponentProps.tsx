// Import Dependencies
import { ReactNode } from "react";

// Local Imports
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui";

// ----------------------------------------------------------------------

const cols = ["Prop", "Default", "Description"];

function formatDefaultPropValue(
  defaultValue: string | boolean | undefined,
): string {
  if (defaultValue === undefined || defaultValue === "") {
    return "—";
  }
  if (typeof defaultValue === "boolean") {
    return defaultValue.toString();
  }
  return defaultValue;
}

export interface PropertyProp {
  name: string;
  type: string;
  default?: string | boolean;
  description: ReactNode;
}

export interface ComponentPropsItem {
  componentName: string;
  desc?: ReactNode;
  props: PropertyProp[];
}

interface ComponentPropsProps {
  properties: ComponentPropsItem[];
}

export function ComponentProps({
  properties,
}: Readonly<ComponentPropsProps>) {
  return (
    <div className="mt-12">
      <h2 className="dark:text-dark-100 text-xl font-medium text-gray-800">
        Component API
      </h2>

      {properties.map((comp, i) => (
        <div className="mt-4" key={i}>
          <h4 className="text-sm font-medium">{comp.componentName}</h4>
          {comp.desc && <p>{comp.desc}</p>}
          <div className="hide-scrollbar min-w-full overflow-x-auto">
            <Table className="w-full min-w-[540px] text-left rtl:text-right">
              <THead>
                <Tr className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200">
                  {cols.map((title, index) => (
                    <Th
                      key={index}
                      className="dark:text-dark-100 px-0 font-semibold text-gray-800 uppercase"
                    >
                      {title}
                    </Th>
                  ))}
                </Tr>
              </THead>
              <TBody>
                {comp.props.map((tr, i) => (
                  <Tr
                    key={i}
                    className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200"
                  >
                    <Td className="w-2/12 shrink-0 px-0">
                      <code className="dark:text-dark-100 text-gray-800 before:content-['`'] after:content-['`']">
                        {tr.name}
                      </code>
                    </Td>
                    <Td className="w-2/12 shrink-0">
                      <code className="dark:text-dark-100 text-gray-800 before:content-['`'] after:content-['`']">
                        {formatDefaultPropValue(tr.default)}
                      </code>
                    </Td>
                    <Td className="w-2/3 px-0 whitespace-normal">
                      <div className="inline-code">
                        <code className="before:content-['`'] after:content-['`']">
                          {tr.type}
                        </code>
                      </div>
                      <div className="mt-1 max-w-xl min-w-80 text-balance">
                        {tr.description}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
