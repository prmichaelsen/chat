import { BedrockRuntime, config } from "aws-sdk";

config.update({ region: "us-east-1" });

export interface ChatServiceInput {
  prompt: string;
}
export const chatService = async (input: ChatServiceInput) => {
  const { prompt } = input;
  const params = {
    body: JSON.stringify({
      prompt,
      temperature: 0,
      top_p: 0,
      top_k: 0,
      max_tokens_to_sample: 1000,
      stop_sequences: ["[STOP]"],
    }),
    modelId: "anthropic.claude-v2",
    accept: "application/json",
    contentType: "application/json",
  };
  const bedrockRuntime = new BedrockRuntime({
    apiVersion: "2023-09-30",
  });
  const result = await bedrockRuntime.invokeModel(params).promise();
  const body = JSON.parse(String(result.body)) as {
    completion: string;
  };
  return body.completion.trim();
};
