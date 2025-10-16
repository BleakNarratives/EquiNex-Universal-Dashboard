# Unit & Integration Tests

This document outlines the testing strategy for the EquiNex Universal Dashboard's core services. The following tests are written in a Jest-style syntax and should be implemented using a framework like Jest and React Testing Library to ensure the application's stability and prevent regressions.

## 1. `metricsService`

The `metricsService` is critical for populating the dashboard. Tests should focus on data integrity and mock API interactions.

```javascript
import { metricsService } from '../services/metricsService';

describe('metricsService', () => {

  // Test 1: Ensure getMetrics returns the expected data structure
  test('getMetrics() should return a valid dashboard metrics object', async () => {
    const metrics = await metricsService.getMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics).toHaveProperty('overall_status');
    expect(metrics).toHaveProperty('modules');
    expect(Array.isArray(metrics.modules)).toBe(true);
    expect(metrics.modules.length).toBeGreaterThan(0);
    expect(metrics.modules[0]).toHaveProperty('module_name');
  });

  // Test 2: Ensure setModuleStatus correctly updates the module state (in the mock)
  test('setModuleStatus() should update a module\'s status', async () => {
    // Get initial state
    const initialMetrics = await metricsService.getMetrics();
    const targetModule = initialMetrics.modules[0].module_name;
    
    // Perform the action
    metricsService.setModuleStatus(targetModule, 'Offline');
    
    // Get new state and verify the change
    const updatedMetrics = await metricsService.getMetrics();
    const updatedModule = updatedMetrics.modules.find(m => m.module_name === targetModule);
    
    expect(updatedModule).toBeDefined();
    expect(updatedModule.status).toBe('Offline');
    
    // Reset state for other tests
    metricsService.setModuleStatus(targetModule, 'Online');
  });
});
```

## 2. `aiService`

The `aiService` interacts with the live Gemini API. Tests should mock the `@google/genai` library to avoid making real API calls during testing.

```javascript
import { aiService } from '../services/aiService';
import { GoogleGenAI } from '@google/genai';

// Mock the entire @google/genai library
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
      // Mock other AI functions as they are added
    },
  })),
}));

describe('aiService', () => {
  let mockGenerateContent;

  beforeEach(() => {
    // Reset mocks before each test
    const mockAi = new GoogleGenAI({ apiKey: 'mock_key' });
    mockGenerateContent = mockAi.models.generateContent;
    mockGenerateContent.mockClear();
  });

  // Test 1: Ensure generateText returns the correct text on a successful API call
  test('generateText() should return the text from a successful response', async () => {
    const mockResponse = { text: 'This is a test response.' };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await aiService.generateText('test prompt');
    
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: 'test prompt',
    });
    expect(result).toBe('This is a test response.');
  });

  // Test 2: Ensure generateText handles API errors gracefully
  test('generateText() should return an error message when the API call fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));

    const result = await aiService.generateText('test prompt');
    
    expect(result).toBe('Error: Could not get a response from the AI model.');
  });
});
```

## 3. `operativeService`

The `operativeService` contains the core autonomous logic. Tests should verify its decision-making process based on mock telemetry data.

```javascript
import { operativeService } from '../services/operativeService';
import { metricsService } from '../services/metricsService';

// Mock metricsService to control the telemetry data
jest.mock('../services/metricsService');

describe('operativeService', () => {
  
  // Test 1: Operative should take corrective action on a degraded module
  test('should generate an action to fix a degraded module', (done) => {
    const mockMetrics = {
      // ... other metrics
      modules: [
        { module_name: 'Test Module', status: 'Degraded', version: 'v1' },
        { module_name: 'Stable Module', status: 'Online', version: 'v2' },
      ],
    };
    metricsService.getMetrics.mockResolvedValue(mockMetrics);
    
    const mockSubscriber = (action) => {
      // We expect the operative to identify 'Test Module' and try to fix it
      expect(action.action).toContain('Reallocating resources to stabilize Test Module');
      expect(action.reasoning).toContain('performance degradation in Test Module');
      
      // Unsubscribe and finish the test
      operativeService.unsubscribe(mockSubscriber);
      done();
    };
    
    operativeService.subscribe(mockSubscriber);
  });
  
  // Test 2: Operative should perform a routine action when all systems are healthy
  test('should generate a routine action when no modules are degraded', (done) => {
    const mockMetrics = {
      // ... other metrics
      modules: [
        { module_name: 'Test Module', status: 'Online', version: 'v1' },
      ],
    };
    metricsService.getMetrics.mockResolvedValue(mockMetrics);
    
    const mockSubscriber = (action) => {
      // We expect a routine action, not a corrective one
      expect(action.action).not.toContain('Reallocating resources');
      
      operativeService.unsubscribe(mockSubscriber);
      done();
    };
    
    operativeService.subscribe(mockSubscriber);
  });
});
```
