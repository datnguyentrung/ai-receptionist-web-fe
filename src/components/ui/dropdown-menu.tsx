"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import * as React from "react";

import { cn } from "./utils";

const DROPDOWN_MENU_STYLE_ID = "ui-dropdown-menu-styles";

const DROPDOWN_MENU_CSS = `
.dm-content {
  background-color: #ffffff;
  background-image: none;
  color: hsl(var(--popover-foreground));
  z-index: 50;
  min-width: 8rem;
  max-height: var(--radix-dropdown-menu-content-available-height);
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: calc(var(--radius) - 2px);
  border: 1px solid color-mix(in srgb, hsl(var(--border)) 88%, #cfd4dc);
  padding: 0.25rem;
  opacity: 1;
  backdrop-filter: none;
  box-shadow:
    0 18px 36px -18px rgb(15 23 42 / 0.32),
    0 10px 16px -12px rgb(15 23 42 / 0.2);
}

.dm-item,
.dm-checkbox-item,
.dm-radio-item,
.dm-sub-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: calc(var(--radius) - 4px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  user-select: none;
  outline: none;
}

.dm-item,
.dm-sub-trigger {
  padding: 0.375rem 0.5rem;
}

.dm-checkbox-item,
.dm-radio-item {
  padding: 0.375rem 0.5rem 0.375rem 2rem;
}

.dm-item[data-inset="true"],
.dm-label[data-inset="true"],
.dm-sub-trigger[data-inset="true"] {
  padding-left: 2rem;
}

.dm-item svg,
.dm-checkbox-item svg,
.dm-radio-item svg {
  flex-shrink: 0;
  pointer-events: none;
  width: 1rem;
  height: 1rem;
}

.dm-item svg:not([class*="size-"]) {
  color: hsl(var(--muted-foreground));
}

.dm-item:focus,
.dm-checkbox-item:focus,
.dm-radio-item:focus,
.dm-sub-trigger:focus,
.dm-sub-trigger[data-state="open"] {
  background: color-mix(in srgb, hsl(var(--accent)) 78%, white);
  color: hsl(var(--accent-foreground));
}

.dm-item[data-disabled],
.dm-checkbox-item[data-disabled],
.dm-radio-item[data-disabled] {
  pointer-events: none;
  opacity: 0.5;
}

.dm-item[data-variant="destructive"] {
  color: hsl(var(--destructive));
}

.dm-item[data-variant="destructive"]:focus {
  background: color-mix(in srgb, hsl(var(--destructive)) 10%, transparent);
  color: hsl(var(--destructive));
}

.dm-label {
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
}

.dm-separator {
  margin: 0.25rem -0.25rem;
  height: 1px;
  background: hsl(var(--border));
}

.dm-shortcut {
  margin-left: auto;
  font-size: 0.75rem;
  line-height: 1rem;
  letter-spacing: 0.1em;
  color: hsl(var(--muted-foreground));
}

.dm-item-indicator {
  pointer-events: none;
  position: absolute;
  left: 0.5rem;
  display: flex;
  width: 0.875rem;
  height: 0.875rem;
  align-items: center;
  justify-content: center;
}

.dm-sub-content {
  background-color: #ffffff;
  background-image: none;
  color: hsl(var(--popover-foreground));
  z-index: 50;
  min-width: 8rem;
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  overflow: hidden;
  border-radius: calc(var(--radius) - 2px);
  border: 1px solid color-mix(in srgb, hsl(var(--border)) 88%, #cfd4dc);
  padding: 0.25rem;
  opacity: 1;
  backdrop-filter: none;
  box-shadow:
    0 18px 36px -18px rgb(15 23 42 / 0.32),
    0 10px 16px -12px rgb(15 23 42 / 0.2);
}
`;

function useDropdownMenuStyles() {
  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.getElementById(DROPDOWN_MENU_STYLE_ID)) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = DROPDOWN_MENU_STYLE_ID;
    styleElement.textContent = DROPDOWN_MENU_CSS;
    document.head.appendChild(styleElement);
  }, []);
}

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  useDropdownMenuStyles();
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn("dm-content", className)}
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "none",
          opacity: 1,
          backdropFilter: "none",
          ...style,
        }}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("dm-item", className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn("dm-checkbox-item", className)}
      checked={checked}
      {...props}
    >
      <span className="dm-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn("dm-radio-item", className)}
      {...props}
    >
      <span className="dm-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("dm-label", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("dm-separator", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("dm-shortcut", className)}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn("dm-sub-trigger", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn("dm-sub-content", className)}
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "none",
        opacity: 1,
        backdropFilter: "none",
        ...style,
      }}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
