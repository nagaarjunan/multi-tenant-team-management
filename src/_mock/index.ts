import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { signIn, signUp, userList } from "./handlers/_user";

const handlers = [signIn, signUp, userList, mockTokenExpired, menuList];
const worker = setupWorker(...handlers);

export { worker };
