import { auth } from "../lib/auth.js";

async function test() {
  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: "better-auth.session_token=uocZGKVGDhmUUOKYiSgsElYjhPW2Bpxi"
      }
    });
    console.log("Session fetched via getSession:", JSON.stringify(session, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
