import multer from 'multer';

// Use memoryStorage to hold the diverse files in RAM buffer temporarily
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Broad list of industrial file formats allowed by the PS
  const allowedMimeTypes = [
    'application/pdf',                                                         // PDFs & manuals
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',      // Excel (.xlsx)
    'application/vnd.ms-excel',                                                // Older Excel (.xls)
    'text/csv',                                                                // CSV data
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
    'message/rfc822',                                                          // Email archives (.eml)
    'application/vnd.ms-outlook',                                              // Outlook emails (.msg)
    'image/jpeg', 'image/png', 'image/tiff'                                    // Scanned forms/drawings
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Clearance Denied: Format '${file.mimetype}' is not supported for ingestion.`), false);
  }
};

export const upload = multer({
  storage: storage,
  // Hard ceiling only — the real, admin-configurable limit is enforced in
  // documentController.uploadDocument by reading Settings.storage.maxUploadMB live.
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: fileFilter
});