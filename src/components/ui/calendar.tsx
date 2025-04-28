/* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import * as React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { DayPicker } from "react-day-picker";

// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";

// export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   ...props
// }: CalendarProps) {
//   return (
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn("p-3", className)}
//       classNames={{
//         month: "space-y-4",
//         months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 relative",
//         month_caption: "flex justify-center pt-1 relative items-center",
//         month_grid: "w-full border-collapse space-y-1",
//         caption_label: "text-sm font-medium",
//         nav: "flex items-center justify-between absolute inset-x-0",
//         button_previous: cn(
//           buttonVariants({ variant: "outline" }),
//           "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
//         ),
//         button_next: cn(
//           buttonVariants({ variant: "outline" }),
//           "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
//         ),
//         weeks: "w-full border-collapse space-y-",
//         weekdays: "flex",
//         weekday:
//           "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]",
//         week: "flex w-full mt-2",
//         day_button:
//           "h-9 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//         day: cn(
//           buttonVariants({ variant: "ghost" }),
//           "h-9 w-12 p-0 font-normal aria-selected:opacity-100",
//         ),
//         range_end: "day-range-end",
//         selected:
//           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
//         today: "bg-accent text-accent-foreground",
//         outside:
//           "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
//         disabled: "text-muted-foreground opacity-50",
//         range_middle:
//           "aria-selected:bg-accent aria-selected:text-accent-foreground",
//         hidden: "invisible",
//         ...classNames,
//       }}
//       components={{
//         Chevron: ({ ...props }) =>
//           props.orientation === "left" ? (
//             <ChevronLeft {...props} className="h-4 w-4" />
//           ) : (
//             <ChevronRight {...props} className="h-4 w-4" />
//           ),
//       }}
//       {...props}
//     />
//   );
// }
// Calendar.displayName = "Calendar";

// export { Calendar };

"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { differenceInCalendarDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
  type DayPickerProps,
} from "react-day-picker";

export type CalendarProps = DayPickerProps & {
  /**
   * In the year view, the number of years to display at once.
   * @default 12
   */
  yearRange?: number;

  /**
   * Wether to show the year switcher in the caption.
   * @default true
   */
  showYearSwitcher?: boolean;

  monthsClassName?: string;
  monthCaptionClassName?: string;
  weekdaysClassName?: string;
  weekdayClassName?: string;
  monthClassName?: string;
  captionClassName?: string;
  captionLabelClassName?: string;
  buttonNextClassName?: string;
  buttonPreviousClassName?: string;
  navClassName?: string;
  monthGridClassName?: string;
  weekClassName?: string;
  dayClassName?: string;
  dayButtonClassName?: string;
  rangeStartClassName?: string;
  rangeEndClassName?: string;
  selectedClassName?: string;
  todayClassName?: string;
  outsideClassName?: string;
  disabledClassName?: string;
  rangeMiddleClassName?: string;
  hiddenClassName?: string;
};

type NavView = "days" | "years" | "months";

/**
 * A custom calendar component built on top of react-day-picker.
 * @param props The props for the calendar.
 * @default yearRange 12
 * @returns
 */
