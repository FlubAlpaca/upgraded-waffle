# Tech Stack
- **Node.js** + **Express**
- **Handlebars** for templating
- **OpenRouter API** for LLM calls
- **PostgreSQL** database

# Dependencies

Install all project dependencies with:

```bash
npm install
```

# Environmental Variables
- PORT
- OPENROUTER_API_KEY
- OPENROUTER_MODEL
- TZ
- DATABASE_URL

# Using the system
1. Start the server by running node index.js in the correct directory in the terminal
2. Send a POST request to http://localhost:PORT/api/intake/start this will return a session ID and a question (I use Postman to send request in my testing)
3. Send a POST request to http://localhost:PORT/api/intake/answer in the following format {"sessionId":"ID","userText":"ANSWER"}. When the system has all the information it will automatically generate html and .doc versions of the will in the out folder
