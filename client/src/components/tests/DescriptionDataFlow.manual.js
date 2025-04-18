/**
 * Goal description data flow manual testing script
 * 
 * Use this script to manually test whether the description field is correctly passed through the entire data flow
 * Copy this code to the browser console to execute
 */

// Test description generation in GoalSettingGuide component
function testGoalSettingGuideDescriptionGeneration() {
  console.group('Testing description generation in GoalSettingGuide');
  
  // Mock data
  const goalData = {
    title: 'Complete Project',
    motivation: 'Improve my skills'
  };
  
  // Generate description
  const generatedDescription = `I want to ${goalData.title}, because ${goalData.motivation}.`;
  console.log('Expected description:', generatedDescription);
  
  // Mock finalGoalData
  const finalGoalData = {
    ...goalData,
    description: generatedDescription
  };
  
  console.log('Final generated goal data:', finalGoalData);
  console.log('Description field exists:', !!finalGoalData.description);
  console.log('Description length:', finalGoalData.description.length);
  
  console.groupEnd();
  return finalGoalData;
}

// Test description handling in OnboardingModal
function testOnboardingModalDescriptionHandling(finalGoalData) {
  console.group('Testing description handling in OnboardingModal');
  
  // Print the received data
  console.log('Data received from GoalSettingGuide:', finalGoalData);
  console.log('Description field exists:', !!finalGoalData.description);
  
  // Mock check logic
  if (!finalGoalData.description && finalGoalData.title && finalGoalData.motivation) {
    console.warn('WARNING: Description field missing, generating default value');
    finalGoalData.description = `I want to ${finalGoalData.title}, because ${finalGoalData.motivation}.`;
  }
  
  console.log('Final data passed to API:', finalGoalData);
  console.log('Final description:', finalGoalData.description);
  
  console.groupEnd();
  return finalGoalData;
}

// Test description handling in API service
function testApiServiceDescriptionHandling(finalGoalData) {
  console.group('Testing description handling in API service');
  
  // Print received data
  console.log('Data received from OnboardingModal:', finalGoalData);
  console.log('Description field exists:', !!finalGoalData.description);
  
  // Mock API service check logic
  if (!finalGoalData.description && finalGoalData.title && finalGoalData.motivation) {
    console.warn('WARNING: API layer found missing description field, auto-generating');
    finalGoalData.description = `I want to ${finalGoalData.title}, because ${finalGoalData.motivation}.`;
  }
  
  console.log('Final data sent to backend:', finalGoalData);
  console.log('Final description:', finalGoalData.description);
  
  console.groupEnd();
  return finalGoalData;
}

// Run complete test
function runFullTest() {
  console.group('Goal description data flow complete test');
  
  // Clear separator line
  console.log('='.repeat(50));
  console.log('Start test - description field data flow');
  console.log('='.repeat(50));
  
  // Test normal case - with description
  console.log('\nNormal case test - Complete data flow:');
  const data1 = testGoalSettingGuideDescriptionGeneration();
  const data2 = testOnboardingModalDescriptionHandling(data1);
  const data3 = testApiServiceDescriptionHandling(data2);
  
  console.log('\nTest result summary:');
  console.log('GoalSettingGuide output description:', !!data1.description);
  console.log('OnboardingModal output description:', !!data2.description);
  console.log('API service output description:', !!data3.description);
  
  // Test exception case - no description
  console.log('\n\nException case test - description missing:');
  const abnormalData = {
    title: 'Complete Project',
    motivation: 'Improve my skills',
    // Deliberately omit description
  };
  
  console.log('Initial data (missing description):', abnormalData);
  const abnormalData2 = testOnboardingModalDescriptionHandling(abnormalData);
  const abnormalData3 = testApiServiceDescriptionHandling(abnormalData2);
  
  console.log('\nException case test result summary:');
  console.log('Initial data has description:', !!abnormalData.description);
  console.log('OnboardingModal generated description:', !!abnormalData2.description);
  console.log('API service generated description:', !!abnormalData3.description);
  
  console.log('='.repeat(50));
  console.log('Test completed');
  console.log('='.repeat(50));
  
  console.groupEnd();
}

// Run test
runFullTest(); 