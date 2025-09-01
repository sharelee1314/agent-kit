<script lang="ts">
	import { createEventSource } from 'eventsource-client';
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import {Save} from 'lucide-svelte'
	import {api} from '$lib/api';

	let messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [];
	let inputMessage = '';
	let isLoading = false;
	let chatContainer: HTMLElement;

	function handleMessage(message: string) {
		isLoading = false;
		let oldMessages = messages[messages.length - 1];
		if (oldMessages.role === 'assistant') {
			oldMessages.content += message;
		}

		messages = [
			...messages.slice(0, -1),
			{
				role: 'assistant',
				content: oldMessages.content,
				timestamp: new Date()
			}
		];

		scrollToBottom();
	}

	// 调用真实的AI API
	async function callAIAPI(userMessage: string, handleMessage: (message: string) => void) {
		const SSEClient = createEventSource({
			url: '/api/chat/assistant',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`
			},
			method: 'POST',
			onMessage: (event) => {
				console.log('event', event);
			},
			body: JSON.stringify({ message: userMessage })
		});

		for await (const chunk of SSEClient) {
			const { data } = chunk;
			if (data === '[DONE]') {
				SSEClient.close();
				return;
			}
			try {
				const parseData = JSON.parse(data);
				handleMessage(parseData.data);
			} catch (error) {
				handleMessage(data);
				console.error(error);
			}
		}
	}

	async function sendMessage() {
		if (!inputMessage.trim() || isLoading) return;

		const userMsg = inputMessage.trim();
		inputMessage = '';

		// 添加用户消息
		messages = [
			...messages,
			{
				role: 'user',
				content: userMsg,
				timestamp: new Date()
			}
		];

		isLoading = true;

		messages = [
			...messages,
			{
				role: 'assistant',
				content: '',
				timestamp: new Date()
			}
		];

		callAIAPI(userMsg, handleMessage);
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function clearChat() {
		messages = [];
	}

	async function getChatHistory(): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>> {
		const chatHistory = await api.get('/api/chat/history');
		return chatHistory?.content || [];
	}

	async function saveChat() {
		await api.post('/api/chat/save', {
			content: messages
		});
	}

	onMount(async () => {
		let chatHistory = await getChatHistory();
		// 欢迎消息
		messages = chatHistory || [
			{
				role: 'assistant',
				content: '你好！我是你的AI助手。有什么我可以帮助你的吗？',
				timestamp: new Date()
			}
		];
		console.log(messages,'messages');
	});
</script>

<div class="ai-chat-container">
	<!-- 头部 -->
	<div class="chat-header">
		<div class="header-content">
			<div class="ai-indicator">
				<div class="pulse-dot"></div>
				<span>AI Assistant</span>
			</div>
			<button class="clear-btn" on:click={saveChat}>
				<Save size={16}></Save>
				保存
			</button>
			<button class="clear-btn" on:click={clearChat}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
					/>
				</svg>
				清空
			</button>
		</div>
	</div>

	<!-- 聊天区域 -->
	<div class="chat-messages" bind:this={chatContainer}>
		{#each messages as message}
			{#if !!message.content}
				<div class="message {message.role}">
					<div class="message-avatar">
						{#if message.role === 'user'}
							<div class="user-avatar">U</div>
						{:else}
							<div class="ai-avatar">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="3" />
									<path
										d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
									/>
								</svg>
							</div>
						{/if}
					</div>
					<div class="message-content">
						<div class="message-text">{message.content}</div>
						<div class="message-time">
							{dayjs(message.timestamp).format('YYYY-MM-DD HH:mm:ss')}
						</div>
					</div>
				</div>
			{/if}
		{/each}

		{#if isLoading}
			<div class="message assistant">
				<div class="message-avatar">
					<div class="ai-avatar loading">
						<div class="loading-dots">
							<div></div>
							<div></div>
							<div></div>
						</div>
					</div>
				</div>
				<div class="message-content">
					<div class="typing-indicator">AI正在思考中...</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- 输入区域 -->
	<div class="chat-input">
		<div class="input-container">
			<textarea
				bind:value={inputMessage}
				on:keydown={handleKeyPress}
				placeholder="输入你的问题..."
				rows="1"
				disabled={isLoading}
			></textarea>
			<button
				class="send-btn"
				on:click={sendMessage}
				disabled={!inputMessage.trim() || isLoading}
				aria-label="Send message"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="22" y1="2" x2="11" y2="13" />
					<polygon points="22,2 15,22 11,13 2,9" />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.ai-chat-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
		color: #e0e6ed;
		font-family:
			'SF Pro Display',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
	}

	.chat-header {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem 1.5rem;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 800px;
		margin: 0 auto;
	}

	.ai-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 1.1rem;
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		background: #00ff88;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.clear-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #e0e6ed;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		font-size: 0.9rem;
	}

	.clear-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	.message {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		animation: fadeInUp 0.3s ease;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message.user {
		flex-direction: row-reverse;
	}

	.message-avatar {
		flex-shrink: 0;
	}

	.user-avatar,
	.ai-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.user-avatar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.ai-avatar {
		background: linear-gradient(135deg, #00ff88 0%, #00d4aa 100%);
		color: #0a0a0a;
	}

	.ai-avatar.loading {
		background: rgba(0, 255, 136, 0.2);
		color: #00ff88;
	}

	.loading-dots {
		display: flex;
		gap: 2px;
	}

	.loading-dots div {
		width: 4px;
		height: 4px;
		background: #00ff88;
		border-radius: 50%;
		animation: loadingDots 1.4s infinite ease-in-out both;
	}

	.loading-dots div:nth-child(1) {
		animation-delay: -0.32s;
	}
	.loading-dots div:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes loadingDots {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	.message-content {
		flex: 1;
		max-width: calc(100% - 60px);
	}

	.message.user .message-content {
		text-align: right;
	}

	.message-text {
		background: rgba(255, 255, 255, 0.1);
		padding: 1rem 1.25rem;
		border-radius: 18px;
		line-height: 1.5;
		word-wrap: break-word;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.message.user .message-text {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
	}

	.message.assistant .message-text {
		background: rgba(0, 255, 136, 0.1);
		border: 1px solid rgba(0, 255, 136, 0.2);
	}

	.message-time {
		font-size: 0.75rem;
		color: rgba(224, 230, 237, 0.6);
		margin-top: 0.5rem;
		padding: 0 0.5rem;
	}

	.typing-indicator {
		color: rgba(0, 255, 136, 0.8);
		font-style: italic;
		padding: 1rem 1.25rem;
	}

	.chat-input {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem 1.5rem;
	}

	.input-container {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		max-width: 800px;
		margin: 0 auto;
	}

	textarea {
		flex: 1;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		color: #e0e6ed;
		font-size: 1rem;
		line-height: 1.5;
		resize: none;
		min-height: 24px;
		max-height: 120px;
		font-family: inherit;
		transition: all 0.2s ease;
	}

	textarea:focus {
		outline: none;
		border-color: #00ff88;
		box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
	}

	textarea::placeholder {
		color: rgba(224, 230, 237, 0.5);
	}

	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.send-btn {
		background: linear-gradient(135deg, #00ff88 0%, #00d4aa 100%);
		border: none;
		border-radius: 12px;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #0a0a0a;
	}

	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
	}

	.send-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	/* 滚动条样式 */
	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background: rgba(0, 255, 136, 0.3);
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 255, 136, 0.5);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.chat-header,
		.chat-input {
			padding: 1rem;
		}

		.chat-messages {
			padding: 1rem 0.5rem;
		}

		.message {
			gap: 0.75rem;
		}

		.user-avatar,
		.ai-avatar {
			width: 32px;
			height: 32px;
			font-size: 0.8rem;
		}

		.message-content {
			max-width: calc(100% - 50px);
		}

		.message-text {
			padding: 0.75rem 1rem;
			font-size: 0.95rem;
		}
	}
</style>
