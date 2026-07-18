import { Settings } from '../models/settingsModel.js';
import { Document } from '../models/documentModel.js';
import mongoose from 'mongoose';
import axios from 'axios';



export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { company, aiToggles, notificationToggles, security, storage } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});

    if (company) settings.company = { ...settings.company.toObject(), ...company };
    if (aiToggles) settings.aiToggles = { ...settings.aiToggles.toObject(), ...aiToggles };
    if (notificationToggles) settings.notificationToggles = { ...settings.notificationToggles.toObject(), ...notificationToggles };
    if (security) settings.security = { ...settings.security.toObject(), ...security };
    if (storage) settings.storage = { ...settings.storage.toObject(), ...storage };
    settings.updatedBy = req.user.userId;

    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};

// Real, live cluster stats instead of hardcoded fake numbers
export const getStackStatus = async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments();
    res.status(200).json({
      llmEngine: 'Groq — llama-3.3-70b-versatile',
      vectorStore: 'ChromaDB (local persistent)',
      ocrLayer: 'Not configured',
      storageFootprint: `${totalDocs} Docs Indexed`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stack status', error: error.message });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const mm = settings?.maintenanceMode || { enabled: false, message: '', startedAt: null, estimatedEndAt: null };
    res.status(200).json(mm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch maintenance status', error: error.message });
  }
};

export const updateMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message, estimatedMinutes } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});

    settings.maintenanceMode = {
      enabled: !!enabled,
      message: message ?? settings.maintenanceMode?.message ?? '',
      startedAt: enabled ? new Date() : settings.maintenanceMode?.startedAt || null,
      estimatedEndAt: enabled && estimatedMinutes
        ? new Date(Date.now() + estimatedMinutes * 60000)
        : (enabled ? settings.maintenanceMode?.estimatedEndAt || null : null),
    };
    settings.updatedBy = req.user.userId;

    await settings.save();
    res.status(200).json(settings.maintenanceMode);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update maintenance mode', error: error.message });
  }
};

// Real subsystem checks — no auth required so this stays reachable even without a valid session
export const getSubsystemHealth = async (req, res) => {
  const mongoState = mongoose.connection.readyState; // 1 = connected

  let aiServiceUp = false;
  try {
    const r = await axios.get(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/`, { timeout: 3000 });
    aiServiceUp = r.status === 200;
  } catch {
    aiServiceUp = false;
  }

  res.status(200).json({
    database: mongoState === 1 ? 'Operational' : 'Unreachable',
    // ChromaDB runs embedded inside the Python service, so its health rides on this check too
    aiCopilotService: aiServiceUp ? 'Operational' : 'Unreachable',
  });
};