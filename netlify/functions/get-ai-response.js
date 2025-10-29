// This is the CJS (exports.handler) version.
// This is more robust and should fix the deploy failure.
// We are NOT using the "export default" version anymore.

exports.handler = async function(event, context) {
    // 1. Only allow POST requests.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. Get the secret API key from the environment variables.
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ message: "API key is not set." })
            };
        }

        // 3. Get the data sent from the frontend.
        const { userQuery, systemPrompt } = JSON.parse(event.body);

        // 4. This is the Google API endpoint.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // 5. Prepare the payload for the Google API.
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        // 6. Make the secure call to the Google API from the server.
        // The 'fetch' function is already available globally in this environment.
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If Google's API returns an error, pass it back.
            const errorBody = await response.text();
            console.error("Google API Error:", errorBody);
            return { statusCode: response.status, body: errorBody };
        }

        const data = await response.json();

        // 7. Send the successful response back to the frontend.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // 8. Handle any other errors.
        console.error("Function Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing your request', error: error.message })
        };
    }
};

