import { SystemNode } from '../models/systemNodeModel.js';

export const getSystemNodes = async (req, res) => {
  try {
    const nodes = await SystemNode.find().populate('linkedDocument', 'fileName title category');
    res.status(200).json(nodes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system topology', error: error.message });
  }
};

export const createSystemNode = async (req, res) => {
  try {
    const { nodeId, type, label, status, system, linkedDocument, rev, author, load, connections } = req.body;

    if (!nodeId || !type || !label) {
      return res.status(400).json({ message: 'nodeId, type, and label are required.' });
    }

    const node = await SystemNode.create({
      nodeId, type, label, status, system, linkedDocument: linkedDocument || null,
      rev, author, load, connections: connections || [],
      createdBy: req.user.userId,
    });

    res.status(201).json(node);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: `Node with id "${req.body.nodeId}" already exists.` });
    }
    res.status(500).json({ message: 'Failed to create system node', error: error.message });
  }
};

export const updateSystemNode = async (req, res) => {
  try {
    const node = await SystemNode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('linkedDocument', 'fileName title category');
    if (!node) return res.status(404).json({ message: 'Node not found.' });
    res.status(200).json(node);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update system node', error: error.message });
  }
};

export const deleteSystemNode = async (req, res) => {
  try {
    const node = await SystemNode.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ message: 'Node not found.' });
    res.status(200).json({ message: 'Node removed from topology.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete system node', error: error.message });
  }
};