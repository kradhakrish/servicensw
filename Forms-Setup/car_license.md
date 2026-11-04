# Car licence details

This document describes the 20 fields defined in `salesforce_car_licence_details.csv`. Field names use camel case only.

## Object

- Object name: `carLicenceDetails`
- Purpose: Capture applicant, licence, concession, renewal, and driving-history information.
- Source format: Horizontal CSV field definition.
- Conditional fields: 3

## Fields

1. `name`
   - Type: Text
   - Section: Personal Details
   - Captures the applicant's full name.

2. `address`
   - Type: Text Area
   - Section: Personal Details
   - Captures the applicant's residential address.

3. `postcode`
   - Type: Text
   - Section: Personal Details
   - Captures the Australian postcode.

4. `emailAddress`
   - Type: Email
   - Section: Personal Details
   - Captures a valid email address.

5. `mobileNumber`
   - Type: Phone
   - Section: Personal Details
   - Captures the applicant's Australian mobile number.

6. `licenceNumber`
   - Type: Text
   - Section: Personal Details
   - Captures the current driver licence number.

7. `hasConcessionCardPccDva`
   - Type: Checkbox
   - Section: Concession Card
   - Values: Yes or No.

8. `aboriginalOrTorresStraitIslanderDescent`
   - Type: Checkbox
   - Section: Aboriginal / Torres Strait Islander
   - Optional field with Yes or No values.

9. `heldOtherNswLicenceOrPhotoCard`
   - Type: Checkbox
   - Section: Previous Licence
   - Values: Yes or No.

10. `previousLicenceDetails`
    - Type: Text Area
    - Section: Previous Licence
    - Conditional: Display when `heldOtherNswLicenceOrPhotoCard` is true.

11. `disqualifiedProhibitedOrRefusedDriving`
    - Type: Checkbox
    - Section: Medical & Driving History
    - Values: Yes or No.

12. `disqualificationDetails`
    - Type: Text Area
    - Section: Medical & Driving History
    - Conditional: Display when `disqualifiedProhibitedOrRefusedDriving` is true.

13. `hasDiabetes`
    - Type: Checkbox
    - Section: Medical & Driving History
    - Values: Yes or No.

14. `diabetesControlType`
    - Type: Picklist
    - Section: Medical & Driving History
    - Options: Insulin, Oral medication, Diet (medical not required).
    - Conditional: Display when `hasDiabetes` is true.

15. `requestedRenewalPeriod`
    - Type: Picklist
    - Section: Licence Renewal Period
    - Options: 1 year, 3 years, 5 years, P1 (18 months), P2 (30 months).

16. `previousLicenceClass`
    - Type: Text
    - Section: Previous Licence
    - Captures the previous NSW licence class.

17. `previousLicenceExpiryDate`
    - Type: Date
    - Section: Previous Licence
    - Captures the previous NSW licence expiry date.

18. `pendingChargesOrAppeals`
    - Type: Checkbox
    - Section: Medical & Driving History
    - Values: Yes or No.

19. `hasEpilepsy`
    - Type: Checkbox
    - Section: Medical & Driving History
    - Values: Yes or No.

20. `wearGlassesOrContactLensesForDriving`
    - Type: Checkbox
    - Section: Medical & Driving History
    - Values: Yes or No.

## Conditional logic

1. Show `previousLicenceDetails` when `heldOtherNswLicenceOrPhotoCard` is true.
2. Show `disqualificationDetails` when `disqualifiedProhibitedOrRefusedDriving` is true.
3. Show `diabetesControlType` when `hasDiabetes` is true.

Use Salesforce Dynamic Forms visibility rules to implement these conditions.
