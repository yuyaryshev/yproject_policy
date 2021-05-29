// @INPRINT_START {exclude:[], merge:[{name:"publishApiFuncs", suffix:"PublishApi"}]}
export * from "./checkProject.js";

import { checkProjectPublishApi } from "./checkProject";
export const publishApiFuncs = [checkProjectPublishApi];
// @INPRINT_END
