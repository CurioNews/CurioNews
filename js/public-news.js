async function carregarNoticiasPublicas() {
  const grid = document.getElementById("newsGrid");

  if (!grid) return;

  grid.innerHTML = "<p>Carregando notícias...</p>";

  try {
    if (typeof supabaseClient === "undefined") {
      throw new Error("Supabase não foi carregado.");
    }

    const { data, error } = await supabaseClient
      .from("noticias")
      .select("id,titulo,resumo,conteudo,imagem,categoria,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      grid.innerHTML = "<p>Nenhuma notícia publicada ainda.</p>";
      return;
    }

    grid.innerHTML = data.map(function(n) {

      const title = escapar(n.titulo || "Sem título");
      const resumo = escapar(n.resumo || n.conteudo || "");
      const categoria = escapar(n.categoria || "Notícias");

      const date = n.created_at
        ? new Date(n.created_at).toLocaleDateString("pt-BR")
        : "";

      let image = "";

      if (n.imagem) {
        const imagemSegura = safeUrl(n.imagem);

        if (imagemSegura) {
          image = `
            <img
              src="${imagemSegura}"
              alt="${title}"
              loading="lazy"
            >
          `;
        }
      }

      return `
        <a href="${paginaCategoria(categoria)}" class="news-link">

          <article
            class="news-card article-card"
            data-category="${categoria}"
            data-title="${title}"
          >

            ${image}

            <div class="news-body">

              <span class="tag cyan">
                ${categoria.toUpperCase()}
              </span>

              <h3>${title}</h3>

              <p>${resumo}</p>

              <div class="meta">
                ▣ ${date}
              </div>

            </div>

          </article>

        </a>
      `;

    }).join("");

  } catch (err) {

    console.error("CurioNews/Supabase:", err);

    grid.innerHTML = `
      <p>
        Erro ao carregar notícias:
        ${escapar(err.message || String(err))}
      </p>
    `;
  }
}


// Escolhe a página de acordo com a categoria
function paginaCategoria(categoria) {

  const categoriaNormalizada = String(categoria)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (categoriaNormalizada === "brasil") {
    return "brasil.html";
  }

  if (categoriaNormalizada === "ciencia") {
    return "ciencia.html";
  }

  if (categoriaNormalizada === "entretenimento") {
    return "entretenimento.html";
  }

  if (categoriaNormalizada === "mundo") {
    return "mundo.html";
  }

  if (categoriaNormalizada === "tecnologia") {
    return "tecnologia.html";
  }

  return "noticias.html";
}


// Escapa caracteres especiais
function escapar(valor) {

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


// Verifica a URL da imagem
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


// Carrega as notícias quando a página abre
document.addEventListener(
  "DOMContentLoaded",
  carregarNoticiasPublicas
);


// Atualiza quando voltar para a página
document.addEventListener(
  "visibilitychange",
  function() {

    if (!document.hidden) {
      carregarNoticiasPublicas();
    }

  }
)