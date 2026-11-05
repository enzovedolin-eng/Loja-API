const express = require("express");
const fs = require("fs")
const app = express();
const PORT = 3000;
const ARQUIVO = "./data.json";

app.use(express.json());
app.use(express.static("public"));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Contet-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

function carregar() {
    const texto = fs.readFileSync(ARQUIVO,"utf-8");
    return JSON.parse(texto);
}
function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

let { categoria, produtos } = carregar();
let proximoId = produtos.reduce((max,p )=> Math.max(max, p.id), 0) + 1;
function comCategoria(p) {
    const cat = carregarCategorias.find((c) => c.id === p.categoriaId);
    return {...p, categoria: cat ? cat.nome : "Sem categoria"};
}

app.get("/categorias", (req, res) => {
    let lista = produtos.map(comCategoria);
    if (req.query.categoria) {
        const idcat = Number(req.query.categoria);
        lista = lista.filter((p) => p.categoriaId === idcat);
    }
    const ordenar = req.query.ordenar;
if (ordenar === "preco") lista.sort((a,b) => a.preco - b.preco);
if (ordenar === "estoque") lista.sort((a,b) => a.estoque - b.estoque)
if (ordenar === "nome") lista.sort((a,b) => a.nome.localeCompare(b.nome));
res.status(200).json(lista);
});

app.get("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find((p) => p.id === id);
    if(!produto) return res.status(404).json({erro:"Produto não encontrado"});
    res.status(200).json(comCategoria(produto));
});

function validar(body) {
    const nome = (body.nome || "").trim();
    const preco = Number(body.preco);
    const estoque = Number(body.estoque);
    const categoriaId = Number(body.categoriaId);

    if (!nome) return {erro:"informe o nome"};
    if (Number.isNaN(preco) || preco < 0) return {erro:"preço deve ser um número maior que zero"};
    if (Number.isNaN(estoque) || estoque< 0 ) return {erro:"estoque deve ser um número inteiro"};
    if (!categoria.find((c) => c.id === categoriaId)) return{erro: "categoriaId inexistete"};

    return { ok: {nome, preco, estoque, categoriaId} };
}
app.post("/produtos", (req, res) => {
    const v = validar(req.body);
    if (v.erro) return res.status(400).json({erro: v.erro});

    const novo = {id:proximoId++,...v.ok};
    produtos.push(novo);
    salvar({categoria,produtos});
    res.status(201).json(comCategoria(novo));
});

app.put ("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return res.status(404).json({erro:v.erro});

    produto.nome = v.ok.nome;
    produto.preco = v.ok.preco;
    produto.estoque = v.ok.estoque;
    produto.categoriaId = v.ok.categoriaId;
    salvar({categorias, produtos });
    res.status(200).json(comCategoria(produto));
});

app.delete("/produto:/" , (req, res) => {
    const id = Number(req.params.id);
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === 1) return res.status(404).json({erro: "Produto não encontrado"});
    produtos.splice(indice, 1 );
    salvar({categoria, produtos});
    res.status(204).end();
});

app.listen(PORT , () => {
    console.log(`API loja no ar : http://localhost:${PORT}`);
})


