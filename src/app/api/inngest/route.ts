import { serve } from "inngest/next";

import { inngest } from "@/modules/intelligence/inngest/client";
import { processMeetingTranscript } from "@/modules/intelligence/inngest/functions/process-meeting-transcript";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeetingTranscript],
});
