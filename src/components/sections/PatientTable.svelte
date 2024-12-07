<script lang="ts">
  import type { LabRecord } from "../../types/labRecords";
  import type { MatchInfo } from "../../types/matchInfo";
  import type { DateRange } from "bits-ui";

  import Loading from "../misc/loading.svelte";
  import type {
    ApiResponse,
    LabRecordMatchInfoPair,
  } from "../../types/apiResponse";

  import { readable, writable } from "svelte/store";
  import {
    createTable,
    DataBodyRow,
    Render,
    Subscribe,
  } from "svelte-headless-table";
  import { addPagination, addSortBy, addSubRows, addExpandedRows} from "svelte-headless-table/plugins";
  import * as Table from "$lib/components/ui/table";
  import { onMount } from "svelte"; // Import onMount to fetch data when the component mounts
  import { Button } from "$lib/components/ui/button";
  import Datepicker from "../../components/input/datepicker.svelte";
  import { ArrowUpDown } from "lucide-svelte";
  import {
    CalendarDate,
    getLocalTimeZone,
    today,
    type DateValue,
  } from "@internationalized/date";
  import Fail from "../popups/fail.svelte";
  import { format } from "date-fns";
  import { Input } from "$lib/components/ui/input";

  let dataStore = writable<LabRecord[]>([]);
  let isLoading = true; // Add a loading state
  let dateRange: DateRange | undefined;
  let dateSearchButtonEnabled = false;
  let showError = false;
  let errorMessage = "";
  let patientSearch = ""; // Add this new variable for patient search
  let recordToMatchInfoMap: Map<String, Array<String> | undefined> = new Map();
  let barcodeToRecordMap: Map<String, LabRecord> = new Map();
  let showingMatchedRecords = false;
  let selectedRecordMatches: LabRecord[] = [];
  let selectedRecord: String | null = null;
  let totalRecords = writable(0);
  let recordsPerPage = 15;

   async function fetchMatchedRecords(barcodeId: String){
    let matches = recordToMatchInfoMap.get(barcodeId);
    let url = "/api/batchRecords"
    if (matches) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( matches )
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.reload();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const records: Array<LabRecord> = await response.json();
      return records;
    }
    return [];
  }
  // Modify the data fetching function
  async function fetchRecords(
    start?: DateValue | undefined,
    end?: DateValue | undefined,
  ) {
    isLoading = true;
    showError = false; // Reset error state
    let url = `/api/records?limit=${recordsPerPage}&offset=${$pageIndex * recordsPerPage}`;

    if (start && end) {
      url += `&timeIntervalStart=${start.toString()}&timeIntervalEnd=${end.toString()}`;
    }

    // Add patient name search parameter
    if (patientSearch.trim()) {
      url += `&patientNameSurname=${encodeURIComponent(patientSearch.trim())}`;
    }

    console.log(url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401) {
          window.location.reload();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: ApiResponse = await response.json();
      
      // Assuming the API now returns total count in the response header
      totalRecords.set(apiResponse.totalCount);
      
      recordToMatchInfoMap = new Map(
        apiResponse.records.map((pair) => [
          pair.record.barcodeId,
          pair.matchInfo?.matchRecords,
        ]),
      );
      barcodeToRecordMap = new Map(
        apiResponse.records.map((pair) => [
          pair.record.barcodeId,
          pair.record,
        ]),
      );
      dataStore.set(apiResponse.records.map((pair) => pair.record));
    } catch (error) {
      console.error(error);
      errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching records";
      showError = true;
    }
    isLoading = false;
  }

  // Update onMount to use the new fetch function
  onMount(() => {
    fetchRecords();
  });

  // Handle search button click
  function handleDateSearch() {
    if (dateRange && dateRange.start && dateRange.end) {
      fetchRecords(dateRange.start, dateRange.end);
    }
  }

  // Add function to handle patient search
  function handlePatientSearch() {
    fetchRecords(dateRange?.start, dateRange?.end);
  }

  function formatDate(date: Date) {
    try {
      return format(date, "dd MMM yyyy HH:mm");
    } catch {
      return date.toISOString();
    }
  }

  // Add a function to check if a record has matches
  function hasMatches(barcodeId: string): boolean {
    const matches = recordToMatchInfoMap.get(barcodeId);
    return matches !== undefined && matches.length > 0;
  }

  const table = createTable(dataStore, {
    page: addPagination({
      initialPageSize: recordsPerPage,
      serverSide: true,
      serverItemCount: totalRecords ,
    }),
    sort: addSortBy(),
  });

  const columns = table.createColumns([
    table.column({
      accessor: "barcodeId",
      header: "Barcode Id",
    }),
    table.column({
      accessor: "patientNameSurname",
      header: "Patient Name Surname",
    }),
    table.column({
      accessor: "department",
      header: "Department",
    }),
    table.column({
      accessor: "organismName",
      header: "Organism Name",
    }),
    table.column({
      accessor: "uploadDate",
      header: "Upload Date",
      cell: ({ value }) => formatDate(value),
    }),
    table.column({
      accessor: "requestDate",
      header: "Request Date",
      cell: ({ value }) => formatDate(value),
    }),
    table.column({
      accessor: "barcodeDate",
      header: "Barcode Date",
      cell: ({ value }) => formatDate(value),
    }),
    table.column({
      accessor: (obj) => obj.resistantAntibiotics.join(", "),
      header: "Resistant Antibiotics",
    }),
    table.column({
      accessor: (obj) => obj.susceptibleAntibiotics.join(", "),
      header: "Susceptible Antibiotics",
    }),
    table.column({
      accessor: (obj) => obj.susceptibleAtHighDoseAntibiotics.join(", "),
      header: "Susceptible at High Dose Antibiotics",
    })
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns, {
      rowDataId: (row) => row.barcodeId,
    });

  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

  // Add this new function to handle row clicks
  async function handleRowClick(barcodeId: string) {
    if (hasMatches(barcodeId)) {
      isLoading = true;
      try {
        selectedRecord = barcodeId;
        selectedRecordMatches = await fetchMatchedRecords(barcodeId);
        showingMatchedRecords = true;
      } catch (error) {
        console.error(error);
        errorMessage = error instanceof Error ? error.message : "An error occurred while fetching matched records";
        showError = true;
      }
      isLoading = false;
    }
  }

  // Add function to go back to main view
  function handleBackToMain() {
    showingMatchedRecords = false;
    selectedRecordMatches = [];
    selectedRecord = null;
  }

  // Add a watch effect for page changes
  $: if ($pageIndex !== undefined) {
    fetchRecords(dateRange?.start, dateRange?.end);
  }
</script>

<div class="w-full max-w-full">
  {#if showError}
    <div class="flex justify-center">
      <Fail message={errorMessage} onClose={() => (showError = false)} />
    </div>
  {/if}

  {#if isLoading}
    <div class="flex items-center justify-center h-screen">
      <div>
        <Loading />
        <p class="text-center">Loading...</p>
      </div>
    </div>
  {:else}
    {#if showingMatchedRecords}
      <!-- Matched Records View -->
      <div class="w-full p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            Matched Records for Patient: {selectedRecord && barcodeToRecordMap.get(selectedRecord)?.patientNameSurname}
          </h2>
          <Button variant="outline" on:click={handleBackToMain}>
            Back
          </Button>
        </div>
        
        <div class="w-full overflow-x-auto rounded-md">
          <Table.Root class="border-collapse table-auto p-4">
            <Table.Header class="bg-gray-50">
              <Table.Row>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Barcode ID</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Patient Name Surname</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Barcode Date</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Organism Name</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Department</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Resistant Antibiotics</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Susceptible Antibiotics</Table.Head>
                <Table.Head class="px-4 py-3 text-xs font-medium text-gray-900">Susceptible at High Dose Antibiotics</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each selectedRecordMatches as match}
                <Table.Row class="hover:bg-gray-50">
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.barcodeId}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.patientNameSurname}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{formatDate(match.barcodeDate)}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.organismName}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.department}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.resistantAntibiotics.join(", ")}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.susceptibleAntibiotics.join(", ")}</Table.Cell>
                  <Table.Cell class="px-4 py-3 text-xs text-gray-500">{match.susceptibleAtHighDoseAntibiotics.join(", ")}</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    {:else}
      <!-- Main Table View -->
      <div class="w-full p-2 pb-2 flex justify-between items-end">
        <div class="flex justify-between gap-2 items-end">
          <div>
            <Datepicker bind:range={dateRange} />
          </div>
          <Button
            disabled={dateRange == null ||
              dateRange.start == null ||
              dateRange.end == null}
            variant="default"
            on:click={handleDateSearch}
          >
            Search
          </Button>
        </div>

        <div class="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search by patient name"
            class="w-64"
            bind:value={patientSearch}
            on:keydown={(e) => e.key === "Enter" && handlePatientSearch()}
          />
          <Button
            variant="default"
            disabled={patientSearch.trim() === ""}
            on:click={handlePatientSearch}
          >
            Search Patient
          </Button>
        </div>
      </div>
      <div class="w-full overflow-x-auto rounded-md">
        <div class="pl-2">
          <Table.Root {...$tableAttrs} class="border-collapse table-auto p-4">
            <Table.Header class="bg-gray-50">
              {#each $headerRows as headerRow}
                <Subscribe rowAttrs={headerRow.attrs()}>
                  <Table.Row>
                    {#each headerRow.cells as cell (cell.id)}
                      <Subscribe
                        attrs={cell.attrs()}
                        let:attrs
                        props={cell.props()}
                        let:props
                      >
                        <Table.Head
                          {...attrs}
                          class="px-4 py-3 text-xs text-bold	text-center font-medium text-gray-900"
                        >
                         
                            <Render of={cell.render()} />
                        </Table.Head>
                      </Subscribe>
                    {/each}
                  </Table.Row>
                </Subscribe>
              {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
              {#each $pageRows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                  {#if row.isData() && hasMatches(row.dataId)}
                    <Table.Row
                      {...rowAttrs}
                      class="bg-green-100 hover:bg-green-200 cursor-pointer"
                      on:click={() => handleRowClick(row.dataId)}
                    >
                      {#each row.cells as cell (cell.id)}
                        <Subscribe attrs={cell.attrs()} let:attrs>
                          <Table.Cell
                            {...attrs}
                            class="px-4 py-3 text-xs text-gray-500"
                          >
                            <Render of={cell.render()} />
                          </Table.Cell>
                        </Subscribe>
                      {/each}
                    </Table.Row>
                  {:else}
                    <Table.Row {...rowAttrs} class="hover:bg-gray-50">
                      {#each row.cells as cell (cell.id)}
                        <Subscribe attrs={cell.attrs()} let:attrs>
                          <Table.Cell
                            {...attrs}
                            class="px-4 py-3 text-xs text-gray-500"
                          >
                            <Render of={cell.render()} />
                          </Table.Cell>
                        </Subscribe>
                      {/each}
                    </Table.Row>
                  {/if}
                </Subscribe>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
        <div class="flex items-center justify-between space-x-4 py-4 px-4">
          <div class="text-sm text-gray-500">
            Showing {$pageIndex * recordsPerPage + 1} to {Math.min(($pageIndex + 1) * recordsPerPage, $totalRecords)} of {$totalRecords} records
          </div>
          <div class="flex space-x-4">
            <Button
              variant="outline"
              size="sm"
              on:click={() => ($pageIndex = $pageIndex - 1)}
              disabled={!$hasPreviousPage}>Previous</Button
            >
            <Button
              variant="outline"
              size="sm"
              disabled={!$hasNextPage}
              on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
            >
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Remove the style block as we're using Tailwind classes */
</style>
