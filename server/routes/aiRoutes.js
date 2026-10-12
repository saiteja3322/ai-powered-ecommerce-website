const express = require('express');
const { chat, smartSearch, compareProducts, getRecommendations } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', chat);
router.post('/smart-search', smartSearch);
router.post('/compare', compareProducts);
router.post('/recommendations', getRecommendations);

module.exports = router;
