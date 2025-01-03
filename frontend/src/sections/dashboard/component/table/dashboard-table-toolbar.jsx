import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { fetchLists } from 'src/redux/slice/listSlice';
import { useDispatch } from 'react-redux';

// ----------------------------------------------------------------------

export function DashboardTableToolbar({ filters, onResetPage }) {
  const dispatch = useDispatch();
  const handleFilterName = (event) => {
    const searchValue = event.target.value;
    onResetPage();
    filters.setState({ name: searchValue });
    dispatch(
      fetchLists({
        search: searchValue,
        // status: filters.state.status,
        page: 1, // Reset to the first page
        rowsPerPage: filters.state.rowsPerPage,
      })
    );
  };

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters?.state?.name}
          onChange={handleFilterName}
          placeholder="Search by list name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}
