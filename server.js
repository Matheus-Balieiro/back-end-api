import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();         // Carrega e processa o arquivo .env
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados
app.use(express.json());
// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada
  
  const db = new Pool({
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
  });
  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

app.get("/", async (req, res) => {        // Cria endpoint na rota da raiz do projeto
  const db = new Pool({
    connectionString: process.env.URL_BD,
  });

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }
  console.log("Rota GET / solicitada");
  res.json({
    message: "API para Perfurmes", // Substitua pelo conteúdo da sua API
    author: "Matheus Balieiro", // Substitua pelo seu nome
    dbStatus: dbStatus,
  });
});

//server.js
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta ="UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// ======================================================
// 🟢 GET /itens — LISTAR TODOS OS ITENS
// ======================================================
app.get("/itens", async (req, res) => {
  console.log("Rota GET /itens solicitada");
  try {
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM itens_achados_perdidos ORDER BY id_item DESC");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar itens:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ======================================================
// 🟢 GET /itens/:id — BUSCAR ITEM POR ID
// ======================================================
app.get("/itens/:id", async (req, res) => {
  console.log("Rota GET /itens/:id solicitada");
  try {
    const db = conectarBD();
    const { id } = req.params;

    const resultado = await db.query("SELECT * FROM itens_achados_perdidos WHERE id_item = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Item não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar item:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ======================================================
// 🟢 POST /itens — CADASTRAR NOVO ITEM
// ======================================================
app.post("/itens", async (req, res) => {
  console.log("Rota POST /itens solicitada");

  try {
    const {
      nome_item,
      descricao,
      local_encontrado,
      data_encontrado,
      status,
      nome_entregador,
      contato_entregador,
      nome_retirante,
      data_retirada
    } = req.body;

    if (!nome_item) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem: "O campo nome_item é obrigatório."
      });
    }

    const db = conectarBD();

    const consulta = `
      INSERT INTO itens_achados_perdidos 
      (nome_item, descricao, local_encontrado, data_encontrado, status, nome_entregador, contato_entregador, nome_retirante, data_retirada)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const valores = [
      nome_item,
      descricao || null,
      local_encontrado || null,
      data_encontrado || null,
      status || "Achado",
      nome_entregador || null,
      contato_entregador || null,
      nome_retirante || null,
      data_retirada || null
    ];

    const resultado = await db.query(consulta, valores);
    res.status(201).json({
      mensagem: "Item cadastrado com sucesso!",
      item: resultado.rows[0]
    });
  } catch (e) {
    console.error("Erro ao cadastrar item:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ======================================================
// 🟡 PUT /itens/:id — ATUALIZAR ITEM
// ======================================================
app.put("/itens/:id", async (req, res) => {
  console.log("Rota PUT /itens/:id solicitada");

  try {
    const { id } = req.params;
    const db = conectarBD();

    const itemExistente = await db.query("SELECT * FROM itens_achados_perdidos WHERE id_item = $1", [id]);
    if (itemExistente.rows.length === 0) {
      return res.status(404).json({ mensagem: "Item não encontrado" });
    }

    const antigo = itemExistente.rows[0];
    const {
      nome_item,
      descricao,
      local_encontrado,
      data_encontrado,
      status,
      nome_entregador,
      contato_entregador,
      nome_retirante,
      data_retirada
    } = req.body;

    const novosValores = {
      nome_item: nome_item || antigo.nome_item,
      descricao: descricao || antigo.descricao,
      local_encontrado: local_encontrado || antigo.local_encontrado,
      data_encontrado: data_encontrado || antigo.data_encontrado,
      status: status || antigo.status,
      nome_entregador: nome_entregador || antigo.nome_entregador,
      contato_entregador: contato_entregador || antigo.contato_entregador,
      nome_retirante: nome_retirante || antigo.nome_retirante,
      data_retirada: data_retirada || antigo.data_retirada
    };

    const consulta = `
      UPDATE itens_achados_perdidos
      SET nome_item=$1, descricao=$2, local_encontrado=$3, data_encontrado=$4,
          status=$5, nome_entregador=$6, contato_entregador=$7, 
          nome_retirante=$8, data_retirada=$9
      WHERE id_item=$10
      RETURNING *;
    `;

    const valores = [
      novosValores.nome_item,
      novosValores.descricao,
      novosValores.local_encontrado,
      novosValores.data_encontrado,
      novosValores.status,
      novosValores.nome_entregador,
      novosValores.contato_entregador,
      novosValores.nome_retirante,
      novosValores.data_retirada,
      id
    ];

    const resultado = await db.query(consulta, valores);
    res.status(200).json({
      mensagem: "Item atualizado com sucesso!",
      item: resultado.rows[0]
    });
  } catch (e) {
    console.error("Erro ao atualizar item:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ======================================================
// 🔴 DELETE /itens/:id — EXCLUIR ITEM
// ======================================================
app.delete("/itens/:id", async (req, res) => {
  console.log("Rota DELETE /itens/:id solicitada");

  try {
    const { id } = req.params;
    const db = conectarBD();

    const resultado = await db.query("DELETE FROM itens_achados_perdidos WHERE id_item = $1 RETURNING *", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Item não encontrado" });
    }

    res.json({ mensagem: "Item excluído com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir item:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});


app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});