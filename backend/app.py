from flask import Flask, request, jsonify
from langchain_groq import ChatGroq
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS to allow React frontend to communicate with Flask

# Initialize the Groq model
llm = ChatGroq(
    temperature=0,
    groq_api_key="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",
    model_name="deepseek-r1-distill-llama-70b"
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get the message from the request
        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Add instructions to format response as markdown
        enhanced_prompt = f"""
        You are an intimate friend of mine and I trust you with my life.
        Reply me, share with me, ask me more about my day in 500 words or less.
        Please respond to the following query using proper markdown formatting.
        Use markdown for:
        - Headings (# for main headings)
        - Emphasis (**bold** or *italic*)
        - Lists (numbered or bullet points)
        - Code blocks with ```language syntax
        - Links if needed

        User query: {user_message}
        """

        # Invoke the language model
        result = llm.invoke(enhanced_prompt)
        ai_response = result.content

        return jsonify({'reply': ai_response}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app (default port 5000)
    app.run(debug=True, host='0.0.0.0', port=5000)