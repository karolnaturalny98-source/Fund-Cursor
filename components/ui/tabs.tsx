"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const TabsIdContext = React.createContext<string | undefined>(undefined);

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ children, ...props }, ref) => {
  const id = React.useId();
  const normalizedId = id.replace(/:/g, "");

  return (
    <TabsIdContext.Provider value={`radix-${normalizedId}`}>
      <TabsPrimitive.Root ref={ref} {...props}>
        {children}
      </TabsPrimitive.Root>
    </TabsIdContext.Provider>
  );
});

Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex flex-wrap items-center justify-center rounded-full bg-muted/20 p-[clamp(0.35rem,0.5vw,0.45rem)] text-muted-foreground fluid-stack-2xs",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => {
  const prefix = React.useContext(TabsIdContext);
  const triggerId = prefix && value ? `${prefix}-trigger-${value}` : undefined;
  const contentId = prefix && value ? `${prefix}-content-${value}` : undefined;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      id={triggerId}
      value={value}
      aria-controls={contentId}
      className={cn(
        "group inline-flex min-w-[clamp(7.5rem,11vw,9rem)] items-center justify-between whitespace-nowrap rounded-full border font-semibold transition-all duration-200 gap-[clamp(0.294rem,0.672vw,0.504rem)] h-[clamp(1.89rem,1.092vw+1.512rem,2.1rem)] px-[clamp(0.84rem,1.176vw+0.63rem,1.26rem)] text-[clamp(0.63rem,0.336vw+0.546rem,0.714rem)]",
        "border-transparent bg-muted/30 text-muted-foreground",
        "data-[state=inactive]:text-muted-foreground/80 data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:border-primary/40 data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:shadow-[0_30px_65px_-40px_rgba(15,23,42,0.45)]",
        "data-[state=active]:border-primary/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]",
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, value, ...props }, ref) => {
  const prefix = React.useContext(TabsIdContext);
  const triggerId = prefix && value ? `${prefix}-trigger-${value}` : undefined;
  const contentId = prefix && value ? `${prefix}-content-${value}` : undefined;

  return (
    <TabsPrimitive.Content
      ref={ref}
      id={contentId}
      aria-labelledby={triggerId}
      value={value}
      className={cn(
        "mt-[clamp(1.25rem,2vw,1.75rem)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
