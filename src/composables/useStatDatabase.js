import { dbFireStore } from '../firebase';
import { setDoc, doc, deleteField } from 'firebase/firestore';

/**
 * Composable for database operations related to stat data
 */
export function useStatDatabase() {
  /**
   * Update institution data in both manual and integrated collections
   * @param {string} uri - Institution URI
   * @param {object} updates - Object with fields to update
   */
  const updateInstitutionData = async (uri, updates) => {
    const manualDataUpdates = {};
    const integratedDataUpdates = {};

    // Process each field update
    for (const [field, { value, petersonsValue }] of Object.entries(updates)) {
      if (value === null || value === '') {
        // Clear manual value and revert to Petersons
        manualDataUpdates[field] = deleteField();
        integratedDataUpdates[field] = petersonsValue !== null 
          ? petersonsValue 
          : deleteField();
      } else {
        // Set manual value
        manualDataUpdates[field] = value;
        integratedDataUpdates[field] = value;
      }
    }

    // Apply updates to Firestore
    await Promise.all([
      setDoc(
        doc(dbFireStore, 'manual_institution_data', uri),
        manualDataUpdates,
        { merge: true }
      ),
      setDoc(
        doc(dbFireStore, 'institutions_integrated', uri),
        integratedDataUpdates,
        { merge: true }
      )
    ]);

    // Clear cached table data
    localStorage.removeItem('tableData');
  };

  /**
   * Update testing policy visibility settings
   * @param {string} uri - Institution URI
   * @param {string} policyKey - The policy key (Required, Considered, Not used)
   * @param {boolean} value - Visibility value
   */
  const updateTestingPolicyVisibility = async (uri, policyKey, value) => {
    const fieldMap = {
      'Required': 'showRequiredTestingPolicy',
      'Considered': 'showConsideredTestingPolicy',
      'Not used': 'showNotUsedTestingPolicy'
    };

    const field = fieldMap[policyKey];
    if (!field) return;

    const update = { [field]: value };

    await Promise.all([
      setDoc(
        doc(dbFireStore, 'manual_institution_data', uri),
        update,
        { merge: true }
      ),
      setDoc(
        doc(dbFireStore, 'institutions_integrated', uri),
        update,
        { merge: true }
      )
    ]);
  };

  return {
    updateInstitutionData,
    updateTestingPolicyVisibility
  };
}
