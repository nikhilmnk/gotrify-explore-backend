const { createServer } = require("http");
const { requireAuth } = require("./clerk");
const { contentService } = require("./services/ContentService");
const GeneratedContent = require("./models/GeneratedContent");
const { z } = require("zod");

// Request validation schemas
const itineraryRequestSchema = z.object({
  destination: z.string().min(1),
  days: z.number().min(1).max(30),
  budget: z.enum(["budget", "mid-range", "luxury"]),
  preferences: z.array(z.string()).optional(),
});

const costEstimatorRequestSchema = z.object({
  destination: z.string().min(1),
  days: z.number().min(1).max(30),
  accommodationType: z.enum(["hostel", "hotel", "luxury", "apartment"]),
  mealType: z.enum(["street-food", "local-restaurants", "fine-dining", "mix"]),
  transportMode: z.enum(["public", "taxi", "rental", "mix"]),
});

const bestTimeRequestSchema = z.object({
  destination: z.string().min(1),
});

const packingListRequestSchema = z.object({
  destination: z.string().min(1),
  duration: z.number().min(1).max(30),
  weather: z.string().optional(),
  activityType: z.array(z.string()).optional(),
});

const photoSpotsRequestSchema = z.object({
  destination: z.string().min(1),
});

const adventurePlannerRequestSchema = z.object({
  destination: z.string().min(1),
  budget: z.enum(["budget", "mid-range", "luxury"]).optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  activityTypes: z.array(z.string()).optional(),
});

const currencyCompareRequestSchema = z.object({
  fromCountry: z.string().min(1),
  toCountry: z.string().min(1),
  budgetAmount: z.number().min(0),
});

const foodFinderRequestSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
});

const jetlagPlannerRequestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  travelDate: z.string().min(1),
});

async function registerRoutes(app) {
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.json({ id: userId });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/content', requireAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const content = await contentService.getUserContent(userId, limit);
      res.json(content);
    } catch (error) {
      console.error("Error fetching user content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get('/api/content/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const content = await contentService.getContentById(req.params.id, userId);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Utility to handle all content generation routes
  const setupRoute = (path, schema, type, userId = '2') => {
    app.post(path, requireAuth, async (req, res) => {
      try {
        const requestData = schema.parse(req.body);
        const content = await contentService.getOrCreateContent({
          userId,
          type,
          input: requestData
        });
        res.json(content.result);
      } catch (error) {
        console.error(`Error on ${type}:`, error);
        res.status(500).json({ message: `Failed to generate ${type.replace('-', ' ')}` });
      }
    });
  };
  app.get('/api/check-route', async (req, res) => {
    try {
      res.json({ message: 'Route is working' });
    } catch (error) {
      console.error(`Error on ${type}:`, error);
      res.status(500).json({ message: `Failed to generate ${type.replace('-', ' ')}` });
    }
  });
  setupRoute('/api/generate-itinerary', itineraryRequestSchema, 'itinerary');
  setupRoute('/api/estimate-cost', costEstimatorRequestSchema, 'cost-estimator');
  setupRoute('/api/best-time', bestTimeRequestSchema, 'best-time', '1');
  setupRoute('/api/packing-list', packingListRequestSchema, 'packing-list');
  setupRoute('/api/photo-spots', photoSpotsRequestSchema, 'photo-spots');
  setupRoute('/api/adventure-planner', adventurePlannerRequestSchema, 'adventure-planner');
  setupRoute('/api/currency-compare', currencyCompareRequestSchema, 'currency-converter');
  setupRoute('/api/food-finder', foodFinderRequestSchema, 'food-finder');
  setupRoute('/api/jetlag-planner', jetlagPlannerRequestSchema, 'jet-lag');

  const httpServer = createServer(app);
  return httpServer;
}

module.exports = {
  registerRoutes
};
