export interface ValidatorConfig {
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }

export function validate(validatableInput: ValidatorConfig) {
      let isValid = true;
      if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
      }
      if (typeof validatableInput.value === "string"){
        if (validatableInput.minLength != null) {
          isValid = isValid && validatableInput.value.length > validatableInput.minLength;
        }
        if (validatableInput.maxLength != null) {
          isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
        }
      }
      if (typeof validatableInput.value === "number"){
        if (validatableInput.min != null) {
          isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null) {
          isValid = isValid && validatableInput.value <= validatableInput.max;
        }
      }
      return isValid;
    }