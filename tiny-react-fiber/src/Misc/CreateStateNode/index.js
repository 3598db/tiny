import { createDOMElement } from "../../DOM";
import { CreateReactInstance } from "../CreateReactInstance";

const createStateNode = (fiber) => {
  if (fiber.tag === "host_component") {
    return createDOMElement(fiber);
  } else {
    return CreateReactInstance(fiber);
  }
};

export default createStateNode;
