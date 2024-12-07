<script lang="ts">
    import CalendarIcon from "lucide-svelte/icons/calendar";
    import type { DateRange } from "bits-ui";
    
    import {
     CalendarDate,
     DateFormatter,
     type DateValue,
     getLocalTimeZone
    } from "@internationalized/date";
    import { cn } from "$lib/utils.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    
    const df = new DateFormatter("en-US", {
     dateStyle: "medium"
    });
    
     export let range: DateRange | undefined;
    
    let startValue: DateValue | undefined = undefined;
   </script>
    
   <div class="grid gap-2">
    <Popover.Root openFocus>
     <Popover.Trigger asChild let:builder>
      <Button
       variant="outline"
       class={cn(
        "w-[300px] justify-start text-left font-normal",
        !range && "text-muted-foreground"
       )}
       builders={[builder]}
      >
       <CalendarIcon class="mr-2 h-4 w-4" />
       {#if range && range.start}
        {#if range.end}
         {df.format(range.start.toDate(getLocalTimeZone()))} - {df.format(
          range.end.toDate(getLocalTimeZone())
         )}
        {:else}
         {df.format(range.start.toDate(getLocalTimeZone()))}
        {/if}
       {:else if startValue}
        {df.format(startValue.toDate(getLocalTimeZone()))}
       {:else}
        Pick a date
       {/if}
      </Button>
     </Popover.Trigger>
     <Popover.Content class="w-auto p-0" align="start">
      <RangeCalendar
       bind:value={range}
       bind:startValue
       initialFocus
       numberOfMonths={2}
       placeholder={range?.start}
      />
     </Popover.Content>
    </Popover.Root>
   </div>