function Calendar({
  className,
  showOutsideDays = true,
  showYearSwitcher = true,
  yearRange = 24,
  numberOfMonths,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<NavView>("days");
  const [selectedYear, setSelectedYear] = React.useState<number>(() => {
    // Handle different mode types safely
    if (props.mode === "single") {
      return (
        (props.selected as Date)?.getFullYear() ?? new Date().getFullYear()
      );
    } else if (props.mode === "range" || props.mode === "multiple") {
      const selectedDates = props.selected as Date[] | undefined;
      return selectedDates?.[0]?.getFullYear() ?? new Date().getFullYear();
    }
    return new Date().getFullYear();
  });

  const [displayYears, setDisplayYears] = React.useState<{
    from: number;
    to: number;
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear();
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      };
    }, [yearRange])
  );

  const { onNextClick, onPrevClick, startMonth, endMonth } = props;

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths;

  const _monthsClassName = cn("relative flex", props.monthsClassName);
  const _monthCaptionClassName = cn(
    "relative mx-10 flex h-7 items-center justify-center",
    props.monthCaptionClassName
  );
  const _weekdaysClassName = cn("flex flex-row", props.weekdaysClassName);
  const _weekdayClassName = cn(
    "w-8 text-sm font-normal text-muted-foreground",
    props.weekdayClassName
  );
  const _monthClassName = cn("w-full", props.monthClassName);
  const _captionClassName = cn(
    "relative flex items-center justify-center pt-1",
    props.captionClassName
  );
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium",
    props.captionLabelClassName
  );
  const buttonNavClassName = buttonVariants({
    variant: "outline",
    className:
      "absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  });
  const _buttonNextClassName = cn(
    buttonNavClassName,
    "right-0",
    props.buttonNextClassName
  );
  const _buttonPreviousClassName = cn(
    buttonNavClassName,
    "left-0",
    props.buttonPreviousClassName
  );
  const _navClassName = cn("flex items-start", props.navClassName);
  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName);
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName);
  const _dayClassName = cn(
    "flex size-8 flex-1 items-center justify-center p-0 text-sm",
    props.dayClassName
  );
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "size-8 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName
  );
  const buttonRangeClassName =
    "bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground";
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "day-range-start rounded-s-md",
    props.rangeStartClassName
  );
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "day-range-end rounded-e-md",
    props.rangeEndClassName
  );
  const _rangeMiddleClassName = cn(
    "bg-accent !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-transparent [&>button]:hover:!text-foreground",
    props.rangeMiddleClassName
  );
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
    props.selectedClassName
  );
  const _todayClassName = cn(
    "[&>button]:bg-accent [&>button]:text-accent-foreground",
    props.todayClassName
  );
  const _outsideClassName = cn(
    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    props.outsideClassName
  );
  const _disabledClassName = cn(
    "text-muted-foreground opacity-50",
    props.disabledClassName
  );
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      style={{
        width: 248.8 * (columnsDisplayed ?? 1) + "px",
      }}
      classNames={{
        months: _monthsClassName,
        month_caption: _monthCaptionClassName,
        weekdays: _weekdaysClassName,
        weekday: _weekdayClassName,
        month: _monthClassName,
        caption: _captionClassName,
        caption_label: _captionLabelClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        month_grid: _monthGridClassName,
        week: _weekClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        range_start: _rangeStartClassName,
        range_middle: _rangeMiddleClassName,
        range_end: _rangeEndClassName,
        selected: _selectedClassName,
        today: _todayClassName,
        outside: _outsideClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
        Nav: ({ className }) => (
          <Nav
            className={className}
            displayYears={displayYears}
            navView={navView}
            setDisplayYears={setDisplayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            setSelectedYear={setSelectedYear}
          />
        ),
        CaptionLabel: (props) => (
          <CaptionLabel
            showYearSwitcher={showYearSwitcher}
            navView={navView}
            setNavView={setNavView}
            displayYears={displayYears}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            {...props}
          />
        ),
        MonthGrid: ({ className, children, ...props }) => (
          <MonthGrid
            className={className}
            displayYears={displayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            navView={navView}
            setNavView={setNavView}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            {...props}
          >
            {children}
          </MonthGrid>
        ),
      }}
      numberOfMonths={columnsDisplayed}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

function Nav({
  className,
  navView,
  startMonth,
  endMonth,
  displayYears,
  setDisplayYears,
  setSelectedYear,
  onPrevClick,
  onNextClick,
}: {
  className?: string;
  navView: NavView;
  startMonth?: Date;
  endMonth?: Date;
  displayYears: { from: number; to: number };
  setDisplayYears: React.Dispatch<
    React.SetStateAction<{ from: number; to: number }>
  >;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  onPrevClick?: (date: Date) => void;
  onNextClick?: (date: Date) => void;
}) {
  const { nextMonth, previousMonth, goToMonth } = useDayPicker();

  const isPreviousDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            endMonth
          ) > 0)
      );
    }
    return !previousMonth;
  })();

  const isNextDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            endMonth
          ) > 0)
      );
    }
    return !nextMonth;
  })();

  const handlePreviousClick = React.useCallback(() => {
    if (!previousMonth) return;
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from - (prev.to - prev.from + 1),
        to: prev.to - (prev.to - prev.from + 1),
      }));
      onPrevClick?.(
        new Date(
          displayYears.from - (displayYears.to - displayYears.from),
          0,
          1
        )
      );
      return;
    } else if (navView === "months") {
      setSelectedYear((prev) => prev - 1);
      setDisplayYears((prev) => ({
        from: prev.from - 1,
        to: prev.to - 1,
      }));
      onPrevClick?.(new Date(displayYears.from - 1, 0, 1));
      return;
    }
    goToMonth(previousMonth);
    onPrevClick?.(previousMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousMonth, goToMonth]);

  const handleNextClick = React.useCallback(() => {
    if (!nextMonth) return;
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from + (prev.to - prev.from + 1),
        to: prev.to + (prev.to - prev.from + 1),
      }));
      onNextClick?.(
        new Date(
          displayYears.from + (displayYears.to - displayYears.from),
          0,
          1
        )
      );
      return;
    } else if (navView === "months") {
      setSelectedYear((prev) => prev + 1);
      setDisplayYears((prev) => ({
        from: prev.from + 1,
        to: prev.to + 1,
      }));
      onNextClick?.(new Date(displayYears.from + 1, 0, 1));
      return;
    }
    goToMonth(nextMonth);
    onNextClick?.(nextMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToMonth, nextMonth]);
  return (
    <nav className={cn("flex items-center", className)}>
      <Button
        variant="outline"
        className="absolute left-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={
          navView === "years"
            ? `Go to the previous ${
                displayYears.to - displayYears.from + 1
              } years`
            : labelPrevious(previousMonth)
        }
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isNextDisabled ? undefined : -1}
        disabled={isNextDisabled}
        aria-label={
          navView === "years"
            ? `Go to the next ${displayYears.to - displayYears.from + 1} years`
            : labelNext(nextMonth)
        }
        onClick={handleNextClick}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

