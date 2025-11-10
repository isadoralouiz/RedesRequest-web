// Espera o HTML ser carregado antes de rodar
document.addEventListener("DOMContentLoaded", () => {

    // Pega os elementos do HTML pelos seus IDs
    const runButton = document.getElementById("runButton");
    const sourceCodeEl = document.getElementById("sourceCode");
    const stdinEl = document.getElementById("stdin");
    const langSelectEl = document.getElementById("languageSelect");
    const outputEl = document.getElementById("output");

    // O endereço da API
    // const JUDGE0_URL = "https://judge.darlon.com.br"; // <-- LINHA ORIGINAL (COM ERRO)
    
    // CORREÇÃO: Usar um proxy CORS para "consertar" o cabeçalho de permissão
    const JUDGE0_URL = "https://corsproxy.io/?https://judge.darlon.com.br";

    // Função que será chamada quando o botão for clicado
    const runCode = async () => {
        
        // 1. Pegar os valores dos campos
        const source_code = sourceCodeEl.value;
        const stdin = stdinEl.value;
        const language_id = parseInt(langSelectEl.value, 10); // Converte para número

        if (!source_code) {
            outputEl.textContent = "Por favor, digite algum código para executar.";
            return;
        }

        // 2. Mostrar mensagem de "carregando" e desabilitar o botão
        outputEl.textContent = "Executando... por favor, aguarde.";
        runButton.disabled = true;

        try {
            // 3. Converter para Base64 (btoa é a função do JavaScript para isso)
            //    O truque unescape(encodeURIComponent(...)) é para lidar com UTF-8
            const encoded_source = btoa(unescape(encodeURIComponent(source_code)));
            const encoded_stdin = btoa(unescape(encodeURIComponent(stdin)));

            // 4. Montar o payload (igual ao do script Python)
            const payload = {
                source_code: encoded_source,
                language_id: language_id,
                stdin: encoded_stdin,
                base64_encoded: true,
                wait: true
            };

            // 5. Enviar a requisição (fetch é o 'requests.post' do JavaScript)
            const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Pega a mensagem de erro da API se algo der errado
                const errorData = await response.json();
                throw new Error(`Erro na API: ${response.status} - ${errorData.error || response.statusText}`);
            }

            // 6. Pegar o resultado
            const result = await response.json();

            // 7. Decodificar a saída (atob é a função do JavaScript para isso)
            //    ARQUIVADO: Precisamos de decodeURIComponent(escape(...)) para lidar com UTF-8
            const stdout = result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : "";
            const stderr = result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : "";
            const status = result.status.description;

            // 8. Montar e exibir a saída formatada
            let output = `Status: ${status}\n\n--- Saída Padrão (stdout) ---\n${stdout}`;

            if (stderr) {
                output += `\n\n--- Erros (stderr) ---\n${stderr}`;
            }

            outputEl.textContent = output;

        } catch (error) {
            // Lidar com qualquer erro (de rede, da API, etc.)
            console.error("Falha ao executar:", error);
            outputEl.textContent = `Erro: ${error.message}.\n\nVerifique sua conexão ou o console do navegador (F12) para mais detalhes.`;
        } finally {
            // 9. Re-abilitar o botão, não importa se deu certo ou errado
            runButton.disabled = false;
        }
    };

    // "Conecta" a função runCode ao evento de clique do botão
    runButton.addEventListener("click", runCode);
});