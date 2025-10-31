import fetch from "node-fetch"; // instale com: npm install node-fetch
import { Buffer } from "buffer";

const JUDGE0_URL = "http://judge.darlon.com.br";

// Código Python a ser executado
const sourceCode = `
print(input())

# val_a = int(input())
# val_b = int(input())
# val_soma - val_a = val_b
# print(f"{val_a} + {val_b} = {val_soma}")
`;

// Entrada padrão (stdin)
const stdin = `5
10`;

// Converter código e stdin para Base64
const encodedSource = Buffer.from(sourceCode, "utf-8").toString("base64");
const encodedStdin = Buffer.from(stdin, "utf-8").toString("base64");

// Montar payload
const payload = {
  source_code: encodedSource,
  language_id: 71, // Python 3.x
  stdin: encodedStdin,
  base64_encoded: true,
  wait: true
};

// Enviar submissão e mostrar resultado
async function main() {
  try {
    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Decodificar saída e erros (que vêm em Base64)
    const stdout = result.stdout
      ? Buffer.from(result.stdout, "base64").toString("utf-8")
      : "";
    const stderr = result.stderr
      ? Buffer.from(result.stderr, "base64").toString("utf-8")
      : "";

    console.log("Status:", result.status.description);
    console.log("Saída padrão:", stdout);
    console.log("Erros:", stderr);
  } catch (error) {
    console.error("Erro:", error);
  }
}

main();
