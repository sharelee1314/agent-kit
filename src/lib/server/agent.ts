import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from '@langchain/core/tools'
import { ChatDeepSeek } from '@langchain/deepseek'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { DEEPSEEK_API_KEY } from '$env/static/private';

import { WeatherTool } from './agent-tools'

const model = new ChatDeepSeek({
  model: "deepseek-chat",
  apiKey: DEEPSEEK_API_KEY,
  temperature: 0.7,
});

export const agent = createReactAgent({
  llm: model,
  tools: [WeatherTool()],
  messageModifier: "你是一个智能助手。当使用搜索工具时，请基于搜索结果为用户提供有用的回答，不要直接展示原始搜索数据。"
});

export async function* streamAgentResponse(message: string) {
  const stream = await agent.stream(
    { messages: [new HumanMessage(message)] },
    { streamMode: "values" }
  );

  for await (const chunk of stream) {
    const messages = chunk.messages;
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // 只返回AI消息，过滤掉工具调用和工具结果
      if (lastMessage instanceof AIMessage && lastMessage.content) {
        yield {
          type: 'message',
          data: lastMessage.content
        };
      }
    }
  }
}



