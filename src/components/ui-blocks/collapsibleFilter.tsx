import { ChevronDown, LucideIcon } from "lucide-react";
import React, { ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

const CollapsibleFilter = ({
    title,
    icon: Icon,
    children,
    className,
    defaultOpen = true,
  }: {
    title: string;
    icon?: LucideIcon;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between py-3">
        <h3 className={"flex items-center gap-2 text-base font-semibold"}>
          {!!Icon && <Icon className="h-5 w-5" />} {title}
        </h3>
        <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 transition-transform text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  )
};
export default CollapsibleFilter;
  