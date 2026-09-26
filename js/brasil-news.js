async function carregarNoticiasBrasil() {

    const grid =
        document.getElementById("newsGrid");


    if (!grid) return;


    grid.innerHTML =
        "<p class='carregando'>Carregando notícias...</p>";


    try {


        /* Verifica Supabase */

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            throw new Error(
                "Supabase não foi carregado."
            );

        }



        /* Busca notícias do Brasil */

        const { data, error } =
            await supabaseClient

                .from("noticias")

                .select(
                    "id,titulo,resumo,conteudo,imagem,categoria,created_at"
                )

                .eq(
                    "categoria",
                    "Brasil"
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );



        /* Verifica erro */

        if (error) {

            throw error;

        }



        /* Nenhuma notícia */

        if (
            !data ||
            data.length === 0
        ) {

            grid.innerHTML = `

                <p class="carregando">

                    Nenhuma notícia do Brasil
                    publicada ainda.

                </p>

            `;

            return;

        }



        /* Cria os cards */

        grid.innerHTML =

            data.map(
                function (noticia) {


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



                    const dataNoticia =
                        noticia.created_at

                        ? new Date(
                            noticia.created_at
                        ).toLocaleDateString(
                            "pt-BR"
                        )

                        : "";



                    /* Imagem */

                    let imagem = "";



                    if (
                        noticia.imagem
                    ) {


                        const imagemSegura =
                            safeUrl(
                                noticia.imagem
                            );


                        if (
                            imagemSegura
                        ) {

                            imagem = `

                                <img

                                    src="${imagemSegura}"

                                    alt="${titulo}"

                                    loading="lazy"

                                >

                            `;

                        }

                    }



                    /*
                     * IMPORTANTE:
                     *
                     * Aqui está o link
                     * para a página
                     * da notícia completa.
                     */

                    return `


                        <a

                            href="noticia-completa.html?id=${noticia.id}"

                            class="news-link"

                        >


                            <article
                                class="news-card"
                            >


                                ${imagem}



                                <div
                                    class="news-body"
                                >


                                    <span
                                        class="tag"
                                    >

                                        BRASIL

                                    </span>



                                    <h3>

                                        ${titulo}

                                    </h3>



                                    <p>

                                        ${resumo}

                                    </p>



                                    <div
                                        class="meta"
                                    >

                                        🗓️
                                        ${dataNoticia}

                                    </div>


                                </div>


                            </article>


                        </a>


                    `;

                }
            )

            .join("");


    }


    catch (erro) {


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



/*
 * Protege os textos
 */

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



/*
 * Protege URLs das imagens
 */

function safeUrl(valor) {

    try {


        const url =
            new URL(valor);



        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return escapar(valor);

        }


        return "";


    }
    catch (erro) {

        return "";

    }

}



/*
 * Carrega quando abrir
 */

document.addEventListener(
    "DOMContentLoaded",
    carregarNoticiasBrasil
);



/*
 * Atualiza quando
 * voltar para a página
 */

document.addEventListener(
    "visibilitychange",
    function () {

        if (!document.hidden) {

            carregarNoticiasBrasil();

        }

    }
);