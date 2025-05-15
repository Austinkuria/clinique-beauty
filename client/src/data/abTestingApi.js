// Mock API functions for AB Testing features
import { mockAbTestingData } from './mockAbTestingData';

// Create a local variable to store AB Tests data
let abTestsData = mockAbTestingData.abTests || [];

// Simulated delay for API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API client for AB Testing features
 */
export const abTestingApi = {
  /**
   * Get all AB tests
   */
  getTests: async () => {
    // Simulate API delay
    await delay(800);
    
    return {
      success: true,
      data: abTestsData
    };
  },
  
  /**
   * Create a new AB test
   * @param {Object} testData - Test configuration data
   */
  createTest: async (testData) => {
    // Validate required fields
    if (!testData.name || !testData.startDate || !testData.endDate) {
      throw new Error('Missing required fields');
    }
    
    // Make sure variants add up to 100%
    const totalAllocation = testData.variants.reduce(
      (sum, variant) => sum + Number(variant.trafficAllocation), 0
    );
    
    if (Math.abs(totalAllocation - 100) > 1) {
      throw new Error('Variant traffic allocation must total 100%');
    }
    
    // Simulate API delay
    await delay(1200);
    
    // Generate a new ID for the test
    const newTest = {
      id: Date.now().toString(),
      ...testData,
      createdAt: new Date().toISOString(),
      participants: 0
    };
    
    // Add to the local data
    abTestsData.push(newTest);
    
    return {
      success: true,
      data: newTest
    };
  },
  
  /**
   * Start an AB test
   * @param {string} testId - The ID of the test to start
   */
  startTest: async (testId) => {
    // Simulate API delay
    await delay(500);
    
    const testIndex = abTestsData.findIndex(test => test.id === testId);
    if (testIndex === -1) {
      throw new Error('Test not found');
    }
    
    // Update the test status
    abTestsData[testIndex].status = 'active';
    abTestsData[testIndex].startedAt = new Date().toISOString();
    
    return {
      success: true,
      data: abTestsData[testIndex]
    };
  },
  
  /**
   * Stop an AB test
   * @param {string} testId - The ID of the test to stop
   */
  stopTest: async (testId) => {
    // Simulate API delay
    await delay(500);
    
    const testIndex = abTestsData.findIndex(test => test.id === testId);
    if (testIndex === -1) {
      throw new Error('Test not found');
    }
    
    // Update the test status
    abTestsData[testIndex].status = 'completed';
    abTestsData[testIndex].completedAt = new Date().toISOString();
    
    return {
      success: true,
      data: abTestsData[testIndex]
    };
  },
  
  /**
   * Delete an AB test
   * @param {string} testId - The ID of the test to delete
   */
  deleteTest: async (testId) => {
    // Simulate API delay
    await delay(500);
    
    const testIndex = abTestsData.findIndex(test => test.id === testId);
    if (testIndex === -1) {
      throw new Error('Test not found');
    }
    
    // Remove the test
    abTestsData.splice(testIndex, 1);
    
    return {
      success: true
    };
  }
};
