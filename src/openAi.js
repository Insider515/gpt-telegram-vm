import { Configuration, OpenAIApi } from 'openai'
import config from 'config';
import { createReadStream } from 'fs'

class OpenAi {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }

    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(configuration);
    }

    //Ініціалізація чату з GPT
    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            //
            return response.data.choices[0].message
        } catch (e) {
            console.log('Error while chat', e.message)
        }
    }
    //Створення  тексту з голосового повідомлення за топопмогою API openAI
    async transcription(mp3Path) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(mp3Path),
                'whisper-1'
            )
            return response.data.text
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}
export const openai = new OpenAi(config.get('OPENAI_API_KEY'))