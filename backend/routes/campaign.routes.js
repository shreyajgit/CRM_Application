const express = require('express');
const { check } = require('express-validator');
const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  executeCampaign,
  scheduleCampaign
} = require('../controllers/campaign.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

const validateCampaign = [
  check('name', 'Campaign name is required').not().isEmpty(),
  check('segmentRules', 'Segment rules must be an array').isArray(),
  check('message', 'Message content is required').not().isEmpty()
];

// 🔁 Renamed routes
router.get('/all-campaigns', getAllCampaigns);
router.get('/campaign/:id', getCampaignById);
router.post('/create-campaign', validateCampaign, createCampaign);
router.put('/update-campaign/:id', validateCampaign, updateCampaign);
router.delete('/delete-campaign/:id', deleteCampaign);
router.post('/execute-campaign/:id', executeCampaign);
router.post('/schedule-campaign/:id', [
  check('scheduledDate', 'Valid scheduled date is required').isISO8601()
], scheduleCampaign);

module.exports = router;
