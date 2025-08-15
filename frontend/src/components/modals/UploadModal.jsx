// frontend/src/components/modals/UploadModal.jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FileUpload from '../FileUpload';
import { useCurrentFolder } from '../../context/CurrentFolderContext'; // ✅ import context

export default function UploadModal({ open, onClose, onUploadSuccess }) { // folderId prop removed
  const { currentFolder } = useCurrentFolder(); // ✅ get current folder from context

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload File</DialogTitle>

      <DialogContent dividers>
        <FileUpload
          folderId={currentFolder.id} // ✅ always use context folder
          onUploadSuccess={() => {
            onUploadSuccess();
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
