// Test file for BARTable validation functions
// This is a simple test to verify the date validation logic

// Mock validation functions (copied from BARTable.tsx)
const validateCompletionDate = (analysisDate, completionDate) => {
    if (!analysisDate || !completionDate) {
        return { isValid: true, message: '' }; // Allow empty values
    }

    const analysisDateObj = new Date(analysisDate);
    const completionDateObj = new Date(completionDate);
    
    // Check if completion date is before analysis date
    if (completionDateObj < analysisDateObj) {
        return {
            isValid: false,
            message: `❌ Completion Date cannot be before Analysis Date\n\nAnalysis: ${analysisDate}\nCompletion: ${completionDate}`
        };
    }

    // Check if completion date is more than 24 hours after analysis date
    const timeDiff = completionDateObj.getTime() - analysisDateObj.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        return {
            isValid: false,
            message: `⏰ Completion Date must be within 24 hours of Analysis Date\n\nAnalysis: ${analysisDate}\nCompletion: ${completionDate}\nGap: ${Math.round(hoursDiff)} hours\nMax allowed: 24 hours`
        };
    }

    return { isValid: true, message: '' };
};

// Test cases
console.log('Testing Completion Date Validation:');
console.log('=====================================');

// Test 1: Valid case - completion date same as analysis date
const test1 = validateCompletionDate('2025-01-15', '2025-01-15');
console.log('Test 1 - Same dates:', test1.isValid ? '✅ PASS' : '❌ FAIL');

// Test 2: Valid case - completion date 12 hours after analysis date
const test2 = validateCompletionDate('2025-01-15T10:00:00', '2025-01-15T22:00:00');
console.log('Test 2 - 12 hours gap:', test2.isValid ? '✅ PASS' : '❌ FAIL');

// Test 3: Valid case - completion date 24 hours after analysis date
const test3 = validateCompletionDate('2025-01-15T10:00:00', '2025-01-16T10:00:00');
console.log('Test 3 - Exactly 24 hours gap:', test3.isValid ? '✅ PASS' : '❌ FAIL');

// Test 4: Invalid case - completion date before analysis date
const test4 = validateCompletionDate('2025-01-15', '2025-01-14');
console.log('Test 4 - Completion before Analysis:', test4.isValid ? '❌ FAIL' : '✅ PASS');
console.log('  Message:', test4.message);

// Test 5: Invalid case - completion date more than 24 hours after analysis date
const test5 = validateCompletionDate('2025-01-15T10:00:00', '2025-01-17T10:00:00');
console.log('Test 5 - More than 24 hours gap:', test5.isValid ? '❌ FAIL' : '✅ PASS');
console.log('  Message:', test5.message);

// Test 6: Edge case - empty dates (should be valid)
const test6 = validateCompletionDate('', '');
console.log('Test 6 - Empty dates:', test6.isValid ? '✅ PASS' : '❌ FAIL');

console.log('\nAll validation tests completed!');
