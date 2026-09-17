// TODO (NGO - PRD 3): Implement NGO match action controller
// Handles: confirm-receipt, usage-update, rate-donor

// POST /api/ngo/match-actions/:matchId/confirm-receipt
export const confirmReceipt = async (_req, res) => {
  res.status(501).json({ message: 'Not implemented — PRD 3' });
};

// POST /api/ngo/match-actions/:matchId/usage-update
export const usageUpdate = async (_req, res) => {
  res.status(501).json({ message: 'Not implemented — PRD 3' });
};

// POST /api/ngo/match-actions/:matchId/rate-donor
export const rateDonor = async (_req, res) => {
  res.status(501).json({ message: 'Not implemented — PRD 3' });
};
