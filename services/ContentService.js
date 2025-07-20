const GeneratedContent = require('../models/GeneratedContent');
const { generateWithGemini } = require('../openai');
const crypto = require('crypto');

class ContentService {
  generateInputHash(input) {
    return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
  }

  async getOrCreateContent(data) {
    const { userId, type, input } = data;

    // Check for cached content
    const cachedContent = await GeneratedContent.findOne({
      userId,
      type,
      input: input
    }).sort({ createdAt: -1 });

    if (cachedContent) {
      console.log(`Returning cached content for user ${userId}, type ${type}`);
      return cachedContent;
    }

    // Generate new content
    const prompt = this.buildPrompt(type, input);
    const aiResponse = await generateWithGemini(prompt);
    const result = JSON.parse(aiResponse);

    // Store in database
    const newContent = new GeneratedContent({
      userId,
      type,
      input,
      result,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newContent.save();
    console.log(`Generated and stored new content for user ${userId}, type ${type}`);
    return newContent;
  }

  async getUserContent(userId, limit = 20) {
    return GeneratedContent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getContentById(id, userId) {
    return GeneratedContent.findOne({ _id: id, userId });
  }

  buildPrompt(type, input) {
    switch (type) {
      case 'itinerary':
        return `Create a detailed travel itinerary for ${input.destination} for ${input.days} days with a ${input.budget} budget. Include preferences: ${input.preferences?.join(', ') || 'none'}. Return a JSON object with the structure: { "destination": string, "days": number, "itinerary": [{ "day": number, "activities": [{ "time": string, "activity": string, "description": string, "cost": string, "duration": string }] }], "totalCost": string, "tips": [string] }`;

      case 'cost-estimator':
        return `Estimate travel costs for ${input.destination} for ${input.days} days with ${input.accommodationType} accommodation, ${input.mealType} meals, and ${input.transportMode} transport. Return JSON: { "destination": string, "duration": number, "breakdown": { "accommodation": { "type": string, "costPerNight": string, "totalCost": string }, "meals": { "type": string, "costPerDay": string, "totalCost": string }, "transport": { "type": string, "localTransport": string, "totalCost": string }, "activities": { "estimatedCost": string }, "miscellaneous": { "estimatedCost": string } }, "totalCost": string, "costPerDay": string, "tips": [string] }`;

      case 'best-time':
        return `Provide the best time to visit ${input.destination} with monthly breakdown. Return JSON: { "destination": string, "bestMonths": [string], "monthlyBreakdown": [{ "month": string, "weather": string, "temperature": string, "rainfall": string, "crowds": string, "costLevel": string, "highlights": [string], "score": number }], "peakSeason": string, "shoulderSeason": string, "offSeason": string, "tips": [string] }`;

      case 'packing-list':
        return `Create a packing list for ${input.destination} for ${input.duration} days. Weather: ${input.weather || 'unknown'}. Activities: ${input.activityType?.join(', ') || 'general travel'}. Return JSON: { "destination": string, "duration": number, "weather": string, "categories": [{ "category": string, "items": [{ "item": string, "quantity": string, "essential": boolean, "notes": string }] }], "tips": [string] }`;

      case 'photo-spots':
        return `Find the best photography spots in ${input.destination}. Return JSON: { "destination": string, "spots": [{ "name": string, "type": string, "description": string, "bestTime": string, "coordinates": { "lat": number, "lng": number }, "difficulty": string, "tips": [string] }], "generalTips": [string] }`;

      case 'adventure-planner':
        return `Plan adventure activities for ${input.destination} with ${input.budget || 'any'} budget, ${input.difficulty || 'any'} difficulty. Activity types: ${input.activityTypes?.join(', ') || 'all'}. Return JSON: { "destination": string, "activities": [{ "name": string, "type": string, "difficulty": string, "duration": string, "cost": string, "bestTime": string, "location": string, "equipment": [string], "safety": [string], "description": string }], "tips": [string], "seasonalInfo": string }`;

      case 'currency-converter':
        return `Compare currencies and costs between ${input.fromCountry} and ${input.toCountry} for budget ${input.budgetAmount}. Return JSON: { "fromCountry": string, "toCountry": string, "budgetAmount": number, "exchangeRate": string, "convertedAmount": string, "costComparison": { "accommodation": { "from": string, "to": string, "difference": string }, "meals": { "from": string, "to": string, "difference": string }, "transport": { "from": string, "to": string, "difference": string } }, "purchasingPower": string, "tips": [string] }`;

      case 'food-finder':
        return `Find local food and restaurants in ${input.destination}. Return JSON: { "city": string, "country": string, "dishes": [{ "name": string, "description": string, "type": string, "ingredients": [string], "whereToFind": string, "averagePrice": string, "vegetarian": boolean, "spiciness": string, "tips": [string] }], "restaurants": [{ "name": string, "type": string, "specialty": string, "location": string, "priceRange": string }], "foodTips": [string], "culturalNotes": [string] }`;

      default:
        return `Provide travel information for ${JSON.stringify(input)}. Return valid JSON format.`;
    }
  }
}

const contentService = new ContentService();
module.exports = { contentService };
