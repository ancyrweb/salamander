import * as joi from "joi";
import Validable, { ConstraintBuilderFunction } from "./Validable";

class Validator {
  validator: joi.Root;

  constructor() {
    this.validator = joi;
  }

  validate(
    entity: Validable,
    value: any,
    constraintAccessor: ConstraintBuilderFunction | Validable | any,
    context?: any
  ): {
    success: boolean;
    message: string | null;
    original: joi.Err | null;
  } {
    let schema = null;
    if (entity.getConstraints) {
      context = constraintAccessor;
      constraintAccessor = entity;
    }

    if (typeof constraintAccessor === "function") {
      schema = constraintAccessor(this.validator, context);
    } else {
      schema = constraintAccessor.getConstraints(this.validator, context);
    }

    const result = this.validator.validate(value, schema);
    if (result.error) {
      return {
        success: false,
        message: result.error.message,
        original: result.error
      };
    }

    return {
      success: true,
      message: null,
      original: null
    };
  }
}

export default Validator;
