// frontend/src/components/modals/CreateFolderModal.jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CreateFolderForm from '../CreateFolderForm';

export default function CreateFolderModal({ open, onClose, onCreateSuccess }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent dividers>
        <CreateFolderForm
          onSuccess={() => {
            onCreateSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
