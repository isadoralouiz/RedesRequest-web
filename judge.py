import requests
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS 

# --- Configuração do Servidor "Ponte" ---
app = Flask(__name__)
CORS(app) 

# Esta é a rota que o seu 'script.js' vai chamar
@app.route('/execute', methods=['POST'])
def handle_execution():
    
    # 1. Recebe os dados do seu 'index.html'
    data = request.json
    source_code = data.get('source_code', '')
    stdin = data.get('stdin', '')
    language_id = data.get('language_id', 71)

    print(f"Recebido do frontend: Lang ID {language_id}")
    
    # --- ============================================ ---
    # --- INÍCIO DA LÓGICA DO SEU CÓDIGO PY (INTACTA) ---
    # --- ============================================ ---

    # Este é o script que você forneceu, agora rodando DENTRO
    # do seu servidor "ponte".
    
    JUDGE0_URL = "http://judge.darlon.com.br"

    # Converter ambos para Base64
    encoded_source = base64.b64encode(source_code.encode("utf-8")).decode("utf-8")
    encoded_stdin  = base64.b64encode(stdin.encode("utf-8")).decode("utf-8")

    # Payload
    payload = {
        "source_code": encoded_source,
        "language_id": language_id,
        "stdin": encoded_stdin,
        "base64_encoded": True,
        "wait": True
    }

    try:
        # Enviar submissão ao Judge0
        response = requests.post(f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true", json=payload)
        result = response.json()

        # Decodificar saída
        stdout = base64.b64decode(result.get("stdout") or "").decode("utf-8", errors="ignore")
        stderr = base64.b64decode(result.get("stderr") or "").decode("utf-8", errors="ignore")
        status = result.get("status", {}).get("description", "Erro Desconhecido")

        print("Status:", status)
        print("Saída padrão:", stdout)
        print("Erros:", stderr)

    # --- ========================================== ---
    # --- FIM DA LÓGICA DO SEU CÓDIGO PY (INTACTA) ---
    # --- ========================================== ---

        # 2. Envia o resultado de volta para o seu 'index.html'
        return jsonify({
            "status": status,
            "stdout": stdout,
            "stderr": stderr
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Erro ao contatar o Judge0: {e}")
        return jsonify({"status": "Erro do Servidor", "stderr": f"Não foi possível conectar ao Judge0: {e}"}), 500
    except Exception as e:
        print(f"Erro inesperado: {e}")
        return jsonify({"status": "Erro do Servidor", "stderr": str(e)}), 500

# --- Roda o servidor "ponte" ---
if __name__ == '__main__':
    # Roda o servidor na porta 5000
    app.run(debug=True, port=5000)