import { Document } from '../models/documentModel.js';
import { ChatSession } from '../models/chatModel.js';
import ActivityLog from '../models/ActivityLog.js'; // <-- Import your ActivityLog model

export const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Fetch data concurrently from all relevant collections
    const [ingestedDocs, sessions, alertsCount, complianceCount, totalLogs] = await Promise.all([
      Document.countDocuments({ status: 'Ingested' }),
      ChatSession.find({}, 'messages'),
      ActivityLog.countDocuments({ type: 'alert' }),      // Dynamically count downtime risks
      ActivityLog.countDocuments({ type: 'compliance' }), // Dynamically count compliance events
      ActivityLog.countDocuments({})                     // Used to gauge knowledge nodes/activity
    ]);

    // 2. Calculate copilot interactions from user messages
    const copilotQueries = sessions.reduce(
      (sum, s) => sum + s.messages.filter(m => m.sender === 'user').length,
      0
    );

    // 3. Formulate mock/derived logic for cards lacking strict models:
    // Knowledge Graph Nodes: Typically a factor of documents and system chunks processed
    const knowledgeNodes = ingestedDocs > 0 ? (ingestedDocs * 12) + (totalLogs * 2) : 0;
    
    // Avg Time-to-Answer Saved: A mock performance percentage efficiency baseline 
    const timeToAnswerSaved = copilotQueries > 0 ? Math.min(88, 45 + Math.floor(copilotQueries * 0.5)) : null;

    // 4. Return the fully computed payloads back to React
    res.status(200).json({
      ingestedDocs,
      copilotQueries,
      knowledgeNodes,
      downtimeRisks: alertsCount,
      complianceGaps: complianceCount,
      timeToAnswerSaved,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute dashboard metrics', error: error.message });
  }
};