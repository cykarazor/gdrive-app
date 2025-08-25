// frontend/src/components/BatchActionBar.jsx
import { Box, Button, Typography } from '@mui/material';

/**
 * BatchActionBar
 * A reusable component for performing batch actions on selected items.
 *
 * Props:
 * - selectedItems: array of item IDs
 * - onDownload: callback for batch download
 * - onCopy: callback for batch copy
 * - onCut: callback for batch cut/move
 * - onClearSelection: callback to clear selection
 */
export default function BatchActionBar({
  selectedItems = [],
  onDownload,
  onCopy,
  onCut,
  onClearSelection,
}) {
  if (selectedItems.length === 0) return null; // hide if nothing selected

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        mb: 2,
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Typography variant="body2">
        {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
      </Typography>

      <Button
        size="small"
        variant="contained"
        onClick={onDownload}
        disabled={!onDownload}
      >
        Download
      </Button>

      <Button
        size="small"
        variant="outlined"
        onClick={onCopy}
        disabled={!onCopy}
      >
        Copy
      </Button>

      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={onCut}
        disabled={!onCut}
      >
        Move / Cut
      </Button>

      <Button
        size="small"
        onClick={onClearSelection}
      >
        Clear
      </Button>
    </Box>
  );
}
