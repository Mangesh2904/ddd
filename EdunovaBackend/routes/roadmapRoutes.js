import express from 'express';
import { generateRoadmap, getRoadmapHistory, submitFeedback, getRoadmapById, testPerplexityAPI } from '../controllers/roadmapController.js';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';

const router = express.Router();

router.get('/test-perplexity', testPerplexityAPI);
router.get('/history', auth, getRoadmapHistory);
router.get('/:id', auth, getRoadmapById);
router.post('/generate', optionalAuth, generateRoadmap);
router.post('/feedback', auth, submitFeedback);

export default router;