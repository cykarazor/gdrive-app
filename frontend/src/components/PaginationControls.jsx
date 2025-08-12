// src/components/PaginationControls.jsx
import { TablePagination, Box, Button } from '@mui/material';

export default function PaginationControls({
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange,
  hasNextPage,
  onLoadMore,
  mode = 'standard', // 'standard' = numeric, 'load-more' = infinite scroll style
}) {
  if (mode === 'load-more') {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          disabled={!hasNextPage}
          onClick={onLoadMore}
        >
          {hasNextPage ? 'Load More' : 'No More Files'}
        </Button>
      </Box>
    );
  }

  // Standard numbered pagination
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}
