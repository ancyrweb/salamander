import { Root, SchemaLike } from "joi";

export type ConstraintBuilder = Root;
export type Constraint = SchemaLike;
export type ConstraintBuilderFunction = (
  builder: ConstraintBuilder,
  context?: object
) => Constraint;

interface Validable {
  getConstraints: ConstraintBuilderFunction;
}

export default Validable;
