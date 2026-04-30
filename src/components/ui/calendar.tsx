"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  DayFlag,
  DayPicker,
  SelectionState,
  UI,
  type ChevronProps,
} from "react-day-picker";

import { buttonVariants } from "./button";
import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row gap-2",
        [UI.Month]: "relative flex flex-col gap-4",
        [UI.MonthCaption]:
          "flex justify-center pt-1 relative items-center w-full",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center",
        [UI.Week]: "flex w-full mt-2",
        [UI.Day]: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range" ? "rounded-none" : "rounded-md",
        ),
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal",
        ),
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 top-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 top-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        [UI.Chevron]: "size-4",
        [SelectionState.selected]:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        [SelectionState.range_start]:
          "bg-primary text-primary-foreground rounded-l-md",
        [SelectionState.range_end]:
          "bg-primary text-primary-foreground rounded-r-md",
        [SelectionState.range_middle]:
          "bg-accent text-accent-foreground rounded-none",
        [DayFlag.today]: "bg-accent text-accent-foreground",
        [DayFlag.outside]: "text-muted-foreground",
        [DayFlag.disabled]: "text-muted-foreground opacity-50",
        [DayFlag.hidden]: "invisible",
        [DayFlag.focused]: "relative z-20",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }: ChevronProps) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;

          return <Icon className={cn("size-4", className)} {...props} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
