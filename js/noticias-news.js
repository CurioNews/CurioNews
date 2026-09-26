async function carregarTodasNoticias() {

    const grid = document.getElementById("newsGrid");

    if (!grid) return;


    grid.innerHTML =
        "<p class='carregando'>Carregando notícias...</p>";


    try {

        if (typeof supabaseClient === "undefined") {

            throw new Error(
                "Supabase não foi carregado."
            );
        }


        const { data, error } = await supabaseClient

            .from("noticias")

            .select(
                "id,titulo,resumo,conteudo,imagem,categoria,created_at"
            )

            .order(
                "created_at",
                { ascending: false }
            );


        if (error) throw error;


        if (!data || data.length === 0) {

            grid.innerHTML = `
                <p class="carregando">
                    Nenhuma notícia publicada ainda.
                </p>
            `;

            return;
        }


        grid.innerHTML = data.map(function(noticia) {


            const titulo =
                escapar(
                    noticia.titulo ||
                    "Sem título"
                );


            const resumo =
                escapar(
                    noticia.resumo ||
                    noticia.conteudo ||
                    ""
                );


            const categoria =
                escapar(
                    noticia.categoria ||
                    "Notícias"
                );


            const dataNoticia =
                noticia.created_at

                    ? new Date(
                        noticia.created_at
                    ).toLocaleDateString("pt-BR")

                    : "";


            let imagem = "";


            if (noticia.imagem) {

                const imagemSegura =
                    safeUrl(noticia.imagem);


                if (imagemSegura) {

                    imagem = `
                        <img
                            src="${imagemSegura}"
                            alt="${titulo}"
                            loading="lazy"
                        >
                    `;
                }
            }


            return `

                <a
                    href="noticia-completa.html?id=${noticia.id}"
                    class="news-link"
                >

                    <article class="news-card">

                        ${imagem}

                        <div class="news-body">

                            <span class="tag">
                                ${categoria.toUpperCase()}
                            </span>


                            <h3>
                                ${titulo}
                            </h3>


                            <p>
                                ${resumo}
                            </p>


                            <div class="meta">
                                🗓️ ${dataNoticia}
                            </div>

                        </div>

                    </article>

                </a>

            `;

        }).join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar notícias:",
            erro
        );


        grid.innerHTML = `

            <p class="carregando">

                Erro ao carregar notícias.

            </p>

        `;
    }
}



function escapar(valor) {

    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#39;"
        );
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
    carregarTodasNoticias
);



document.addEventListener(
    "visibilitychange",
    function() {

        if (!document.hidden) {

            carregarTodasNoticias();

        }

    }
);