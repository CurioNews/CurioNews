async function carregarAnuncios() {
    try {
        const { data, error } = await supabaseClient
            .from("anuncios")
            .select("*")
            .eq("ativo", true)
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) return;

        const topo = data.find(a => a.posicao === "topo");
        const entre = data.find(a => a.posicao === "entre");
        const rodape = data.find(a => a.posicao === "rodape");

        if (topo) colocarAnuncio(topo, "anuncio-topo");
        if (entre) colocarAnuncio(entre, "anuncio-entre");
        if (rodape) colocarAnuncio(rodape, "anuncio-rodape");

    } catch (erro) {
        console.error("Erro ao carregar anúncios:", erro);
    }
}

function colocarAnuncio(anuncio, id) {
    const area = document.getElementById(id);

    if (!area) return;

    const imagem = safeUrl(anuncio.imagem);
    const link = safeUrl(anuncio.link);

    if (!imagem || !link) return;

    area.innerHTML = `
        <a
            href="${link}"
            target="_blank"
            rel="noopener noreferrer sponsored"
        >
            <img
                src="${imagem}"
                alt="${escapar(anuncio.nome)}"
                loading="lazy"
            >
        </a>
    `;

    area.style.display = "block";
}

function escapar(valor) {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeUrl(valor) {
    try {
        const url = new URL(valor);

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {
            return escapar(valor);
        }

        return "";
    } catch (erro) {
        return "";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    carregarAnuncios
);