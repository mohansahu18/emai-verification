import { useTheme } from '@emotion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Divider, Tooltip, CardHeader, Typography } from '@mui/material';
import { useSetState } from 'src/hooks/use-set-state';
import { fIsBetween } from 'src/utils/format-time';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCreditsHistory } from 'src/redux/slice/creditSlice';
import { Scrollbar } from 'src/components/scrollbar';
import { convertToTimezone } from 'src/utils/date-utils';
import {
  useTable,
  rowInPage,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { CreditTableRow } from './credit-table-row';
import { CreditTableToolbar } from './credit-table-toolbar';
import { CreditTableFiltersResult } from './credit-table-filters-result';

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  let filteredData = inputData;

  // Filter by message (name)
  if (name) {
    filteredData = filteredData.filter(
      (order) => order.message && order.message.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter by status
  if (status !== 'all') {
    filteredData = filteredData.filter((order) => order.credits === status);
  }

  // Filter by date range
  if (!dateError) {
    if (startDate && endDate) {
      filteredData = filteredData.filter((order) =>
        fIsBetween(new Date(order.dateCreatedOn), startDate, endDate)
      );
    }
  }

  return filteredData;
}

const TABLE_HEAD = [
  {
    id: 'statusdate',
    label: 'Status/Date',
    width: 'flex',
    whiteSpace: 'nowrap',
    tooltip: 'Date and time when the email verification action occurred.',
  },

  {
    id: 'message',
    label: 'Message',
    width: 'flex',
    whiteSpace: 'nowrap',
    tooltip: 'Description of the email verification action or status update.',
  },
  {
    id: 'credits',
    label: 'Credits',
    width: 'flex',
    whiteSpace: 'nowrap',
    align: 'right',
    tooltip: 'Current state of the email verification credits.',
  },
];
function transformData(data, selectedTimeZone) {
  return data.map((item) => {
    const dateCreatedOn = convertToTimezone(item.createdAt, selectedTimeZone);

    let message = item.description;
    if (item.type === 'ADDITION') {
      message = item.description.includes('Credits added by admin')
        ? 'Email credits added by Admin'
        : item.description;
    } else if (item.type === 'DEDUCTION') {
      if (item.description.includes('Verifying Email')) {
        message = item.description.replace('Used In Verifying Email:', 'Used in verifying email:');
      } else if (item.description.includes('Verifying "SampleImport1.csv" List')) {
        message = item.description.replace(
          'Used In Verifying "SampleImport1.csv" List',
          'Used in verifying "SampleImport_(3).csv" list'
        );
      }
    }

    return {
      dateCreatedOn,
      message,
      status: item.status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      credits: item.type === 'ADDITION' ? 'Alloted' : 'Consumed',
      noOfCredits: item.amount,
    };
  });
}

export function CreditTable() {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((store) => store.credits);
  const table = useTable({ defaultOrderBy: 'orderNumber' });
  const [currentFilter, setCurrentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const searchTimeoutRef = useRef(null);
  const selectedTimeZone = useSelector((state) => state.timeZone.selectedTimeZone);

  const theme = useTheme();

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (history.data && history.data.length > 0) {
      setTableData(transformData(history.data, selectedTimeZone));
    }
  }, [history, selectedTimeZone]);

  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const canReset =
    !!filters.state.name ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );
  const setTotalRowsPerPage = (num) => {
    setRowsPerPage(num);
    setPage(0);
  };
  useEffect(() => {
    dispatch(
      fetchCreditsHistory({
        page: page + 1,
        limit: rowsPerPage,
        // search: searchValue,
        type: currentFilter,
      })
    );
  }, [dispatch, page, rowsPerPage, currentFilter]);
  // Show loading state

  // if (loading && tableData.length === 0) {
  //   return (
  //     <Card>
  //       <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  //         <CircularProgress />
  //       </Box>
  //     </Card>
  //   );
  // }
  const handleSearch = (value) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearchValue(value);
      // Add your search logic here
    }, 2000); // 2 seconds delay
  };
  const handleFilterApplied = (filter) => {
    // setCurrentFilter(filter)
    // Added Verified Email Verified List all

    switch (filter) {
      case 'Added':
        setCurrentFilter('added');
        break;
      case 'Verified Email':
        setCurrentFilter('email');
        break;
      case 'Verified List':
        setCurrentFilter('list');
        break;
      default:
        setCurrentFilter('all');
        break;
    }
    setPage(0);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="inline-block">
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title="View all the email verification logs here."
            >
              <Typography variant="h6">Email Verification Logs</Typography>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 3 }}
        subheader="All the email verification logs will appear here."
      />
      <Divider />

      <CreditTableToolbar
        filters={filters}
        onResetPage={table.onResetPage}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterApplied}
        totalCredits={history.totalCredits ? history.totalCredits : 0}
      />
      {canReset && (
        <CreditTableFiltersResult
          filters={filters}
          totalResults={dataFiltered.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              showCheckbox={false}
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              // rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {tableData &&
                tableData.map((row, index) => (
                  <CreditTableRow
                    key={index}
                    row={row}
                    selected={table.selected.includes(row.id)}
                  />
                ))}

              <TableEmptyRows
                height={table.dense ? 56 : 56 + 20}
                emptyRows={emptyRows(table?.page, table?.rowsPerPage, history.data?.length)}
              />

              {tableData?.length === 0 ? (
                <TableNoData
                  title="Not Data Found"
                  description="No data found in the table"
                  notFound={notFound}
                />
              ) : (
                <TableNoData
                  title="Not Search Found"
                  description={`No search found with keyword "${filters.state.name}"`}
                  notFound={notFound}
                />
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <TablePaginationCustom
        page={page}
        count={history?.totalCredits ? history?.totalCredits : 0}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onChangeDense={table.onChangeDense}
        onRowsPerPageChange={(e) => setTotalRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Card>
  );
}
