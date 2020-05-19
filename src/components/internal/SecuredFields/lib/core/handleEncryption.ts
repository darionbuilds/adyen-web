import { makeCallbackObjectsEncryption } from './utils/callbackUtils';
import { addEncryptedElements } from '../ui/encryptedElements';
import { HOSTED_MONTH_FIELD, HOSTED_YEAR_FIELD, HOSTED_CVC_FIELD, HOSTED_NUMBER_FIELD } from '../configuration/constants';
import { processErrors } from './utils/processErrors';
import { truthy } from '../utilities/commonUtils';
import { SFFeedbackObj, CbObjOnFieldValid, EncryptionObj } from '~/components/internal/SecuredFields/lib/types';
import * as logger from '../utilities/logger';

export function handleEncryption(pFeedbackObj: SFFeedbackObj): void {
    if (process.env.NODE_ENV === 'development' && window._b$dl) {
        logger.log('\n### HandleEncryption:: pFeedbackObj=', pFeedbackObj);
    }

    // EXTRACT VARS
    const fieldType: string = pFeedbackObj.fieldType;

    // SET FOCUS ON OTHER INPUT - If user has just typed a correct expiryDate - set focus on the cvc field OR typed a correct expiryMonth - focus on year field
    if (this.config.autoFocus) {
        if (pFeedbackObj.type === 'year' || fieldType === HOSTED_YEAR_FIELD) {
            this.setFocusOnFrame(HOSTED_CVC_FIELD);
        }
        if (fieldType === HOSTED_MONTH_FIELD) {
            this.setFocusOnFrame(HOSTED_YEAR_FIELD);
        }
    }
    //--

    let i: number;
    let len: number;

    const encryptedObjArr: EncryptionObj[] = pFeedbackObj[fieldType];

    // Set boolean saying this securedField is in an encryptedState
    this.state.securedFields[fieldType].isEncrypted = true;

    // ADD HIDDEN INPUT TO PARENT FORM ELEMENT, if allowed
    if (this.config.allowedDOMAccess) {
        addEncryptedElements(encryptedObjArr, this.state.type, this.props.rootNode);
    }

    // REMOVE ANY ERRORS ON FIELD e.g. was a full number that failed the luhnCheck, then we corrected the number and now it passes
    processErrors(
        ({ error: '', fieldType } as any) as SFFeedbackObj,
        this.state.securedFields[fieldType],
        this.state.type,
        this.props.rootNode,
        this.callbacks.onError
    );

    // MAKE ENCRYPTION OBJECTS FOR EACH OF THE INDIVIDUAL INPUTS
    // N.B. when considering "individual inputs" we are concerned with the 4 fields that the checkoutAPI expects to receive for a credit card payment:
    // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear
    const callbackObjectsArr: CbObjOnFieldValid[] = makeCallbackObjectsEncryption(fieldType, this.state.type, this.props.rootNode, encryptedObjArr);

    // For number field - add the endDigits to the encryption object
    if (fieldType === HOSTED_NUMBER_FIELD && truthy(pFeedbackObj.endDigits)) {
        callbackObjectsArr[0].endDigits = pFeedbackObj.endDigits;
    }

    // BROADCAST VALID STATE OF INDIVIDUAL INPUTS - passing the encryption objects
    for (i = 0, len = callbackObjectsArr.length; i < len; i += 1) {
        this.callbacks.onFieldValid(callbackObjectsArr[i]);
    }
    //--------------------------------------------

    // STORE & BROADCAST VALID STATE OF THE FORM AS A WHOLE ///////
    this.assessFormValidity();
}