function CaptionLabel({
  children,
  showYearSwitcher,
  navView,
  setNavView,
  displayYears,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  showYearSwitcher?: boolean;
  navView: NavView;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  displayYears: { from: number; to: number };
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
} & React.HTMLAttributes<HTMLSpanElement>) {
  if (!showYearSwitcher) return <span {...props}>{children}</span>;
  return (
    <Button
      className="h-7 w-full truncate text-sm font-medium"
      variant="ghost"
      size="sm"
      onClick={() => setNavView((prev) => (prev === "days" ? "years" : "days"))}
    >
      {(() => {
        if (navView === "days") {
          return children;
        } else if (navView === "months") {
          return selectedYear;
        } else {
          return displayYears.from + " - " + displayYears.to;
        }
      })()}
    </Button>
  );
}

function MonthGrid({
  className,
  children,
  displayYears,
  startMonth,
  endMonth,
  navView,
  setNavView,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  displayYears: { from: number; to: number };
  startMonth?: Date;
  endMonth?: Date;
  navView: NavView;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
} & React.TableHTMLAttributes<HTMLTableElement>) {
  if (navView === "years") {
    return (
      <YearGrid
        displayYears={displayYears}
        startMonth={startMonth}
        endMonth={endMonth}
        setNavView={setNavView}
        navView={navView}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        className={className}
        {...props}
      />
    );
  } else if (navView === "months") {
    return (
      <MonthsGrid
        setNavView={setNavView}
        navView={navView}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        className={className}
        {...props}
      />
    );
  }
  return (
    <table className={className} {...props}>
      {children}
    </table>
  );
}

function YearGrid({
  className,
  displayYears,
  startMonth,
  endMonth,
  setNavView,
  navView,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  className?: string;
  displayYears: { from: number; to: number };
  startMonth?: Date;
  endMonth?: Date;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  navView: NavView;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const handleYearClick = React.useCallback(
    (year: number) => {
      setNavView("months");
      setSelectedYear(year);
    },
    [setNavView, setSelectedYear]
  );

  return (
    <div className={cn("grid grid-cols-4 gap-y-2", className)} {...props}>
      {Array.from(
        { length: displayYears.to - displayYears.from + 1 },
        (_, i) => {
          const isBefore =
            differenceInCalendarDays(
              new Date(displayYears.from + i, 11, 31),
              startMonth!
            ) < 0;

          const isAfter =
            differenceInCalendarDays(
              new Date(displayYears.from + i, 0, 0),
              endMonth!
            ) > 0;

          const isDisabled = isBefore || isAfter;

          const isCurrentYear =
            displayYears.from + i === new Date().getFullYear();
          const isSelectedYear = displayYears.from + i === selectedYear;
          return (
            <Button
              key={i}
              className={cn(
                "h-7 w-full text-sm font-normal text-foreground",
                isCurrentYear && "bg-accent font-medium text-accent-foreground",
                isSelectedYear &&
                  "bg-primary text-primary-foreground font-medium"
              )}
              variant="ghost"
              onClick={() => handleYearClick(displayYears.from + i)}
              disabled={navView === "years" ? isDisabled : undefined}
              aria-label={`Select year ${displayYears.from + i}`}
              aria-selected={displayYears.from + i === selectedYear}
            >
              {displayYears.from + i}
            </Button>
          );
        }
      )}
    </div>
  );
}

function MonthsGrid({
  className,
  children,
  navView,
  setNavView,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  className?: string;
  navView: NavView;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { goToMonth, selected } = useDayPicker();
  const handleMonthClick = React.useCallback(
    (month: number) => {
      setNavView("days");
      goToMonth(new Date(selectedYear, month));
    },
    [setNavView, goToMonth, selectedYear]
  );
  return (
    <div className={cn("grid grid-cols-4 gap-y-2", className)} {...props}>
      {Array.from({ length: 12 }, (_, i) => {
        const isCurrentMonth =
          i === new Date().getMonth() &&
          selectedYear === new Date().getFullYear();

        const isSelectedMonth =
          i === (selected as Date | undefined)?.getMonth() &&
          selectedYear === (selected as Date | undefined)?.getFullYear();

        return (
          <Button
            key={i}
            className={cn(
              "h-7 w-full text-sm font-normal text-foreground",
              isCurrentMonth && "bg-accent font-medium text-accent-foreground",
              isSelectedMonth &&
                "bg-primary text-primary-foreground font-medium"
            )}
            variant="ghost"
            onClick={() => handleMonthClick(i)}
            // disabled={navView === "years" ? isDisabled : undefined}
            aria-label={`Select month ${format(new Date(2023, i, 1), "MMMM")}`}
            aria-selected={(selected as Date | undefined)?.getMonth() === i}
          >
            {format(new Date(2023, i, 1), "MMM")}
          </Button>
        );
      })}
    </div>
  );
}

export { Calendar };