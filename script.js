document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleciona todos os elementos do HTML
    const runButton = document.getElementById('runButton');
    const sourceCodeElem = document.getElementById('sourceCode');
    const stdinElem = document.getElementById('stdin');
    const languageSelectElem = document.getElementById('languageSelect');
    const outputElement = document.getElementById('output');

    // 2. Adiciona o "ouvinte" de clique no botão
    runButton.addEventListener('click', async () => {
        
        // 3. Pega os valores dos campos QUANDO o botão é clicado
        const sourceCode = sourceCodeElem.value;
        const stdin = stdinElem.value;
        const languageId = languageSelectElem.value;

        // 4. Mostra uma mensagem de "Executando..."
        outputElement.innerHTML = '<span class="output-label">Executando...</span>';

        try {
            // 5. Envia os dados para o seu 'servidor.py' (a "ponte")
            const response = await fetch('http://127.0.0.1:5000/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: sourceCode,
                    stdin: stdin,
                    language_id: parseInt(languageId, 10) // Converte o ID para número
                })
            });

            // 6. Recebe a resposta do 'servidor.py'
            const result = await response.json();

            // 7. Formata a resposta e exibe no <pre id="output">
            let htmlOutput = '';
            
            // Define a cor do status (verde para sucesso, vermelho para erro)
            const statusClass = (result.status === "Accepted") ? 'status-success' : 'status-error';
            
            // Adiciona o Status
            htmlOutput += `<strong>Status: </strong><span class="${statusClass}">${result.status}</span><br>`;

            // Adiciona a Saída Padrão (stdout), se existir
            if (result.stdout) {
                htmlOutput += `<strong class="output-label">Saída Padrão:</strong>`;
                const escapedStdout = escapeHTML(result.stdout);
                htmlOutput += `<span style="color: var(--text-light);">${escapedStdout}</span>`;
            }

            // Adiciona Erros (stderr), se existir
            if (result.stderr) {
                htmlOutput += `<strong class="output-label">Erros:</strong>`;
                const escapedStderr = escapeHTML(result.stderr);
                htmlOutput += `<span class="status-error">${escapedStderr}</span>`;
            }
            
            // Coloca o HTML formatado dentro da caixa de saída
            outputElement.innerHTML = htmlOutput;

        } catch (error) {
            // 8. Se a conexão com o 'servidor.py' falhar
            outputElement.innerHTML = `<span class="status-error">Erro ao conectar com o servidor: ${error.message}.<br>Verifique se o 'servidor.py' está rodando no seu terminal.</span>`;
        }
    });

    /**
     * Função de segurança para "escapar" o HTML.
     * Isso impede que um código como print("<h1>Olá</h1>")
     * quebre o layout da sua página.
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
});