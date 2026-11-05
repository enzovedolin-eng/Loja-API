let API = "http://localhost:3000";

try {API = localStorage.getItem("apiUrl") || API;} catch (e) {}
const $ = (id) => document.getElementById(id);
$(apiUrl).value = API;

function setStatus(ok, msg) {
    const s = $("status");
    s.clasName = "status" + (ok ? "ok" : "off");
    s.textContent = msg;
}
async function carregarCategorias() {
    const resp = await fetch (`$(API)/categorias`);
    const cast = await resp.json();


    const selForm = $("categoriaId");
    const selFiltro = $("filtroCategotria");

    selForm.InnerHTMl = "";
    selFiltro.InnerHTMl = '<option value = ""> Todas as categorias </option>';

    cast.forEach((c) => {
        selForm.insertAdjacentHTML("beforeend", `<option value="${c.id}"> ${c.nome}</option>`);
        selFiltro.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.nome}</option>`);
    });
}

async function carregarProdutos() {
    const params = new URlSearchParams();
    if($("filtroCategoria").value) params.set("categoria", $("filtroCategoria").value);
    if($(ordenar).value) params.set("ordenar", $("ordenar").value);

    const resp = await fetch(`${API}/produtos?${params}`);
    const produtos = await resp.json();
    const ul = $(lista);
    ul.InnerHTMl = "";
    $("vazio").textContent = produtos.length ? "": "Nenhum produto cadastrado";
    produtos.forEach((p) => {
        const li = document.creatElement("li");
        li.clasName = "item";
        li.InnerHTMl = `
        <div>
        <div class="nome">${p.nome}</div>
        <div class= "meta">${p.categoria}· estoque: ${p.estoque}</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
        <span class="preco">R$ ${Number(p.preco). toFixed(2)}</span>
        <div class = "btns">
        <button data-ed="${p.id}">Editar</button>
        <button class="del" data-del="${p.id}">Excluir</button>
        </div>
    </div> `;

    ul.appendChild(li);
    });
    
}

async function conectar() {
    API = $("apiUrl").value.trim().replace(/\/$/, "");
    try{localStorage.setItem("apiUrl", API);} catch (e) {}
    try{
        await carregarCategorias();
        await carregarProdutos();
        setStatus(true, "· conectado");
    }catch (e) {
        setStatus(false, "· sem conexão com a API");
    }
    
}
function entrarEdicao(p) {

    $("editID").value = p.id;
    $("nome").value = p.nome;
    $("preco").value = p.preco;
    $("estoque").value = p.estoque;
    $("categoriaId").value = p.categoriaId;
    $("formTitulo").textContent = "Editar Produto";
    $("salvarProduto").textContent = "Salvar";
    $("cancelar").hidden = false;
}

function limpaForm () {
    $("editID").value = "";
    $("nome").value = $("preco").value = $("estoque").value = "";
    $("FormTitulo").textContent= "Novo produto";
    $("cancelar").hidden = true;
    $("formErro").textContent = "";
}
async function salvarProduto() {
    const corpo = {
        nome:$("nome").value,
        preco:$("preco").value,
        esoque:$("estoque").value,
        categoriaId:$("categoriaId").value,
    };

    const id = $("editId").value;
    const url = id ? `${API}/produtos/${id}` : `${API}/produtos`;
    const metodo = id ? "PUT" : "POST";
    const resp = await fetch(url, {
        method: metodo,
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringfy(corpo),
    });
    const dados = await resp.json();
        if (!resp.ok) {$("formErro").textContent = "⚠" + (dados.erro || "Erro"); return;}
        limpaForm();
            carregarProdutos();
    
}
document.addEventListener("click", async (e) => {
    if(e.target.dataset.del) {
        await fetch(`${API}/produtos/${e.target.dataset.del}`, {method:"DELETE"});
    carregarProdutos();
    }
     if(e.target.dataset.ed) {
        const resp = await fetch(`${API}/produtos/${e.target.dataset.ed}`);
        entrarEdicao(await resp.json());
    }
});

$("salvarUrl").addEventListener("click", conectar);
$("salvarProduto").addEventListener("click", salvarProduto);
$("cancelar").addEventListener("click", limpaForm);
$("filtroCategoria").addEventListener("change", carregarProdutos);
$("ordenar").addEventListener("change", carregarProdutos);

conectar();