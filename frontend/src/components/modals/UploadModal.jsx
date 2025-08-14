// frontend/src/components/modals/UploadModal.jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FileUpload from '../FileUpload';

export default function UploadModal({ open, onClose, onUploadSuccess, folderId }) { // ✅ receive folderId
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload File</DialogTitle>

      <DialogContent dividers>
        <FileUpload
          folderId={folderId} // ✅ forward folderId to upload form
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
