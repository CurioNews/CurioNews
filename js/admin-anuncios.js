const getEl = (id) => document.getElementById(id);

const formAnuncio = getEl("form-anuncio");
const listaAnuncios = getEl("lista-anuncios");
const anuncioId = getEl("anuncio-id");
const anuncioNome = getEl("anuncio-nome");
const anuncioImagem = getEl("anuncio-imagem");
const anuncioLink = getEl("anuncio-link");
const anuncioPosicao = getEl("anuncio-posicao");
const anuncioAtivo = getEl("anuncio-ativo");
const cancelarEdicao = getEl("cancelar-edicao-anuncio");

const ADMIN_ID = "b71328fe-b51d-47f6-b3bd-dac00f7878f1";

async function verificarAdministrador() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "login.html";
        return false;
    }

    if (data.user.id !== ADMIN_ID) {
        alert("Você não tem autorização para acessar esta área.");
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
        return false;
    }

    return true;
}

async function carregarListaAnuncios() {
    if (!listaAnuncios) return;

    listaAnuncios.innerHTML = "<p>Carregando anúncios...</p>";

    const { data, error } = await supabaseClient
        .from("anuncios")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        listaAnuncios.innerHTML = `<p style="color:red">Erro ao carregar anúncios: ${escapar(error.message)}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        listaAnuncios.innerHTML = "<p>Nenhum anúncio cadastrado.</p>";
        return;
    }

    listaAnuncios.innerHTML = data.map((anuncio) => `
        <div class="item-anuncio" style="display:flex;gap:15px;align-items:center;background:var(--card,#fff);padding:15px;border-radius:10px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,.08)">
            <img src="${safeUrl(anuncio.imagem)}" alt="${escapar(anuncio.nome)}" style="width:180px;height:80px;object-fit:cover;border-radius:8px">
            <div class="info-anuncio" style="flex:1">
                <h3 style="margin:0 0 6px">${escapar(anuncio.nome)}</h3>
                <p style="margin:4px 0">Posição: <strong>${escapar(anuncio.posicao)}</strong></p>
                <p style="margin:4px 0">Status: <strong>${anuncio.ativo ? "ATIVO" : "DESATIVADO"}</strong></p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                    <button type="button" onclick="editarAnuncio(${Number(anuncio.id)})">Editar</button>
                    <button type="button" onclick="alternarAnuncio(${Number(anuncio.id)}, ${Boolean(anuncio.ativo)})">${anuncio.ativo ? "Desativar" : "Ativar"}</button>
                    <button type="button" onclick="excluirAnuncio(${Number(anuncio.id)})">Excluir</button>
                </div>
            </div>
        </div>
    `).join("");
}

async function salvarAnuncio(evento) {
    evento.preventDefault();

    const nome = anuncioNome.value.trim();
    const imagem = anuncioImagem.value.trim();
    const link = anuncioLink.value.trim();
    const posicao = anuncioPosicao.value;
    const ativo = anuncioAtivo.checked;

    if (!nome || !imagem || !link) {
        alert("Preencha todos os campos do anúncio.");
        return;
    }

    if (!validarUrl(imagem)) {
        alert("A URL da imagem precisa começar com http:// ou https://");
        return;
    }

    if (!validarUrl(link)) {
        alert("O link precisa começar com http:// ou https://");
        return;
    }

    const botao = formAnuncio.querySelector("button[type='submit']");
    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const id = anuncioId.value.trim();
        let resultado;

        if (id) {
            resultado = await supabaseClient
                .from("anuncios")
                .update({ nome, imagem, link, posicao, ativo })
                .eq("id", id);
        } else {
            resultado = await supabaseClient
                .from("anuncios")
                .insert({ nome, imagem, link, posicao, ativo });
        }

        if (resultado.error) {
            console.error("Erro Supabase:", resultado.error);
            alert("Erro ao salvar anúncio:\n\n" + resultado.error.message);
            return;
        }

        alert(id ? "Anúncio atualizado com sucesso!" : "Anúncio publicado com sucesso!");
        limparFormulario();
        await carregarListaAnuncios();
    } catch (erro) {
        console.error(erro);
        alert("Erro inesperado:\n\n" + erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

async function editarAnuncio(id) {
    const { data, error } = await supabaseClient
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        alert("Erro ao carregar anúncio:\n\n" + error.message);
        return;
    }

    anuncioId.value = data.id;
    anuncioNome.value = data.nome;
    anuncioImagem.value = data.imagem;
    anuncioLink.value = data.link;
    anuncioPosicao.value = data.posicao;
    anuncioAtivo.checked = data.ativo;
    cancelarEdicao.style.display = "inline-block";

    formAnuncio.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function alternarAnuncio(id, estadoAtual) {
    const { error } = await supabaseClient
        .from("anuncios")
        .update({ ativo: !estadoAtual })
        .eq("id", id);

    if (error) {
        alert("Erro ao alterar anúncio:\n\n" + error.message);
        return;
    }

    await carregarListaAnuncios();
}

async function excluirAnuncio(id) {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;

    const { error } = await supabaseClient
        .from("anuncios")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Erro ao excluir anúncio:\n\n" + error.message);
        return;
    }

    alert("Anúncio excluído.");
    await carregarListaAnuncios();
}

function limparFormulario() {
    anuncioId.value = "";
    anuncioNome.value = "";
    anuncioImagem.value = "";
    anuncioLink.value = "";
    anuncioPosicao.value = "entre";
    anuncioAtivo.checked = true;
    cancelarEdicao.style.display = "none";
}

function validarUrl(valor) {
    try {
        const url = new URL(valor);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function safeUrl(valor) {
    return validarUrl(valor) ? escapar(valor) : "";
}

function escapar(valor) {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

cancelarEdicao.addEventListener("click", limparFormulario);
formAnuncio.addEventListener("submit", salvarAnuncio);

(async function iniciar() {
    const autorizado = await verificarAdministrador();
    if (autorizado) await carregarListaAnuncios();
})();
