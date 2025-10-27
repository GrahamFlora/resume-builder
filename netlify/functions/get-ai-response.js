// This is a Node.js function that runs on Netlify's servers.
exports.handler = async function(event, context) {
    // Only allow POST requests.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the secret API key from the environment variables.
        const apiKey = process.env.GEMINI_API_KEY;

        // Get the data sent from the frontend.
        const { userQuery, systemPrompt } = JSON.parse(event.body);

        // This is the Google API endpoint.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview-0514:generateContent?key=${apiKey}`;

        // Prepare the payload for the Google API.
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        // Make the secure call to the Google API from the server.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If Google's API returns an error, pass it back.
            const errorBody = await response.text();
            return { statusCode: response.status, body: errorBody };
        }

        const data = await response.json();

        // Send the successful response back to the frontend.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // Handle any other errors.
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing your request', error: error.message })
        };
    }
};