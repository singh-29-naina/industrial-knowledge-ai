import axios from 'axios';
import FormData from 'form-data';
import { Document } from '../models/documentModel.js';
import ActivityLog from '../models/ActivityLog.js';
import { Settings } from '../models/settingsModel.js';


export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No industrial file uploaded.' });
    }

    const settings = await Settings.findOne();
    const maxUploadMB = settings?.storage?.maxUploadMB || 50;
    const maxUploadBytes = maxUploadMB * 1024 * 1024;

    if (req.file.size > maxUploadBytes) {
      return res.status(413).json({
        message: `File exceeds the configured upload limit of ${maxUploadMB}MB.`
      });
    }

    const { category, department, description, title } = req.body;

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('originalMimetype', req.file.mimetype);

    const pythonResponse = await axios.post('http://localhost:8000/api/ai/ingest-heterogeneous', form, {
      headers: { ...form.getHeaders() },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const newDoc = await Document.create({
      title: title || req.file.originalname,
      fileName: req.file.originalname, // matches document_name stored in Chroma metadata
      fileType: req.file.mimetype,
      category: category || 'Manuals',
      department: department || undefined,
      description: description || undefined,
      uploadedBy: req.user.userId,
      status: 'Ingested'
    });

    try {
      await ActivityLog.create({
        type: 'upload',
        title: `${newDoc.fileName} uploaded`,
        userName: req.user.email || 'System',
        userId: req.user.userId,
        metadata: { documentId: newDoc._id }
      });
    } catch (logErr) {
      console.error('Activity log write failed:', logErr.message);
    }

    res.status(200).json({
      message: 'Document dispatched successfully to the Multi-Format Ingestion Agent Pipeline.',
      document: newDoc,
      aiStatus: pythonResponse.data
    });

  } catch (error) {
    console.error('Heterogeneous Ingestion Routing Error:', error.message);

    if (req.file) {
      try {
        await Document.create({
          title: req.body?.title || req.file.originalname,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          category: req.body?.category || 'Manuals',
          department: req.body?.department || undefined,
          uploadedBy: req.user.userId,
          status: 'Failed'
        });
      } catch (persistErr) {
        console.error('Failed to persist failed-upload record:', persistErr.message);
      }
    }

    res.status(500).json({ message: 'Industrial parsing service communication failure.', error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name employeeId');
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document log', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    let vectorsPurged = false;
    let vectorPurgeWarning = null;
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
      const aiResponse = await axios.delete(
        `${aiServiceUrl}/api/ai/documents/${encodeURIComponent(doc.fileName)}`
      );
      vectorsPurged = aiResponse.data?.status === 'success';
    } catch (aiError) {
      vectorPurgeWarning = 'Vector embeddings could not be purged from the AI core — the AI service may be offline.';
      console.error('Warning: Could not clear embeddings from AI core:', aiError.message);
    }

    await Document.findByIdAndDelete(id);

    try {
      await ActivityLog.create({
        type: 'document',
        title: `${doc.fileName} removed`,
        userName: req.user.email || 'System',
        userId: req.user.userId
      });
    } catch (logErr) {
      console.error('Activity log write failed:', logErr.message);
    }

    res.status(200).json({
      message: vectorPurgeWarning
        ? `Document removed from system inventory. ${vectorPurgeWarning}`
        : 'Document removed from system inventory and AI memory.',
      vectorsPurged
    });
  } catch (error) {
    res.status(500).json({ message: 'Deletion workflow failed', error: error.message });
  }
};